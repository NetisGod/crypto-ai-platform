# Crypto AI Market Intelligence Platform

A production-ready Next.js 15 app with TypeScript, App Router, Tailwind CSS, and shadcn/ui. Dark fintech-style UI for crypto market intelligence.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (Radix primitives, New York style)
- **Recharts** for charts
- **Lucide React** for icons
- **Supabase** (Postgres + pgvector) for database

## Database (Supabase)

**Project URL and anon key**

- **Option A – Supabase MCP (Cursor):** If you use the Supabase MCP server (`user-supabase`), run the tools **get_project_url** and **get_publishable_keys** (use the `anon` key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- **Option B – Dashboard:** [supabase.com](https://supabase.com) → your project → **Settings** (gear) → **API**. Use **Project URL** and the **anon public** key.

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL` – Project URL (e.g. `https://xxxx.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – anon public key

**Migrations**

Migrations are in `supabase/migrations/`. You can:

- **Via Supabase MCP:** Use the **apply_migration** tool with `name` (snake_case) and `query` (SQL) for each file, in order: `initial_schema`, `match_news_rpc`, `market_snapshots_funding`.
- **Via Dashboard:** Run the contents of each migration file in the SQL Editor, in the same order.

**App usage:** `getDb()` for the Supabase client, `searchNewsByEmbedding(embedding, limit)` for semantic search. Types in `src/types/database.ts`.

## Data ingestion

POST endpoints to fetch external data and store it in Supabase:

| Endpoint | Source | Action |
|----------|--------|--------|
| `POST /api/ingest/prices` | CoinGecko | Upserts assets, inserts `market_snapshots` (price, volume_24h, market_cap) |
| `POST /api/ingest/funding` | Binance futures | Updates latest `market_snapshots` with `funding_rate` and `open_interest` (run after prices) |
| `POST /api/ingest/news` | CryptoPanic | Inserts `news_items` (optional `?filter=hot|rising|bullish|bearish&limit=50`) |

Services live under `src/services/ingestion/` (coingecko, binance, cryptopanic, store). Set `CRYPTOPANIC_AUTH_TOKEN` in `.env.local` for news ingestion.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app redirects to `/dashboard`.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/dashboard` |
| `/dashboard` | Overview: metrics, BTC chart, news feed, top movers |
| `/token/[symbol]` | Token detail: price, chart, narrative (e.g. `/token/BTC`) |
| `/narratives` | Market narratives with strength and sentiment |
| `/ask` | Natural language Q&A (mock answers) |
| `/monitoring` | Alert rules and recent triggers |

## Structure

```
src/
├── app/
│   ├── (app)/                 # App shell (sidebar + header)
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── token/[symbol]/page.tsx
│   │   ├── narratives/page.tsx
│   │   ├── ask/page.tsx
│   │   └── monitoring/page.tsx
│   ├── layout.tsx
│   ├── page.tsx               # Redirect to dashboard
│   └── globals.css
├── components/
│   ├── layout/                # Sidebar, Header
│   ├── dashboard/             # MetricCard, ChartCard, NewsFeed
│   └── ui/                    # shadcn: Button, Card, Input, Tabs, etc.
├── data/
│   └── mock-data.ts           # Tokens, narratives, news, alerts
├── lib/
│   ├── db.ts                  # Supabase client, getDb(), searchNewsByEmbedding()
│   └── utils.ts
├── types/
│   └── database.ts            # DB types (Asset, NewsItem, etc.)
└── supabase/migrations/      # SQL migrations (schema + pgvector HNSW)

## Mock data

All data is in `src/data/mock-data.ts`: tokens (BTC, ETH, SOL, etc.), narratives, news items, price history, and alert rules. Replace with API calls when wiring to a backend.

## Build

```bash
npm run build
npm start
```

## License

MIT
