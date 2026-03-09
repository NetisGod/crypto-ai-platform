/**
 * Persist normalized ingestion data into Supabase.
 * Uses getDb() - call from API routes or server context.
 */

import { getDb } from "@/lib/db";
import type { NormalizedPrice, NormalizedFunding, NormalizedNewsItem } from "./types";
import type { AssetInsert, MarketSnapshotInsert, NewsItemInsert } from "@/types/database";

const log = (msg: string, meta?: Record<string, unknown>) => {
  const line = meta ? `${msg} ${JSON.stringify(meta)}` : msg;
  console.log(`[ingestion/store] ${line}`);
};

/** Upsert assets by symbol; return map symbol -> id. */
export async function upsertAssets(
  items: { symbol: string; name: string }[]
): Promise<Map<string, string>> {
  const db = getDb();
  const symbolToId = new Map<string, string>();
  const unique = Array.from(new Map(items.map((i) => [i.symbol, i])).values());

  for (const item of unique) {
    const insert: AssetInsert = { symbol: item.symbol, name: item.name };
    const { data, error } = await db
      .from("assets")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert(insert as any, { onConflict: "symbol", ignoreDuplicates: false })
      .select("id, symbol")
      .single();

    if (error) {
      const { data: existingRow } = await db
        .from("assets")
        .select("id")
        .eq("symbol", item.symbol)
        .maybeSingle();
      const existing = existingRow as { id: string } | null;
      if (existing?.id) symbolToId.set(item.symbol, existing.id);
      log("upsertAssets row error", { symbol: item.symbol, error: error.message });
      continue;
    }
    const row = data as { id: string; symbol: string } | null;
    if (row?.id) symbolToId.set(row.symbol, row.id);
  }

  return symbolToId;
}

/** Insert market snapshots (price, volume, market_cap). Optionally merge funding/OI by symbol. */
export async function insertMarketSnapshots(
  prices: NormalizedPrice[],
  fundingBySymbol?: Map<string, NormalizedFunding>
): Promise<{ inserted: number; error?: string }> {
  const db = getDb();
  const assetIds = await upsertAssets(
    prices.map((p) => ({ symbol: p.symbol, name: p.name }))
  );
  let inserted = 0;

  for (const p of prices) {
    const assetId = assetIds.get(p.symbol);
    if (!assetId) continue;

    const funding = fundingBySymbol?.get(p.symbol);
    const row: MarketSnapshotInsert = {
      asset_id: assetId,
      price: p.price,
      volume_24h: p.volume_24h,
      market_cap: p.market_cap,
      funding_rate: funding?.funding_rate ?? null,
      open_interest: funding?.open_interest ?? null,
      snapshot_at: p.snapshot_at,
    };
    const { error } = await db
      .from("market_snapshots")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(row as any);
    if (error) {
      log("insertMarketSnapshots error", { symbol: p.symbol, error: error.message });
      return { inserted, error: error.message };
    }
    inserted++;
  }

  return { inserted };
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

    const { data: latestRow } = await db
      .from("market_snapshots")
      .select("id")
      .eq("asset_id", assetId)
      .order("snapshot_at", { ascending: false })
      .limit(1)
      .single();

    const latest = latestRow as { id: string } | null;
    if (!latest?.id) continue;

    // Supabase client infers 'never' for custom Database types; use loose cast
    const q = db.from("market_snapshots") as unknown as {
      update: (v: Record<string, unknown>) => { eq: (k: string, v: string) => Promise<{ error: { message: string } | null }> };
    };
    const { error } = await q
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

/** Insert news items (no embedding; run embedding job separately if needed). */
export async function insertNewsItems(
  items: NormalizedNewsItem[]
): Promise<{ inserted: number; error?: string }> {
  const db = getDb();
  let inserted = 0;

  for (const item of items) {
    const row: NewsItemInsert = {
      title: item.title,
      source: item.source,
      summary: item.summary,
      url: item.url,
      sentiment: item.sentiment,
      related_tokens: item.related_tokens,
      published_at: item.published_at,
    };
    const { error } = await db
      .from("news_items")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(row as any);
    if (error) {
      log("insertNewsItems error", { title: item.title.slice(0, 50), error: error.message });
      return { inserted, error: error.message };
    }
    inserted++;
  }

  return { inserted };
}
