
FILE: /docs/backend-architecture.md
```md
# Backend Architecture

## Status
- **API-first backend architecture:** Confirmed
- **Service layer structure:** Confirmed
- **Background jobs / queues:** Not yet specified
- **Cron / schedulers:** Not yet specified

## Backend approach

The backend is implemented using:
- Next.js API routes
- reusable TypeScript service modules
- shared AI execution utilities

The architecture emphasizes:
- clean service boundaries
- provider abstraction
- minimal logic in UI
- centralized AI execution

---

## 1. Backend responsibilities

### Confirmed
The backend is responsible for:
- exposing normalized market data
- exposing normalized news data
- triggering AI workflows
- returning cached AI outputs
- storing operational data
- centralizing model execution and routing
- future retrieval / evaluation support

---

## 2. API route architecture

### Market routes — Confirmed
- `GET /api/market/prices`
- `GET /api/market/chart`
- `GET /api/market/top-movers`

### News routes — Confirmed
- `GET /api/news/latest`

### AI routes — Confirmed
- `GET /api/ai/market-brief`
- `POST /api/ai/market-brief`
- `POST /api/ai/token-analysis`
- `GET /api/ai/narratives`
- `POST /api/ai/ask`

### Evaluation routes — Partially specified
- `/api/eval` was discussed conceptually
- exact route contract is not yet specified

---

## 3. Service layer architecture

### Confirmed service areas
```text
services/
  market/
  news/

src/ai/
  agents/
  workflows/
  runner/
  router/
  providers/
  retrieval/   (planned)
  eval/        (planned)