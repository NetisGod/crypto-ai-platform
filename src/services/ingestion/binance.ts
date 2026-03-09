/**
 * Binance USDT-M futures: funding rate and open interest.
 * - Funding: GET /fapi/v1/fundingRate
 * - Open interest: GET /futures/data/openInterestHist (fapi binance)
 */

import type { NormalizedFunding } from "./types";

const BINANCE_FAPI_BASE = "https://fapi.binance.com";
const BINANCE_FUTURES_DATA = "https://fapi.binance.com/futures/data";

/** Symbols we care about (base asset for mapping). */
const DEFAULT_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "AVAXUSDT", "LINKUSDT"];

interface BinanceFundingRateRow {
  symbol: string;
  fundingRate: string;
  fundingTime: number;
  markPrice: string;
}

interface BinanceOpenInterestRow {
  symbol: string;
  sumOpenInterest: string;
  sumOpenInterestValue: string;
  timestamp: number;
}

function baseAssetFromSymbol(symbol: string): string {
  return symbol.replace("USDT", "");
}

export async function fetchBinanceFunding(options?: {
  symbols?: string[];
  limit?: number;
}): Promise<NormalizedFunding[]> {
  const { symbols = DEFAULT_SYMBOLS, limit = 1 } = options ?? {};
  const now = new Date().toISOString();
  const out: NormalizedFunding[] = [];

  for (const sym of symbols) {
    try {
      const url = new URL(`${BINANCE_FAPI_BASE}/fapi/v1/fundingRate`);
      url.searchParams.set("symbol", sym);
      url.searchParams.set("limit", String(limit));

      const res = await fetch(url.toString(), { next: { revalidate: 0 } });
      if (!res.ok) {
        continue;
      }
      const arr = (await res.json()) as BinanceFundingRateRow[];
      const latest = arr[arr.length - 1];
      if (latest?.fundingRate != null) {
        out.push({
          symbol: baseAssetFromSymbol(latest.symbol),
          funding_rate: parseFloat(latest.fundingRate),
          open_interest: null,
          snapshot_at: now,
        });
      }
    } catch {
      // skip this symbol
    }
  }

  return out;
}

export async function fetchBinanceOpenInterest(options?: {
  symbols?: string[];
  period?: "1h" | "4h" | "1d";
  limit?: number;
}): Promise<NormalizedFunding[]> {
  const { symbols = DEFAULT_SYMBOLS, period = "1h", limit = 1 } = options ?? {};
  const out: NormalizedFunding[] = [];

  for (const sym of symbols) {
    try {
      const url = new URL(`${BINANCE_FUTURES_DATA}/openInterestHist`);
      url.searchParams.set("symbol", sym);
      url.searchParams.set("period", period);
      url.searchParams.set("limit", String(limit));

      const res = await fetch(url.toString(), { next: { revalidate: 0 } });
      if (!res.ok) {
        continue;
      }
      const arr = (await res.json()) as BinanceOpenInterestRow[];
      const latest = arr[arr.length - 1];
      if (latest?.sumOpenInterestValue != null) {
        out.push({
          symbol: baseAssetFromSymbol(latest.symbol),
          funding_rate: 0,
          open_interest: parseFloat(latest.sumOpenInterestValue),
          snapshot_at: new Date(latest.timestamp).toISOString(),
        });
      }
    } catch {
      // skip
    }
  }

  return out;
}

/**
 * Fetch both funding rate and OI, then merge by symbol (OI overwrites, funding preserved).
 */
export async function fetchBinanceFundingAndOI(options?: {
  symbols?: string[];
}): Promise<NormalizedFunding[]> {
  const [funding, oi] = await Promise.all([
    fetchBinanceFunding(options),
    fetchBinanceOpenInterest(options),
  ]);
  const bySymbol = new Map<string, NormalizedFunding>();
  for (const f of funding) {
    bySymbol.set(f.symbol, { ...f });
  }
  for (const o of oi) {
    const existing = bySymbol.get(o.symbol);
    if (existing) {
      existing.open_interest = o.open_interest;
      if (o.snapshot_at) existing.snapshot_at = o.snapshot_at;
    } else {
      bySymbol.set(o.symbol, o);
    }
  }
  return Array.from(bySymbol.values());
}
