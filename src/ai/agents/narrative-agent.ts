/**
 * Narrative Agent
 *
 * Detects the strongest active narratives in the crypto market by combining
 * recent news signals with any previously tracked narratives from the database.
 * Runs as a child span under the parent LangGraph workflow trace in Langfuse.
 *
 * Uses the shared AI client (callStructuredJson) for LLM execution and Zod
 * validation. Includes retry logic aligned with the shared workflow runner.
 */

import { callStructuredJson } from "@/lib/ai-client";
import { logScore, logError, type LangfuseTrace } from "@/lib/langfuse";
import {
  type NewsRow,
  type NarrativeRow,
  type NarrativeAnalysis,
  NarrativeAnalysisSchema,
  createAgentSpan,
  AGENT_MODEL,
} from "./types";

const MAX_RETRIES = 2;
const FALLBACK_MODEL = "gpt-4.1-nano";

const SYSTEM_PROMPT = `You are a senior crypto narrative analyst specializing in thematic pattern detection.

A "narrative" is a persistent, market-moving theme that drives capital rotation, attention, and sentiment across the crypto ecosystem.

Examples of past narratives:
- "ETH ETF approval momentum"
- "AI token supercycle"
- "RWA tokenization wave"
- "Layer-2 fee war"
- "Memecoin season on Solana"
- "Bitcoin halving supply squeeze"
- "Regulatory crackdown on DeFi"
- "Restaking / EigenLayer ecosystem"

Your task is to identify which narratives are currently active and how strong they are.

## Analysis framework

1. **Top narratives** — List the 3-6 strongest active narratives right now.
   Each entry should be a short, descriptive label (3-8 words).
   Order by estimated market impact (strongest first).
   A narrative qualifies if:
   - Multiple news stories or data points converge on the same theme
   - It is driving capital flows, token price action, or community attention
   - It has persisted or intensified over recent days
   Avoid listing one-off events as narratives unless they have clearly catalyzed
   a broader thematic shift.

2. **Narrative summary** — A concise 2-4 sentence overview of the current
   narrative landscape. Describe which themes are strengthening, fading, or
   emerging. Write for a portfolio manager who needs to understand thematic
   positioning in 15 seconds.

3. **Affected tokens** — List the token tickers (e.g. BTC, ETH, SOL, RNDR, ARB)
   most directly affected by the identified narratives. Include 3-10 tickers.
   Only include tokens that are meaningfully connected to an active narrative —
   do not pad the list with loosely related assets.

4. **Confidence** — A number from 0 to 1 reflecting how confident you are
   in the narrative detection. Lower confidence when:
   - Input data is sparse or noisy
   - No clear narrative emerges
   - Existing database narratives conflict with fresh news signals

## Rules
- Focus on narrative detection, not a full market summary.
- If existing narratives from the database are provided, use them as context:
  confirm, update, or note if they appear to be fading.
- If no existing narratives are provided, derive them entirely from the news.
- Do not invent narratives that have no support in the input data.
- Keep narrative labels distinct — no overlapping or synonymous entries.

Respond with exactly one JSON object:
{ "top_narratives": string[], "narrative_summary": string, "affected_tokens": string[], "confidence": number }`;

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildUserPrompt(
  news: NewsRow[],
  narratives: NarrativeRow[],
): string {
  if (!news.length && !narratives.length) {
    return [
      "No news items or existing narrative data are available for this cycle.",
      "",
      "Produce a neutral assessment noting the absence of signal.",
      "Set confidence low to reflect the lack of input data.",
    ].join("\n");
  }

  const sections: string[] = [];

  if (narratives.length) {
    sections.push(
      `=== PREVIOUSLY TRACKED NARRATIVES (${narratives.length}) ===`,
    );
    sections.push("");
    for (const n of narratives) {
      const trend = n.trend === "up" ? "↑" : n.trend === "down" ? "↓" : "→";
      sections.push(`• **${n.name}**  ${trend}`);
      sections.push(
        `  Strength: ${n.strength}/100  |  Sentiment: ${n.sentiment}/100`,
      );
      if (n.description) {
        sections.push(`  ${n.description}`);
      }
    }
    sections.push("");
  }

  if (news.length) {
    sections.push(`=== RECENT NEWS FOR NARRATIVE DETECTION (${news.length} items) ===`);
    sections.push("");
    for (let i = 0; i < news.length; i++) {
      const n = news[i];
      const parts = [`${i + 1}. **${n.title}**`];
      parts.push(`   Source: ${n.source}  |  Published: ${n.published_at ?? "unknown"}`);
      if (n.summary) {
        parts.push(`   ${n.summary}`);
      }
      sections.push(parts.join("\n"));
    }
    sections.push("");
  }

  sections.push("=== ANALYSIS INSTRUCTIONS ===");
  sections.push("");
  sections.push(
    "Using the data above, identify the active market narratives.",
  );
  sections.push(
    "- Which themes appear across multiple news stories or align with tracked narratives?",
  );
  sections.push(
    "- Are any previously tracked narratives strengthening, fading, or evolving?",
  );
  sections.push(
    "- Are there emerging narratives not yet in the database?",
  );
  sections.push(
    "- Which tokens are most directly exposed to these narratives?",
  );

  return sections.join("\n");
}

// ---------------------------------------------------------------------------
// Agent entry point
// ---------------------------------------------------------------------------

export async function runNarrativeAgent(
  news: NewsRow[],
  narratives: NarrativeRow[],
  parentTrace: LangfuseTrace | null,
): Promise<NarrativeAnalysis> {
  const { span, end } = createAgentSpan(parentTrace, "narrative_agent", {
    news_count: news.length,
    existing_narrative_count: narratives.length,
    existing_narratives: narratives.map((n) => n.name),
  });

  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const model = attempt === 0 ? AGENT_MODEL : FALLBACK_MODEL;

    try {
      const result = await callStructuredJson<NarrativeAnalysis>({
        model,
        systemPrompt: SYSTEM_PROMPT,
        userPrompt: buildUserPrompt(news, narratives),
        schema: NarrativeAnalysisSchema,
        trace: span,
        temperature: 0.3,
      });

      await logScore(span, "structured_output_valid", 1);
      await logScore(span, "confidence_score", result.data.confidence);
      await logScore(span, "narrative_count", result.data.top_narratives.length);
      await logScore(span, "affected_token_count", result.data.affected_tokens.length);

      end({
        model: result.model,
        latencyMs: result.latencyMs,
        tokens: result.usage,
        output: result.data,
      });

      return result.data;
    } catch (error) {
      lastError = error;
      await logScore(span, "structured_output_valid", 0);
      await logError(span, error);
    }
  }

  end({ error: lastError instanceof Error ? lastError.message : String(lastError) });
  throw lastError instanceof Error
    ? lastError
    : new Error(`Narrative Agent failed after ${MAX_RETRIES} attempts`);
}
