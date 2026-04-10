/**
 * Persist normalized ingestion data into Supabase.
 * Uses batch operations to minimize round-trips within Vercel's timeout.
 */

import { getDb } from "@/lib/db";
import type { NormalizedPrice, NormalizedFunding, NormalizedNewsItem, SourceResult } from "./types";
import type {
  MarketSnapshotInsert,
  IngestionRunInsert,
  DocumentChunkInsert,
} from "@/types/database";

/* eslint-disable @typescript-eslint/no-explicit-any */

const log = (msg: string, meta?: Record<string, unknown>) => {
  const line = meta ? `${msg} ${JSON.stringify(meta)}` : msg;
  console.log(`[ingestion/store] ${line}`);
};

/** Upsert assets by symbol in a single batch; return map symbol -> id. */
export async function upsertAssets(
  items: { symbol: string; name: string }[]
): Promise<Map<string, string>> {
  const db = getDb();
  const symbolToId = new Map<string, string>();
  const unique = Array.from(new Map(items.map((i) => [i.symbol, i])).values());

  const rows = unique.map((i) => ({ symbol: i.symbol, name: i.name }));
  const { data, error } = await (db as any)
    .from("assets")
    .upsert(rows, { onConflict: "symbol", ignoreDuplicates: false })
    .select("id, symbol");

  if (error) {
    log("upsertAssets batch error, falling back to select", { error: error.message });
    const { data: existing } = await (db as any)
      .from("assets")
      .select("id, symbol")
      .in("symbol", unique.map((i) => i.symbol));
    if (existing) {
      for (const row of existing as { id: string; symbol: string }[]) {
        symbolToId.set(row.symbol, row.id);
      }
    }
    return symbolToId;
  }

  for (const row of (data ?? []) as { id: string; symbol: string }[]) {
    symbolToId.set(row.symbol, row.id);
  }
  return symbolToId;
}

/** Insert market snapshots in a single batch. */
export async function insertMarketSnapshots(
  prices: NormalizedPrice[],
  fundingBySymbol?: Map<string, NormalizedFunding>
): Promise<{ inserted: number; error?: string }> {
  const db = getDb();
  const assetIds = await upsertAssets(
    prices.map((p) => ({ symbol: p.symbol, name: p.name }))
  );

  const rows: MarketSnapshotInsert[] = [];
  for (const p of prices) {
    const assetId = assetIds.get(p.symbol);
    if (!assetId) continue;
    const funding = fundingBySymbol?.get(p.symbol);
    rows.push({
      asset_id: assetId,
      price: p.price,
      volume_24h: p.volume_24h,
      market_cap: p.market_cap,
      funding_rate: funding?.funding_rate ?? null,
      open_interest: funding?.open_interest ?? null,
      snapshot_at: p.snapshot_at,
    });
  }

  if (rows.length === 0) return { inserted: 0 };

  const { error } = await (db as any).from("market_snapshots").insert(rows);
  if (error) {
    log("insertMarketSnapshots batch error", { error: error.message });
    return { inserted: 0, error: error.message };
  }
  return { inserted: rows.length };
}

/** Update existing latest snapshots with funding/OI (by asset symbol). */
export async function updateSnapshotsFunding(
  funding: NormalizedFunding[]
): Promise<{ updated: number; error?: string }> {
  if (funding.length === 0) return { updated: 0 };
  const db = getDb();
  const assetIds = await upsertAssets(
    funding.map((f) => ({ symbol: f.symbol, name: f.symbol }))
  );
  let updated = 0;

  for (const f of funding) {
    const assetId = assetIds.get(f.symbol);
    if (!assetId) continue;

    const { data: latestRow } = await (db as any)
      .from("market_snapshots")
      .select("id")
      .eq("asset_id", assetId)
      .order("snapshot_at", { ascending: false })
      .limit(1)
      .single();

    const latest = latestRow as { id: string } | null;
    if (!latest?.id) continue;

    const { error } = await (db as any)
      .from("market_snapshots")
      .update({ funding_rate: f.funding_rate, open_interest: f.open_interest })
      .eq("id", latest.id);

    if (error) {
      log("updateSnapshotsFunding error", { symbol: f.symbol, error: error.message });
      return { updated, error: error.message };
    }
    updated++;
  }

  return { updated };
}

/**
 * Insert news items with deduplication on URL using batch operations.
 * Pre-fetches existing URLs to avoid N+1 queries.
 */
export async function insertNewsItems(
  items: NormalizedNewsItem[]
): Promise<{ inserted: number; insertedIds: string[]; error?: string }> {
  const db = getDb();

  const urls = items.map((i) => i.url).filter(Boolean) as string[];
  const existingUrls = new Set<string>();

  if (urls.length > 0) {
    const { data: existing } = await (db as any)
      .from("news_items")
      .select("url")
      .in("url", urls);
    if (existing) {
      for (const row of existing as { url: string }[]) {
        existingUrls.add(row.url);
      }
    }
  }

  const newItems = items.filter((i) => !i.url || !existingUrls.has(i.url));
  if (newItems.length === 0) return { inserted: 0, insertedIds: [] };

  const rows = newItems.map((item) => ({
    title: item.title,
    source: item.source,
    summary: item.summary,
    url: item.url,
    sentiment: item.sentiment,
    related_tokens: item.related_tokens,
    published_at: item.published_at,
  }));

  const { data, error } = await (db as any)
    .from("news_items")
    .insert(rows)
    .select("id");

  if (error) {
    log("insertNewsItems batch error", { error: error.message });
    return { inserted: 0, insertedIds: [], error: error.message };
  }

  const insertedIds = ((data ?? []) as { id: string }[]).map((r) => r.id);
  return { inserted: insertedIds.length, insertedIds };
}

/** Insert document chunks in a single batch. */
export async function insertDocumentChunks(
  chunks: DocumentChunkInsert[]
): Promise<{ inserted: number; error?: string }> {
  if (chunks.length === 0) return { inserted: 0 };
  const db = getDb();

  const { error } = await (db as any)
    .from("document_chunks")
    .upsert(chunks, { onConflict: "source_id,chunk_index", ignoreDuplicates: true });

  if (error) {
    log("insertDocumentChunks batch error", { error: error.message });
    return { inserted: 0, error: error.message };
  }
  return { inserted: chunks.length };
}

/** Create an ingestion_runs record (start of pipeline). */
export async function createIngestionRun(
  trigger: string
): Promise<string | null> {
  const db = getDb();
  const row: IngestionRunInsert = {
    status: "running",
    trigger: trigger as IngestionRunInsert["trigger"],
  };
  const { data, error } = await (db as any)
    .from("ingestion_runs")
    .insert(row)
    .select("id")
    .single();
  if (error) {
    log("createIngestionRun error", { error: error.message });
    return null;
  }
  return (data as { id: string })?.id ?? null;
}

/** Update an ingestion_runs record (end of pipeline). */
export async function completeIngestionRun(
  runId: string,
  status: "completed" | "partial" | "failed",
  results: {
    prices?: SourceResult | null;
    funding?: SourceResult | null;
    news?: SourceResult | null;
    embeddings?: SourceResult | null;
  }
): Promise<void> {
  const db = getDb();
  await (db as any)
    .from("ingestion_runs")
    .update({
      completed_at: new Date().toISOString(),
      status,
      prices: results.prices ?? null,
      funding: results.funding ?? null,
      news: results.news ?? null,
      embeddings: results.embeddings ?? null,
    })
    .eq("id", runId);
}
