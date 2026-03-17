# Project Roadmap

## Status legend
- **Completed**
- **In Progress**
- **Planned**

## Phase 1 — Core Platform

### 1. Market Data Layer
- **Status:** Completed
- **Description:** Unified Binance-backed market layer for prices, charts, and top movers
- **Where:** backend services + internal APIs + shared UI data layer
- **Dependencies:** Binance

### 2. Dashboard KPI Cards
- **Status:** Completed
- **Description:** BTC / ETH cards with current price and 24h change
- **Where:** `/dashboard`
- **Dependencies:** Market Data Layer

### 3. Chart System
- **Status:** Completed
- **Description:** Asset-aware, range-aware chart
- **Where:** `/dashboard`, reusable on token pages
- **Dependencies:** Market Data Layer

### 4. Top Movers
- **Status:** Completed
- **Description:** Movers list connected to shared market data
- **Where:** `/dashboard`
- **Dependencies:** Market Data Layer

### 5. Model Router
- **Status:** Completed
- **Description:** Centralized task-based LLM routing
- **Where:** AI infrastructure
- **Dependencies:** AI runner, provider layer

### 6. Market News Layer / Panel
- **Status:** Completed
- **Description:** News service + API + dashboard panel
- **Where:** `/dashboard`
- **Dependencies:** external news source

### 7. Token Pages
- **Status:** In Progress
- **Description:** Dedicated token pages with market data and news
- **Where:** `/token/[symbol]`
- **Dependencies:** Market Data Layer, News Layer

---

## Phase 2 — Core AI Product Features

### 8. AI Token Analysis
- **Status:** Planned
- **Description:** Token-specific AI explanation
- **Where:** `/token/[symbol]`
- **Dependencies:** Token Pages, AI runner, model router, news layer

### 9. AI Market Brief
- **Status:** In Progress conceptually
- **Description:** Dashboard AI market summary with caching
- **Where:** `/dashboard`
- **Dependencies:** market data, news, DB, Langfuse

### 10. Ask AI
- **Status:** Planned
- **Description:** Market Q&A interface
- **Where:** `/ask`
- **Dependencies:** market data, news, narratives, AI runner

### 11. Narratives Page
- **Status:** Planned
- **Description:** Display active narratives and linked news
- **Where:** `/narratives`
- **Dependencies:** news, narrative workflow, DB

### 12. Monitoring Page
- **Status:** Planned
- **Description:** Show AI latency/cost/tokens/errors
- **Where:** `/monitoring`
- **Dependencies:** ai_runs

### 13. Evaluation Layer
- **Status:** Planned
- **Description:** Golden dataset + scoring + results
- **Where:** backend + monitoring
- **Dependencies:** eval_runs

---

## Phase 3 — Advanced AI Engineering

### 14. Multi-Agent Market Brief
- **Status:** In Progress architecturally
- **Description:** LangGraph-based multi-agent Market Brief
- **Where:** `/dashboard`
- **Dependencies:** market data, news, narratives, AI runner, LangGraph

### 15. “How this brief was built” Drawer
- **Status:** Planned
- **Description:** Show internal Market Brief agent outputs
- **Where:** dashboard Market Brief block
- **Dependencies:** debug_json

### 16. RAG Retrieval Layer
- **Status:** Planned
- **Description:** Retrieval over news, narratives, historical events, token context
- **Where:** AI workflows
- **Dependencies:** pgvector, embeddings, retrievers

### 17. Historical Similarity Explorer
- **Status:** Planned
- **Description:** Find similar historical market regimes
- **Where:** future `/history`
- **Dependencies:** retrieval layer

### 18. Semantic Cache
- **Status:** Planned
- **Description:** Reuse semantically similar AI outputs
- **Where:** AI workflows
- **Dependencies:** embeddings, cache strategy

### 19. Enhanced AI Evaluation / LLM-as-judge
- **Status:** Planned
- **Description:** More advanced evaluation over quality and sources
- **Where:** evaluation layer
- **Dependencies:** Evaluation Layer

---

## Phase 4 — AI Infrastructure Expansion

### 20. Hybrid AI Architecture
- **Status:** Planned
- **Description:** Support local + cloud models
- **Where:** AI infrastructure
- **Dependencies:** model router

### 21. Local Model Support
- **Status:** Planned
- **Description:** Optional Ollama / vLLM integration
- **Where:** AI infrastructure
- **Dependencies:** hybrid architecture

### 22. Provider Expansion
- **Status:** Planned
- **Description:** Add providers beyond OpenRouter
- **Where:** AI infrastructure
- **Dependencies:** provider abstraction

---

## Phase 5 — Product Expansion Features

### 23. Voice Market Brief
- **Status:** Planned
- **Description:** Spoken brief using TTS
- **Where:** dashboard
- **Dependencies:** ElevenLabs, Market Brief output

### 24. Narrative Intelligence Studio
- **Status:** Planned
- **Description:** Richer narrative timeline and evidence UI
- **Where:** `/narratives`
- **Dependencies:** narrative layer

### 25. Explain This Move
- **Status:** Planned
- **Description:** AI explanation for a market move
- **Where:** dashboard or token pages
- **Dependencies:** reasoning + market/news context

### 26. Market Regime Detector
- **Status:** Planned
- **Description:** Classify regime such as bull/bear/risk-on/sideways
- **Where:** dashboard and token pages
- **Dependencies:** market data + AI/ML workflow

---

## Confirmed correct implementation order

### Final order repeatedly reinforced in the conversation
1. Market Data Layer
2. Dashboard KPI
3. Chart
4. Top Movers
5. Market News
6. Token Pages
7. AI Token Analysis
8. AI Market Brief stabilization
9. Ask AI
10. Narratives
11. Monitoring
12. Evaluation
13. Multi-Agent Market Brief polish / drawer
14. RAG Retrieval
15. Historical Similarity
16. Semantic Cache
17. Hybrid / Local AI / Routing extensions
18. Voice / Regime / other advanced product features

## Current next feature
