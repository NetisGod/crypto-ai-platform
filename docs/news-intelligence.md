# News Intelligence Layer

## Status
- **News layer architecture:** Confirmed
- **Dashboard Market News panel:** Completed
- **AI use of news:** Confirmed and planned for multiple features
- **Exact news provider:** Not yet finalized

## 1. Purpose

The news layer provides the latest crypto market news to:
- the dashboard Market News panel
- AI Market Brief
- Token Analysis
- Narrative detection
- Ask AI
- future RAG retrieval

It is both:
- a user-facing feature
- a core AI input layer

## 2. Architecture

### Confirmed structure
```text
services/news/getLatestNews.ts
app/api/news/latest/route.ts
components/dashboard/MarketNews.tsx