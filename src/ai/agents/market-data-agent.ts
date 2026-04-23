/**
 * Market Data Agent
 *
 * Analyzes quantitative market metrics (prices, volume, funding, open interest)
 * and produces a structured market signal summary. Runs as a child span under
 * the parent LangGraph workflow trace in Langfuse.
 *
 * Uses the AI Runner (runAIStructured) for LLM execution — model selection
 * is delegated to the Model Router.
 */

import { runAIStructured } from "@/ai/runner/runAI";
import { logScore, logError, type LangfuseTrace } from "@/lib/langfuse";
import {
  type SnapshotRow,
  type MarketDataAnalysis,
  MarketDataAnalysisSchema,
  createAgentSpan,
} from "./types";

const SYSTEM_PROMPT = `You are a senior quantitative crypto market analyst at a digital-asset trading desk.

Your task is to interpret raw market snapshot data and produce a concise, structured assessment of the current market regime.

## Analysis framework

1. **Market momentum** — Classify the overall market direction.
   Use one of: "strongly bullish", "bullish", "cautiously bullish", "neutral",
   "cautiously bearish", "bearish", "strongly bearish", or "mixed / rotational".
   Base this on price levels, volume trends, and derivatives data.

2. **Key signals** — List the 3-5 most important quantitative signals.
   Prioritize:
   - Notable price levels or thresholds (e.g. round numbers, recent highs/lows)
   - Volume anomalies (unusually high or low relative to typical ranges)
   - Funding rate extremes (positive = crowded longs, negative = crowded shorts)
   - Open interest changes (rising OI + rising price = fresh longs, etc.)
   - Cross-asset divergences (e.g. BTC up while ETH lags)
   Each signal should be a short sentence with the metric value when available.

3. **Market structure** — One paragraph describing the structural regime.
   Consider leverage positioning, liquidity conditions, and whether the market
   is trending, consolidating, or transitioning between states.

4. **Confidence** — A number from 0 to 1 indicating your confidence in this
   assessment. Lower confidence when data is sparse or conflicting.

## Rules
- Be data-driven. Reference actual numbers from the input.
- Do not hallucinate data points that are not provided.
- If a metric is "n/a", note its absence rather than guessing.
- Keep each key signal to one sentence.

Respond with exactly one JSON object:
{ "market_momentum": string, "key_signals": string[], "market_structure": string, "confidence": number }`;

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildUserPrompt(snapshots: SnapshotRow[]): string {
  if (!snapshots.length) {
    return [
      "No market snapshot data is available for this analysis cycle.",
      "",
      "Produce a neutral assessment. Set confidence low to reflect the absence of data.",
    ].join("\n");
  }

  const sections: string[] = [];

  sections.push("=== CURRENT MARKET SNAPSHOTS ===");
  sections.push("");

  for (const s of snapshots) {
    const parts = [`**${s.symbol}**`];
    parts.push(`  Price:           $${formatNum(s.price)}`);
    parts.push(`  24h Volume:      ${formatOpt(s.volume_24h, "$")}`);
    parts.push(`  Market Cap:      ${formatOpt(s.market_cap, "$")}`);
    parts.push(`  Funding Rate:    ${formatOpt(s.funding_rate)}`);
    parts.push(`  Open Interest:   ${formatOpt(s.open_interest, "$")}`);
    sections.push(parts.join("\n"));
    sections.push("");
  }

  sections.push("=== ANALYSIS INSTRUCTIONS ===");
  sections.push("");
  sections.push(
    "Using the data above, determine the current market regime.",
  );
  sections.push(
    "- Is the market trending, range-bound, or in transition?",
  );
  sections.push(
    "- Are derivatives metrics (funding, OI) signaling leverage buildup?",
  );
  sections.push(
    "- Are there notable cross-asset divergences between BTC, ETH, SOL?",
  );
  sections.push(
    "- What are the strongest quantitative signals a trader should watch?",
  );

  return sections.join("\n");
}

function formatNum(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatOpt(v: number | null, prefix = ""): string {
  if (v === null || v === undefined) return "n/a";
  return `${prefix}${formatNum(v)}`;
}

// ---------------------------------------------------------------------------
// Agent entry point
// ---------------------------------------------------------------------------

export async function runMarketDataAgent(
  snapshots: SnapshotRow[],
  parentTrace: LangfuseTrace | null,
): Promise<MarketDataAnalysis> {
  const { span, end } = createAgentSpan(parentTrace, "market_data_agent", {
    snapshot_count: snapshots.length,
    symbols: snapshots.map((s) => s.symbol),
  });

  try {
    const result = await runAIStructured(
      "extraction",
      buildUserPrompt(snapshots),
      MarketDataAnalysisSchema,
      { systemPrompt: SYSTEM_PROMPT, trace: span },
    );

    await logScore(span, "confidence_score", result.data.confidence);
    await logScore(span, "signal_count", result.data.key_signals.length);

    end({
      model: result.model,
      latencyMs: result.latencyMs,
      tokens: { promptTokens: result.promptTokens, completionTokens: result.completionTokens },
      output: result.data,
    });

    return result.data;
  } catch (error) {
    await logError(span, error);
    end({ error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}
