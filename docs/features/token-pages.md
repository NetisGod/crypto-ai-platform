# Feature Architecture: Token Pages

## Overview

Token Pages provide dedicated pages for individual crypto assets such as BTC and ETH.

These pages allow the user to inspect:
- current market stats
- token-specific chart
- related news
- AI token analysis (later step)

This feature is an important bridge between:
- dashboard-level intelligence
- token-level intelligence

---

## Product Location

Routes:

- /token/BTC
- /token/ETH
- optional later: /token/SOL

Navigation sources:
- clicking token cards
- clicking top movers
- manual URL entry

---

## Main UI Blocks

Each token page should display:

1. Token Header
   - symbol
   - current price
   - 24h change

2. Token Chart
   - reusable chart system
   - same time range controls as dashboard if possible

3. Token Market Stats
   - volume
   - market cap if available
   - optional funding/open interest if later added

4. Related News
   - latest token-relevant articles

5. AI Token Analysis
   - added in the next step

For now, implement the page shell with real market + news data.

---

## Architecture

This feature should reuse existing layers instead of building new ad hoc fetch logic.

Use:

- Market Data Layer
- News Layer
- existing chart logic
- internal API routes

Suggested structure:

app/token/[symbol]/page.tsx

components/token/
  TokenHeader.tsx
  TokenStats.tsx
  TokenChart.tsx
  TokenNews.tsx

services/market/
services/news/

---

## Data Sources

### Market Data
Use existing Binance-backed internal APIs:
- /api/market/prices
- /api/market/chart

### News
Use the existing:
- /api/news/latest

For MVP:
filter related news at the page/component level if necessary.

---

## Route Rules

Dynamic route:
- app/token/[symbol]/page.tsx

Supported symbols for MVP:
- BTC
- ETH

If unsupported symbol is provided:
- show graceful fallback / not supported state
- do not crash

---

## Reuse Rules

Do not:
- fetch Binance directly from token page components
- duplicate chart fetching logic
- duplicate KPI formatting logic unnecessarily

Do:
- reuse shared market services
- reuse internal API routes
- keep UI components modular

---

## UI Requirements

### Token Header
Show:
- token symbol
- current price
- 24h change
- positive/negative state

### Chart
Use the same chart architecture as dashboard if possible.
Support:
- 1D
- 1W
- 1M
- 1Y
- ALL

### Token News
Show latest news relevant to the token.
For MVP, it is acceptable to:
- use latest crypto news
- optionally filter by token keyword in title

### States
Add:
- loading state
- error state
- empty state

---

## Navigation Behavior

Clicking these should navigate to token pages:
- dashboard BTC card → /token/BTC
- dashboard ETH card → /token/ETH
- top movers BTC → /token/BTC
- top movers ETH → /token/ETH

Chart selection on dashboard is separate from page navigation.
Click behavior can prioritize navigation to token page if desired.

---

## Future AI Integrations

These pages will later support:

### AI Token Analysis
Token-specific AI explanation:
- summary
- bullish factors
- bearish factors
- outlook
- confidence

### Token RAG
Later, token pages may retrieve:
- related narratives
- historical token events
- token-specific research context

---

## QA Checklist

Verify:

1. /token/BTC loads
2. /token/ETH loads
3. prices match dashboard values
4. chart renders correctly
5. range switching works
6. token-related news renders
7. unsupported symbols fail gracefully
8. no direct external API calls are made from page components

---

## Cursor Usage

Before implementing run:

Read docs/features/token-pages.md
Implement the Token Pages exactly as described.
Do not simplify the architecture.
