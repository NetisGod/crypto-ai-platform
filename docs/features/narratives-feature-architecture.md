# Feature Architecture: Narratives

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User / Browser                        │
│                                                         │
│  /narratives page (client component)                    │
│    ├── GET /api/ai/narratives → cached snapshot         │
│    └── POST /api/ai/narratives → full pipeline          │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│              API Route (thin)                            │
│  src/app/api/ai/narratives/route.ts                     │
│    GET → getLatestNarratives()                          │
│    POST → generateNarratives()                          │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│          Orchestration Service                           │
│  src/services/narratives/service.ts                     │
│    ├── loadTokenMarketData()      ← scoring.ts          │
│    ├── scoreNarrativeCandidates() ← scoring.ts          │
│    ├── getLatestNews()            ← news service        │
│    ├── generateNarrativeExplanations() ← generate.ts    │
│    ├── mergeResults()             ← internal            │
│    ├── persist to narrative_snapshots ← Supabase        │
│    └── track in ai_runs           ← Supabase            │
└───┬───────────┬───────────┬───────────┬─────────────────┘
    │           │           │           │
┌───▼───┐ ┌────▼────┐ ┌────▼────┐ ┌────▼────────────────┐
│Binance│ │Supabase │ │  News   │ │   AI Runner          │
│  API  │ │snapshots│ │ Service │ │ runAIStructured()    │
│(BTC,  │ │+ assets │ │CryptoP/ │ │   → chooseModel()   │
│ ETH)  │ │         │ │RSS feed │ │   → OpenRouter       │
└───────┘ └─────────┘ └─────────┘ │   → Zod validation  │
                                  │   → Langfuse trace   │
                                  └──────────────────────┘
```

---

## Status

- **Feature:** Narratives
- **Implementation status:** Implemented (MVP)
- **Product route:** `/narratives`
- **Primary read route:** `GET /api/ai/narratives`
- **Primary generation route:** `POST /api/ai/narratives`
- **Persistence:** `narrative_snapshots` table (Supabase)

---

## What This Feature Does

Narratives detects and explains the **dominant crypto themes currently driving cross-token price action**.

It answers:

- Which market narratives are active right now?
- Is the market rotating into AI, memes, L2s, DeFi, Solana ecosystem, or something else?
- Which tokens are leading each narrative?
- Is a narrative emerging, active, or fading?
- Which signals and risks support that conclusion?

The feature is **not** a free-form LLM prompt. It is a **structured market analysis feature** built on top of deterministic scoring with an AI explanation layer.

---

## Core Design Principle

**Deterministic logic first, AI explanation second.**

1. Collect structured market data from existing internal services
2. Group tokens into predefined themes using a static taxonomy
3. Score narrative candidates deterministically
4. Rank the strongest candidates
5. Send structured candidate context into the shared AI runner
6. Validate AI output with Zod
7. Merge deterministic scores with AI explanations
8. Persist and cache for read performance

The LLM explains pre-scored candidates — it does not decide which narratives exist.

---

## File Structure

```
src/
  services/narratives/
    types.ts              # Domain types: NarrativeItem, NarrativeCandidate, etc.
    taxonomy.ts           # Static token-to-theme mapping
    scoring.ts            # Market data loading + deterministic scoring
    generate.ts           # AI prompt builder + generation with fallback chain
    service.ts            # Orchestration: generateNarratives(), getLatestNarratives()

  ai/schemas/
    narratives.ts         # Zod schemas for AI output validation

  app/api/ai/narratives/
    route.ts              # Thin GET + POST handlers

  app/(app)/narratives/
    page.tsx              # Client-side page with cards, drawer, loading/empty/error

  types/
    database.ts           # NarrativeSnapshot + NarrativeSnapshotInsert types

supabase/migrations/
  20260317000001_add_narrative_snapshots.sql   # DB migration
```

---

## Domain Types

### `NarrativeItem` (final output)

```ts
export type NarrativeStatus = "emerging" | "active" | "peaking" | "fading";

export interface NarrativeSignal {
  label: string;
  explanation: string;
}

export interface NarrativeTokenRef {
  symbol: string;
  role: "leader" | "related" | "laggard";
}

export interface NarrativeItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  thesis: string;
  status: NarrativeStatus;
  strengthScore: number;      // compositeScore from deterministic scoring (0–100)
  confidenceScore: number;    // AI confidence capped by dataCoverage (0–1)
  leaderTokens: NarrativeTokenRef[];
  relatedTokens: NarrativeTokenRef[];
  laggardTokens?: NarrativeTokenRef[];
  supportingSignals: NarrativeSignal[];
  riskSignals: string[];
  catalysts: string[];
  updatedAt: string;
}
```

### `NarrativeCandidate` (internal, pre-AI)

```ts
export interface NarrativeCandidate {
  slug: string;
  name: string;
  tokens: string[];           // symbols with available data in this bucket
  bucketSize: number;         // total tokens defined in taxonomy bucket
  dataCoverage: number;       // fraction of bucket with data (0–1)
  performanceScore: number;   // 0–100
  breadthScore: number;       // 0–100
  moverPresenceScore: number; // 0–100
  compositeScore: number;     // weighted combination (0–100)
  leaderTokens: string[];
  status: NarrativeStatus;
  tokenPerformance: Record<string, number>;  // per-token 24h change %
}
```

---

## Token Taxonomy

Static mapping in `src/services/narratives/taxonomy.ts`. Tokens are limited to those the app actually tracks via Binance, ingestion, or mock data.

| Slug | Name | Tokens |
|------|------|--------|
| `ai` | AI + Crypto | FET, RENDER, TAO, LINK, NEAR |
| `l2` | Layer 2 Scaling | ARB, OP, MATIC |
| `memes` | Meme Coins | DOGE, PEPE, WIF, BONK |
| `defi` | DeFi Resurgence | UNI, AAVE, AVAX |
| `sol_eco` | Solana Ecosystem | SOL, BONK, WIF |
| `btc_beta` | Bitcoin Beta / Majors | BTC, ETH, BNB |

Tokens can appear in multiple buckets (e.g. BONK in both `memes` and `sol_eco`).

`ALL_TAXONOMY_SYMBOLS` is a deduplicated flat list computed at import time.

---

## Scoring Logic

### Data Collection (`loadTokenMarketData`)

Two sources, in priority order:

1. **Binance live** — BTC and ETH with reliable `priceChangePercentage24h`
2. **Supabase `assets` + `market_snapshots`** — all other ingested tokens

For Supabase tokens, 24h change is approximated by comparing the two most recent snapshots. If only one snapshot exists, change defaults to 0.

**Staleness detection:** Snapshots older than 48 hours have their `change24h` zeroed to prevent misleading signals.

Binance data takes precedence — if BTC/ETH data exists from Binance, the DB fallback is skipped for those symbols.

### Scoring Dimensions

| Dimension | Weight | Calculation |
|---|---|---|
| `performanceScore` | 0.5 | Average 24h change, normalized to 0–100 (-10% = 0, 0% = 50, +10% = 100) |
| `breadthScore` | 0.3 | Fraction of bucket tokens with positive 24h change, × 100 |
| `moverPresenceScore` | 0.2 | Share of global top-5 movers that belong to this bucket, × 100 |

`compositeScore = perf × 0.5 + breadth × 0.3 + moverPresence × 0.2`

**Coverage discount:** If `dataCoverage < 0.5`, `compositeScore *= dataCoverage`. This prevents single-token buckets from ranking artificially high.

### Status Inference

| Composite Score | Status |
|---|---|
| ≥ 70 | `active` |
| ≥ 45 | `emerging` |
| < 45 | `fading` |

`peaking` is intentionally not inferred in MVP — detecting a peak requires comparing current scores to prior scores, which needs persistence history that does not exist yet.

---

## AI Explanation Layer

### Path

`runAIStructured("synthesis", prompt, NarrativesAIOutputSchema)`
→ `chooseModel("synthesis")` → OpenRouter → Zod validation

### Prompt Structure

The system prompt instructs the model to:
- explain only the provided candidates (no invention)
- reference concrete data points (price moves, breadth, leader tokens)
- reduce confidence proportionally when data coverage is low
- add risk signals for limited coverage
- avoid financial advice or price predictions

The user prompt includes for each candidate:
- slug, name, status, data coverage ratio
- all scoring dimensions
- per-token 24h performance with leader markers
- recent news items (up to 10)

### Fallback Chain

```
runAIStructured (Zod-validated structured output)
  ↓ failure
runAI (plain text) → manual JSON parse → safeParse
  ↓ failure
buildFallbackOutput (deterministic-only, confidence: 0.2)
```

The terminal fallback guarantees the feature always returns a result, even if all AI calls fail.

### AI Output Schema (Zod)

```ts
NarrativesAIOutputSchema = z.object({
  narratives: z.array(z.object({
    slug: z.string(),
    title: z.string(),
    summary: z.string(),
    thesis: z.string(),
    supporting_signals: z.array(z.object({
      label: z.string(),
      explanation: z.string(),
    })),
    risk_signals: z.array(z.string()).default([]),
    catalysts: z.array(z.string()).default([]),
    confidence: z.number().min(0).max(1),
  })),
});
```

---

## Merge Layer

`mergeResults()` in `service.ts` combines deterministic candidates with AI output:

- `strengthScore` = `compositeScore` (deterministic, 0–100)
- `confidenceScore` = `min(AI confidence, dataCoverage)` — hard cap ensures confidence never overstates data quality
- `leaderTokens` / `laggardTokens` / `relatedTokens` are derived from deterministic `tokenPerformance`
- `title` / `summary` / `thesis` / `supportingSignals` / `riskSignals` / `catalysts` come from AI output, with deterministic fallbacks if AI is unavailable

---

## Orchestration Service

### `generateNarratives()` — POST path

Full pipeline:

1. Start Langfuse trace (`narratives_generation`)
2. Insert `ai_runs` row with status `running`
3. `loadTokenMarketData()` — Binance + Supabase
4. `scoreNarrativeCandidates()` — deterministic ranking
5. Slice top 6 candidates for AI
6. `getLatestNews(10)` — recent news context
7. Log Langfuse scores (token count, candidate count, news count, data coverage)
8. `generateNarrativeExplanations()` — AI with fallback chain
9. `mergeResults()` — combine deterministic + AI
10. Persist to `narrative_snapshots` (content as JSON string, debug_json as JSONB)
11. Update `ai_runs` to `completed` (or `failed` on error)
12. Finish Langfuse trace

### `getLatestNarratives()` — GET path

Reads the most recent `narrative_snapshots` row. No LLM call, no Langfuse trace.

Handles:
- No rows → returns `null`
- Corrupted JSON in `content` → returns `null`
- Missing `narratives` array → returns `null`

---

## Database

### `narrative_snapshots` table

```sql
create table public.narrative_snapshots (
  id uuid primary key default gen_random_uuid(),
  content text not null,          -- JSON string: { narratives, updatedAt, model }
  debug_json jsonb,               -- full pipeline diagnostics
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index idx_narrative_snapshots_generated_at
  on public.narrative_snapshots(generated_at desc);
```

Mirrors the `market_briefs` table: `content` as text (JSON.stringify), `debug_json` as native JSONB.

### `debug_json` contents

```ts
{
  candidates: NarrativeCandidate[],      // all scored candidates
  aiOutput: NarrativesAIOutput,          // raw AI response
  meta: {
    tokenCount: number,                  // tokens with market data
    taxonomyTokenCount: number,          // total taxonomy symbols
    avgDataCoverage: number,             // average coverage across candidates
    candidateCount: number,              // total candidates scored
    candidatesSentToAI: number,          // top N sent to AI (max 6)
    newsCount: number,
    model: string,
    latencyMs: number,
    aiFallback: boolean,
  }
}
```

### `ai_runs` integration

Each POST pipeline creates an `ai_runs` row with:
- `run_type`: `"narratives_generation"`
- `status`: `running` → `completed` | `failed`
- `input_snapshot`: `{ pipeline: "narratives" }`
- `output_snapshot`: model, latency, narrative count, avg confidence

---

## API Contract

### `GET /api/ai/narratives`

Returns latest cached snapshot. No generation, no Langfuse.

**Success (data exists):**
```json
{
  "narratives": [...],
  "model": "openai/gpt-4.1",
  "updatedAt": "2026-03-17T12:00:00.000Z",
  "debugJson": { ... }
}
```

**Success (no data yet):**
```json
{
  "narratives": null,
  "message": "No narratives generated yet"
}
```

**Error:**
```json
{ "error": "...", "narratives": null }   // status 500
```

### `POST /api/ai/narratives`

Runs full generation pipeline.

**Success:**
```json
{
  "narratives": [...],
  "updatedAt": "2026-03-17T12:00:00.000Z",
  "model": "openai/gpt-4.1",
  "latencyMs": 4200,
  "aiRunId": "uuid",
  "debugJson": { ... }
}
```

**Error:**
```json
{ "error": "...", "durationMs": 1500 }   // status 500
```

---

## Frontend

### Page: `/narratives`

Client component (`"use client"`) using `useState` + `useCallback` + `useEffect`.

**Data flow:**
- On mount: `GET /api/ai/narratives` → display cached narratives
- Refresh button: `POST /api/ai/narratives` → display fresh narratives

**States:**
| State | Behavior |
|---|---|
| `loading` | Skeleton grid (4 placeholder cards) |
| `empty` | Empty state card with "Click Refresh to run the first analysis" |
| `error` | Red error card with error message |
| `idle` + data | Narrative card grid |

**UI components used:**
- `Card`, `CardContent`, `CardHeader`, `CardTitle` — shadcn/ui
- `Badge` — status badges (color-coded by NarrativeStatus)
- `Button` — Refresh trigger
- `ScrollArea` — drawer content
- `Link` (next/link) — token badges link to `/token/{SYMBOL}`
- Lucide icons: `RefreshCw`, `TrendingUp`, `Zap`, `AlertTriangle`, `X`

### Narrative Card

Each card displays:
- Title + status badge (color-coded: emerald=active, sky=emerging, amber=peaking, slate=fading)
- Summary text
- Strength score (progress bar, 0–100)
- Confidence score (percentage)
- Token badges (color-coded by role: emerald=leader, red=laggard, primary=related)
- Clickable → opens detail drawer

### Detail Drawer

Side panel (slides in from right), mirrors `market-brief-debug-drawer.tsx` pattern.

Displays:
- Title + status badge
- Strength, confidence, updated timestamp
- Thesis (expanded explanation)
- Supporting signals (label + explanation list)
- Risk signals (red dot list)
- Catalysts (amber dot list)
- Leader tokens, laggard tokens, related tokens (linked badges)
- Escape key or backdrop click to close

---

## Observability

Langfuse integration traces every POST pipeline as `narratives_generation`.

### Scores logged

| Score | Description |
|---|---|
| `token_count` | Number of tokens with available market data |
| `candidate_count` | Number of narrative candidates scored |
| `news_count` | Number of news items provided to AI |
| `data_coverage` | Ratio of tracked tokens to total taxonomy symbols |
| `narrative_count` | Final narratives produced |
| `avg_confidence` | Average confidence across output narratives |
| `ai_fallback` | 1 if deterministic fallback was used, 0 otherwise |

### Trace output

`{ narrative_count, avgConfidence }`

GET requests produce no Langfuse traces.

---

## Data Quality Handling

The feature accounts for limited and stale market data at every layer:

| Layer | Mechanism |
|---|---|
| **Data loading** | Staleness detection: snapshots > 48h old have `change24h` zeroed |
| **Scoring** | `dataCoverage` tracks fraction of bucket tokens with data |
| **Scoring** | Coverage discount: `compositeScore *= dataCoverage` when coverage < 50% |
| **AI prompt** | Data coverage ratio included per candidate for AI awareness |
| **AI system prompt** | Instructs AI to reduce confidence proportionally to coverage |
| **Merge** | `confidenceScore = min(AI confidence, dataCoverage)` — hard cap |
| **Fallback** | Terminal deterministic fallback with confidence 0.2 if AI fails entirely |

---

## Error Handling

### Service layer
- Binance failure: caught, falls through to DB-only data
- DB query failure: caught, returns whatever Binance provided
- Both fail: empty token data → empty candidates → empty narratives
- AI failure: three-tier fallback chain (structured → raw parse → deterministic)
- Persistence failure: error propagates, `ai_runs` marked failed, Langfuse error logged

### Route layer
- All errors caught, return structured JSON with `error` field and appropriate HTTP status
- No provider-level error details leak to the client

### UI layer
- GET failure: shows empty state (not error) — feature simply hasn't been used yet
- POST failure: shows red error card with message
- Concurrent POST guard: `isRefreshing` flag prevents double-click

---

## Integration Points

### Reusable exports

| Export | Module | Used by |
|---|---|---|
| `getLatestNarratives()` | `service.ts` | GET route, future Market Brief / Ask AI |
| `generateNarratives()` | `service.ts` | POST route |
| `NarrativeItem` | `types.ts` | API routes, UI components |
| `NarrativeCandidate` | `types.ts` | Scoring, generation, service |
| `NARRATIVE_TAXONOMY` | `taxonomy.ts` | Scoring, prompt builder |
| `ALL_TAXONOMY_SYMBOLS` | `taxonomy.ts` | Service (coverage metrics) |

### Future consumers

- **Market Brief** — can import `getLatestNarratives()` as input to the multi-agent pipeline
- **Ask AI** — can include narrative context in `build-ask-context.ts`
- **Token Pages** — can show narrative membership and status per token
- **Monitoring** — `ai_runs` table already tracks run history

---

## Existing Architecture Reuse

| Concern | Reused from |
|---|---|
| AI execution | `runAI()` / `runAIStructured()` from `src/ai/runner/runAI.ts` |
| Model selection | `chooseModel("synthesis")` from model router |
| DB access | `getDb()` singleton from `src/lib/db.ts` |
| Market data | `fetchCurrentPrices()` from `src/services/market/binance.ts` |
| News data | `getLatestNews()` from `src/services/news/getLatestNews.ts` |
| Langfuse tracing | `startTrace` / `logScore` / `finishTrace` from `src/lib/langfuse.ts` |
| Persistence pattern | `market_briefs` table structure (text content + jsonb debug) |
| Run tracking | `ai_runs` table (same status lifecycle) |
| API pattern | GET cached / POST generate (same as Market Brief) |
| UI components | shadcn/ui Card, Badge, Button, ScrollArea |
| Drawer pattern | `market-brief-debug-drawer.tsx` interaction shell |
| Token linking | `next/link` to `/token/{SYMBOL}` (same as token pages) |

---

## Non-Goals for MVP

These are intentionally excluded from the current implementation:

- RAG retrieval dependency
- LangGraph multi-agent orchestration
- Vector search / embeddings
- Narrative history explorer / timeline
- `peaking` status inference (requires cross-snapshot comparison)
- Volume expansion scoring (not reliably available)
- Persistence-based trend tracking
- Semantic cache
- Scheduled generation (manual trigger only)
- Server-side rate limiting for POST

---

## Future Upgrade Paths

| Enhancement | Prerequisite |
|---|---|
| `peaking` status detection | Compare current snapshot scores to prior snapshots |
| Volume expansion scoring | Reliable volume data across all taxonomy tokens |
| News confirmation scoring | Keyword matching between news titles and narrative themes |
| RAG-grounded explanations | RAG retrieval layer completion |
| LangGraph workflow | Multi-agent framework maturity |
| Scheduled generation | Cron or background job infrastructure |
| Cross-feature integration | Stable `getLatestNarratives()` API (already exported) |

---

## Definition of Done (verified)

1. `/narratives` exists and renders from internal API data
2. The feature uses existing app architecture, not parallel logic
3. GET returns cached/latest structured narratives without generation side effects
4. POST generates fresh narratives through shared AI runner
5. Candidate detection and ranking are deterministic
6. AI is used only for structured explanation/synthesis
7. AI output is Zod-validated with a three-tier fallback
8. No direct provider calls are introduced
9. No direct external market/news calls from frontend
10. Implementation is cleanly reusable by future features
11. Data quality (coverage, staleness) is handled at every layer
12. Langfuse traces every generation pipeline
13. `ai_runs` tracks run lifecycle
14. `narrative_snapshots` persists results following `market_briefs` pattern

---

## Cursor Implementation Guardrails

These rules remain in effect for any future changes to this feature.

### Hard rules
- Reuse existing app logic wherever possible
- Keep route handlers thin — no business logic in routes
- Keep AI access behind the shared runner (`runAI` / `runAIStructured`)
- Keep all response contracts typed and Zod-validated
- Do not introduce RAG dependencies
- Do not introduce LangGraph unless there is a strong repository-local reason
- Do not call LLM providers directly
- Do not fetch external APIs from frontend components
- Do not invent new infrastructure unless required

### Preferred mindset
"Narratives is a natural extension of the current app, not a separate experiment."
