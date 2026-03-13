import type {
  AssetSymbol,
  CurrentPrice,
  ChartPoint,
  TimeRange,
} from "./types";
import { ASSET_NAMES, BINANCE_PAIRS, TIME_RANGE_KLINE } from "./types";

const BASE_URL = "https://api.binance.com/api/v3";
const SUPPORTED_SYMBOLS: AssetSymbol[] = ["BTC", "ETH"];

// ---------------------------------------------------------------------------
// Binance response shapes
// ---------------------------------------------------------------------------

interface BinanceTicker24h {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
}

// Binance kline: [openTime, open, high, low, close, volume, closeTime, ...]
type BinanceKline = [
  number, string, string, string, string, string,
  number, string, string, string, string, string,
];

// ---------------------------------------------------------------------------
// In-memory caches
// ---------------------------------------------------------------------------

const PRICE_CACHE_TTL = 15_000; // 15 seconds
let priceCache: { data: CurrentPrice[]; expiresAt: number } | null = null;

const CHART_CACHE_TTL: Record<TimeRange, number> = {
  "1D": 30_000,
  "1W": 2 * 60_000,
  "1M": 5 * 60_000,
  "1Y": 30 * 60_000,
  ALL: 60 * 60_000,
};
const chartCache = new Map<string, { data: ChartPoint[]; expiresAt: number }>();

// ---------------------------------------------------------------------------
// Fetch current prices
// ---------------------------------------------------------------------------

export async function fetchCurrentPrices(): Promise<CurrentPrice[]> {
  if (priceCache && Date.now() < priceCache.expiresAt) {
    return priceCache.data;
  }

  const symbols = SUPPORTED_SYMBOLS.map((s) => BINANCE_PAIRS[s]);
  const url = `${BASE_URL}/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(symbols))}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Binance ticker error: ${res.status} ${res.statusText}`);
  }

  const tickers = (await res.json()) as BinanceTicker24h[];

  const pairToSymbol = Object.fromEntries(
    SUPPORTED_SYMBOLS.map((s) => [BINANCE_PAIRS[s], s])
  ) as Record<string, AssetSymbol>;

  const prices: CurrentPrice[] = tickers
    .filter((t) => t.symbol in pairToSymbol)
    .map((t) => {
      const sym = pairToSymbol[t.symbol];
      return {
        symbol: sym,
        name: ASSET_NAMES[sym],
        currentPrice: parseFloat(t.lastPrice),
        priceChangePercentage24h: parseFloat(t.priceChangePercent),
        volume24h: parseFloat(t.quoteVolume),
        lastUpdated: new Date().toISOString(),
      };
    });

  priceCache = { data: prices, expiresAt: Date.now() + PRICE_CACHE_TTL };
  return prices;
}

// ---------------------------------------------------------------------------
// Fetch market chart (klines)
// ---------------------------------------------------------------------------

function formatChartTime(ms: number, range: TimeRange): string {
  const d = new Date(ms);
  switch (range) {
    case "1D":
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    case "1W":
    case "1M":
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    case "1Y":
    case "ALL":
      return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }
}

export async function fetchMarketChart(
  asset: AssetSymbol,
  range: TimeRange
): Promise<ChartPoint[]> {
  const cacheKey = `${asset}:${range}`;
  const entry = chartCache.get(cacheKey);
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data;
  }

  const pair = BINANCE_PAIRS[asset];
  const { interval, limit } = TIME_RANGE_KLINE[range];
  const url = `${BASE_URL}/klines?symbol=${pair}&interval=${interval}&limit=${limit}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Binance klines error: ${res.status} ${res.statusText}`);
  }

  const klines = (await res.json()) as BinanceKline[];

  const data: ChartPoint[] = klines.map((k) => ({
    time: formatChartTime(k[0], range),
    timestamp: k[0],
    value: parseFloat(k[4]), // close price
  }));

  chartCache.set(cacheKey, { data, expiresAt: Date.now() + CHART_CACHE_TTL[range] });
  return data;
}
