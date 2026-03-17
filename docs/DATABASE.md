# Database Schema — AI Crypto Market Intelligence Platform

**Database**: Supabase (PostgreSQL + pgvector extension)

---

## Tables Overview

| Table | Purpose |
|---|---|
| `assets` | Master list of tracked crypto assets |
| `market_snapshots` | Price/volume/funding snapshots per asset |
| `news_items` | Normalized crypto news with future embeddings |
| `narratives` | AI-detected market narratives |
| `narrative_news` | Many-to-many: narratives ↔ news items |
| `market_briefs` | Cached AI market brief outputs |
| `ai_runs` | Observability: all AI workflow runs |
| `eval_runs` | Evaluation: golden-set eval results |

---

## Table Definitions

### `assets`
Master registry of tracked crypto assets.

```sql
CREATE TABLE assets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol      TEXT UNIQUE NOT NULL,         -- e.g. 'BTC', 'ETH'
  name        TEXT NOT NULL,                -- e.g. 'Bitcoin'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX ON assets(symbol);
```

**Relationships**: Referenced by `market_snapshots.asset_id`

---

### `market_snapshots`
Point-in-time market data snapshots per asset.

```sql
CREATE TABLE market_snapshots (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id          UUID REFERENCES assets(id) ON DELETE CASCADE,
  symbol            TEXT NOT NULL,           -- denormalized for query convenience
  price             NUMERIC,
  volume_24h        NUMERIC,
  market_cap        NUMERIC,                 -- app-level only, may not be persisted
  open_interest     NUMERIC,
  funding_rate      NUMERIC,
  liquidation_long  NUMERIC,
  liquidation_short NUMERIC,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

**TypeScript Row Shape (SnapshotRow)**:
```typescript
type SnapshotRow = {
  symbol: string
  price: number
  volume_24h: number | null
  market_cap: number | null
  funding_rate: number | null
  open_interest: number | null
}
```

**Open question**: Whether snapshots are persistently ingested on a schedule or only written ad-hoc — **NOT DEFINED**

---

### `news_items`
Normalized crypto news articles. Future: stores embeddings for RAG.

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE news_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  body            TEXT,
  source          TEXT,
  url             TEXT UNIQUE,
  summary         TEXT,                      -- AI-generated or extracted
  sentiment_score NUMERIC,                   -- future sentiment analysis
  published_at    TIMESTAMPTZ,
  embedding       VECTOR(1536),              -- OpenAI-compatible embedding
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint on URL
CREATE UNIQUE INDEX ON news_items(url);

-- HNSW vector index for cosine similarity search (RAG)
CREATE INDEX ON news_items
  USING hnsw (embedding vector_cosine_ops);
```

**TypeScript Row Shape (NewsRow)**:
```typescript
type NewsRow = {
  title: string
  source: string
  summary: string | null
  url: string | null
  published_at: string | null
}
```

**Relationships**: Many-to-many with `narratives` via `narrative_news`

---

### `narratives`
AI-detected active market narratives.

```sql
CREATE TABLE narratives (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  name         TEXT,                         -- display name
  summary      TEXT,
  description  TEXT,
  confidence   NUMERIC,
  growth_score NUMERIC,
  strength     NUMERIC,
  trend        TEXT,                         -- 'rising' | 'stable' | 'fading'
  sentiment    NUMERIC,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

**TypeScript Row Shape (NarrativeRow)**:
```typescript
type NarrativeRow = {
  name: string
  description: string | null
  strength: number
  trend: string
  sentiment: number
}
```

**Open question**: DB fields vs app-level NarrativeRow schema reconciliation — **NOT FINALIZED**

---

### `narrative_news`
Junction table — many-to-many between narratives and news items.

```sql
CREATE TABLE narrative_news (
  narrative_id  UUID REFERENCES narratives(id) ON DELETE CASCADE,
  news_id       UUID REFERENCES news_items(id) ON DELETE CASCADE,
  PRIMARY KEY (narrative_id, news_id)
);
```

---

### `market_briefs`
Cached AI market brief results including full debug payload.

```sql
CREATE TABLE market_briefs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_summary TEXT NOT NULL,
  drivers        JSONB NOT NULL,
  risks          JSONB NOT NULL,
  confidence     NUMERIC,
  sources        JSONB,
  model_name     TEXT,
  debug_json     JSONB,                      -- full agent-by-agent breakdown
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

**`debug_json` shape** (stores full multi-agent explainability payload):
```typescript
type DebugJson = {
  marketDataAnalysis: object
  newsAnalysis: object
  narrativeAnalysis: object
  riskAnalysis: object
  synthesizedBrief: object
  validatedBrief: object
  issues: string[]
}
```

**UI usage**: "How this brief was built" drawer reads `debug_json` — no new AI call required.

---

### `ai_runs`
Observability table — persists every AI workflow execution.

```sql
CREATE TABLE ai_runs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name  TEXT NOT NULL,              -- e.g. 'market-brief', 'token-analysis'
  model_name     TEXT,
  latency_ms     INTEGER,
  token_input    INTEGER,
  token_output   INTEGER,
  cost_usd       NUMERIC,
  success        BOOLEAN DEFAULT TRUE,
  retry_count    INTEGER DEFAULT 0,
  error_message  TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

**Consumed by**: Monitoring page (`/monitoring`), Langfuse traces

---

### `eval_runs`
Stores results from golden-set evaluation runs.

```sql
CREATE TABLE eval_runs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name   TEXT NOT NULL,
  score       NUMERIC,
  evaluator   TEXT,                          -- e.g. 'llm-as-judge', 'human', 'script'
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

**Populated by**: `scripts/run-evals.ts`

---

## Relationships Summary

```
assets ──────────────── 1:many ──── market_snapshots
narratives ─────────── many:many ── news_items  (via narrative_news)
market_briefs ─────── standalone (workflow output)
ai_runs ───────────── standalone (observability)
eval_runs ─────────── standalone (evaluation)
```

---

## Indexes Summary

| Table | Column | Index Type | Purpose |
|---|---|---|---|
| `assets` | `symbol` | UNIQUE | Fast asset lookup |
| `news_items` | `url` | UNIQUE | Dedup on ingest |
| `news_items` | `embedding` | HNSW cosine | RAG vector search |
| `narrative_news` | `(narrative_id, news_id)` | PRIMARY KEY | Junction dedup |

---

## Open Questions

- RLS policies: **NOT DEFINED** — needs definition before production
- Whether `market_cap` is persisted in DB or stays app-level only: **NOT FINALIZED**
- Whether news is always stored in DB before display: **NOT FINALIZED**
- Semantic cache storage table/schema: **NOT DEFINED**
- Background ingestion schedule for `market_snapshots`: **NOT DEFINED**
