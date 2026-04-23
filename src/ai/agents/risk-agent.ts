/**
 * Risk Agent
 *
 * Identifies short-term downside risks, fragility signals, and sources of
 * uncertainty across market data and news. Runs as a child span under the
 * parent LangGraph workflow trace in Langfuse.
 *
 * Uses the AI Runner (runAIStructured) for LLM execution — model selection
 * is delegated to the Model Router.
 */

import { runAIStructured } from "@/ai/runner/runAI";
import { logScore, logError, type LangfuseTrace } from "@/lib/langfuse";
import {
  type SnapshotRow,
  type NewsRow,
  type RiskAnalysis,
  RiskAnalysisSchema,
  createAgentSpan,
} from "./types";

const SYSTEM_PROMPT = `You are a senior crypto risk analyst at a digital-asset trading desk.

Your task is to identify the most important short-term downside risks facing the crypto market right now, using the provided market data and news context.

## Risk taxonomy

Evaluate risk across these categories (in priority order):

1. **Leverage & liquidation risk**
   - Elevated or extreme funding rates (positive = crowded longs vulnerable to squeeze)
   - Rapidly rising open interest without price confirmation
   - Signs of over-leveraged positioning

2. **Regulatory & legal risk**
   - Enforcement actions, lawsuits, or policy announcements
   - Legislative proposals that could restrict market access
   - Jurisdiction-specific bans or restrictions

3. **Macro & contagion risk**
   - Adverse macroeconomic signals (rate hikes, strong dollar, risk-off shift)
   - Contagion from TradFi stress, bank failures, or credit events
   - Stablecoin de-peg or reserve concerns

4. **Protocol & infrastructure risk**
   - Smart contract exploits, bridge hacks, oracle failures
   - Exchange outages, withdrawal suspensions, proof-of-reserves concerns
   - Critical upgrade failures or governance attacks

5. **Market structure risk**
   - Thin liquidity (low volume relative to open interest)
   - Whale concentration or suspicious large transfers
   - Rapid sentiment shifts without fundamental backing

6. **Narrative exhaustion risk**
   - Overheated themes losing momentum (e.g. AI tokens after extended rally)
   - Hype-driven tokens with no fundamental anchor

## Output fields

1. **Top risks** — List the 3-6 most important specific risks right now.
   Each entry should be one clear sentence describing the risk and why it matters.
   Order by severity (highest first). Do not list generic platitudes —
   every risk must be grounded in the provided data or news.

2. **Risk summary** — A concise 2-4 sentence overview of the current risk
   environment. Characterize the overall fragility level and what a risk-aware
   trader should prioritize. Write for someone deciding position sizing.

3. **Severity** — A number from 0 to 1 representing the aggregate short-term
   risk level:
   - 0.0–0.2: calm, low risk
   - 0.2–0.4: normal background risk
   - 0.4–0.6: elevated, caution warranted
   - 0.6–0.8: high, defensive positioning recommended
   - 0.8–1.0: extreme, capital preservation mode

4. **Confidence** — A number from 0 to 1 reflecting how confident you are in
   this risk assessment. Lower when data is sparse or contradictory.

## Rules
- Focus exclusively on downside risks and fragility — this is not a market outlook.
- Do not mention upside potential or bullish catalysts.
- Ground every risk in specific data points or news items from the input.
- If data is sparse, flag the uncertainty itself as a risk.
- If no meaningful risks are apparent, say so and set severity low.

Respond with exactly one JSON object:
{ "top_risks": string[], "risk_summary": string, "severity": number, "confidence": number }`;

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildUserPrompt(snapshots: SnapshotRow[], news: NewsRow[]): string {
  if (!snapshots.length && !news.length) {
    return [
      "No market data or news items are available for this analysis cycle.",
      "",
      "Note the absence of data as a risk factor in itself (blind spots).",
      "Set confidence low to reflect the lack of input.",
    ].join("\n");
  }

  const sections: string[] = [];

  if (snapshots.length) {
    sections.push("=== MARKET DATA ===");
    sections.push("");
    for (const s of snapshots) {
      const parts = [`**${s.symbol}**`];
      parts.push(`  Price:           $${formatNum(s.price)}`);
      parts.push(`  24h Volume:      ${formatOpt(s.volume_24h, "$")}`);
      parts.push(`  Funding Rate:    ${formatOpt(s.funding_rate)}`);
      parts.push(`  Open Interest:   ${formatOpt(s.open_interest, "$")}`);
      sections.push(parts.join("\n"));
      sections.push("");
    }
  }

  if (news.length) {
    sections.push(`=== RECENT NEWS (${news.length} items) ===`);
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

  sections.push("=== RISK ANALYSIS INSTRUCTIONS ===");
  sections.push("");
  sections.push(
    "Scan the data above for downside risks and fragility signals.",
  );
  sections.push(
    "- Are funding rates or open interest at levels that suggest a crowded trade?",
  );
  sections.push(
    "- Is there news indicating regulatory, legal, or infrastructure threats?",
  );
  sections.push(
    "- Are there signs of thin liquidity, contagion potential, or macro headwinds?",
  );
  sections.push(
    "- Is the market showing signs of overheating or narrative exhaustion?",
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

export async function runRiskAgent(
  snapshots: SnapshotRow[],
  news: NewsRow[],
  parentTrace: LangfuseTrace | null,
): Promise<RiskAnalysis> {
  const { span, end } = createAgentSpan(parentTrace, "risk_agent", {
    snapshot_count: snapshots.length,
    news_count: news.length,
    symbols: snapshots.map((s) => s.symbol),
  });

  try {
    const result = await runAIStructured(
      "extraction",
      buildUserPrompt(snapshots, news),
      RiskAnalysisSchema,
      { systemPrompt: SYSTEM_PROMPT, trace: span },
    );

    await logScore(span, "confidence_score", result.data.confidence);
    await logScore(span, "severity", result.data.severity);
    await logScore(span, "risk_count", result.data.top_risks.length);

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
