# Ingestion Pipeline Architecture

Reference document for the data ingestion pipeline — how external data enters
the system, gets stored, chunked, embedded, and consumed by the AI agent
pipeline.

---

## 1. Overview

The ingestion pipeline is responsible for:

1. Fetching data from external sources (CoinGecko, Binance, CryptoPanic)
2. Normalizing and deduplicating incoming data
3. Persisting structured data to Supabase (relational)
4. Extracting and chunking full article bodies
5. Generating embeddings and storing them for vector search (pgvector)
6. Recording ingestion metadata for freshness tracking

The pipeline runs independently from the AI agent pipeline. Agents consume
ingested data from the database — they never call external APIs directly.

---

## 2. High-Level Data Flow

```
External Sources
  CoinGecko (prices)
  Binance Futures (funding/OI)
  CryptoPanic (news)
        |
        v
  Ingestion Orchestrator
  runIngestionPipeline()
        |
        +---> Phase 1 (parallel)
        |       Prices (CoinGecko)
        |       News (CryptoPanic)
        |
        +---> Phase 2 (sequential, depends on Phase 1)
        |       Funding/OI (Binance, after prices)
        |       Article extraction + chunking + embedding (after news)
        |
        +---> Phase 3
        |       Write ingestion_runs metadata
        |
        v
  Supabase
    Relational: assets, market_snapshots, news_items, narratives
    Vector: document_chunks (pgvector, HNSW)
        |
        v
  Consumers
    LangGraph market brief pipeline (loadContext)
    Ask AI (semantic search)
    Narrative detection
    Token analysis
```

---

## 3. External Data Sources

### 3.1 CoinGecko — Market Prices

- **Endpoint:** `GET /api/v3/coins/markets`
- **Data:** price, volume_24h, market_cap per token
- **Normalized to:** `NormalizedPrice`
- **Stored in:** `assets` (upsert) + `market_snapshots` (insert)
- **Service:** `src/services/ingestion/coingecko.ts`

### 3.2 Binance Futures — Funding Rate and Open Interest

- **Endpoints:** `GET /fapi/v1/fundingRate`, `GET /futures/data/openInterestHist`
- **Symbols:** BTCUSDT, ETHUSDT, SOLUSDT, AVAXUSDT, LINKUSDT
- **Normalized to:** `NormalizedFunding`
- **Stored in:** `market_snapshots` (update latest snapshot per asset)
- **Dependency:** Must run after prices — needs existing snapshots to update
- **Service:** `src/services/ingestion/binance.ts`

### 3.3 CryptoPanic — News

- **Endpoint:** `GET /api/developer/v2/posts/`
- **Data:** title, source, summary, URL, sentiment (from votes), related tokens
- **Normalized to:** `NormalizedNewsItem`
- **Stored in:** `news_items` (insert, deduplicated on URL)
- **Service:** `src/services/ingestion/cryptopanic.ts`

---

## 4. Ingestion Orchestrator

**File:** `src/services/ingestion/orchestrator.ts`

Single entry point that coordinates all ingestion steps in the correct order.

```
runIngestionPipeline(options: IngestionOptions): Promise<IngestionRunRecord>
```

### Options

```typescript
interface IngestionOptions {
  trigger: 'manual' | 'cron' | 'pre_pipeline';
  skipPrices?: boolean;
  skipNews?: boolean;
  skipFunding?: boolean;
  skipEmbeddings?: boolean;
}
```

### Execution Order

1. **Phase 1 — Parallel independent sources**
   - `ingestPrices()` — CoinGecko prices
   - `ingestNews()` — CryptoPanic news (with deduplication)
2. **Phase 2 — Dependent steps (sequential)**
   - `ingestFunding()` — Binance funding/OI (only if prices succeeded)
   - `ingestArticlesAndEmbed()` — extract bodies, chunk, embed (only if news succeeded)
3. **Phase 3 — Metadata**
   - Record results in `ingestion_runs` table

### Error Handling

- Each phase uses `Promise.allSettled` for parallel steps
- Partial failures produce `status: 'partial'` (some sources succeeded)
- Full failures produce `status: 'failed'`
- All results are recorded in `ingestion_runs` for observability

---

## 5. Store Layer

**File:** `src/services/ingestion/store.ts`

### Key Functions

| Function | Behavior |
|----------|----------|
| `upsertAssets(items)` | Upsert by symbol, return symbol-to-id map |
| `insertMarketSnapshots(prices, funding?)` | Batch insert snapshots, optionally merge funding |
| `updateSnapshotsFunding(funding)` | Update latest snapshot per asset with funding/OI |
| `insertNewsItems(items)` | Batch insert with deduplication on URL |

### Batch Operations

All inserts should use Supabase batch `.insert(rows[])` instead of
row-by-row loops. This reduces round trips and improves throughput.

### Deduplication

News items are deduplicated by URL using upsert with
`onConflict: 'url'` and `ignoreDuplicates: true`. This prevents
duplicate rows when ingestion runs overlap.

---

## 6. What Gets Embedded (Vector Store Strategy)

### Principle

Embed what needs to be searched by meaning. Store everything else
relationally. Never embed numeric time-series data.

### Embedding Decisions

| Data | Embed? | Reason |
|------|--------|--------|
| News items (title + summary) | Yes | Semantic search for Ask AI, RAG for agents |
| News items (full article body) | Yes, chunked | Deep retrieval from article content |
| Narratives (name + description) | Yes | Historical narrative pattern matching |
| Market briefs (headline + summary + drivers) | Yes | "What did we say last time X happened?" |
| Market snapshots (prices, volume, funding) | No | Numeric — use SQL queries |
| Assets | No | Small fixed set — exact match |
| AI runs / eval runs | No | Operational metadata — no semantic use case |

### Embedding Model

- **Model:** OpenAI `text-embedding-3-small`
- **Dimensions:** 1536
- **Context window:** 8,192 tokens
- **Cost:** ~$0.02 per 1M tokens (~$0.02-0.20/month at expected volume)

### Embedding Text Construction

For each document type, the text sent to the embedding model:

- **News (short):** `title + "\n" + summary`
- **News (full article):** chunked body text (see Section 7)
- **Narratives:** `name + "\n" + description`
- **Market briefs:** `headline + "\n" + market_summary + "\n" + key_drivers (joined)`

---

## 7. Chunking Pipeline

### When to Chunk

Chunking is applied automatically based on estimated token count:

- If content <= ~450 tokens (1,800 chars): store as single chunk (`chunk_index = 0`)
- If content > ~450 tokens: split into multiple chunks with overlap

### Chunking Parameters

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Chunk size | 1,200 characters (~300 tokens) | Focused enough for precise retrieval |
| Overlap | 200 characters (~50 tokens) | Preserves cross-boundary context |
| Min chunk size | 120 characters (~30 tokens) | Prevents tiny orphan fragments |
| Separators | `["\n\n", "\n", ". ", " "]` | Paragraph-aware, sentence-aware fallback |

### Implementation

Use LangChain's `RecursiveCharacterTextSplitter` (already a project dependency):

```typescript
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1200,
  chunkOverlap: 200,
  separators: ["\n\n", "\n", ". ", " "],
});
```

### Full Article Extraction

CryptoPanic provides title + URL but not full article body. To get
the body, follow the article URL and extract readable text:

- Use a library like `@extractus/article-extractor` or similar
- If extraction fails, fall back to title + summary as a single chunk
- Rate-limit extraction to avoid overwhelming source sites

---

## 8. Vector Storage Schema

### `document_chunks` Table

Centralized vector storage for all document types.

```sql
CREATE TABLE document_chunks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table TEXT NOT NULL,       -- 'news_items' | 'narratives' | 'market_briefs'
  source_id    UUID NOT NULL,       -- FK to the parent document row
  chunk_index  INT NOT NULL DEFAULT 0,
  content      TEXT NOT NULL,       -- the chunk text that was embedded
  token_count  INT,
  embedding    vector(1536),
  metadata     JSONB DEFAULT '{}',  -- { title, source, published_at, ... }
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_id, chunk_index)
);

CREATE INDEX idx_chunks_source ON document_chunks(source_table, source_id);
CREATE INDEX idx_chunks_embedding_hnsw ON document_chunks
  USING hnsw (embedding vector_cosine_ops);
```

### Migration from `news_items.embedding`

The existing `news_items.embedding` column becomes redundant once
`document_chunks` is in use. Migration path:

1. Create `document_chunks` table
2. Migrate existing embedded news into `document_chunks`
3. Update search RPCs to query `document_chunks`
4. Drop `news_items.embedding` column and HNSW index

### Vector Search RPC

```sql
CREATE FUNCTION match_document_chunks(
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
    AND (filter_source IS NULL OR source_table = filter_source)
  ORDER BY embedding <=> query_embedding
  LIMIT match_limit;
$$;
```

---

## 9. Freshness Tracking

### `ingestion_runs` Table

Records every ingestion execution for observability and freshness checks.

```sql
CREATE TABLE ingestion_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'running',
  prices        JSONB,     -- { count, source, duration_ms, error? }
  funding       JSONB,
  news          JSONB,
  embeddings    JSONB,
  trigger       TEXT NOT NULL DEFAULT 'manual'
);
```

Status values: `running` | `completed` | `partial` | `failed`

Trigger values: `manual` | `cron` | `pre_pipeline`

### Freshness Check

**File:** `src/services/ingestion/freshness.ts`

Before the agent pipeline runs, it checks whether ingested data is
fresh enough:

```typescript
const FRESHNESS_THRESHOLDS = {
  prices:  15 * 60_000,   // 15 minutes
  news:    30 * 60_000,   // 30 minutes
  funding: 60 * 60_000,   // 1 hour
};
```

`isDataFresh()` queries the latest successful `ingestion_runs` row
and compares timestamps. If data is stale, the pipeline can:

- **Option A:** Trigger inline re-ingestion (adds latency, guarantees freshness)
- **Option B:** Proceed with stale data and flag it in `debug_json`

The chosen behavior is configurable per trigger type.

---

## 10. Scheduling

### Triggers

The ingestion pipeline can be triggered three ways:

| Trigger | When | Endpoint |
|---------|------|----------|
| **Cron** | Every 15 minutes (configurable) | `POST /api/ingest` |
| **Manual** | Developer/admin triggers explicitly | `POST /api/ingest` |
| **Pre-pipeline** | Before market brief generation if data is stale | Called internally by `loadContextNode` |

### Cron Configuration (Vercel)

```json
{
  "crons": [
    { "path": "/api/ingest", "schedule": "*/15 * * * *" }
  ]
}
```

For self-hosted deployments, any external scheduler can POST to the
same endpoint.

---

## 11. API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ingest` | POST | Full orchestrated ingestion pipeline |
| `/api/ingest/prices` | POST | Prices only (delegates to orchestrator) |
| `/api/ingest/news` | POST | News only (delegates to orchestrator) |
| `/api/ingest/funding` | POST | Funding only (delegates to orchestrator) |

The individual routes are kept for backward compatibility but delegate
to the orchestrator internally.

---

## 12. How the Agent Pipeline Consumes Ingested Data

### LangGraph Market Brief Pipeline

`loadContextFromDb()` in `src/ai/workflows/market-brief-graph.ts`:

1. Check freshness via `isDataFresh()`
2. If stale, optionally trigger `runIngestionPipeline({ trigger: 'pre_pipeline' })`
3. Load from Supabase:
   - `market_snapshots`: latest per asset (BTC, ETH, SOL)
   - `news_items`: 20 most recent by `published_at`
   - `narratives`: top 10 by strength
4. Optionally blend recency with semantic relevance:
   - 10 most recent news (recency)
   - 10 semantically relevant news via `match_document_chunks` (relevance)
   - Merge and deduplicate

### Ask AI

`buildAskContext()` in `src/services/ai/build-ask-context.ts`:

- Use `searchRelevantNews(question)` for semantically relevant news
  instead of (or alongside) live CryptoPanic fetch
- Vector search finds articles that keyword matching would miss

### Narrative Detection

- Reads existing narratives from DB
- Can use `match_document_chunks` with `filter_source = 'narratives'`
  to find historically similar narrative patterns

---

## 13. File Structure

```
src/services/ingestion/
  orchestrator.ts       -- runIngestionPipeline(), single entry point
  freshness.ts          -- isDataFresh(), freshness thresholds
  store.ts              -- batch upserts, deduplication, chunk storage
  chunker.ts            -- text splitting, shouldChunk()
  embedder.ts           -- batch embedding via OpenAI
  article-extractor.ts  -- fetch + extract full article body from URL
  sources/
    coingecko.ts        -- fetchCoinGeckoPrices()
    binance.ts          -- fetchBinanceFunding/OI()
    cryptopanic.ts      -- fetchCryptoPanicNews()
  types.ts              -- NormalizedPrice, NormalizedFunding, NormalizedNewsItem,
                           IngestionRunRecord, ChunkConfig
  index.ts              -- public exports
```

---

## 14. Implementation Order

1. Add `ingestion_runs` table (migration)
2. Add `document_chunks` table (migration)
3. Add `match_document_chunks` RPC (migration)
4. Create `freshness.ts` — query + threshold logic
5. Create `chunker.ts` — text splitting with LangChain
6. Create `embedder.ts` — batch embedding wrapper
7. Create `article-extractor.ts` — URL fetch + body extraction
8. Rewrite `store.ts` — batch operations, deduplication, chunk storage
9. Create `orchestrator.ts` — pipeline coordinator
10. Create unified `POST /api/ingest` route
11. Update `loadContextNode` in LangGraph pipeline — freshness check
12. Migrate existing `news_items.embedding` data to `document_chunks`
13. Update search functions to use `document_chunks`
14. Update individual ingest routes to delegate to orchestrator
15. Add scheduling config (Vercel Cron or equivalent)
16. Drop legacy `news_items.embedding` column

---

## 15. Cost and Storage Considerations

### Embedding Cost (OpenAI text-embedding-3-small)

| Volume | Monthly cost |
|--------|-------------|
| 1,000 news items/month | ~$0.02 |
| 10,000 news items/month | ~$0.20 |
| 100,000 news items/month | ~$2.00 |

### Vector Storage

Each 1536-dim vector is ~6KB. At 100k chunks, that is ~600MB.

Consider a TTL policy: drop embeddings older than 90 days (keep the
relational row) to bound storage growth. Most retrieval use cases
care about recent context, not years-old articles.
