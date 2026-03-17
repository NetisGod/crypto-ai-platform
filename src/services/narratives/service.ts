/**
 * Narratives orchestration service.
 *
 * Two entry points:
 *   getLatestNarratives()  — read cached snapshot (GET path, no LLM)
 *   generateNarratives()   — full pipeline (POST path, with LLM)
 *
 * Generate pipeline:
 *   loadTokenMarketData → scoreNarrativeCandidates → getLatestNews
 *   → generateNarrativeExplanations → merge → persist → return
 *
 * Patterns reused:
 *   - getLatestMarketBrief()      (src/lib/market-brief-cache.ts)
 *   - runMarketBriefPipeline()    (src/ai/workflows/market-brief-graph.ts)
 *   - ai_runs tracking            (same table, same status lifecycle)
 *   - Langfuse tracing            (same startTrace / finishTrace flow)
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { getDb } from "@/lib/db";
import {
  startTrace,
  setTraceOutput,
  finishTrace,
  logScore,
  logError,
  type LangfuseTrace,
} from "@/lib/langfuse";
import { getLatestNews } from "@/services/news/getLatestNews";
import { loadTokenMarketData, scoreNarrativeCandidates } from "./scoring";
import { generateNarrativeExplanations } from "./generate";
import { ALL_TAXONOMY_SYMBOLS } from "./taxonomy";
import type { NarrativeAIItem } from "@/ai/schemas/narratives";
import type {
  NarrativeItem,
  NarrativeCandidate,
  NarrativeTokenRef,
  NarrativeSignal,
} from "./types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WORKFLOW_NAME = "narratives_generation";
const MAX_CANDIDATES_FOR_AI = 6;

// ---------------------------------------------------------------------------
// GET: read latest cached narrative snapshot
// ---------------------------------------------------------------------------

export interface CachedNarratives {
  narratives: NarrativeItem[];
  updatedAt: string;
  model: string;
  debugJson: Record<string, unknown> | null;
}

/** Shape stored inside narrative_snapshots.content (JSON string). */
interface StoredContent {
  narratives?: NarrativeItem[];
  updatedAt?: string;
  model?: string;
}

/**
 * Returns the latest persisted narrative snapshot.
 * No LLM call, no Langfuse trace.
 *
 * Mirrors getLatestMarketBrief() in src/lib/market-brief-cache.ts.
 */
export async function getLatestNarratives(): Promise<CachedNarratives | null> {
  const db = getDb() as any;

  const { data: rows } = await db
    .from("narrative_snapshots")
    .select("id, content, debug_json, generated_at")
    .order("generated_at", { ascending: false })
    .limit(1);

  if (!rows?.length) return null;

  const row = rows[0] as {
    id: string;
    content: string;
    debug_json: Record<string, unknown> | null;
    generated_at: string;
  };

  let parsed: StoredContent;
  try {
    parsed = JSON.parse(row.content) as StoredContent;
  } catch {
    return null;
  }

  if (!parsed.narratives || !Array.isArray(parsed.narratives)) return null;

  return {
    narratives: parsed.narratives,
    updatedAt: parsed.updatedAt ?? row.generated_at,
    model: typeof parsed.model === "string" ? parsed.model : "unknown",
    debugJson: row.debug_json ?? null,
  };
}

// ---------------------------------------------------------------------------
// POST: full generation pipeline
// ---------------------------------------------------------------------------

export interface GenerateNarrativesResult {
  narratives: NarrativeItem[];
  updatedAt: string;
  model: string;
  latencyMs: number;
  aiRunId: string | null;
  debugJson: Record<string, unknown>;
}

/**
 * Full narrative generation pipeline:
 * 1. Load market data from Binance + Supabase snapshots
 * 2. Score and rank narrative candidates deterministically
 * 3. Fetch recent news for AI context
 * 4. Generate AI explanations for top candidates
 * 5. Merge deterministic scores + AI output into NarrativeItem[]
 * 6. Persist snapshot to narrative_snapshots
 * 7. Track run in ai_runs
 */
export async function generateNarratives(): Promise<GenerateNarrativesResult> {
  const pipelineStart = Date.now();

  const trace: LangfuseTrace | null = startTrace(
    WORKFLOW_NAME,
    { pipeline: "narratives" },
    { triggered_at: new Date().toISOString() },
  );

  const db = getDb() as any;

  // --- Track run in ai_runs ---
  const { data: aiRunInsert, error: aiRunInsertError } = await db
    .from("ai_runs")
    .insert({
      run_type: WORKFLOW_NAME,
      status: "running",
      input_snapshot: { pipeline: "narratives" },
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  const aiRunId: string | null =
    aiRunInsertError || !aiRunInsert ? null : (aiRunInsert.id as string);

  try {
    // --- 1. Load market data ---
    const tokenData = await loadTokenMarketData();
    const tokenCount = tokenData.size;

    // --- 2. Score narrative candidates ---
    const allCandidates = scoreNarrativeCandidates(tokenData);
    const candidates = allCandidates.slice(0, MAX_CANDIDATES_FOR_AI);

    // --- 3. Fetch news ---
    const news = await getLatestNews(10);

    await logScore(trace, "token_count", tokenCount);
    await logScore(trace, "candidate_count", candidates.length);
    await logScore(trace, "news_count", news.length);
    await logScore(trace, "data_coverage", tokenCount / Math.max(ALL_TAXONOMY_SYMBOLS.length, 1));

    // --- 4. AI explanation ---
    const aiResult = await generateNarrativeExplanations(candidates, news);

    // --- 5. Merge ---
    const now = new Date().toISOString();
    const narratives = mergeResults(candidates, aiResult.aiOutput.narratives, now);

    const latencyMs = Date.now() - pipelineStart;
    const updatedAt = now;

    // --- Langfuse scores ---
    const avgConfidence =
      narratives.length > 0
        ? narratives.reduce((sum, n) => sum + n.confidenceScore, 0) / narratives.length
        : 0;
    setTraceOutput(trace, { narrative_count: narratives.length, avgConfidence });
    await logScore(trace, "narrative_count", narratives.length);
    await logScore(trace, "avg_confidence", avgConfidence);
    await logScore(trace, "ai_fallback", aiResult.fallback ? 1 : 0);

    // --- 6. Persist (mirrors market_briefs insert in market-brief-graph.ts) ---
    const taxonomyTokenCount = ALL_TAXONOMY_SYMBOLS.length;
    const avgCoverage =
      allCandidates.length > 0
        ? allCandidates.reduce((sum, c) => sum + c.dataCoverage, 0) / allCandidates.length
        : 0;

    const debugJson: Record<string, unknown> = {
      candidates: allCandidates,
      aiOutput: aiResult.aiOutput,
      meta: {
        tokenCount,
        taxonomyTokenCount,
        avgDataCoverage: Math.round(avgCoverage * 100) / 100,
        candidateCount: allCandidates.length,
        candidatesSentToAI: candidates.length,
        newsCount: news.length,
        model: aiResult.model,
        latencyMs,
        aiFallback: aiResult.fallback,
      },
    };

    await db.from("narrative_snapshots").insert({
      content: JSON.stringify({ narratives, updatedAt, model: aiResult.model }),
      debug_json: debugJson,
    });

    // --- 7. Update ai_runs ---
    if (aiRunId) {
      await db
        .from("ai_runs")
        .update({
          status: "completed",
          output_snapshot: {
            workflow_name: WORKFLOW_NAME,
            model: aiResult.model,
            latency_ms: latencyMs,
            narrative_count: narratives.length,
            avg_confidence: avgConfidence,
          },
          completed_at: new Date().toISOString(),
        })
        .eq("id", aiRunId);
    }

    return {
      narratives,
      updatedAt,
      model: aiResult.model,
      latencyMs,
      aiRunId,
      debugJson,
    };
  } catch (error) {
    const latencyMs = Date.now() - pipelineStart;
    if (aiRunId) {
      await db
        .from("ai_runs")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : String(error),
          output_snapshot: { latency_ms: latencyMs },
          completed_at: new Date().toISOString(),
        })
        .eq("id", aiRunId);
    }
    await logError(trace, error);
    throw error;
  } finally {
    await finishTrace(trace);
  }
}

// ---------------------------------------------------------------------------
// Merge: deterministic candidates + AI explanations → NarrativeItem[]
// ---------------------------------------------------------------------------

function mergeResults(
  candidates: NarrativeCandidate[],
  aiItems: NarrativeAIItem[],
  updatedAt: string,
): NarrativeItem[] {
  const aiBySlug = new Map(aiItems.map((a) => [a.slug, a]));

  return candidates.map((c) => {
    const ai = aiBySlug.get(c.slug);

    const leaderTokens: NarrativeTokenRef[] = c.leaderTokens.map((s) => ({
      symbol: s,
      role: "leader",
    }));

    const laggardSymbols = c.tokens.filter(
      (s) => c.tokenPerformance[s] < 0 && !c.leaderTokens.includes(s),
    );
    const laggardTokens: NarrativeTokenRef[] = laggardSymbols.map((s) => ({
      symbol: s,
      role: "laggard",
    }));

    const relatedSymbols = c.tokens.filter(
      (s) => !c.leaderTokens.includes(s) && !laggardSymbols.includes(s),
    );
    const relatedTokens: NarrativeTokenRef[] = relatedSymbols.map((s) => ({
      symbol: s,
      role: "related",
    }));

    const supportingSignals: NarrativeSignal[] = (ai?.supporting_signals ?? []).map((s) => ({
      label: s.label,
      explanation: s.explanation,
    }));

    const rawConfidence = ai?.confidence ?? 0.2;
    const confidenceScore = Math.round(
      Math.min(rawConfidence, c.dataCoverage) * 100,
    ) / 100;

    return {
      id: crypto.randomUUID(),
      slug: c.slug,
      title: ai?.title ?? c.name,
      summary: ai?.summary ?? `${c.name} — composite score ${c.compositeScore}/100.`,
      thesis: ai?.thesis ?? "Deterministic scoring only; AI explanation unavailable.",
      status: c.status,
      strengthScore: c.compositeScore,
      confidenceScore,
      leaderTokens,
      relatedTokens,
      laggardTokens: laggardTokens.length > 0 ? laggardTokens : undefined,
      supportingSignals,
      riskSignals: ai?.risk_signals ?? [],
      catalysts: ai?.catalysts ?? [],
      updatedAt,
    };
  });
}
