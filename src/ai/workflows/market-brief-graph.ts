/**
 * LangGraph multi-agent workflow for Market Brief generation.
 *
 * Graph:  START → loadContext → analyze → synthesize → validate → END
 *
 * Nodes:
 *   loadContext  — fetches snapshots, news, narratives from Supabase
 *   analyze      — runs 4 analysis agents in parallel (market data, news,
 *                  narrative, risk) via Promise.allSettled for graceful failure
 *   synthesize   — merges sub-analyses into a single dashboard-ready brief
 *   validate     — deterministic quality checks and normalization
 *
 * Observability:
 *   One parent Langfuse trace ("market_brief_pipeline") wraps the entire run.
 *   Each agent creates a child span under this trace via createAgentSpan().
 *   Pipeline-level scores (confidence, validation, agent coverage) are logged
 *   on the parent trace after the graph completes.
 *
 * Persistence:
 *   Final brief → market_briefs.content  (JSON, backward-compatible)
 *   Agent outputs → market_briefs.debug_json  (JSONB, for debug drawer)
 *   Run metadata → ai_runs  (status, timing, errors)
 */

import { StateGraph, START, END } from "@langchain/langgraph";
import { getDb } from "@/lib/db";
import {
  startTrace,
  setTraceOutput,
  finishTrace,
  logScore,
  logError,
  type LangfuseTrace,
} from "@/lib/langfuse";
import {
  MarketBriefGraphState,
  type MarketBriefState,
  type MarketBriefUpdate,
  type SnapshotRow,
  type NewsRow,
  type NarrativeRow,
  type SynthesizedBrief,
  type MarketBriefDebugPayload,
} from "../agents/types";

const PIPELINE_MODEL_LABEL = "router-managed";
import { runMarketDataAgent } from "../agents/market-data-agent";
import { runNewsAgent } from "../agents/news-agent";
import { runNarrativeAgent } from "../agents/narrative-agent";
import { runRiskAgent } from "../agents/risk-agent";
import { runSynthesizerAgent } from "../agents/synthesizer-agent";
import { runValidatorAgent } from "../agents/validator-agent";

const WORKFLOW_NAME = "market_brief_pipeline";

// ---------------------------------------------------------------------------
// Pipeline options (used by eval layer to inject context and skip persistence)
// ---------------------------------------------------------------------------

export interface PipelineOptions {
  overrideContext?: {
    snapshots: SnapshotRow[];
    news: NewsRow[];
    narratives: NarrativeRow[];
  };
  skipPersistence?: boolean;
}

// ---------------------------------------------------------------------------
// Context loading (Supabase)
// ---------------------------------------------------------------------------

async function loadContextFromDb(): Promise<{
  snapshots: SnapshotRow[];
  news: NewsRow[];
  narratives: NarrativeRow[];
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;

  // --- Assets (BTC, ETH, SOL) ---
  const { data: assetRows } = await db
    .from("assets")
    .select("id, symbol, name")
    .in("symbol", ["BTC", "ETH", "SOL"]);

  const assets =
    (assetRows as { id: string; symbol: string; name: string }[] | null) ?? [];

  // --- Latest snapshot per asset ---
  let snapshots: SnapshotRow[] = [];
  if (assets.length) {
    const assetIds = assets.map((a) => a.id);
    const { data: snapshotRows } = await db
      .from("market_snapshots")
      .select(
        "asset_id, price, volume_24h, market_cap, funding_rate, open_interest, snapshot_at",
      )
      .in("asset_id", assetIds)
      .order("snapshot_at", { ascending: false });

    const snapshotsByAsset = new Map<string, SnapshotRow>();
    const rows =
      (snapshotRows as {
        asset_id: string;
        price: number;
        volume_24h: number | null;
        market_cap: number | null;
        funding_rate: number | null;
        open_interest: number | null;
      }[] | null) ?? [];

    for (const row of rows) {
      if (snapshotsByAsset.has(row.asset_id)) continue;
      const asset = assets.find((a) => a.id === row.asset_id);
      if (!asset) continue;
      snapshotsByAsset.set(row.asset_id, {
        symbol: asset.symbol,
        price: row.price,
        volume_24h: row.volume_24h,
        market_cap: row.market_cap,
        funding_rate: row.funding_rate,
        open_interest: row.open_interest,
      });
    }
    snapshots = Array.from(snapshotsByAsset.values());
  }

  // --- Recent news ---
  const { data: newsRows } = await db
    .from("news_items")
    .select("title, source, summary, url, published_at")
    .order("published_at", { ascending: false })
    .limit(20);

  const news = (newsRows as NewsRow[] | null) ?? [];

  // --- Existing narratives ---
  const { data: narrativeRows } = await db
    .from("narratives")
    .select("name, description, strength, trend, sentiment")
    .order("strength", { ascending: false })
    .limit(10);

  const narratives = (narrativeRows as NarrativeRow[] | null) ?? [];

  return { snapshots, news, narratives };
}

// ---------------------------------------------------------------------------
// Graph nodes
// ---------------------------------------------------------------------------

function createLoadContextNode(options?: PipelineOptions) {
  return async function loadContextNode(
    _state: MarketBriefState,
  ): Promise<MarketBriefUpdate> {
    if (options?.overrideContext) {
      return {
        snapshots: options.overrideContext.snapshots,
        news: options.overrideContext.news,
        narratives: options.overrideContext.narratives,
      };
    }
    const { snapshots, news, narratives } = await loadContextFromDb();
    return { snapshots, news, narratives };
  };
}

async function analyzeNode(
  state: MarketBriefState,
): Promise<MarketBriefUpdate> {
  const snapshots = state.snapshots ?? [];
  const news = state.news ?? [];
  const narratives = state.narratives ?? [];
  const trace = state.trace ?? null;

  const [marketResult, newsResult, narrativeResult, riskResult] =
    await Promise.allSettled([
      runMarketDataAgent(snapshots, trace),
      runNewsAgent(news, trace),
      runNarrativeAgent(news, narratives, trace),
      runRiskAgent(snapshots, news, trace),
    ]);

  const issues: string[] = [];
  const update: MarketBriefUpdate = { issues };

  if (marketResult.status === "fulfilled") {
    update.marketDataAnalysis = marketResult.value;
  } else {
    issues.push(`Market Data Agent failed: ${String(marketResult.reason)}`);
    update.marketDataAnalysis = null;
  }

  if (newsResult.status === "fulfilled") {
    update.newsAnalysis = newsResult.value;
  } else {
    issues.push(`News Agent failed: ${String(newsResult.reason)}`);
    update.newsAnalysis = null;
  }

  if (narrativeResult.status === "fulfilled") {
    update.narrativeAnalysis = narrativeResult.value;
  } else {
    issues.push(`Narrative Agent failed: ${String(narrativeResult.reason)}`);
    update.narrativeAnalysis = null;
  }

  if (riskResult.status === "fulfilled") {
    update.riskAnalysis = riskResult.value;
  } else {
    issues.push(`Risk Agent failed: ${String(riskResult.reason)}`);
    update.riskAnalysis = null;
  }

  return update;
}

async function synthesizeNode(
  state: MarketBriefState,
): Promise<MarketBriefUpdate> {
  const trace = state.trace ?? null;
  try {
    const brief = await runSynthesizerAgent(
      {
        marketDataAnalysis: state.marketDataAnalysis ?? null,
        newsAnalysis: state.newsAnalysis ?? null,
        narrativeAnalysis: state.narrativeAnalysis ?? null,
        riskAnalysis: state.riskAnalysis ?? null,
      },
      trace,
    );
    return { synthesizedBrief: brief };
  } catch (error) {
    return {
      issues: [`Synthesizer Agent failed: ${String(error)}`],
    };
  }
}

async function validateNode(
  state: MarketBriefState,
): Promise<MarketBriefUpdate> {
  const brief = state.synthesizedBrief;
  if (!brief) {
    return {
      issues: ["Validation skipped: no synthesized brief available"],
    };
  }

  const trace = state.trace ?? null;
  try {
    const result = await runValidatorAgent(brief, trace);
    const issues: string[] = [];
    if (!result.valid) {
      issues.push(...result.issues);
    }
    return { validationResult: result, issues };
  } catch (error) {
    return {
      issues: [`Validator Agent failed: ${String(error)}`],
    };
  }
}

// ---------------------------------------------------------------------------
// Graph compilation
// ---------------------------------------------------------------------------

let defaultCompiledGraph: ReturnType<ReturnType<typeof StateGraph<typeof MarketBriefGraphState>>["compile"]> | null = null;

function buildGraph(options?: PipelineOptions) {
  return new StateGraph(MarketBriefGraphState)
    .addNode("loadContext", createLoadContextNode(options))
    .addNode("analyze", analyzeNode)
    .addNode("synthesize", synthesizeNode)
    .addNode("validate", validateNode)
    .addEdge(START, "loadContext")
    .addEdge("loadContext", "analyze")
    .addEdge("analyze", "synthesize")
    .addEdge("synthesize", "validate")
    .addEdge("validate", END)
    .compile();
}

function getCompiledGraph(options?: PipelineOptions) {
  if (options?.overrideContext) {
    return buildGraph(options);
  }
  if (!defaultCompiledGraph) {
    defaultCompiledGraph = buildGraph();
  }
  return defaultCompiledGraph;
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export interface MarketBriefPipelineResult {
  brief: SynthesizedBrief;
  model: string;
  latencyMs: number;
  aiRunId: string | null;
  debugJson: MarketBriefDebugPayload;
}

export async function runMarketBriefPipeline(
  options?: PipelineOptions,
): Promise<MarketBriefPipelineResult> {
  const pipelineStart = Date.now();
  const skipPersistence = options?.skipPersistence ?? false;

  // --- Parent Langfuse trace for the entire pipeline ---
  const traceName = skipPersistence ? "market_brief_eval" : WORKFLOW_NAME;
  const trace: LangfuseTrace | null = startTrace(
    traceName,
    { pipeline: "multi_agent", model: PIPELINE_MODEL_LABEL, eval: skipPersistence },
    { triggered_at: new Date().toISOString() },
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = skipPersistence ? null : (getDb() as any);

  // --- Track run in ai_runs (skip for eval) ---
  let aiRunId: string | null = null;
  if (db) {
    const { data: aiRunInsert, error: aiRunInsertError } = await db
      .from("ai_runs")
      .insert({
        run_type: WORKFLOW_NAME,
        status: "running",
        input_snapshot: { pipeline: "multi_agent" },
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    aiRunId = aiRunInsertError || !aiRunInsert ? null : (aiRunInsert.id as string);
  }

  try {
    // --- Invoke the LangGraph pipeline ---
    const graph = getCompiledGraph(options);
    const finalState: MarketBriefState = await graph.invoke({
      trace,
      snapshots: [],
      news: [],
      narratives: [],
      marketDataAnalysis: null,
      newsAnalysis: null,
      narrativeAnalysis: null,
      riskAnalysis: null,
      synthesizedBrief: null,
      validationResult: null,
      issues: [],
    });

    const latencyMs = Date.now() - pipelineStart;

    // --- Extract final brief (prefer validated, fall back to synthesized) ---
    const finalBrief: SynthesizedBrief | null =
      finalState.validationResult?.normalized_brief ??
      finalState.synthesizedBrief ??
      null;

    if (!finalBrief) {
      const errorMsg =
        finalState.issues?.length
          ? finalState.issues.join("; ")
          : "Pipeline produced no output";

      await markAiRunFailed(db, aiRunId, errorMsg);
      await logError(trace, new Error(errorMsg));
      throw new Error(errorMsg);
    }

    // --- Build debug_json for the debug drawer ---
    const agentCoverage = [
      finalState.marketDataAnalysis && "market_data",
      finalState.newsAnalysis && "news",
      finalState.narrativeAnalysis && "narrative",
      finalState.riskAnalysis && "risk",
    ].filter((v): v is string => Boolean(v));

    const debugJson: MarketBriefDebugPayload = {
      marketDataAnalysis: finalState.marketDataAnalysis ?? null,
      newsAnalysis: finalState.newsAnalysis ?? null,
      narrativeAnalysis: finalState.narrativeAnalysis ?? null,
      riskAnalysis: finalState.riskAnalysis ?? null,
      synthesizedBrief: finalState.synthesizedBrief ?? null,
      validationResult: finalState.validationResult
        ? {
            valid: finalState.validationResult.valid,
            issues: finalState.validationResult.issues,
          }
        : null,
      issues: finalState.issues ?? [],
      meta: {
        latencyMs,
        agentCoverage,
        model: PIPELINE_MODEL_LABEL,
        snapshotCount: (finalState.snapshots ?? []).length,
        newsCount: (finalState.news ?? []).length,
      },
    };

    // --- Langfuse: pipeline-level output and scores ---
    setTraceOutput(trace, finalBrief);
    await logScore(trace, "confidence_score", finalBrief.confidence);
    await logScore(trace, "source_presence", finalBrief.sources.length > 0 ? 1 : 0);
    await logScore(trace, "validation_passed", finalState.validationResult?.valid ? 1 : 0);
    await logScore(trace, "agent_coverage", agentCoverage.length / 4);

    // --- Persist to market_briefs (skip for eval) ---
    if (db) {
      await db.from("market_briefs").insert({
        content: JSON.stringify({
          brief: finalBrief,
          model: PIPELINE_MODEL_LABEL,
          context: {
            snapshots_count: (finalState.snapshots ?? []).length,
            news_count: (finalState.news ?? []).length,
          },
        }),
        debug_json: debugJson,
      });

      // --- Update ai_runs ---
      if (aiRunId) {
        await db
          .from("ai_runs")
          .update({
            status: "completed",
            output_snapshot: {
              workflow_name: WORKFLOW_NAME,
              model: PIPELINE_MODEL_LABEL,
              latency_ms: latencyMs,
              agent_coverage: agentCoverage,
              brief: finalBrief,
              issues: finalState.issues ?? [],
            },
            completed_at: new Date().toISOString(),
          })
          .eq("id", aiRunId);
      }
    }

    return { brief: finalBrief, model: PIPELINE_MODEL_LABEL, latencyMs, aiRunId, debugJson };
  } catch (error) {
    const latencyMs = Date.now() - pipelineStart;
    if (db) {
      await markAiRunFailed(
        db,
        aiRunId,
        error instanceof Error ? error.message : String(error),
        latencyMs,
      );
    }
    await logError(trace, error);
    throw error;
  } finally {
    await finishTrace(trace);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function markAiRunFailed(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  aiRunId: string | null,
  errorMessage: string,
  latencyMs?: number,
): Promise<void> {
  if (!aiRunId) return;
  await db
    .from("ai_runs")
    .update({
      status: "failed",
      error_message: errorMessage,
      ...(latencyMs !== undefined && {
        output_snapshot: { latency_ms: latencyMs },
      }),
      completed_at: new Date().toISOString(),
    })
    .eq("id", aiRunId);
}
