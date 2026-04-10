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
  insertDocumentChunks,
  createIngestionRun,
  completeIngestionRun,
} from "./store";
export { runIngestionPipeline } from "./orchestrator";
export { isDataFresh } from "./freshness";
export { chunkText, shouldChunk } from "./chunker";
export { embedSingle, embedBatch } from "./embedder";
export { extractArticle, extractArticlesBatch } from "./article-extractor";
export type {
  NormalizedPrice,
  NormalizedFunding,
  NormalizedNewsItem,
  IngestionResult,
  IngestionOptions,
  IngestionRunRecord,
  SourceResult,
  ChunkConfig,
  TextChunk,
} from "./types";
