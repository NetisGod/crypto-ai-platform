/**
 * Data ingestion services and store helpers.
 * Use from API routes or server-only code.
 */

export { fetchCoinGeckoPrices } from "./coingecko";
export {
  fetchBinanceFunding,
  fetchBinanceOpenInterest,
  fetchBinanceFundingAndOI,
} from "./binance";
export { fetchCryptoPanicNews } from "./cryptopanic";
export {
  upsertAssets,
  insertMarketSnapshots,
  updateSnapshotsFunding,
  insertNewsItems,
} from "./store";
export type { NormalizedPrice, NormalizedFunding, NormalizedNewsItem, IngestionResult } from "./types";
