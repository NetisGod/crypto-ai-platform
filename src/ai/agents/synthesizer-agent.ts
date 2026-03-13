/**
 * Synthesizer Agent
 *
 * Merges the structured outputs of all four analysis agents (market data,
 * news, narrative, risk) into a single dashboard-ready Market Brief. Runs as
 * a child span under the parent LangGraph workflow trace in Langfuse.
 *
 * Uses the shared AI client (callStructuredJson) for LLM execution and Zod
 * validation. Includes retry logic aligned with the shared workflow runner.
 */

import { callStructuredJson } from "@/lib/ai-client";
import { logScore, logError, type LangfuseTrace } from "@/lib/langfuse";
import {
  type MarketDataAnalysis,
  type NewsAnalysis,
  type NarrativeAnalysis,
  type RiskAnalysis,
  type SynthesizedBrief,
  SynthesizedBriefSchema,
  createAgentSpan,
  AGENT_MODEL,
} from "./types";

const MAX_RETRIES = 2;
const FALLBACK_MODEL = "gpt-4.1-nano";

const SYSTEM_PROMPT = `You are the chief market strategist at a crypto intelligence platform.

You will receive structured sub-analyses from four specialized agents:
- **Market Data Agent** — quantitative market structure and momentum
- **News Agent** — recent news interpretation and market-moving drivers
- **Narrative Agent** — active thematic narratives and affected tokens
- **Risk Agent** — short-term downside risks and severity assessment

Your task is to synthesize these into one concise, dashboard-ready market brief that a crypto trader can read in 30 seconds.

## Output fields

1. **Market summary** — A 3-5 sentence overview of the current market state.
   - Open with the dominant market direction and tone.
   - Weave in the most important drivers, narrative context, and risk posture.
   - End with a forward-looking sentence on what to watch.
   - Write in a professional, direct style. No hedging filler ("it remains to be seen…").
   - This is the main text a user reads on the dashboard — make it count.

2. **Drivers** — A deduplicated list of 3-6 key factors moving the market.
   Merge overlapping drivers from the news and narrative agents into one entry.
   Each driver should be one clear, specific sentence.
   Order by market impact (strongest first).

3. **Risks** — A deduplicated list of 3-5 key downside risks.
   Pull from the risk agent's output but consolidate with any risk-relevant
   signals from market data or news. Each risk should be one sentence.
   Order by severity (highest first).

4. **Confidence** — A number from 0 to 1 reflecting the overall confidence of
   this synthesized brief. Weight the individual agent confidence scores:
   - If most agents are high-confidence → aggregate should be high.
   - If any critical agent is missing or low-confidence → reduce aggregate.
   - If agents contradict each other → reduce further.

5. **Sources** — A list of the most relevant news source titles that informed
   this brief. Pull these verbatim from the News Agent's source_titles output.
   Include 3-8 entries. If the News Agent is unavailable, return an empty array.

## Synthesis rules
- Do NOT simply concatenate agent outputs. Synthesize and cross-reference.
- Do NOT repeat the same point across summary, drivers, and risks.
- If an agent's output is marked as NOT AVAILABLE, work with remaining data.
  Note the gap in confidence but do not fabricate missing analysis.
- Drivers should focus on what IS moving the market (neutral or positive catalysts).
- Risks should focus exclusively on downside threats.
- The summary should integrate all perspectives without favoring one agent.
- Prefer specificity over vague statements.

Respond with exactly one JSON object:
{ "market_summary": string, "drivers": string[], "risks": string[], "confidence": number, "sources": string[] }`;

// ---------------------------------------------------------------------------
// Input type & prompt builder
// ---------------------------------------------------------------------------

export interface SynthesizerInput {
  marketDataAnalysis: MarketDataAnalysis | null;
  newsAnalysis: NewsAnalysis | null;
  narrativeAnalysis: NarrativeAnalysis | null;
  riskAnalysis: RiskAnalysis | null;
}

function buildUserPrompt(input: SynthesizerInput): string {
  const sections: string[] = [];
  const available: string[] = [];
  const missing: string[] = [];

  sections.push("=== SUB-ANALYSES FROM SPECIALIZED AGENTS ===");
  sections.push("");

  // --- Market Data Agent ---
  if (input.marketDataAnalysis) {
    available.push("Market Data");
    const m = input.marketDataAnalysis;
    sections.push("## 1. Market Data Agent");
    sections.push(`Momentum:       ${m.market_momentum}`);
    sections.push(`Market Structure: ${m.market_structure}`);
    sections.push("");
    sections.push("Key Signals:");
    m.key_signals.forEach((s) => sections.push(`  • ${s}`));
    sections.push("");
    sections.push(`Agent Confidence: ${m.confidence}`);
  } else {
    missing.push("Market Data");
    sections.push("## 1. Market Data Agent — NOT AVAILABLE");
  }
  sections.push("");

  // --- News Agent ---
  if (input.newsAnalysis) {
    available.push("News");
    const n = input.newsAnalysis;
    sections.push("## 2. News Agent");
    sections.push(`News Summary: ${n.news_summary}`);
    sections.push("");
    sections.push("Main Drivers:");
    n.main_drivers.forEach((d) => sections.push(`  • ${d}`));
    sections.push("");
    sections.push("Source Titles (use these verbatim in your sources array):");
    n.source_titles.forEach((t) => sections.push(`  - "${t}"`));
    sections.push("");
    sections.push(`Agent Confidence: ${n.confidence}`);
  } else {
    missing.push("News");
    sections.push("## 2. News Agent — NOT AVAILABLE");
  }
  sections.push("");

  // --- Narrative Agent ---
  if (input.narrativeAnalysis) {
    available.push("Narrative");
    const na = input.narrativeAnalysis;
    sections.push("## 3. Narrative Agent");
    sections.push(`Narrative Summary: ${na.narrative_summary}`);
    sections.push("");
    sections.push("Top Narratives:");
    na.top_narratives.forEach((n) => sections.push(`  • ${n}`));
    sections.push("");
    sections.push(`Affected Tokens: ${na.affected_tokens.join(", ")}`);
    sections.push(`Agent Confidence: ${na.confidence}`);
  } else {
    missing.push("Narrative");
    sections.push("## 3. Narrative Agent — NOT AVAILABLE");
  }
  sections.push("");

  // --- Risk Agent ---
  if (input.riskAnalysis) {
    available.push("Risk");
    const r = input.riskAnalysis;
    sections.push("## 4. Risk Agent");
    sections.push(`Risk Summary: ${r.risk_summary}`);
    sections.push("");
    sections.push("Top Risks:");
    r.top_risks.forEach((risk) => sections.push(`  • ${risk}`));
    sections.push("");
    sections.push(`Severity: ${r.severity}  |  Agent Confidence: ${r.confidence}`);
  } else {
    missing.push("Risk");
    sections.push("## 4. Risk Agent — NOT AVAILABLE");
  }
  sections.push("");

  // --- Coverage note ---
  sections.push("=== SYNTHESIS INSTRUCTIONS ===");
  sections.push("");
  sections.push(
    `Agent coverage: ${available.length}/4 available (${available.join(", ")}).`,
  );
  if (missing.length) {
    sections.push(
      `Missing: ${missing.join(", ")} — account for this gap in your confidence score.`,
    );
  }
  sections.push("");
  sections.push(
    "Synthesize the above into a single market brief. Deduplicate drivers and risks. Use the News Agent's source titles verbatim for the sources array.",
  );

  return sections.join("\n");
}

// ---------------------------------------------------------------------------
// Agent entry point
// ---------------------------------------------------------------------------

export async function runSynthesizerAgent(
  input: SynthesizerInput,
  parentTrace: LangfuseTrace | null,
): Promise<SynthesizedBrief> {
  const agentCoverage = [
    input.marketDataAnalysis && "market_data",
    input.newsAnalysis && "news",
    input.narrativeAnalysis && "narrative",
    input.riskAnalysis && "risk",
  ].filter(Boolean);

  const { span, end } = createAgentSpan(parentTrace, "synthesizer_agent", {
    agents_available: agentCoverage,
    agent_coverage: agentCoverage.length,
  });

  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const model = attempt === 0 ? AGENT_MODEL : FALLBACK_MODEL;

    try {
      const result = await callStructuredJson<SynthesizedBrief>({
        model,
        systemPrompt: SYSTEM_PROMPT,
        userPrompt: buildUserPrompt(input),
        schema: SynthesizedBriefSchema,
        trace: span,
        temperature: 0.2,
      });

      await logScore(span, "structured_output_valid", 1);
      await logScore(span, "confidence_score", result.data.confidence);
      await logScore(span, "driver_count", result.data.drivers.length);
      await logScore(span, "risk_count", result.data.risks.length);
      await logScore(span, "source_count", result.data.sources.length);

      end({
        model: result.model,
        latencyMs: result.latencyMs,
        tokens: result.usage,
        agent_coverage: agentCoverage.length,
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
    : new Error(`Synthesizer Agent failed after ${MAX_RETRIES} attempts`);
}
