/**
 * BTC 24h chart data from CoinGecko.
 *
 * Fetches market_chart (prices), transforms to { time, value }[], and caches
 * for ~60 seconds to avoid unnecessary refetching.
 */

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1";

export interface BtcChartPoint {
  time: string;
  value: number;
}

const CACHE_TTL_MS = 60 * 1000; // 60 seconds
let cached: { data: BtcChartPoint[]; expiresAt: number } | null = null;

/** CoinGecko market_chart response (prices array only). */
interface CoinGeckoPricesResponse {
  prices?: [number, number][]; // [timestamp_ms, price]
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Fetch BTC 24h price chart from CoinGecko and return points for the chart.
 * Uses in-memory cache for 60 seconds.
 */
export async function getBtcChartData(): Promise<BtcChartPoint[]> {
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const res = await fetch(COINGECKO_URL, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status} ${res.statusText}`);
  }

  const body = (await res.json()) as CoinGeckoPricesResponse;
  const raw = body.prices ?? [];

  const data: BtcChartPoint[] = raw.map(([ts, price]) => ({
    time: formatTime(ts),
    value: typeof price === "number" ? price : Number(price),
  }));

  cached = { data, expiresAt: Date.now() + CACHE_TTL_MS };
  return data;
}
