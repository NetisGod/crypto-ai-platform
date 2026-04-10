-- Ingestion pipeline: ingestion_runs + document_chunks + match_document_chunks RPC

-- 1. ingestion_runs — tracks every pipeline execution
CREATE TABLE IF NOT EXISTS ingestion_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'running',
  prices        JSONB,
  funding       JSONB,
  news          JSONB,
  embeddings    JSONB,
  trigger       TEXT NOT NULL DEFAULT 'manual'
);

CREATE INDEX IF NOT EXISTS idx_ingestion_runs_status
  ON ingestion_runs(status, started_at DESC);

-- 2. document_chunks — centralized vector storage for all document types
CREATE TABLE IF NOT EXISTS document_chunks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table TEXT NOT NULL,
  source_id    UUID NOT NULL,
  chunk_index  INT NOT NULL DEFAULT 0,
  content      TEXT NOT NULL,
  token_count  INT,
  embedding    vector(1536),
  metadata     JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_chunks_source
  ON document_chunks(source_table, source_id);

CREATE INDEX IF NOT EXISTS idx_chunks_embedding_hnsw
  ON document_chunks USING hnsw (embedding vector_cosine_ops);

-- 3. match_document_chunks — vector search RPC
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_limit INT DEFAULT 10,
  filter_source TEXT DEFAULT NULL
)
RETURNS TABLE (
  chunk_id UUID,
  source_table TEXT,
  source_id UUID,
  chunk_index INT,
  content TEXT,
  metadata JSONB,
  distance FLOAT
)
LANGUAGE sql STABLE AS $$
  SELECT id, source_table, source_id, chunk_index, content, metadata,
         (embedding <=> query_embedding) AS distance
  FROM document_chunks
  WHERE embedding IS NOT NULL
    AND (filter_source IS NULL OR document_chunks.source_table = filter_source)
  ORDER BY embedding <=> query_embedding
  LIMIT match_limit;
$$;
