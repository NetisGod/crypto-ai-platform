
FILE: /docs/data-model.md
```md
# Data Model

## Status
- **Core tables:** Confirmed
- **Some application-level row shapes vs DB schema:** Mixed / partially aligned
- **RLS policies:** Not yet specified

## 1. Table: assets

### Status
- Confirmed

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| symbol | text | Unique, not null |
| name | text | Not null |
| created_at | timestamptz | Default now() |

### Relationships
- `market_snapshots.asset_id` → `assets.id`

### Constraints / indexes
- unique symbol

---

## 2. Table: market_snapshots

### Status
- Confirmed

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| asset_id | UUID | FK to assets |
| price | numeric | |
| volume_24h | numeric | |
| open_interest | numeric | |
| funding_rate | numeric | |
| liquidation_long | numeric | |
| liquidation_short | numeric | |
| created_at | timestamptz | Default now() |

### Relationships
- many snapshots belong to one asset

### Related application shape
`SnapshotRow` in app code includes:
- symbol
- price
- volume_24h
- market_cap
- funding_rate
- open_interest

This indicates app-level typing may be richer than current DB schema.

---

## 3. Table: news_items

### Status
- Confirmed

### Fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| title | text | Not null |
| body | text | |
| source | text | |
| url | text | Unique |
| sentiment_score | numeric | |
| published_at | timestamptz | |
| created_at | timestamptz | Default now() |
| embedding | vector(1536) | For retrieval |

### Relationships
- connected to narratives through `narrative_news`

### Constraints / indexes
- unique `url`
- HNSW vector index on `embedding` with cosine ops

### Related application shape
`NewsRow`:
- title
- source
- summary
- url
- published_at

---

## 4. Table: narratives

### Status
- Confirmed

### DB-level fields discussed
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| title | text | Not null |
| summary | text | |
| confidence | numeric | |
| growth_score | numeric | |
| created_at | timestamptz | Default now() |

### App-level typed shape also discussed
`NarrativeRow`:
- name
- description
- strength
- trend
- sentiment

### Relationships
- many-to-many with `news_items`

### Notes
There is an unresolved mismatch between DB-level and app-level narrative fields.

---

## 5. Table: narrative_news

### Status
- Confirmed

### Fields
| Field | Type | Notes |
|---|---|---|
| narrative_id | UUID | FK to narratives |
| news_id | UUID | FK to news_items |

### Relationships
- join table between narratives and news

### Constraints
- composite primary key `(narrative_id, news_id)`

---

## 6. Table: market_briefs

### Status
- Confirmed

### Originally discussed fields
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| summary | text | Original field naming |
| drivers | jsonb | |
| risks | jsonb | |
| confidence | numeric | |
| model_name | text | |
| created_at | timestamptz | Default now() |

### Final product-level output shape
- market_summary
- drivers
- risks
- confidence
- sources

### Required/strongly recommended future field
- `debug_json`

### Purpose
- cache Market Briefs
- support explainability
- prevent regeneration on page load

### Example debug_json payload
```json
{
  "marketDataAnalysis": {},
  "newsAnalysis": {},
  "narrativeAnalysis": {},
  "riskAnalysis": {},
  "synthesizedBrief": {},
  "validatedBrief": {},
  "issues": []
}