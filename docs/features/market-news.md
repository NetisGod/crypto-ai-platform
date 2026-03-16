# Feature Architecture: Market News Layer

## Overview

Market News Layer provides the latest crypto market news for the product.

This feature is important because it powers not only the dashboard sidebar, but also future AI features:

- AI Market Brief
- Token Intelligence
- Narrative detection
- Ask AI
- RAG retrieval

This layer must be reusable, normalized, and production-ready.

---

## Product Location

### Main UI
- Dashboard right sidebar

### Future usage
- Token pages
- AI workflows
- RAG pipelines

---

## Architecture

This feature has 3 layers:

1. News service
2. API route
3. UI component

Structure:

```
services/
  news/
    getLatestNews.ts

app/api/news/latest/route.ts

components/dashboard/
  MarketNews.tsx
```

---

## News Service

File:
`services/news/getLatestNews.ts`

Responsibilities:
- fetch crypto news from external source
- normalize output
- return consistent JSON format

Possible sources:
- CryptoPanic
- CoinDesk RSS
- CoinTelegraph RSS
- NewsAPI with crypto query

For MVP:
Use a simple and reliable source.

---

## Normalized Output

```ts
type NewsItem = {
  title: string
  source: string
  url: string
  published_at: string
}
```
