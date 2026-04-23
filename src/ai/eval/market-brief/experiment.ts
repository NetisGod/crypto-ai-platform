import {
  startTrace,
  logScore,
  finishTrace,
  flushLangfuse,
  getLangfuse,
} from "@/lib/langfuse";
import { getDb } from "@/lib/db";
import {
  runMarketBriefPipeline,
  type MarketBriefPipelineResult,
} from "@/ai/workflows/market-brief-graph";
import { fetchDatasetItems, type FetchedItem } from "./dataset";
import { runAllEvaluators, computeRunAggregates } from "./evaluators";
import type { EvalScore, ItemEvalResult } from "./types";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface ExperimentConfig {
  runName: string;
  concurrency?: number;
}

export interface ExperimentResult {
  runName: string;
  items: ItemEvalResult[];
  aggregates: EvalScore[];
  totalLatencyMs: number;
}

// ---------------------------------------------------------------------------
// Run a single dataset item through pipeline + evaluators
// ---------------------------------------------------------------------------

async function evaluateItem(
  item: FetchedItem,
  index: number,
  runName: string,
): Promise<ItemEvalResult> {
  const scenario = item.metadata.scenario;
  const itemStart = Date.now();

  const trace = startTrace(
    "market_brief_eval",
    {
      eval_run: runName,
      scenario,
      dataset_item_id: item.id,
    },
    item.input,
  );

  try {
    const result: MarketBriefPipelineResult = await runMarketBriefPipeline({
      overrideContext: item.input,
      skipPersistence: true,
    });

    const scores = runAllEvaluators(
      result.brief,
      item.input,
      item.expectedOutput,
      item.metadata,
      result.debugJson,
    );

    for (const s of scores) {
      await logScore(trace, s.name, s.score);
    }

    if (trace) {
      await item.link(trace, runName);
    }

    await finishTrace(trace);

    return {
      itemIndex: index,
      scenario,
      brief: result.brief,
      debugJson: result.debugJson,
      scores,
      latencyMs: Date.now() - itemStart,
    };
  } catch (error) {
    await finishTrace(trace);

    return {
      itemIndex: index,
      scenario,
      brief: null,
      debugJson: null,
      scores: [{ name: "pipeline_error", score: 0, comment: String(error) }],
      error: String(error),
      latencyMs: Date.now() - itemStart,
    };
  }
}

// ---------------------------------------------------------------------------
// Persist run to eval_runs table
// ---------------------------------------------------------------------------

async function persistEvalRun(result: ExperimentResult): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = getDb() as any;
    const aggregateMap: Record<string, number> = {};
    for (const a of result.aggregates) {
      aggregateMap[a.name] = a.score;
    }

    await db.from("eval_runs").insert({
      metrics: {
        run_name: result.runName,
        item_count: result.items.length,
        aggregates: aggregateMap,
        items: result.items.map((item) => ({
          scenario: item.scenario,
          scores: Object.fromEntries(item.scores.map((s) => [s.name, s.score])),
          error: item.error ?? null,
          latencyMs: item.latencyMs,
        })),
        total_latency_ms: result.totalLatencyMs,
      },
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Eval] Failed to persist eval_run:", err);
  }
}

// ---------------------------------------------------------------------------
// Console output
// ---------------------------------------------------------------------------

export function printResults(result: ExperimentResult): void {
  const SEP = "─".repeat(72);
  console.log(`\n${SEP}`);
  console.log(`  Experiment: ${result.runName}`);
  console.log(`  Items: ${result.items.length} | Total time: ${(result.totalLatencyMs / 1000).toFixed(1)}s`);
  console.log(SEP);

  for (const item of result.items) {
    const avg =
      item.scores.length > 0
        ? item.scores.reduce((a, s) => a + s.score, 0) / item.scores.length
        : 0;
    const status = item.error ? "FAIL" : avg >= 0.7 ? "PASS" : "WARN";
    const icon = item.error ? "✗" : avg >= 0.7 ? "✓" : "△";

    console.log(
      `\n  ${icon} [${status}] ${item.scenario} (${(item.latencyMs / 1000).toFixed(1)}s, avg: ${avg.toFixed(2)})`,
    );

    if (item.error) {
      console.log(`    Error: ${item.error}`);
      continue;
    }

    for (const s of item.scores) {
      const bar = s.score >= 0.8 ? "█" : s.score >= 0.5 ? "▓" : "░";
      const detail = s.comment ? ` — ${s.comment}` : "";
      console.log(`    ${bar} ${s.name}: ${s.score.toFixed(2)}${detail}`);
    }
  }

  console.log(`\n${SEP}`);
  console.log("  Aggregates:");
  for (const a of result.aggregates) {
    console.log(`    ${a.name}: ${a.score.toFixed(4)}  ${a.comment ?? ""}`);
  }
  console.log(SEP + "\n");
}

// ---------------------------------------------------------------------------
// Main experiment runner
// ---------------------------------------------------------------------------

export async function runExperiment(
  config: ExperimentConfig,
): Promise<ExperimentResult> {
  const experimentStart = Date.now();
  const concurrency = config.concurrency ?? 1;

  console.log(`[Eval] Fetching dataset items…`);
  const items = await fetchDatasetItems();
  console.log(`[Eval] Found ${items.length} items. Running with concurrency=${concurrency}…`);

  const results: ItemEvalResult[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((item, j) => evaluateItem(item, i + j, config.runName)),
    );
    results.push(...batchResults);

    const done = Math.min(i + concurrency, items.length);
    console.log(`[Eval] Progress: ${done}/${items.length}`);
  }

  const allScores = results.map((r) => r.scores);
  const aggregates = computeRunAggregates(allScores);

  const experimentResult: ExperimentResult = {
    runName: config.runName,
    items: results,
    aggregates,
    totalLatencyMs: Date.now() - experimentStart,
  };

  await persistEvalRun(experimentResult);

  const langfuse = getLangfuse();
  if (langfuse) {
    await flushLangfuse();
  }

  return experimentResult;
}
