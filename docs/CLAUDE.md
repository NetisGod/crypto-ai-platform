# AI Crypto Market Intelligence Platform
> AI-powered crypto market intelligence dashboard combining real-time market data, news, AI-generated briefs, token analysis, narrative detection, and Ask AI Q&A.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui, Recharts |
| Backend | Next.js API Routes, TypeScript services |
| Database | Supabase (PostgreSQL + pgvector) |
| AI Provider | OpenRouter (primary) |
| AI Orchestration | LangGraph (multi-agent), LangChain (workflows/RAG), LlamaIndex (retrieval) |
| AI Observability | Langfuse |
| Validation | Zod (all AI structured outputs) |
| Deployment | Vercel |
| Future | ElevenLabs (voice), Ollama/vLLM (local inference), Hugging Face (embeddings) |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── market/         → prices, chart, top-movers
│   │   ├── news/           → latest news
│   │   └── ai/             → market-brief, token-analysis, ask, narratives
│   ├── dashboard/
│   ├── token/[symbol]/
│   ├── narratives/
│   ├── ask/
│   └── monitoring/
├── components/
│   ├── dashboard/          → KPI cards, TopMovers, MarketNews, MarketBrief
│   ├── charts/             → shared chart components
│   ├── ai/                 → AI-specific UI (brief drawer, ask UI)
│   └── token/              → TokenHeader, TokenStats, TokenChart, TokenNews, TokenAnalysisCard
├── services/
│   ├── market/             → binance.ts, get-current-prices.ts, get-market-chart.ts, get-top-movers.ts
│   └── news/               → getLatestNews.ts
├── ai/
│   ├── agents/             → market-data-agent, news-agent, narrative-agent, risk-agent, synthesizer-agent, validator-agent, tokenAnalysisAgent
│   ├── workflows/          → market-brief-graph.ts (LangGraph)
│   ├── runner/             → runAI.ts (shared AI runner)
│   ├── router/             → modelRouter.ts
│   ├── providers/          → openrouter.ts
│   ├── schemas/            → Zod schemas for all AI outputs
│   ├── prompts/            → prompt templates
│   ├── retrieval/          → RAG retrievers (future)
│   └── eval/               → evaluation helpers
├── lib/
│   ├── model-router/       → routing logic
│   └── semantic-cache/     → semantic cache (future)
└── types/                  → shared TypeScript types
```

---

## Coding Rules

- **TypeScript strict mode** — no `any` types, ever
- **Zod** for ALL external data validation (API responses, AI outputs, request bodies)
- **Server Components** by default — Client Components only when useState/events required
- **Never call providers directly from agents** — always go through `runAI()` → `modelRouter` → `openrouter.ts`
- **No hardcoded API keys** — all secrets via environment variables
- **No inline styles** — Tailwind only
- **No `useEffect` for data fetching** — use Server Components or Server Actions
- **No Playwright** — do not add or use Playwright tests (token cost decision)

---

## Model Routing Table

| Task | Model | Temperature | Max Tokens |
|---|---|---|---|
| `classification` | gpt-4o-mini | 0.0 | 512 |
| `extraction` | gpt-4.1-mini | 0.1 | 2048 |
| `reasoning` | gpt-4.1 | 0.3 | 4096 |
| `synthesis` | gpt-4.1 | 0.4 | 4096 |
| `validation` | gpt-4o-mini | 0.0 | 1024 |
| `default` | gpt-4.1-mini | 0.2 | 2048 |

All models accessed via **OpenRouter** (`OPENROUTER_API_KEY`).

---

## AI Architecture Rules

- All LLM calls go through `runAI(task, prompt)` → never call OpenRouter directly from a component or agent
- Every AI run must be traced in **Langfuse** (task, model, latency, tokens, errors)
- Multi-agent workflows use **LangGraph** with parent trace + child spans
- GET routes return **cached results** — never generate on GET
- POST routes trigger **new generation**
- All AI outputs validated with **Zod schemas** before DB write or UI render
- `debug_json` must be stored with every Market Brief for explainability

---

## Naming Conventions

- **Components**: PascalCase (`TokenAnalysisCard.tsx`)
- **Functions/hooks**: camelCase (`runAI`, `getLatestNews`)
- **Files**: kebab-case (`market-data-agent.ts`)
- **DB tables**: snake_case (`market_snapshots`, `news_items`)
- **Env vars**: UPPER_SNAKE_CASE (`OPENROUTER_API_KEY`)

---

## Environment Variables

```
OPENROUTER_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_PUBLIC_KEY=
LANGFUSE_BASEURL=
```

---

## Pages & Routes

| Page | Route | Notes |
|---|---|---|
| Dashboard | `/dashboard` | Main intelligence surface |
| Token Detail | `/token/[symbol]` | BTC, ETH + graceful unsupported fallback |
| Narratives | `/narratives` | Active market narratives |
| Ask AI | `/ask` | Q&A interface |
| Monitoring | `/monitoring` | AI operational metrics |
| History (future) | `/history` | Historical similarity explorer |

---

## Current Sprint

**Next feature: Token Pages → AI Token Analysis**

Status: Token Pages in progress
See: `specs/07-token-pages.md` and `specs/08-ai-token-analysis.md`

---

## Completed Features

- [x] Market Data Layer (Binance)
- [x] Dashboard KPI Cards
- [x] Chart System
- [x] Top Movers
- [x] Model Router
- [x] Market News Layer / Panel

## In Progress

- [ ] Token Pages
- [ ] AI Market Brief (multi-agent stabilization)

## Planned

- [ ] AI Token Analysis
- [ ] Ask AI
- [ ] Narratives Page
- [ ] Monitoring Page
- [ ] Evaluation Layer
- [ ] RAG Retrieval Layer
- [ ] Historical Similarity Explorer
- [ ] Semantic Cache
- [ ] Hybrid AI Architecture
- [ ] Voice Market Brief
- [ ] Market Regime Detector
