# Handoff Context

## Purpose
This file is intended to help a new engineer or a new AI chat continue development without needing the original conversation.

## Project identity

### Confirmed
This is a **crypto AI market intelligence platform** with:
- real-time market monitoring
- news
- AI Market Brief
- token-level analysis
- multi-agent workflows
- future RAG and optimization layers

## Current state of the project

### Confirmed completed
- Market Data Layer
- Dashboard KPI Cards
- Chart System
- Top Movers
- Model Router
- Market News Layer

### Confirmed next
- Token Pages
- AI Token Analysis

### Important partially established system
- Multi-Agent Market Brief architecture already exists conceptually:
  - Market Data Agent
  - News Agent
  - Narrative Agent
  - Risk Agent
  - Synthesizer Agent
  - Validator Agent
  - LangGraph orchestration
  - debug_json
  - explainability drawer planned

## Most important architectural constraints

### Confirmed
1. Use Binance for price/chart/top movers
2. Do not use CoinGecko for those flows anymore
3. Do not fetch external APIs directly from React components
4. All AI execution must go through:
   - `runAI()`
   - model router
   - provider layer
5. Use Langfuse for observability
6. Market Brief must be cache-first:
   - GET cached
   - POST generate
   - no generation on page load
7. Do not use Playwright anymore for future development steps
8. Future Cursor prompts should include model recommendations to save tokens

## Model routing handoff

### Final routing table
| Task | Model | Temperature | Max tokens |
|---|---|---:|---:|
| classification | gpt-4o-mini | 0.0 | 512 |
| extraction | gpt-4.1-mini | 0.1 | 2048 |
| reasoning | gpt-4.1 | 0.3 | 4096 |
| synthesis | gpt-4.1 | 0.4 | 4096 |
| validation | gpt-4o-mini | 0.0 | 1024 |
| anything else | gpt-4.1-mini | 0.2 | 2048 |

## Recommended next work sequence

### Confirmed next steps
1. Finish **Token Pages**
2. Implement **AI Token Analysis**
3. Stabilize **AI Market Brief UI**
4. Add **Narratives Page**
5. Add **Ask AI**
6. Add **Monitoring**
7. Add **Evaluation**
8. Expand **Multi-Agent Market Brief** explainability
9. Build **RAG Retrieval Layer**
10. Add **Historical Similarity**
11. Add **Semantic Cache**
12. Add **Hybrid AI support**
13. Add **Voice Market Brief**
14. Add **Market Regime Detector**

## Files / docs approach already established

### Confirmed
Development should continue using:
- `docs/features/*.md` for feature architecture docs
- `.cursor/rules/*.mdc` for short persistent Cursor rules
- feature-specific prompt packs where useful

Examples already discussed:
- `docs/features/model-router.md`
- `docs/features/market-news.md`
- `docs/features/token-pages.md`
- `docs/features/ai-token-analysis.md`
- `docs/features/multi_agent_market_brief_feature_playbook.md`

## Important developer workflow lessons from chat

### Confirmed
- big monolithic prompts are expensive
- Playwright burns too many Cursor tokens
- split work into smaller prompts
- use stronger Cursor models for architecture-heavy work
- use cheaper Cursor models for simple UI / boilerplate changes

## Final reminder for next engineer / AI chat

If continuing this project:
- do not reintroduce CoinGecko for price/chart
- do not bypass the AI runner
- do not bypass model routing
- do not auto-generate Market Brief on page load
- do not use Playwright in future steps
- continue from Token Pages → AI Token Analysis