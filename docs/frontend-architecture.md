
FILE: /docs/frontend-architecture.md
```md
# Frontend Architecture

## Status
- **Dashboard:** Confirmed and mostly implemented
- **Token Pages:** In Progress
- **Narratives / Ask AI / Monitoring:** Planned
- **Exact component tree:** Partially specified

## Frontend stack

### Confirmed
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- charting library

## Frontend routes

### Confirmed
- `/dashboard`
- `/token/[symbol]`
- `/narratives`
- `/ask`
- `/monitoring`

### Planned / inferred
- `/history`

---

## 1. Dashboard

### Goal
The dashboard is the main product entry point.

### Confirmed dashboard modules
- KPI cards
  - BTC price
  - ETH price
  - 24h change
- AI Market Brief
- interactive chart
- Top Movers
- Market News

### Dashboard interaction rules
- BTC / ETH cards and chart should stay linked
- Top Movers and chart should use the same market data source
- market news appears in a right-side panel / sidebar area
- AI Market Brief is a high-value dashboard block
- Market Brief refresh should be manual, not automatic

### Confirmed dashboard behavior
- chart supports:
  - 1 Day
  - 1 Week
  - 1 Month
  - 1 Year
  - All
- market brief should display cached data on load
- refresh triggers new generation
- future drawer:
  - “How this brief was built”

---

## 2. Token Pages

### Goal
Provide detailed token-specific market intelligence pages.

### Confirmed routes
- `/token/BTC`
- `/token/ETH`
- optional later: `/token/SOL`

### Confirmed token page sections
- Token Header
- Token Chart
- Token Stats
- Token News
- later AI Token Analysis

### Suggested components discussed
- `components/token/TokenHeader.tsx`
- `components/token/TokenStats.tsx`
- `components/token/TokenChart.tsx`
- `components/token/TokenNews.tsx`
- `components/token/TokenAnalysisCard.tsx`

### Confirmed route rules
- unsupported symbol should fail gracefully
- page should not crash
- should reuse existing market/news layers

---

## 3. Narratives Page

### Goal
Display active market narratives.

### Confirmed page expectations
- list of narratives
- summary
- confidence
- linked tokens if available
- linked news count
- expandable detail or drawer later

### Status
- planned

---

## 4. Ask AI Page

### Goal
Allow user to ask market questions.

### Confirmed UI expectations
- input box
- loading state
- answer block
- sources
- drivers
- risks
- confidence

### Status
- planned

---

## 5. Monitoring Page

### Goal
Display AI operational metrics.

### Confirmed UI expectations
- average latency
- token usage
- cost
- success rate
- retry count
- failure count

### Status
- planned

---

## 6. UI architecture rules

### Confirmed
- no direct external provider calls from React components
- reuse internal API routes
- keep UI modular
- keep visual style:
  - dark
  - clean
  - fintech / AI dashboard
- loading, error, and empty states are required
- avoid architectural duplication

### Confirmed for future steps
- do not add Playwright-based testing to future work

---

## 7. State and interaction patterns

### Confirmed
A shared selected asset state was discussed for:
- BTC card
- ETH card
- chart
- Top Movers

### Confirmed design goal
All asset-related UI should use:
- the same data source
- synchronized selected asset behavior
- consistent price rendering across pages

### Not yet specified
- exact state library choice
  - local lifted state vs Context vs Zustand was discussed conceptually
  - no final library lock

---

## 8. Frontend folder guidance

### Confirmed / strongly discussed
```text
app/
  api/
  token/
  ask/
  narratives/
  monitoring/

components/
  dashboard/
  token/
  ai/
  charts/