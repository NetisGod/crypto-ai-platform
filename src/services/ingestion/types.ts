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
