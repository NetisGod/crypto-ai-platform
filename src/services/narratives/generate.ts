/**
 * AI explanation layer for Narratives.
 *
 * Takes deterministic NarrativeCandidate[] and generates structured
 * narrative explanations using the shared AI runner.
 *
 * Template: src/services/ai/ask-ai.ts
 * AI path:  runAIStructured("synthesis", prompt, NarrativesAIOutputSchema)
 *           → chooseModel("synthesis") → gpt-4.1, temp 0.4
 *           → callOpenRouterStructured → Zod validation → typed result
 * Fallback: runAI("synthesis") → manual JSON parse → schema safeParse
 */

import { runAI, runAIStructured } from "@/ai/runner/runAI";
import {
  NarrativesAIOutputSchema,
  type NarrativesAIOutput,
} from "@/ai/schemas/narratives";
import type { NarrativeCandidate } from "./types";
import { NARRATIVE_TAXONOMY } from "./taxonomy";
import type { NewsItem } from "@/services/news/getLatestNews";

// ─── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a crypto market narrative analyst for an AI-powered trading intelligence platform.

Rules:
- Explain ONLY the narrative candidates provided in the user message.
- Do not invent narratives, tokens, prices, or news that are not in the provided data.
- Each narrative must reference its slug exactly as given.
- Summaries must be concise (1-2 sentences).
- Thesis must explain WHY this narrative is active/emerging/fading based on the data.
- Supporting signals must reference concrete data points from the input (price moves, breadth, leader tokens).
- Risk signals should mention realistic caveats based on the data (e.g. low breadth, single-token concentration, limited data coverage, stale data).
- If data coverage is below 50%, add a risk signal noting limited token coverage.
- Catalysts should mention plausible near-term events only if clearly implied by the data; otherwise return an empty array.
- Confidence should reflect how well the provided data supports the narrative (0.0 = no signal, 1.0 = strong multi-token confirmation).
- When data coverage is low (few tokens out of the bucket have data), confidence MUST be reduced proportionally. A narrative based on 1 out of 5 tokens should not exceed 0.4 confidence.
- Do not provide financial advice or price predictions.

You must return a JSON object with this exact shape:
{
  "narratives": [
    {
      "slug": "string — must match the candidate slug",
      "title": "string — concise narrative title",
      "summary": "string — 1-2 sentence overview",
      "thesis": "string — why this narrative matters right now",
      "supporting_signals": [{ "label": "string", "explanation": "string" }],
      "risk_signals": ["string"],
      "catalysts": ["string"],
      "confidence": 0.0 to 1.0
    }
  ]
}`;

// ─── Prompt builder ────────────────────────────────────────────────────────────

function formatChange(value: number): string {
  return value >= 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
}

export function buildNarrativePrompt(
  candidates: NarrativeCandidate[],
  news: NewsItem[],
): string {
  const lines: string[] = [];

  lines.push(`TASK: Analyze the following ${candidates.length} narrative candidates and produce structured explanations.`);
  lines.push("");

  for (const c of candidates) {
    const bucket = NARRATIVE_TAXONOMY[c.slug];
    const desc = bucket?.description ?? "";

    lines.push(`=== NARRATIVE CANDIDATE: ${c.name} (slug: "${c.slug}") ===`);
    if (desc) lines.push(`Theme: ${desc}`);
    lines.push(`Status: ${c.status}`);
    lines.push(`Data coverage: ${c.tokens.length}/${c.bucketSize} tokens (${Math.round(c.dataCoverage * 100)}%)`);
    lines.push(`Composite Score: ${c.compositeScore}/100`);
    lines.push(`  Performance Score: ${c.performanceScore}/100`);
    lines.push(`  Breadth Score: ${c.breadthScore}/100`);
    lines.push(`  Mover Presence Score: ${c.moverPresenceScore}/100`);

    lines.push(`Tokens with data: ${c.tokens.join(", ")}`);
    if (c.leaderTokens.length > 0) {
      lines.push(`Leader tokens: ${c.leaderTokens.join(", ")}`);
    }

    lines.push("Token performance (24h):");
    for (const [sym, change] of Object.entries(c.tokenPerformance)) {
      const isLeader = c.leaderTokens.includes(sym);
      lines.push(`  ${sym}: ${formatChange(change)}${isLeader ? " [leader]" : ""}`);
    }

    lines.push("");
  }

  if (news.length > 0) {
    lines.push("=== RECENT NEWS CONTEXT ===");
    for (const item of news) {
      const date = item.published_at?.slice(0, 10) ?? "unknown";
      lines.push(`  [${item.source}] ${item.title} (${date})`);
    }
    lines.push("");
  } else {
    lines.push("RECENT NEWS: unavailable");
    lines.push("");
  }

  lines.push("Using ONLY the data above, produce a narrative analysis for each candidate. Return valid JSON.");

  return lines.join("\n");
}

// ─── Fallback ──────────────────────────────────────────────────────────────────

function buildFallbackOutput(candidates: NarrativeCandidate[]): NarrativesAIOutput {
  return {
    narratives: candidates.map((c) => ({
      slug: c.slug,
      title: c.name,
      summary: `${c.name} narrative with composite score ${c.compositeScore}/100.`,
      thesis: "Insufficient AI context to generate a detailed thesis. Scores are based on deterministic market data.",
      supporting_signals: c.leaderTokens.map((sym) => ({
        label: `${sym} 24h performance`,
        explanation: `${sym} moved ${formatChange(c.tokenPerformance[sym] ?? 0)} in the last 24 hours.`,
      })),
      risk_signals: ["AI explanation unavailable — showing deterministic scores only"],
      catalysts: [],
      confidence: 0.2,
    })),
  };
}

function extractJsonCandidate(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced && fenced[1]) return fenced[1].trim();

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1).trim();
  }

  return null;
}

function safeParseJson(text: string): unknown | null {
  try {
    return JSON.parse(text.trim());
  } catch {
    // noop
  }

  const extracted = extractJsonCandidate(text);
  if (!extracted) return null;

  try {
    return JSON.parse(extracted);
  } catch {
    return null;
  }
}

// ─── Main export ───────────────────────────────────────────────────────────────

export interface AIGenerationResult {
  aiOutput: NarrativesAIOutput;
  model: string;
  latencyMs: number;
  fallback: boolean;
}

/**
 * Generate AI narrative explanations for the given candidates.
 *
 * Primary path: runAIStructured with Zod validation.
 * Fallback path: runAI + manual JSON parse + schema safeParse.
 * Terminal fallback: deterministic-only output with low confidence.
 */
export async function generateNarrativeExplanations(
  candidates: NarrativeCandidate[],
  news: NewsItem[],
): Promise<AIGenerationResult> {
  if (candidates.length === 0) {
    return {
      aiOutput: { narratives: [] },
      model: "none",
      latencyMs: 0,
      fallback: true,
    };
  }

  const prompt = buildNarrativePrompt(candidates, news);

  // --- Primary: structured generation with Zod validation ---
  try {
    const result = await runAIStructured(
      "synthesis",
      prompt,
      NarrativesAIOutputSchema,
      { systemPrompt: SYSTEM_PROMPT },
    );

    return {
      aiOutput: result.data,
      model: result.model,
      latencyMs: result.latencyMs,
      fallback: false,
    };
  } catch (structuredError) {
    console.warn("[narratives/generate] structured generation failed, attempting raw JSON parse");

    // --- Fallback: plain text + manual parse ---
    try {
      const raw = await runAI("synthesis", prompt, { systemPrompt: SYSTEM_PROMPT });
      const parsed = safeParseJson(raw.text);

      if (parsed) {
        const validated = NarrativesAIOutputSchema.safeParse(parsed);
        if (validated.success) {
          return {
            aiOutput: validated.data,
            model: raw.model,
            latencyMs: raw.latencyMs,
            fallback: true,
          };
        }
      }

      console.warn("[narratives/generate] raw parse failed, using deterministic fallback");
    } catch (rawError) {
      console.error("[narratives/generate] fallback generation failed:", structuredError, rawError);
    }

    // --- Terminal fallback: deterministic-only ---
    return {
      aiOutput: buildFallbackOutput(candidates),
      model: "fallback",
      latencyMs: 0,
      fallback: true,
    };
  }
}
