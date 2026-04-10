/**
 * Normalized shapes for ingestion services.
 * Maps external APIs → DB-ready payloads.
 */

import type { Sentiment } from "@/types/database";

/** Normalized price/snapshot from CoinGecko coins/markets. */
export interface NormalizedPrice {
  symbol: string;
  name: string;
  price: number;
  volume_24h: number | null;
  market_cap: number | null;
  snapshot_at: string; // ISO
}

/** Normalized funding + open interest from Binance. */
export interface NormalizedFunding {
  symbol: string; // base asset, e.g. BTC
  funding_rate: number;
  open_interest: number | null;
  snapshot_at: string;
}

/** Normalized news item from CryptoPanic (or other sources). */
export interface NormalizedNewsItem {
  title: string;
  source: string;
  summary: string | null;
  url: string | null;
  sentiment: Sentiment;
  related_tokens: string[];
  published_at: string | null; // ISO or null
}

/** Result of an ingestion run. */
export interface IngestionResult<T> {
  success: boolean;
  data?: T[];
  inserted?: number;
  updated?: number;
  error?: string;
  durationMs: number;
}

/** Options for the ingestion orchestrator. */
export interface IngestionOptions {
  trigger: "manual" | "cron" | "pre_pipeline";
  skipPrices?: boolean;
  skipNews?: boolean;
  skipFunding?: boolean;
  skipEmbeddings?: boolean;
}

/** Per-source result stored in ingestion_runs JSONB columns. */
export interface SourceResult {
  count: number;
  source: string;
  duration_ms: number;
  error?: string;
}

/** Full record written to ingestion_runs after pipeline completes. */
export interface IngestionRunRecord {
  id: string;
  started_at: string;
  completed_at: string;
  status: "completed" | "partial" | "failed";
  prices: SourceResult | null;
  funding: SourceResult | null;
  news: SourceResult | null;
  embeddings: SourceResult | null;
  trigger: string;
}

/** Configuration for text chunking. */
export interface ChunkConfig {
  chunkSize: number;
  chunkOverlap: number;
  minChunkSize: number;
  separators: string[];
}

/** A text chunk ready for embedding. */
export interface TextChunk {
  content: string;
  chunkIndex: number;
  tokenCount: number;
}
