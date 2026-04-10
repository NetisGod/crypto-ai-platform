/**
 * Freshness checking for ingested data.
 * Queries the latest successful ingestion_runs row and compares timestamps.
 */

import { getDb } from "@/lib/db";

const FRESHNESS_THRESHOLDS = {
  prices: 15 * 60_000,
  news: 30 * 60_000,
  funding: 60 * 60_000,
} as const;

export interface FreshnessStatus {
  fresh: boolean;
  staleSources: string[];
  lastRun: { id: string; completed_at: string; status: string } | null;
}

/**
 * Check whether ingested data is fresh enough for agent consumption.
 * Returns which sources are stale (if any).
 */
export async function isDataFresh(): Promise<FreshnessStatus> {
  const db = getDb();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db as any)
    .from("ingestion_runs")
    .select("id, completed_at, status, prices, funding, news")
    .in("status", ["completed", "partial"])
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return { fresh: false, staleSources: ["prices", "news", "funding"], lastRun: null };
  }

  const row = data as {
    id: string;
    completed_at: string;
    status: string;
    prices: Record<string, unknown> | null;
    funding: Record<string, unknown> | null;
    news: Record<string, unknown> | null;
  };

  const now = Date.now();
  const completedAt = new Date(row.completed_at).getTime();
  const staleSources: string[] = [];

  for (const [source, threshold] of Object.entries(FRESHNESS_THRESHOLDS)) {
    const sourceData = row[source as keyof typeof FRESHNESS_THRESHOLDS];
    const hasError = sourceData && typeof sourceData === "object" && "error" in sourceData;
    if (hasError || now - completedAt > threshold) {
      staleSources.push(source);
    }
  }

  return {
    fresh: staleSources.length === 0,
    staleSources,
    lastRun: { id: row.id, completed_at: row.completed_at, status: row.status },
  };
}
