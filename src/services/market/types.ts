export type AssetSymbol = "BTC" | "ETH";
export type TimeRange = "1D" | "1W" | "1M" | "1Y" | "ALL";

export const ASSET_NAMES: Record<AssetSymbol, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
};

export const BINANCE_PAIRS: Record<AssetSymbol, string> = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
};

export interface KlineConfig {
  interval: string;
  limit: number;
}

export const TIME_RANGE_KLINE: Record<TimeRange, KlineConfig> = {
  "1D": { interval: "5m", limit: 288 },
  "1W": { interval: "30m", limit: 336 },
  "1M": { interval: "2h", limit: 360 },
  "1Y": { interval: "1d", limit: 365 },
  ALL: { interval: "1w", limit: 500 },
};

export interface CurrentPrice {
  symbol: AssetSymbol;
  name: string;
  currentPrice: number;
  priceChangePercentage24h: number;
  volume24h: number;
  lastUpdated: string;
}

export interface ChartPoint {
  time: string;
  timestamp: number;
  value: number;
}

export interface MarketPricesResponse {
  prices: CurrentPrice[];
  fetchedAt: string;
}

export interface MarketChartResponse {
  asset: AssetSymbol;
  range: TimeRange;
  data: ChartPoint[];
  fetchedAt: string;
}
