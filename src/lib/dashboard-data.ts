/**
 * Server-side data fetching from Supabase for the app UI.
 * Falls back to mock data when DB is empty or on error.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { getDb } from "@/lib/db";
import {
  MOCK_TOKENS,
  MOCK_NEWS,
  MOCK_NARRATIVES,
  MOCK_PRICE_HISTORY,
  formatCompactNum,
} from "@/data/mock-data";
import type { TokenSummary, NewsItem as UINewsItem, Narrative as UINarrative, PricePoint } from "@/data/mock-data";

export { formatCompactNum };

/** Format published_at to timeAgo string. */
function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`;
  return d.toLocaleDateString();
}

/** Dashboard: tokens (from latest snapshots), news, BTC chart data. */
export async function getDashboardData(): Promise<{
  tokens: TokenSummary[];
  news: UINewsItem[];
  priceHistoryBtc: PricePoint[];
}> {
  try {
    const db = getDb();

    const { data: assets } = await (db.from("assets").select("id, symbol, name") as any).limit(200);
    if (!assets?.length) return fallbackDashboard();

    const assetIds = (assets as { id: string; symbol: string; name: string }[]).map((a) => a.id);
    const { data: snapshots } = await (
      db.from("market_snapshots") as any
    ).select("asset_id, price, volume_24h, market_cap, snapshot_at").in("asset_id", assetIds).order("snapshot_at", { ascending: false }).limit(500);

    if (!snapshots?.length) return fallbackDashboard();

    const byAsset = new Map<string, { price: number; volume_24h: number | null; market_cap: number | null }>();
    for (const s of snapshots as { asset_id: string; price: number; volume_24h: number | null; market_cap: number | null }[]) {
      if (!byAsset.has(s.asset_id)) byAsset.set(s.asset_id, { price: s.price, volume_24h: s.volume_24h, market_cap: s.market_cap });
    }

    const assetMap = new Map((assets as { id: string; symbol: string; name: string }[]).map((a) => [a.id, a]));
    const tokens: TokenSummary[] = [];
    for (const [aid, row] of byAsset) {
      const a = assetMap.get(aid);
      if (!a) continue;
      tokens.push({
        symbol: a.symbol,
        name: a.name,
        price: row.price,
        change24h: 0,
        change7d: 0,
        volume24h: row.volume_24h ?? 0,
        marketCap: row.market_cap ?? 0,
      });
    }
    tokens.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));

    const { data: newsRows } = await (
      db.from("news_items") as any
    ).select("id, title, source, summary, url, sentiment, related_tokens, published_at").order("published_at", { ascending: false }).limit(20);
    const news: UINewsItem[] = (newsRows ?? []).map((n: { id: string; title: string; source: string; summary: string | null; url: string | null; sentiment: "positive" | "negative" | "neutral"; related_tokens: string[]; published_at: string | null }) => ({
      id: n.id,
      title: n.title,
      source: n.source,
      timeAgo: timeAgo(n.published_at),
      summary: n.summary ?? "",
      sentiment: n.sentiment,
      relatedTokens: n.related_tokens ?? [],
      url: n.url ?? "#",
    }));

    const btcAsset = (assets as { id: string; symbol: string }[]).find((a) => a.symbol === "BTC");
    let priceHistoryBtc: PricePoint[] = MOCK_PRICE_HISTORY.BTC;
    if (btcAsset) {
      const { data: btcSnapshots } = await (
        db.from("market_snapshots") as any
      ).select("snapshot_at, price").eq("asset_id", btcAsset.id).order("snapshot_at", { ascending: true }).limit(50);
      if (btcSnapshots?.length) {
        priceHistoryBtc = (btcSnapshots as { snapshot_at: string; price: number }[]).map((s) => ({
          time: new Date(s.snapshot_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
          value: s.price,
        }));
      }
    }

    return {
      tokens: tokens.length ? tokens : MOCK_TOKENS,
      news: news.length ? news : MOCK_NEWS,
      priceHistoryBtc,
    };
  } catch {
    return fallbackDashboard();
  }
}

function fallbackDashboard(): {
  tokens: TokenSummary[];
  news: UINewsItem[];
  priceHistoryBtc: PricePoint[];
} {
  return {
    tokens: MOCK_TOKENS,
    news: MOCK_NEWS,
    priceHistoryBtc: MOCK_PRICE_HISTORY.BTC,
  };
}

/** Token page: asset + latest snapshot by symbol. */
export async function getTokenPageData(symbol: string): Promise<{
  token: TokenSummary | null;
  chartData: PricePoint[];
} | null> {
  try {
    const db = getDb();
    const { data: asset } = await (db.from("assets") as any).select("id, symbol, name").eq("symbol", symbol.toUpperCase()).maybeSingle();
    if (!asset) return null;

    const a = asset as { id: string; symbol: string; name: string };
    const { data: snapshots } = await (
      db.from("market_snapshots") as any
    ).select("price, volume_24h, market_cap, snapshot_at").eq("asset_id", a.id).order("snapshot_at", { ascending: false }).limit(1);
    const latest = (snapshots as { price: number; volume_24h: number | null; market_cap: number | null; snapshot_at: string }[])?.[0];
    if (!latest) return null;

    const { data: history } = await (
      db.from("market_snapshots") as any
    ).select("snapshot_at, price").eq("asset_id", a.id).order("snapshot_at", { ascending: true }).limit(50);
    const chartData: PricePoint[] = (history ?? []).length
      ? (history as { snapshot_at: string; price: number }[]).map((s) => ({
          time: new Date(s.snapshot_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
          value: s.price,
        }))
      : MOCK_PRICE_HISTORY[symbol] ?? MOCK_PRICE_HISTORY.BTC;

    const token: TokenSummary = {
      symbol: a.symbol,
      name: a.name,
      price: latest.price,
      change24h: 0,
      change7d: 0,
      volume24h: latest.volume_24h ?? 0,
      marketCap: latest.market_cap ?? 0,
    };
    return { token, chartData };
  } catch {
    return null;
  }
}

/** Narratives page: from DB or mock. */
export async function getNarrativesData(): Promise<UINarrative[]> {
  try {
    const db = getDb();
    const { data: rows } = await (db.from("narratives") as any).select("id, name, description, strength, trend, sentiment").order("name");
    if (!rows?.length) return MOCK_NARRATIVES;
    return (rows as { id: string; name: string; description: string | null; strength: number; trend: string; sentiment: number }[]).map((n) => ({
      id: n.id,
      name: n.name,
      description: n.description ?? "",
      strength: n.strength,
      trend: n.trend === "up" || n.trend === "down" ? n.trend : "neutral",
      tokens: [],
      sentiment: n.sentiment,
    }));
  } catch {
    return MOCK_NARRATIVES;
  }
}
