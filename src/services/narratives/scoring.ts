/**
 * Deterministic narrative candidate scoring.
 *
 * Data sources:
 *   1. Binance live prices (BTC, ETH) — `fetchCurrentPrices()`
 *   2. Supabase `assets` + `market_snapshots` — all ingested tokens
 *
 * Scoring dimensions:
 *   - performanceScore: average 24h change across bucket tokens (normalized 0–100)
 *   - breadthScore: fraction of bucket tokens with positive 24h change (0–100)
 *   - moverPresenceScore: share of top performers that belong to this bucket (0–100)
 *
 * No AI, no external sources, no speculation.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { getDb } from "@/lib/db";
import { fetchCurrentPrices } from "@/services/market/binance";
import { NARRATIVE_TAXONOMY, ALL_TAXONOMY_SYMBOLS } from "./taxonomy";
import type { NarrativeCandidate, NarrativeStatus } from "./types";

// ---------------------------------------------------------------------------
// Internal data shape — per-token market snapshot used for scoring
// ---------------------------------------------------------------------------

const STALE_THRESHOLD_MS = 48 * 60 * 60 * 1000; // 48 h

interface TokenData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number | null;
  marketCap: number | null;
}

// ---------------------------------------------------------------------------
// Data collection
// ---------------------------------------------------------------------------

/**
 * Collects per-token market data from all available sources.
 *
 * 1. Binance live → BTC, ETH with reliable 24h change.
 * 2. Supabase market_snapshots → other tokens. 24h change is approximated
 *    by comparing the two most recent snapshots. If only one snapshot
 *    exists, change defaults to 0.
 */
export async function loadTokenMarketData(): Promise<Map<string, TokenData>> {
  const result = new Map<string, TokenData>();

  // --- Binance live (BTC, ETH — reliable priceChangePercentage24h) ---
  try {
    const prices = await fetchCurrentPrices();
    for (const p of prices) {
      result.set(p.symbol, {
        symbol: p.symbol,
        price: p.currentPrice,
        change24h: p.priceChangePercentage24h,
        volume24h: p.volume24h,
        marketCap: null,
      });
    }
  } catch {
    console.warn("[narratives/scoring] Binance prices unavailable, using DB only");
  }

  // --- Supabase: assets + latest 2 snapshots per asset ---
  try {
    const db = getDb() as any;

    const { data: assetRows } = await db
      .from("assets")
      .select("id, symbol, name")
      .in("symbol", ALL_TAXONOMY_SYMBOLS);

    const assets = (assetRows as { id: string; symbol: string; name: string }[] | null) ?? [];
    if (!assets.length) return result;

    const assetIds = assets.map((a) => a.id);
    const { data: snapshotRows } = await db
      .from("market_snapshots")
      .select("asset_id, price, volume_24h, market_cap, snapshot_at")
      .in("asset_id", assetIds)
      .order("snapshot_at", { ascending: false })
      .limit(assetIds.length * 3);

    type SnapRow = {
      asset_id: string;
      price: number;
      volume_24h: number | null;
      market_cap: number | null;
      snapshot_at: string;
    };
    const rows = (snapshotRows as SnapRow[] | null) ?? [];

    // Group snapshots by asset_id; keep first two (most recent).
    const byAsset = new Map<string, SnapRow[]>();
    for (const row of rows) {
      const existing = byAsset.get(row.asset_id);
      if (!existing) {
        byAsset.set(row.asset_id, [row]);
      } else if (existing.length < 2) {
        existing.push(row);
      }
    }

    const assetMap = new Map(assets.map((a) => [a.id, a]));

    for (const [assetId, snaps] of byAsset) {
      const asset = assetMap.get(assetId);
      if (!asset) continue;

      // Skip if Binance already provided better data for this symbol.
      if (result.has(asset.symbol)) continue;

      const latest = snaps[0];

      const snapshotAge = Date.now() - new Date(latest.snapshot_at).getTime();
      const isStale = snapshotAge > STALE_THRESHOLD_MS;

      let change24h = 0;
      if (!isStale && snaps.length >= 2) {
        const prior = snaps[1];
        if (prior.price > 0) {
          change24h = ((latest.price - prior.price) / prior.price) * 100;
        }
      }

      result.set(asset.symbol, {
        symbol: asset.symbol,
        price: latest.price,
        change24h,
        volume24h: latest.volume_24h,
        marketCap: latest.market_cap,
      });
    }
  } catch {
    console.warn("[narratives/scoring] DB snapshot query failed");
  }

  return result;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

const PERFORMANCE_WEIGHT = 0.5;
const BREADTH_WEIGHT = 0.3;
const MOVER_PRESENCE_WEIGHT = 0.2;

const TOP_MOVER_COUNT = 5;

/**
 * Scores all taxonomy buckets and returns ranked candidates.
 *
 * @param tokenData — per-symbol market data from `loadTokenMarketData()`
 * @returns candidates sorted by compositeScore descending; empty buckets excluded
 */
export function scoreNarrativeCandidates(
  tokenData: Map<string, TokenData>,
): NarrativeCandidate[] {
  if (tokenData.size === 0) return [];

  // Compute global top movers (across all taxonomy tokens with data).
  const allTokens = [...tokenData.values()];
  const topMovers = allTokens
    .filter((t) => t.change24h !== 0)
    .sort((a, b) => b.change24h - a.change24h)
    .slice(0, TOP_MOVER_COUNT)
    .map((t) => t.symbol);
  const topMoverSet = new Set(topMovers);

  const candidates: NarrativeCandidate[] = [];

  for (const [slug, bucket] of Object.entries(NARRATIVE_TAXONOMY)) {
    const tokensWithData = bucket.tokens.filter((s) => tokenData.has(s));
    if (tokensWithData.length === 0) continue;

    const bucketSize = bucket.tokens.length;
    const dataCoverage = tokensWithData.length / bucketSize;

    const tokenPerformance: Record<string, number> = {};
    for (const sym of tokensWithData) {
      tokenPerformance[sym] = tokenData.get(sym)!.change24h;
    }

    // --- performanceScore ---
    // Average 24h change, normalized to 0–100 scale.
    // -10% avg → 0, 0% avg → 50, +10% avg → 100
    const avgChange =
      tokensWithData.reduce((sum, s) => sum + tokenData.get(s)!.change24h, 0) /
      tokensWithData.length;
    const performanceScore = clamp(((avgChange + 10) / 20) * 100, 0, 100);

    // --- breadthScore ---
    // Fraction of tokens in this bucket with positive 24h change.
    const positiveCount = tokensWithData.filter(
      (s) => tokenData.get(s)!.change24h > 0,
    ).length;
    const breadthScore = (positiveCount / tokensWithData.length) * 100;

    // --- moverPresenceScore ---
    // How many of the global top-N movers are in this bucket.
    const moversInBucket = tokensWithData.filter((s) => topMoverSet.has(s)).length;
    const moverPresenceScore =
      topMovers.length > 0
        ? (moversInBucket / topMovers.length) * 100
        : 0;

    let compositeScore =
      performanceScore * PERFORMANCE_WEIGHT +
      breadthScore * BREADTH_WEIGHT +
      moverPresenceScore * MOVER_PRESENCE_WEIGHT;

    // Discount composite score when data coverage is below 50% to prevent
    // single-token buckets from ranking artificially high.
    if (dataCoverage < 0.5) {
      compositeScore *= dataCoverage;
    }

    // --- Leader tokens (top performers within this bucket) ---
    const sorted = [...tokensWithData].sort(
      (a, b) => tokenData.get(b)!.change24h - tokenData.get(a)!.change24h,
    );
    const leaderTokens = sorted
      .filter((s) => tokenData.get(s)!.change24h > 0)
      .slice(0, 3);

    const status = inferStatus(compositeScore);

    candidates.push({
      slug,
      name: bucket.name,
      tokens: tokensWithData,
      bucketSize,
      dataCoverage: round2(dataCoverage),
      performanceScore: round2(performanceScore),
      breadthScore: round2(breadthScore),
      moverPresenceScore: round2(moverPresenceScore),
      compositeScore: round2(compositeScore),
      leaderTokens,
      status,
      tokenPerformance,
    });
  }

  candidates.sort((a, b) => b.compositeScore - a.compositeScore);
  return candidates;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Simple status inference based on composite score alone.
 *
 * "peaking" is intentionally absent: detecting a peak requires comparing
 * the current score to prior scores, which needs persistence that does not
 * exist yet.
 */
function inferStatus(compositeScore: number): NarrativeStatus {
  if (compositeScore >= 70) return "active";
  if (compositeScore >= 45) return "emerging";
  return "fading";
}
