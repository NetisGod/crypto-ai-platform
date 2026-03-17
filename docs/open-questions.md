# Open Questions

## Status
- These items were not fully resolved in the conversation

## 1. Framework/runtime specifics
- Exact Next.js version: **Not yet specified**
- Exact React version: **Not yet specified**
- Exact TypeScript version: **Not yet specified**
- Exact Node version: **Not yet specified**

## 2. News provider selection
- CryptoPanic, NewsAPI, CoinDesk RSS, CoinTelegraph RSS were discussed
- final production provider is **not yet specified**

## 3. Data ingestion strategy
- whether market snapshots are written on schedule is **not yet specified**
- whether all news is persisted before UI rendering is **not yet specified**
- future embedding ingestion timing is **not yet specified**

## 4. Narrative schema alignment
- DB-level `narratives` fields and app-level `NarrativeRow` are not fully aligned
- final canonical schema is **not yet specified**

## 5. market_cap field
- appears in app-level row type
- not clearly finalized in DB schema

## 6. Exact Langfuse implementation
- Langfuse is confirmed
- exact tracing structure and final helper boundaries are not fully specified

## 7. Queue / background worker architecture
- **Not yet specified**

## 8. Cron / scheduled jobs
- **Not yet specified**

## 9. RLS policies
- **Not yet specified**

## 10. Semantic cache storage
- feature is planned
- cache backend and invalidation strategy are **not yet specified**

## 11. Retrieval / RAG design details
- sources were discussed
- tools were discussed
- concrete retrieval implementation is **not yet specified**

## 12. Hybrid AI implementation details
- Ollama / vLLM were discussed
- exact local runtime and routing behavior are **not yet specified**

## 13. Monitoring implementation details
- monitoring metrics are confirmed
- exact charts/components and aggregation strategy are not fully specified

## 14. Evaluation framework details
- golden dataset and eval_runs are confirmed
- exact evaluator and scoring implementation are not fully specified

## 15. Historical Similarity route
- `/history` was discussed
- whether it will exist as a dedicated page is **not yet specified**