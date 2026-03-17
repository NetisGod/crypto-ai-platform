# Engineering Rules

## Status
- **Rules derived from conversation:** Confirmed
- **This file is normative for future work:** Inferred from chat intent

## 1. Architecture rules

### Confirmed
- Use internal API routes between UI and external providers
- Do not fetch Binance directly from components
- Do not call LLM providers directly from React or agents
- All AI tasks must go through:
  - `runAI()`
  - model router
  - provider abstraction
- Use modular services, not duplicated logic
- Keep the market data layer as the single source of truth across the app

## 2. AI system rules

### Confirmed
- Multi-agent workflows should use LangGraph
- Observability should use Langfuse
- Structured outputs should use Zod
- Model selection should be centralized in the router
- Agents should remain small and composable
- Expensive AI outputs should be cached where appropriate
- Cache-first UX is preferred for Market Brief

## 3. Product behavior rules

### Confirmed
- Market Brief should not regenerate on page load
- GET Market Brief should return cached latest result
- POST Market Brief should generate a new result
- “How this brief was built” should display internal agent outputs

## 4. Development process rules

### Confirmed
- Build features in dependency order
- Do not jump to advanced AI layers before data and product foundations exist
- Use feature architecture docs for each new feature
- Use `.cursor/rules` for short persistent rules
- Use `docs/features/*.md` for detailed feature architecture

## 5. Cursor usage rules

### Confirmed
- Include recommended model choice in future Cursor prompts to save tokens
- Use stronger Cursor models only for:
  - architecture
  - complex reasoning
  - LangGraph / RAG design
- Use cheaper Cursor models for:
  - UI boilerplate
  - route scaffolding
  - small isolated edits
- Avoid giant prompts when possible
- Break work into smaller prompts

## 6. Testing rules

### Final confirmed rule
- Playwright must **not** be used in future development steps

### Reason
- burns too many Cursor tokens
- too expensive when paired with stronger models and long agent loops

### Preferred alternatives
- manual QA prompts
- API verification prompts
- architecture audit prompts
- conservative runtime checks

## 7. Data and caching rules

### Confirmed
- Binance is the market source of truth
- CoinGecko should not be used for price/chart flows anymore
- News should be normalized in a shared news layer
- Market Brief results should be cached in DB
- News should use pragmatic caching
- semantic cache is a planned future optimization

## 8. Documentation rules

### Confirmed
Future AI development should be supported by:
- feature architecture files
- project docs
- Cursor rule files
- implementation prompt packs

These documents are meant to let a new AI agent or new Cursor chat understand the architecture quickly.