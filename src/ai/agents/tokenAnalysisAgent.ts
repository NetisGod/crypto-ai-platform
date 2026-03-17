/**
 * Token Analysis Agent
 *
 * Produces a structured market explanation for a single token (e.g. BTC, ETH).
 * Consumes market data, recent news, and optional narratives to identify
 * bullish / bearish factors, short-term outlook, and a confidence score.
 *
 * Uses the AI Runner (runAIStructured) for LLM execution — model selection
 * is delegated to the Model Router ("reasoning" tier → strong model).
 */

import { runAIStructured } from "@/ai/runner/runAI";
import { logScore, logError, type LangfuseTrace } from "@/lib/langfuse";
import { type NewsRow, type NarrativeRow, createAgentSpan } from "./types";
import {
  TokenAnalysisSchema,
  type TokenAnalysis,
} from "@/ai/schemas/tokenAnalysis";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface TokenMarketData {
  symbol: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  trend_summary?: string;
}

export interface TokenAnalysisInput {
  market: TokenMarketData;
  news: NewsRow[];
  narratives?: NarrativeRow[];
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a senior crypto analyst specializing in single-asset deep dives.

Your task is to analyze real-time data for one specific token and produce a structured assessment that a trader can act on immediately.

## Analysis framework

1. **Summary** — 2-4 sentences explaining what is happening with this token right now.
   Cover price action, momentum, and the dominant driver. Write for a sophisticated trader
   who needs to understand the situation in 15 seconds.

2. **Bullish factors** — List the 2-5 most important reasons the token could move up.
   Each factor should be one clear sentence grounded in the data provided.
   Prioritize:
   - Strong price momentum or breakout from key levels
   - High volume confirming a move
   - Positive news catalysts (ETF, partnerships, upgrades)
   - Favorable narrative tailwinds
   - Improving on-chain or derivatives positioning

3. **Bearish factors** — List the 2-5 most important risks or reasons the token could move down.
   Each factor should be one clear sentence grounded in the data provided.
   Prioritize:
   - Overbought/overextended conditions
   - Negative news (regulatory, exploit, hack)
   - Declining volume or fading momentum
   - Adverse narrative shifts
   - Elevated leverage or crowded positioning

4. **Outlook** — One paragraph giving your short-term view (next 24-72 hours).
   State the most likely direction, key levels to watch, and what could change the thesis.

5. **Confidence** — A number from 0 to 1 reflecting how confident you are in this
   assessment. Lower confidence when data is sparse, signals conflict, or news is absent.

## Rules
- Be data-driven. Reference actual numbers from the input.
- Do not hallucinate data points that are not provided.
- If news or narratives are absent, note the reduced signal and lower confidence accordingly.
- Keep each factor to one sentence.
- Do not provide financial advice — present analysis, not recommendations.

Respond with exactly one JSON object:
{ "summary": string, "bullish_factors": string[], "bearish_factors": string[], "outlook": string, "confidence": number }`;

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildUserPrompt(input: TokenAnalysisInput): string {
  const { market, news, narratives } = input;
  const sections: string[] = [];

  sections.push(`=== TOKEN: ${market.symbol} ===`);
  sections.push("");

  sections.push("--- Market Data ---");
  sections.push(`  Price:        $${formatNum(market.price)}`);
  sections.push(`  24h Change:   ${market.change_24h >= 0 ? "+" : ""}${market.change_24h.toFixed(2)}%`);
  sections.push(`  24h Volume:   $${formatNum(market.volume_24h)}`);
  if (market.trend_summary) {
    sections.push(`  Trend:        ${market.trend_summary}`);
  }
  sections.push("");

  if (news.length > 0) {
    sections.push(`--- Recent News (${news.length} items) ---`);
    for (let i = 0; i < news.length; i++) {
      const n = news[i];
      const age = formatAge(n.published_at);
      const parts = [`  ${i + 1}. ${n.title}`];
      parts.push(`     Source: ${n.source}  |  Published: ${age}`);
      if (n.summary) {
        parts.push(`     ${n.summary}`);
      }
      sections.push(parts.join("\n"));
    }
    sections.push("");
  } else {
    sections.push("--- Recent News ---");
    sections.push("  No recent news available for this token.");
    sections.push("");
  }

  if (narratives && narratives.length > 0) {
    sections.push(`--- Active Narratives (${narratives.length}) ---`);
    for (const nar of narratives) {
      sections.push(
        `  • ${nar.name} (strength: ${nar.strength}, trend: ${nar.trend}, sentiment: ${nar.sentiment.toFixed(2)})`,
      );
      if (nar.description) {
        sections.push(`    ${nar.description}`);
      }
    }
    sections.push("");
  }

  sections.push("=== ANALYSIS INSTRUCTIONS ===");
  sections.push("");
  sections.push(`Analyze ${market.symbol} using the data above and determine:`);
  sections.push("- What is the dominant driver of current price action?");
  sections.push("- What are the strongest bullish and bearish factors?");
  sections.push("- What is the most likely short-term trajectory (24-72h)?");
  sections.push("- How confident can you be given the available data?");

  return sections.join("\n");
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatNum(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatAge(publishedAt: string | null): string {
  if (!publishedAt) return "unknown date";
  try {
    const date = new Date(publishedAt);
    if (isNaN(date.getTime())) return publishedAt;
    const diffMs = Date.now() - date.getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffH < 1) return "< 1h ago";
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD}d ago`;
  } catch {
    return publishedAt;
  }
}

// ---------------------------------------------------------------------------
// Agent entry point
// ---------------------------------------------------------------------------

export async function runTokenAnalysisAgent(
  input: TokenAnalysisInput,
  parentTrace: LangfuseTrace | null = null,
): Promise<TokenAnalysis> {
  const { span, end } = createAgentSpan(parentTrace, "token_analysis_agent", {
    symbol: input.market.symbol,
    price: input.market.price,
    news_count: input.news.length,
    narrative_count: input.narratives?.length ?? 0,
  });

  try {
    const result = await runAIStructured(
      "reasoning",
      buildUserPrompt(input),
      TokenAnalysisSchema,
      { systemPrompt: SYSTEM_PROMPT },
    );

    await logScore(span, "structured_output_valid", 1);
    await logScore(span, "confidence_score", result.data.confidence);
    await logScore(span, "bullish_factor_count", result.data.bullish_factors.length);
    await logScore(span, "bearish_factor_count", result.data.bearish_factors.length);

    end({
      model: result.model,
      latencyMs: result.latencyMs,
      tokens: {
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
      },
      output: result.data,
    });

    return result.data;
  } catch (error) {
    await logScore(span, "structured_output_valid", 0);
    await logError(span, error);
    end({ error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}
