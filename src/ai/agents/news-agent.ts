/**
 * News Agent
 *
 * Analyzes recent crypto news items and identifies the main market-moving
 * themes, drivers, and source attribution. Runs as a child span under
 * the parent LangGraph workflow trace in Langfuse.
 *
 * Uses the AI Runner (runAIStructured) for LLM execution — model selection
 * is delegated to the Model Router.
 */

import { runAIStructured } from "@/ai/runner/runAI";
import { logScore, logError, type LangfuseTrace } from "@/lib/langfuse";
import {
  type NewsRow,
  type NewsAnalysis,
  NewsAnalysisSchema,
  createAgentSpan,
} from "./types";

const SYSTEM_PROMPT = `You are a senior crypto news analyst at a digital-asset intelligence desk.

Your task is to read a batch of recent crypto news items and produce a structured assessment of the current news landscape and its likely market impact.

## Analysis framework

1. **News summary** — A concise 2-4 sentence overview of the current news cycle.
   Capture the dominant tone (risk-on, risk-off, mixed, quiet) and highlight the
   most consequential developments. Write for a sophisticated trader who needs
   to understand the news landscape in 15 seconds.

2. **Main drivers** — List the 3-6 most important market-moving themes extracted
   from the news. Each driver should be one clear sentence.
   Prioritize by likely market impact:
   - Regulatory actions or policy shifts (SEC, CFTC, executive orders, country-level bans/approvals)
   - Institutional adoption or withdrawal (ETF flows, fund launches, corporate treasury moves)
   - Protocol-level events (upgrades, exploits, governance votes, token unlocks)
   - Macroeconomic cross-over (Fed decisions, CPI, dollar strength affecting crypto)
   - Exchange or infrastructure events (listings, delistings, outages, proof-of-reserves)
   - Market structure shifts (whale movements, large liquidations, stablecoin flows)
   When multiple stories point to the same driver, consolidate them into one entry.

3. **Source titles** — The exact titles of the most impactful news items used to
   derive the drivers. Include 3-8 titles. These must be verbatim from the input,
   not paraphrased.

4. **Confidence** — A number from 0 to 1 reflecting how confident you are in
   the assessment. Lower confidence when news is sparse, contradictory, or
   dominated by low-signal noise.

## Rules
- Focus on news likely to move BTC, ETH, or broad crypto sentiment.
- Ignore trivial or promotional stories unless they signal a larger trend.
- Do not invent stories. Only reference news items provided in the input.
- If no meaningful market-moving news is present, say so explicitly and set confidence low.
- Keep drivers distinct — no overlapping or redundant entries.

Respond with exactly one JSON object:
{ "news_summary": string, "main_drivers": string[], "source_titles": string[], "confidence": number }`;

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildUserPrompt(news: NewsRow[]): string {
  if (!news.length) {
    return [
      "No recent crypto news items are available for this analysis cycle.",
      "",
      "Produce a neutral assessment noting the absence of news signal.",
      "Set confidence low to reflect the lack of input data.",
    ].join("\n");
  }

  const sections: string[] = [];

  sections.push(`=== RECENT CRYPTO NEWS (${news.length} items) ===`);
  sections.push("");

  for (let i = 0; i < news.length; i++) {
    const n = news[i];
    const age = formatAge(n.published_at);
    const parts = [`${i + 1}. **${n.title}**`];
    parts.push(`   Source: ${n.source}  |  Published: ${age}`);
    if (n.summary) {
      parts.push(`   Summary: ${n.summary}`);
    }
    sections.push(parts.join("\n"));
  }

  sections.push("");
  sections.push("=== ANALYSIS INSTRUCTIONS ===");
  sections.push("");
  sections.push(
    "Read the news batch above and determine:",
  );
  sections.push(
    "- What is the dominant tone of the current news cycle?",
  );
  sections.push(
    "- Which stories are most likely to move crypto markets in the next 24h?",
  );
  sections.push(
    "- Are there clusters of stories pointing to the same underlying driver?",
  );
  sections.push(
    "- Are there any regulatory, institutional, or protocol-level catalysts?",
  );

  return sections.join("\n");
}

function formatAge(publishedAt: string | null): string {
  if (!publishedAt) return "unknown date";
  try {
    const date = new Date(publishedAt);
    if (isNaN(date.getTime())) return publishedAt;
    const now = Date.now();
    const diffMs = now - date.getTime();
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

export async function runNewsAgent(
  news: NewsRow[],
  parentTrace: LangfuseTrace | null,
): Promise<NewsAnalysis> {
  const { span, end } = createAgentSpan(parentTrace, "news_agent", {
    news_count: news.length,
    sources: [...new Set(news.map((n) => n.source))],
  });

  try {
    const result = await runAIStructured(
      "extraction",
      buildUserPrompt(news),
      NewsAnalysisSchema,
      { systemPrompt: SYSTEM_PROMPT },
    );

    await logScore(span, "structured_output_valid", 1);
    await logScore(span, "confidence_score", result.data.confidence);
    await logScore(span, "driver_count", result.data.main_drivers.length);

    end({
      model: result.model,
      latencyMs: result.latencyMs,
      tokens: { promptTokens: result.promptTokens, completionTokens: result.completionTokens },
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
