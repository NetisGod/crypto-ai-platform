/**
 * Database types for Supabase/Postgres tables.
 * Keep in sync with supabase/migrations/*.sql
 */

export type Sentiment = "positive" | "negative" | "neutral";
export type NarrativeTrend = "up" | "down" | "neutral";
export type AiRunStatus = "pending" | "running" | "completed" | "failed";

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AssetInsert {
  id?: string;
  symbol: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface MarketSnapshot {
  id: string;
  asset_id: string;
  price: number;
  volume_24h: number | null;
  market_cap: number | null;
  funding_rate: number | null;
  open_interest: number | null;
  snapshot_at: string;
  created_at: string;
}

export interface MarketSnapshotInsert {
  id?: string;
  asset_id: string;
  price: number;
  volume_24h?: number | null;
  market_cap?: number | null;
  funding_rate?: number | null;
  open_interest?: number | null;
  snapshot_at?: string;
  created_at?: string;
}

/** Embedding dimension must match migration (1536). */
export const NEWS_EMBEDDING_DIMENSION = 1536;

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  summary: string | null;
  url: string | null;
  sentiment: Sentiment;
  related_tokens: string[];
  embedding: number[] | null;
  published_at: string | null;
  created_at: string;
}

export interface NewsItemInsert {
  id?: string;
  title: string;
  source: string;
  summary?: string | null;
  url?: string | null;
  sentiment: Sentiment;
  related_tokens?: string[];
  embedding?: number[] | null;
  published_at?: string | null;
  created_at?: string;
}

export interface Narrative {
  id: string;
  name: string;
  description: string | null;
  strength: number;
  trend: NarrativeTrend;
  sentiment: number;
  created_at: string;
  updated_at: string;
}

export interface NarrativeInsert {
  id?: string;
  name: string;
  description?: string | null;
  strength?: number;
  trend?: NarrativeTrend;
  sentiment?: number;
  created_at?: string;
  updated_at?: string;
}

export interface NarrativeNews {
  narrative_id: string;
  news_item_id: string;
}

export interface NarrativeNewsInsert {
  narrative_id: string;
  news_item_id: string;
}

export interface MarketBrief {
  id: string;
  content: string;
  generated_at: string;
  created_at: string;
}

export interface MarketBriefInsert {
  id?: string;
  content: string;
  generated_at?: string;
  created_at?: string;
}

export interface NarrativeSnapshot {
  id: string;
  content: string;
  debug_json: Record<string, unknown> | null;
  generated_at: string;
  created_at: string;
}

export interface NarrativeSnapshotInsert {
  id?: string;
  content: string;
  debug_json?: Record<string, unknown> | null;
  generated_at?: string;
  created_at?: string;
}

export interface AiRun {
  id: string;
  run_type: string;
  status: AiRunStatus;
  input_snapshot: Record<string, unknown> | null;
  output_snapshot: Record<string, unknown> | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface AiRunInsert {
  id?: string;
  run_type: string;
  status: AiRunStatus;
  input_snapshot?: Record<string, unknown> | null;
  output_snapshot?: Record<string, unknown> | null;
  error_message?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
}

export interface EvalRun {
  id: string;
  ai_run_id: string | null;
  metrics: Record<string, unknown>;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface EvalRunInsert {
  id?: string;
  ai_run_id?: string | null;
  metrics?: Record<string, unknown>;
  started_at?: string;
  completed_at?: string | null;
  created_at?: string;
}

export type IngestionRunStatus = "running" | "completed" | "partial" | "failed";
export type IngestionTrigger = "manual" | "cron" | "pre_pipeline";

export interface IngestionRun {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: IngestionRunStatus;
  prices: Record<string, unknown> | null;
  funding: Record<string, unknown> | null;
  news: Record<string, unknown> | null;
  embeddings: Record<string, unknown> | null;
  trigger: IngestionTrigger;
}

export interface IngestionRunInsert {
  id?: string;
  started_at?: string;
  completed_at?: string | null;
  status?: IngestionRunStatus;
  prices?: Record<string, unknown> | null;
  funding?: Record<string, unknown> | null;
  news?: Record<string, unknown> | null;
  embeddings?: Record<string, unknown> | null;
  trigger?: IngestionTrigger;
}

export interface DocumentChunk {
  id: string;
  source_table: string;
  source_id: string;
  chunk_index: number;
  content: string;
  token_count: number | null;
  embedding: number[] | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DocumentChunkInsert {
  id?: string;
  source_table: string;
  source_id: string;
  chunk_index?: number;
  content: string;
  token_count?: number | null;
  embedding?: number[] | null;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

/** Supabase Database schema type for typed client (optional). */
export interface Database {
  public: {
    Tables: {
      assets: { Row: Asset; Insert: AssetInsert; Update: Partial<AssetInsert> };
      market_snapshots: {
        Row: MarketSnapshot;
        Insert: MarketSnapshotInsert;
        Update: Partial<MarketSnapshotInsert>;
      };
      news_items: {
        Row: NewsItem;
        Insert: NewsItemInsert;
        Update: Partial<NewsItemInsert>;
      };
      narratives: {
        Row: Narrative;
        Insert: NarrativeInsert;
        Update: Partial<NarrativeInsert>;
      };
      narrative_news: {
        Row: NarrativeNews;
        Insert: NarrativeNewsInsert;
        Update: Partial<NarrativeNewsInsert>;
      };
      market_briefs: {
        Row: MarketBrief;
        Insert: MarketBriefInsert;
        Update: Partial<MarketBriefInsert>;
      };
      narrative_snapshots: {
        Row: NarrativeSnapshot;
        Insert: NarrativeSnapshotInsert;
        Update: Partial<NarrativeSnapshotInsert>;
      };
      ai_runs: {
        Row: AiRun;
        Insert: AiRunInsert;
        Update: Partial<AiRunInsert>;
      };
      eval_runs: {
        Row: EvalRun;
        Insert: EvalRunInsert;
        Update: Partial<EvalRunInsert>;
      };
      ingestion_runs: {
        Row: IngestionRun;
        Insert: IngestionRunInsert;
        Update: Partial<IngestionRunInsert>;
      };
      document_chunks: {
        Row: DocumentChunk;
        Insert: DocumentChunkInsert;
        Update: Partial<DocumentChunkInsert>;
      };
    };
  };
}
