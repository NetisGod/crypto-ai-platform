/**
 * Validator Agent
 *
 * Validates and normalizes the synthesized Market Brief before it is saved
 * to the database. This is a deterministic agent — no LLM call, just Zod
 * parsing and pragmatic sanity checks. Runs as a child span under the parent
 * LangGraph workflow trace in Langfuse.
 *
 * Checks: schema conformance, non-empty summary, non-empty drivers/risks,
 * confidence in [0,1], source presence. Normalizes fixable issues in-place
 * (clamps confidence, trims whitespace, deduplicates arrays).
 */

import { logScore, type LangfuseTrace } from "@/lib/langfuse";
import {
  type SynthesizedBrief,
  type ValidationResult,
  SynthesizedBriefSchema,
  createAgentSpan,
} from "./types";

// ---------------------------------------------------------------------------
// Deterministic validation + normalization
// ---------------------------------------------------------------------------

function validate(brief: SynthesizedBrief): ValidationResult {
  const issues: string[] = [];

  // --- Zod parse (catches structural problems) ---
  const parsed = SynthesizedBriefSchema.safeParse(brief);
  if (!parsed.success) {
    const zodIssues = parsed.error.issues.map(
      (i) => `${i.path.join(".")}: ${i.message}`,
    );
    issues.push(...zodIssues);
  }

  // Work on a mutable copy for normalization
  let summary = (brief.market_summary ?? "").trim();
  let drivers = (brief.drivers ?? []).map((d) => d.trim()).filter(Boolean);
  let risks = (brief.risks ?? []).map((r) => r.trim()).filter(Boolean);
  let confidence = brief.confidence ?? 0;
  let sources = (brief.sources ?? []).map((s) => s.trim()).filter(Boolean);

  // --- Summary ---
  if (!summary) {
    issues.push("market_summary is empty");
    summary = "Market brief unavailable — insufficient data for synthesis.";
  } else if (summary.length < 20) {
    issues.push(`market_summary is suspiciously short (${summary.length} chars)`);
  }

  // --- Drivers ---
  drivers = dedupe(drivers);
  if (drivers.length === 0) {
    issues.push("drivers array is empty");
    drivers = ["No clear drivers identified in this cycle"];
  }

  // --- Risks ---
  risks = dedupe(risks);
  if (risks.length === 0) {
    issues.push("risks array is empty");
    risks = ["No specific risks identified in this cycle"];
  }

  // --- Confidence ---
  if (typeof confidence !== "number" || isNaN(confidence)) {
    issues.push(`confidence is not a valid number (got ${String(brief.confidence)})`);
    confidence = 0.5;
  } else if (confidence < 0 || confidence > 1) {
    issues.push(`confidence out of range: ${confidence} — clamped to [0,1]`);
    confidence = Math.max(0, Math.min(1, confidence));
  }

  // --- Sources ---
  sources = dedupe(sources);
  if (sources.length === 0 && drivers.length > 1) {
    issues.push("sources array is empty despite having multiple drivers");
  }

  const normalized: SynthesizedBrief = {
    market_summary: summary,
    drivers,
    risks,
    confidence,
    sources,
  };

  return {
    valid: issues.length === 0,
    normalized_brief: normalized,
    issues,
  };
}

function dedupe(arr: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of arr) {
    const key = item.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Agent entry point
// ---------------------------------------------------------------------------

export async function runValidatorAgent(
  brief: SynthesizedBrief,
  parentTrace: LangfuseTrace | null,
): Promise<ValidationResult> {
  const { span, end } = createAgentSpan(parentTrace, "validator_agent", {
    summary_length: brief.market_summary?.length ?? 0,
    driver_count: brief.drivers?.length ?? 0,
    risk_count: brief.risks?.length ?? 0,
    source_count: brief.sources?.length ?? 0,
  });

  const result = validate(brief);

  await logScore(span, "validation_passed", result.valid ? 1 : 0);
  await logScore(span, "issue_count", result.issues.length);

  end({
    valid: result.valid,
    issues: result.issues,
    normalized_confidence: result.normalized_brief.confidence,
  });

  return result;
}
