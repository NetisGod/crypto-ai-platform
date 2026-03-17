
FILE: /docs/services.md
```md
# Services and Modules

## Status
- **Core services:** Confirmed
- **Advanced AI/retrieval services:** Planned
- **Exact implementation details for some services:** Partially specified

## 1. Market Data Service

### Purpose
Unified Binance-backed source of market data.

### Inputs
- Binance public REST endpoints

### Outputs
Normalized:
- prices
- 24h changes
- chart data
- top movers

### Consumers
- dashboard
- token pages
- AI workflows

### Files discussed
- `services/market/binance.ts`
- `services/market/get-current-prices.ts`
- `services/market/get-market-chart.ts`
- `services/market/get-top-movers.ts`

---

## 2. Chart Data Service

### Purpose
Provide chart-compatible price series by asset/range.

### Inputs
- asset symbol
- range

### Outputs
Normalized chart points:
- `time`
- `price`

### Dependencies
- Binance klines
- range mapping logic

---

## 3. Top Movers Service

### Purpose
Provide top movers list.

### Inputs
- Binance ticker / 24h stats

### Outputs
- symbol
- price
- 24h percent change

### Dependencies
- Binance data
- internal API route

---

## 4. News Service

### Purpose
Fetch and normalize crypto news.

### Inputs
- external news source

### Outputs
Normalized `NewsItem[]`

### Dependencies
- selected news provider
- `/api/news/latest`

### Files discussed
- `services/news/getLatestNews.ts`

---

## 5. AI Runner

### Purpose
Central execution path for all AI tasks.

### Inputs
- task
- prompt

### Outputs
- model response
- future metadata / logging

### Responsibilities
- call model router
- choose provider
- execute request
- centralize observability

### Files discussed
- `src/ai/runner/runAI.ts`

---

## 6. Model Router

### Purpose
Choose model/provider configuration for each task.

### Inputs
- task name

### Outputs
`ModelConfig` with:
- provider
- model
- temperature
- maxTokens

### Files discussed
- `src/ai/router/modelRouter.ts`

---

## 7. Provider Layer

### Purpose
Abstract actual LLM provider calls.

### Current provider
- OpenRouter

### Future providers
- Ollama
- vLLM
- other cloud providers later

### Files discussed
- `src/ai/providers/openrouter.ts`

---

## 8. Market Brief Workflow Service

### Purpose
Generate and cache AI Market Briefs.

### Inputs
- market data
- news
- narratives
- multi-agent outputs

### Outputs
- market brief
- debug payload
- DB writes
- Langfuse traces

### Files discussed
- `src/ai/workflows/market-brief-graph.ts`
- API route for market brief

---

## 9. Token Analysis Service / Token Insight Generator

### Purpose
Generate token-level AI analysis.

### Inputs
- token market data
- token-relevant news
- optional narratives later

### Outputs
- summary
- bullish_factors
- bearish_factors
- outlook
- confidence

### Files discussed
- `src/ai/agents/tokenAnalysisAgent.ts`
- `src/ai/schemas/tokenAnalysis.ts`
- `/api/ai/token-analysis`

---

## 10. Narrative Detection Service

### Purpose
Detect active market narratives.

### Inputs
- recent news
- optionally existing narratives and market context

### Outputs
- narratives
- linked tokens
- confidence
- linked news

### Dependencies
- news layer
- AI workflow layer
- DB narratives tables

---

## 11. Ask AI Service

### Purpose
Answer market questions with structured outputs.

### Inputs
- user question
- market data
- news
- narratives
- future retrieval context

### Outputs
- answer
- drivers
- risks
- sources
- confidence

### Dependencies
- AI runner
- model router
- Langfuse
- future retrieval

---

## 12. Retrieval Service

### Status
- planned

### Purpose
Provide vector/hybrid retrieval over:
- news
- narratives
- historical events
- token-specific context

### Files discussed
- `src/ai/retrieval/*`

### Dependencies
- pgvector
- embeddings
- LangChain / LlamaIndex

---

## 13. Semantic Cache Service

### Status
- planned

### Purpose
Reuse AI results for semantically similar prompts when context is sufficiently stable.

### Dependencies
- embeddings
- AI workflows
- cache store not yet specified

---

## 14. Evaluation Service

### Purpose
Run golden-set based evaluations.

### Inputs
- prompts
- workflow outputs

### Outputs
- eval scores
- rows in `eval_runs`

### Files discussed
- `scripts/run-evals.ts`

---

## 15. Monitoring Aggregation Service

### Purpose
Aggregate AI operational metrics for monitoring UI.

### Inputs
- `ai_runs`
- possibly Langfuse

### Outputs
- average latency
- token usage
- cost
- success rate
- retry count
- failure count