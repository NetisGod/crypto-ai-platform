# Architecture — AI Crypto Market Intelligence Platform

## Overview

A full-stack AI-powered crypto market intelligence dashboard built on Next.js 15 + Supabase + OpenRouter. The platform centralizes real-time market data, curated news, and multi-agent AI analysis into a single intelligence surface for crypto traders, analysts, and researchers.

---

## System Diagram

```
User / Browser
     ↓
Next.js Frontend (React, Tailwind, shadcn/ui, Recharts)
     ↓
Next.js API Layer (/api/market/* /api/news/* /api/ai/*)
     ↓
┌────────────────────────────────────────────────────┐
│  Market Data Layer   News Layer   AI Workflow Layer │
│  (Binance services)  (News svc)   (runAI + router) │
└────────────────────────────────────────────────────┘
     ↓
Multi-Agent Layer (LangGraph)
     ↓
RAG Retrieval Layer (pgvector — planned)
     ↓
Supabase / PostgreSQL / pgvector
     ↓
Model Router + Provider Layer
     ↓
OpenRouter → gpt-4o-mini / gpt-4.1-mini / gpt-4.1
     ↓
Langfuse (observability — traces every AI run)
```

---

## Layers

### 1. Market Data Layer
- Source: **Binance public API** (replaced CoinGecko — see ADR)
- Services: `get-current-prices`, `get-market-chart`, `get-top-movers`
- Consumed by: Dashboard KPI cards, Charts, Top Movers, Token Pages, AI workflows
- Rule: Frontend never calls Binance directly — always through internal API routes

### 2. News Layer
- Service: `getLatestNews.ts` (normalized crypto news)
- Consumed by: Dashboard news panel, Token Pages, AI workflows
- Future: news stored in DB with embeddings for RAG

### 3. AI Workflow Layer
- Entry point: `runAI(task, prompt)` — shared runner
- Router: `modelRouter.ts` — selects model based on task type
- Provider: `openrouter.ts` — single OpenRouter integration
- Tracing: every call logged to Langfuse

### 4. Multi-Agent Layer (LangGraph)
- Workflow: `market-brief-graph.ts`
- Agents:
  - `market-data-agent` — quantitative market analysis
  - `news-agent` — news summarization and drivers
  - `narrative-agent` — active narrative detection
  - `risk-agent` — short-term risk identification
  - `synthesizer-agent` — combines agent outputs
  - `validator-agent` — validates and normalizes final brief
- Output: structured `market_briefs` row + `debug_json`

### 5. RAG Retrieval Layer (Planned)
- Storage: `news_items.embedding` (vector 1536) in pgvector
- Index: HNSW cosine similarity
- Libraries: LangChain / LlamaIndex
- Used by: Ask AI, Historical Similarity, future AI workflows

### 6. Monitoring & Evaluation Layer
- `ai_runs` table: all AI operational metrics
- `eval_runs` table: golden-set evaluation results
- `scripts/run-evals.ts`: eval runner
- Langfuse: distributed tracing for all agent runs

---

## Data Flow

### Dashboard Load
```
User opens /dashboard
→ Server Component fetches from /api/market/prices + /api/market/top-movers
→ Fetches /api/news/latest
→ Fetches GET /api/ai/market-brief (returns cached brief, no generation)
→ All rendered server-side
```

### Market Brief Generation
```
User clicks "Refresh Brief"
→ POST /api/ai/market-brief
→ Load market data + news + narratives
→ LangGraph workflow: 6 agents run in sequence/parallel
→ Synthesizer combines outputs
→ Validator checks schema
→ Result written to market_briefs with debug_json
→ Langfuse trace created (parent + child spans)
→ UI re-fetches GET to display new brief
```

### Token Page
```
User navigates to /token/BTC
→ Dynamic route [symbol]
→ Server Component loads market data, chart, news for BTC
→ TokenAnalysisCard calls POST /api/ai/token-analysis
→ AI workflow runs through runAI("reasoning", prompt)
→ Zod validates response
→ Structured analysis rendered in UI
```

### Ask AI
```
User submits question on /ask
→ POST /api/ai/ask
→ Build context: market data + recent news + narratives
→ runAI("reasoning", contextualizedPrompt)
→ Zod validates: { answer, drivers, risks, sources, confidence }
→ UI renders structured response
```

---

## API Routes

### Market
| Method | Route | Description |
|---|---|---|
| GET | `/api/market/prices` | Current BTC/ETH prices |
| GET | `/api/market/chart` | OHLCV chart data for asset+range |
| GET | `/api/market/top-movers` | Top 24h gainers/losers |

### News
| Method | Route | Description |
|---|---|---|
| GET | `/api/news/latest` | Latest normalized crypto news |

### AI
| Method | Route | Description |
|---|---|---|
| GET | `/api/ai/market-brief` | Cached latest brief (no generation) |
| POST | `/api/ai/market-brief` | Generate new multi-agent brief |
| POST | `/api/ai/token-analysis` | AI analysis for specific token |
| GET | `/api/ai/narratives` | Active market narratives |
| POST | `/api/ai/ask` | Answer user market question |

---

## Security & Performance

- All API keys server-side only — never exposed to client
- Input validation: Zod on every API route request body
- GET routes are cacheable — no AI generation on GET
- Server Components for all data fetching (no client waterfalls)
- Streaming for AI responses where applicable
- pgvector HNSW index for fast embedding retrieval

---

## Testing

- **No Playwright.** The project does not use Playwright for end-to-end testing. Do not introduce it.
- Testing strategy is manual verification + structured output validation + Langfuse trace checks.

---

## Open Architecture Questions

- Background job / ingestion schedule for market snapshots: **NOT DEFINED**
- News ingestion to DB before display (vs. on-demand): **NOT FINALIZED**
- Caching layer backend (Redis/Upstash): **NOT FINALIZED**
- Exact Langfuse span helper implementation: **NOT FINALIZED**
- Whether `/history` route will exist: **DISCUSSED, NOT CONFIRMED**
- RLS policies on all tables: **NOT DEFINED**
