/**
 * CoinGecko price ingestion.
 * API: https://api.coingecko.com/api/v3/coins/markets
 * No API key required (rate-limited on free tier).
 */

import type { NormalizedPrice } from "./types";

const COINGECKO_MARKETS_URL = "https://api.coingecko.com/api/v3/coins/markets";

interface CoinGeckoMarketItem {
  id: string;
  symbol: string;
  name: string;
  current_price: number | null;
  market_cap: number | null;
  total_volume: number | null;
}

export async function fetchCoinGeckoPrices(options?: {
  vsCurrency?: string;
  perPage?: number;
  page?: number;
}): Promise<NormalizedPrice[]> {
  const { vsCurrency = "usd", perPage = 100, page = 1 } = options ?? {};
  const url = new URL(COINGECKO_MARKETS_URL);
  url.searchParams.set("vs_currency", vsCurrency);
  url.searchParams.set("order", "market_cap_desc");
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("page", String(page));
  url.searchParams.set("sparkline", "false");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as CoinGeckoMarketItem[];
  const now = new Date().toISOString();

  return data
    .filter((row) => row.symbol && row.current_price != null)
    .map((row) => ({
      symbol: row.symbol.toUpperCase(),
      name: row.name ?? row.symbol,
      price: row.current_price!,
      volume_24h: row.total_volume ?? null,
      market_cap: row.market_cap ?? null,
      snapshot_at: now,
    }));
}
