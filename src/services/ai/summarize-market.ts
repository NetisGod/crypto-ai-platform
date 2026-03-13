/**
 * AI Market Brief workflow.
 *
 * Generates a structured crypto market briefing using:
 * - latest BTC/ETH/SOL market snapshots (with funding/open interest)
 * - recent crypto news from Supabase.
 *
 * Output JSON schema:
 * {
 *   "market_summary": string,
 *   "drivers": string[],
 *   "risks": string[],
 *   "confidence": number,
 *   "sources": string[]
 * }
 *
 * Behaviour:
 * - Fetch context from Supabase
 * - Call central AI client (OpenAI) with structured JSON schema
 * - Validate with zod and retry once on failure
 * - Log metrics into ai_runs
 * - Emit Langfuse trace and scores
 */

import { z } from "zod";
import { getDb } from "@/lib/db";
import { runStructuredWorkflow } from "@/lib/ai-workflow-runner";

const WORKFLOW_NAME = "market_brief";
const MODEL = "gpt-4.1-mini";

export const MarketBriefSchema = z.object({
  market_summary: z.string(),
  drivers: z.array(z.string()),
  risks: z.array(z.string()),
  confidence: z.number(),
  sources: z.array(z.string()),
});

export type MarketBrief = z.infer<typeof MarketBriefSchema>;

interface SnapshotRow {
  symbol: string;
  price: number;
  volume_24h: number | null;
  market_cap: number | null;
  funding_rate: number | null;
  open_interest: number | null;
}

interface NewsRow {
  title: string;
  source: string;
  summary: string | null;
  url: string | null;
  published_at: string | null;
}

export interface MarketBriefResult {
  brief: MarketBrief;
  model: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  latencyMs: number;
  retryCount: number;
  aiRunId: string | null;
}

function estimateCostUsd(
  promptTokens: number,
  completionTokens: number,
): number {
  const inputPer1K = 0.0003;
  const outputPer1K = 0.0006;
  return (
    (promptTokens / 1000) * inputPer1K +
    (completionTokens / 1000) * outputPer1K
  );
}

async function loadContextFromDb(): Promise<{
  snapshots: SnapshotRow[];
  news: NewsRow[];
}> {
  const db = getDb();

  // Focus on BTC, ETH, SOL.
  const { data: assetRows } = await (db
    .from("assets")
    .select("id, symbol, name")
    .in("symbol", ["BTC", "ETH", "SOL"]) as any);

  const assets =
    (assetRows as { id: string; symbol: string; name: string }[] | null) ?? [];
  if (!assets.length) {
    return { snapshots: [], news: [] };
  }

  const assetIds = assets.map((a) => a.id);

  const { data: snapshotRows } = await (db
    .from("market_snapshots")
    .select(
      "asset_id, price, volume_24h, market_cap, funding_rate, open_interest, snapshot_at",
    )
    .in("asset_id", assetIds)
    .order("snapshot_at", { ascending: false }) as any);

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

  const snapshots = Array.from(snapshotsByAsset.values());

  const { data: newsRows } = await (db
    .from("news_items")
    .select("title, source, summary, url, published_at")
    .order("published_at", { ascending: false })
    .limit(20) as any);

  const news = (newsRows as NewsRow[] | null) ?? [];

  return { snapshots, news };
}

function buildContextPrompt(
  snapshots: SnapshotRow[],
  news: NewsRow[],
): string {
  const lines: string[] = [];

  lines.push("You are an AI crypto market analyst.");
  lines.push(
    "You will receive latest BTC, ETH, and SOL market snapshots with funding/open interest, and recent crypto news.",
  );
  lines.push(
    "Produce a concise professional market brief for sophisticated crypto traders.",
  );

  lines.push("");
  lines.push("=== MARKET SNAPSHOTS (LATEST) ===");
  if (!snapshots.length) {
    lines.push("No market snapshot data available.");
  } else {
    for (const s of snapshots) {
      lines.push(
        `- ${s.symbol}: price=${s.price}, vol24h=${s.volume_24h ?? "n/a"}, mcap=${s.market_cap ?? "n/a"}, funding=${s.funding_rate ?? "n/a"}, OI=${s.open_interest ?? "n/a"}`,
      );
    }
  }

  lines.push("");
  lines.push("=== RECENT NEWS (MAX 20) ===");
  if (!news.length) {
    lines.push("No recent news available.");
  } else {
    news.forEach((n, idx) => {
      lines.push(
        `${idx + 1}. [${n.source}] ${n.title} (${n.published_at ?? "unknown date"})`,
      );
      if (n.summary) {
        lines.push(`   Summary: ${n.summary}`);
      }
      if (n.url) {
        lines.push(`   URL: ${n.url}`);
      }
    });
  }

  lines.push("");
  lines.push(
    "Focus on what is moving the market, key drivers, risks, and link specific statements to sources when possible.",
  );
  lines.push("");
  lines.push(
    "Respond with exactly one JSON object at the root (no wrapper). Keys: market_summary (string), drivers (string[]), risks (string[]), confidence (number 0-1), sources (string[]).",
  );

  return lines.join("\n");
}

export async function generateMarketBrief(): Promise<MarketBriefResult> {
  const contextStart = Date.now();
  const { snapshots, news } = await loadContextFromDb();
  const contextLatencyMs = Date.now() - contextStart;

  const traceInput = {
    snapshots_count: snapshots.length,
    news_count: news.length,
    context_latency_ms: contextLatencyMs,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;
  const { data: aiRunInsert, error: aiRunInsertError } = await db
    .from("ai_runs")
    .insert({
      run_type: WORKFLOW_NAME,
      status: "running",
      input_snapshot: traceInput as Record<string, unknown>,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  const aiRunId: string | null =
    aiRunInsertError || !aiRunInsert ? null : (aiRunInsert.id as string);

  const systemPrompt =
    "You are an AI crypto market strategist. Return a single JSON object with these exact top-level keys only: market_summary (string), drivers (array of strings), risks (array of strings), confidence (number 0-1), sources (array of strings). Do not wrap the object in another key; the root of your response must be this object.";
  const userPrompt = buildContextPrompt(snapshots, news);

  const result = await runStructuredWorkflow<MarketBrief>({
    workflowName: WORKFLOW_NAME,
    model: MODEL,
    systemPrompt,
    prompt: userPrompt,
    traceInput,
    schema: MarketBriefSchema,
    metadata: traceInput as Record<string, unknown>,
    customScores: (data) => ({
      source_presence: data.sources.length > 0 ? 1 : 0,
      confidence_score: data.confidence,
    }),
    maxRetries: 2,
  });

  if (!result.success || !result.output) {
    if (aiRunId) {
      await db
        .from("ai_runs")
        .update({
          status: "failed",
          output_snapshot: {
            workflow_name: WORKFLOW_NAME,
            model: result.model,
            retry_count: result.retryCount,
          } as Record<string, unknown>,
          error_message:
            result.error instanceof Error
              ? result.error.message
              : String(result.error),
          completed_at: new Date().toISOString(),
        })
        .eq("id", aiRunId);
    }
    throw result.error ?? new Error("Failed to generate market brief");
  }

  const usage = {
    promptTokens: result.inputTokens,
    completionTokens: result.outputTokens,
    totalTokens: result.inputTokens + result.outputTokens,
  };
  const costUsd = estimateCostUsd(result.inputTokens, result.outputTokens);

  if (aiRunId) {
    await db
      .from("ai_runs")
      .update({
        status: "completed",
        output_snapshot: {
          workflow_name: WORKFLOW_NAME,
          model: result.model,
          latency_ms: result.latencyMs,
          usage,
          cost_usd: costUsd,
          retry_count: result.retryCount,
          brief: result.output,
        } as Record<string, unknown>,
        error_message: null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", aiRunId);
  }

  if (snapshots.length + news.length > 0) {
    await db.from("market_briefs").insert({
      content: JSON.stringify({
        brief: result.output,
        model: result.model,
        context: {
          snapshots_count: snapshots.length,
          news_count: news.length,
        },
      }),
    });
  }

  return {
    brief: result.output,
    model: result.model,
    usage,
    latencyMs: result.latencyMs,
    retryCount: result.retryCount,
    aiRunId,
  };
}