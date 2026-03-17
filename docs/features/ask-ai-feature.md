# Feature Architecture: Ask AI

## Overview
----
User question
  ↓
Intent detection
  ↓
Context builder
  ↓
LLM prompt with structured context
  ↓
Structured response
----

Ask AI is the platform-level AI Q&A surface for the crypto market intelligence product.

It allows a user to ask natural-language market questions such as:

- Why is ETH going up today?
- What are the top movers today?
- Summarize the crypto market today.
- Should I watch SOL or AVAX?

This feature must **not** be a generic chat wrapper.
It must answer using **platform context** assembled from internal layers:

- market data
- recent news
- top movers
- narratives (planned integration point)
- shared AI runner + model router

According to the current project docs, Ask AI is a **planned** feature with:

- product route: `/ask`
- API route: `POST /api/ai/ask`
- dependencies: market data, news, narratives, AI runner

---

## Status

- **Feature status:** Planned
- **Product route:** `/ask`
- **API route:** `POST /api/ai/ask`
- **Priority:** Core AI surface after dashboard/token AI foundations

---

## Goal

Turn the app into an interactive crypto intelligence assistant that can answer user questions using real platform context.

The MVP goal is to provide:

1. a dedicated `/ask` page
2. a structured request/response contract
3. a backend orchestration layer that builds context from internal services
4. AI execution through the shared runner only
5. a clean UI that renders structured answers, drivers, risks, sources, and confidence

---

## Product Location

### Main route
- `/ask`

### Product map placement

```text
/dashboard
  - KPI cards
  - chart
  - top movers
  - market news
  - market brief

/token/[symbol]
  - token stats
  - token chart
  - token news
  - AI token analysis

/ask
  - Ask AI general market Q&A
```

### UX role

`/ask` is a **general-purpose AI market question surface**.
It is not a duplicate of the dashboard and not a duplicate of token pages.

- Dashboard = passive overview
- Token page = token-specific analysis
- Ask AI = interactive market Q&A

---

## Confirmed Architecture Constraints

These constraints are already established by the repository documentation and must be preserved:

1. **No direct provider calls from feature code**
   - features must not call OpenRouter/OpenAI/Anthropic directly
   - all AI execution must go through `runAI(task, prompt)`

2. **Model choice must go through the model router**
   - no hardcoded provider/model calls inside Ask AI feature files

3. **Frontend must not call external market/news sources directly**
   - React components may call internal API routes only

4. **Zod validation is required**
   - request validation at the API boundary
   - output validation/normalization for AI responses

5. **Keep the route thin**
   - business logic belongs in the service/orchestration layer

6. **Do not introduce Playwright**
   - explicitly rejected in current project rules

7. **MVP should avoid overengineering**
   - no LangChain, no embeddings, no RAG, no vector DB dependency for the first version
   - narratives/retrieval are future extension points, not MVP blockers

---

## Technologies Used

This feature should align with the technologies already documented in the repository.

### Frontend
- **Next.js App Router**
- **React**
- **TypeScript**
- **Tailwind CSS**

### Backend / API
- **Next.js Route Handlers**
- **TypeScript**
- **Zod** for request/response validation

### AI infrastructure
- **Shared AI Runner**: `runAI(task, prompt)`
- **Model Router**: `chooseModel(task)`
- **Provider Layer**: current docs confirm **OpenRouter** as the provider entrypoint
- **Routing strategy** from `docs/llm-routing.md`

### Current documented routing table

| Task | Model | Temperature | Max tokens |
|---|---|---:|---:|
| classification | gpt-4o-mini | 0.0 | 512 |
| extraction | gpt-4.1-mini | 0.1 | 2048 |
| reasoning | gpt-4.1 | 0.3 | 4096 |
| synthesis | gpt-4.1 | 0.4 | 4096 |
| validation | gpt-4o-mini | 0.0 | 1024 |
| anything else | gpt-4.1-mini | 0.2 | 2048 |

### Observability
- **Langfuse** is part of the documented AI architecture and should be kept as an integration point
- full integration is optional for MVP, but the orchestration layer should have a clean hook point for tracing/logging

### Data/context sources used by Ask AI
- internal market data service/routes
- internal news service/routes
- internal top movers service/routes
- narratives integration point (planned)

---

## MVP Scope

### In scope
- `/ask` page
- `POST /api/ai/ask`
- request validation
- rule-based intent detection
- context assembly from internal platform layers
- AI answer generation through shared AI runner
- structured JSON response
- UI states: loading, error, success
- answer rendering with:
  - answer
  - intent
  - drivers
  - risks
  - sources
  - confidence
- example prompt chips

### Out of scope for MVP
- streaming responses
- chat history persistence
- database writes for sessions/messages
- multi-turn memory
- retrieval / RAG
- embeddings / pgvector
- semantic cache
- multi-agent Ask AI flow
- advanced tool use
- provider fan-out in feature logic

---

## Non-Goals

The first version must **not**:

- behave like a free-form general chatbot
- bypass internal data layers
- expose external provider contracts to the UI
- introduce complex agent frameworks for a simple Q&A MVP
- depend on future retrieval infrastructure before shipping the first usable version

---

## High-Level Architecture

```text
User
  ↓
/ask page
  ↓
AskAI client component
  ↓
POST /api/ai/ask
  ↓
Ask AI service/orchestrator
  ├─ detect intent
  ├─ build context from internal layers
  ├─ build prompt
  ├─ runAI("reasoning", prompt)
  ├─ validate/normalize output
  ↓
Structured JSON response
  ↓
UI renders answer + metadata
```

---

## Ask AI Execution Flow

```text
User submits question on /ask
→ POST /api/ai/ask
→ Validate body with Zod
→ detectAskAiIntent(question)
→ Build context: market data + recent news + top movers + future narratives hook
→ runAI("reasoning", contextualizedPrompt)
→ Parse model output
→ Zod validate / normalize response
→ Return JSON
→ UI renders structured response
```

This matches the broader repo pattern documented in `docs/ai-analysis-pipeline.md`:

```text
Feature / API Route
    ↓
Agent or Workflow
    ↓
runAI(task, prompt)
    ↓
Model Router
    ↓
Provider
    ↓
LLM
    ↓
Structured result / validation
    ↓
Langfuse trace
    ↓
DB / UI response
```

For Ask AI MVP, the “Agent or Workflow” layer can be implemented as a **simple orchestration service**, without LangGraph.

---

## Intent Model

Ask AI should classify a user question into one of these intents:

- `token_analysis`
- `market_summary`
- `top_movers`
- `news_summary`
- `general_market_question`

### MVP approach
Use a deterministic, rule-based intent detector.

### Why rule-based first
- cheaper
- faster
- easier to test
- avoids unnecessary LLM calls for a simple classification task

### Example mappings

| Question | Intent |
|---|---|
| Why is BTC up today? | token_analysis |
| Analyze SOL | token_analysis |
| What are the top movers today? | top_movers |
| Biggest gainers and losers | top_movers |
| Summarize the market today | market_summary |
| What happened in crypto today? | market_summary |
| Latest crypto news | news_summary |
| Should I watch AVAX this week? | general_market_question |

---

## Context Assembly Strategy

Ask AI must answer from **supplied context**, not from model priors alone.

### Context builder responsibilities
The context builder should:

1. accept the user question
2. detect the intent
3. optionally extract a token symbol if present
4. fetch or assemble relevant internal platform context
5. return a normalized object for prompt construction

### Suggested normalized context shape

```ts
{
  question: string,
  intent: "token_analysis" | "market_summary" | "top_movers" | "news_summary" | "general_market_question",
  token?: string,
  market: {
    prices?: unknown,
    snapshot?: unknown,
  },
  topMovers?: unknown,
  news?: unknown[],
  narratives?: unknown[]
}
```

### Context by intent

#### `token_analysis`
Use:
- token symbol if extracted
- token-relevant market data where available
- recent token-relevant news if available
- optional top movers snapshot if helpful

#### `market_summary`
Use:
- broad market snapshot
- latest news
- top movers

#### `top_movers`
Use:
- top movers data
- short market snapshot

#### `news_summary`
Use:
- latest normalized crypto news
- short market snapshot

#### `general_market_question`
Use:
- broad market snapshot
- latest news
- optionally top movers

### Narratives integration
Narratives are listed as a dependency in repo docs, but the feature can ship without full narratives integration.
The context builder should include a **clear extension point** for later narrative context injection.

---

## API Contract

### Route
`POST /api/ai/ask`

### Request

```json
{
  "question": "Why is ETH going up today?"
}
```

### Request validation rules
- `question` is required
- string
- trimmed
- non-empty
- reasonable max length should be enforced (recommended)

### Response

```json
{
  "answer": "ETH is up today mainly because...",
  "intent": "token_analysis",
  "drivers": [
    "Positive market momentum",
    "Recent ETH-related news flow"
  ],
  "risks": [
    "Short-term volatility",
    "Market-wide reversal risk"
  ],
  "sources": [
    "market-data",
    "news"
  ],
  "confidence": 0.74
}
```

### Required response fields
- `answer: string`
- `intent: enum`
- `drivers: string[]`
- `risks: string[]`
- `sources: string[]`
- `confidence: number` between `0` and `1`

---

## Schema Design

### File
`src/ai/schemas/askAi.ts`

### Required exports
- `AskAiRequestSchema`
- `AskAiIntentSchema`
- `AskAiResponseSchema`
- inferred TypeScript types

### Suggested response schema

```ts
{
  answer: string,
  intent: AskAiIntent,
  drivers: string[],
  risks: string[],
  sources: string[],
  confidence: number
}
```

### Normalization rules
- `drivers`, `risks`, `sources` should always be arrays
- `confidence` must be clamped to `0..1`
- malformed LLM output must be converted to a safe fallback response rather than throwing raw parsing errors to the client

---

## Prompting Strategy

Ask AI should use a structured prompt with these rules:

1. act as a crypto market analyst
2. answer using only supplied context
3. be concise and factual
4. be transparent when data is missing
5. avoid guarantees or financial certainty
6. return JSON matching the response schema

### Prompt design guidance

The prompt should include:
- the normalized user question
- detected intent
- relevant context payload
- explicit output schema instructions
- guardrails against unsupported claims

### Example system-style guidance

```text
You are a crypto market analyst.
Use only the supplied platform context.
Do not invent facts.
If context is insufficient, say so clearly.
Return valid JSON matching the required schema.
Avoid financial guarantees.
```

---

## AI Invocation Rules

### Required execution path

```ts
const result = await runAI("reasoning", prompt)
```

### Why
This is required by the project’s AI architecture:
- routing must stay centralized
- provider details must remain abstracted
- observability hooks remain consistent
- future hybrid/cloud/local routing remains possible

### Prohibited pattern
Do **not** do this inside Ask AI feature code:

```ts
openai.chat(...)
openrouter.chat(...)
anthropic.messages.create(...)
```

---

## Recommended File Structure

```text
app/
  ask/
    page.tsx
  api/
    ai/
      ask/
        route.ts

components/
  ai/
    AskAI.tsx
    AskAIInput.tsx
    AskAIResponseCard.tsx

services/
  ai/
    ask-ai.ts
    build-ask-context.ts
    intent-detector.ts

src/
  ai/
    schemas/
      askAi.ts
```

### Responsibilities by file

#### `app/ask/page.tsx`
- page shell for the feature
- title/subtitle/layout
- renders `AskAI`

#### `app/api/ai/ask/route.ts`
- POST handler only
- validates request body
- delegates to `askAI(question)`
- returns JSON
- handles validation and internal errors cleanly

#### `components/ai/AskAI.tsx`
- client component
- local state
- submits question to internal API
- renders loading/error/result

#### `components/ai/AskAIInput.tsx`
- presentational input/textarea/submit UI

#### `components/ai/AskAIResponseCard.tsx`
- presentational rendering of answer + metadata

#### `services/ai/intent-detector.ts`
- deterministic intent classification

#### `services/ai/build-ask-context.ts`
- context assembly from internal services/layers
- token extraction hook
- narratives extension point

#### `services/ai/ask-ai.ts`
- feature orchestration service
- builds prompt
- calls `runAI("reasoning", prompt)`
- validates/normalizes output
- returns final structured object

#### `src/ai/schemas/askAi.ts`
- Zod schemas + inferred types

---

## UI Specification

### Page goal
Allow the user to ask market questions.

### Confirmed UI expectations from repo docs
- input box
- loading state
- answer block
- sources
- drivers
- risks
- confidence

### Recommended page structure

```text
Ask AI page
  ├─ Title
  ├─ Subtitle
  ├─ Example prompt chips
  ├─ AskAIInput
  ├─ Loading state
  ├─ Error state
  └─ AskAIResponseCard
```

### Example prompts
- Why is ETH going up today?
- What are the top movers today?
- Summarize the crypto market today.
- Should I watch SOL or AVAX?

### Visual direction
Must align with current frontend architecture notes:
- dark
- clean
- fintech / AI dashboard
- modular
- loading/error/empty states required

---

## Detailed Implementation Plan

### Phase 1 — Contracts and schemas
Create the formal request/response contract first.

Implement:
- `src/ai/schemas/askAi.ts`

Add:
- request schema
- intent enum/schema
- response schema
- inferred types

Why first:
- stabilizes API shape
- prevents frontend/backend drift
- gives Cursor a clear target

---

### Phase 2 — Intent detection
Implement deterministic intent classification.

Implement:
- `services/ai/intent-detector.ts`

Requirements:
- no LLM call
- normalize casing
- easy to extend
- single exported function

---

### Phase 3 — Context builder
Implement the orchestration helper that collects relevant internal data.

Implement:
- `services/ai/build-ask-context.ts`

Requirements:
- no direct external provider calls
- consume existing internal market/news/top-movers layers
- simple token extraction for MVP
- leave narratives hook point

---

### Phase 4 — Ask AI orchestration service
Implement the core feature service.

Implement:
- `services/ai/ask-ai.ts`

Responsibilities:
- detect intent
- build context
- build prompt
- call `runAI("reasoning", prompt)`
- parse model output
- validate with Zod
- normalize fallback behavior

This is the heart of the feature.

---

### Phase 5 — API route
Implement the public feature API.

Implement:
- `app/api/ai/ask/route.ts`

Requirements:
- POST only
- validate request body
- call service
- return JSON
- proper status codes
- graceful internal failure handling

---

### Phase 6 — Page shell
Implement the route page.

Implement:
- `app/ask/page.tsx`

Requirements:
- title
- subtitle
- `AskAI` component
- simple layout

---

### Phase 7 — Main client UI
Implement the interactive client component.

Implement:
- `components/ai/AskAI.tsx`

Requirements:
- local state only
- submit question to `/api/ai/ask`
- loading state
- error state
- render structured result
- no persistence yet

---

### Phase 8 — Presentation components
Split UI into maintainable pieces.

Implement:
- `components/ai/AskAIInput.tsx`
- `components/ai/AskAIResponseCard.tsx`

Update:
- `components/ai/AskAI.tsx`

---

### Phase 9 — Example prompts
Add clickable prompt chips to improve first-use UX.

Update UI to include:
- quick example questions
- click-to-fill or click-to-submit behavior

---

### Phase 10 — Hardening and normalization
Improve backend resilience.

Focus on:
- safe JSON parsing
- guaranteed schema-safe final response
- normalized source labels
- confidence clamping
- graceful malformed-model fallback

---

### Phase 11 — Observability hook point
Prepare the service for Langfuse or internal run logging.

Do not overbuild it for MVP.
Just add a clean integration point in the orchestration service.

---

## Suggested Response Normalization Rules

Normalize `sources` to a small known set:
- `market-data`
- `news`
- `top-movers`
- `narratives`
- `ai-inference`

### Fallback behavior
If the model output is malformed or cannot be parsed safely:

Return a valid structured response such as:

```json
{
  "answer": "I could not fully structure the answer from the current context, but the available market and news signals suggest a cautious interpretation.",
  "intent": "general_market_question",
  "drivers": [],
  "risks": ["Limited structured AI output"],
  "sources": ["ai-inference"],
  "confidence": 0.2
}
```

Do not bubble raw parsing exceptions to the UI.

---

## Error Handling Requirements

### API layer
Handle:
- invalid body
- missing question
- internal service failure

### Service layer
Handle:
- failed context assembly
- failed AI call
- malformed JSON from model
- invalid response shape

### UI layer
Handle:
- empty submit prevention
- loading state
- error state
- response rendering after success

---

## Security and Performance Notes

- API keys remain server-side only
- input validation at the route boundary is mandatory
- feature should use internal data layers, not direct client-side fetching from external APIs
- first version may return JSON response without streaming
- streaming can be added later without changing the overall architecture

---

## Acceptance Criteria

The Ask AI feature is considered complete for MVP when all of the following are true:

1. `/ask` route exists and renders correctly
2. user can submit a market question
3. `POST /api/ai/ask` validates request input
4. Ask AI builds context from existing internal layers
5. AI execution goes through the shared AI runner only
6. no direct provider calls exist in feature files
7. response is validated/normalized into a stable schema
8. UI renders:
   - answer
   - intent
   - drivers
   - risks
   - sources
   - confidence
9. loading and error states exist
10. no Playwright or RAG infrastructure was introduced for the MVP
11. implementation is modular and easy to extend with narratives later

---

## Future Extensions

These are valid future upgrades, but not MVP requirements:

### Near-term
- streaming responses
- narratives context integration
- token-aware news ranking
- better token extraction
- smarter response formatting

### Mid-term
- session/chat history persistence
- monitoring hooks visible on `/monitoring`
- quality evaluation hooks
- structured prompt versioning

### Long-term
- retrieval layer
- semantic cache
- historical similarity integration
- hybrid local/cloud routing
- multi-agent Ask AI workflows

---

## Notes for Cursor / AI Agent Implementation

When implementing this feature in Cursor:

- preserve existing repository architecture
- do not collapse orchestration into the route
- do not call providers directly
- do not add Playwright
- prefer small, isolated implementation passes
- start with schemas and contracts before UI
- keep Ask AI as a clean MVP instead of a bloated agent system

Recommended implementation order:

1. schemas
2. intent detector
3. context builder
4. orchestration service
5. API route
6. page shell
7. main client component
8. presentation subcomponents
9. example prompts
10. hardening + normalization
11. observability hook point

---

## Source Alignment Summary

This spec is aligned with the current repository docs, especially:

- `docs/ARCHITECTURE.md`
- `docs/roadmap.md`
- `docs/services.md`
- `docs/frontend-architecture.md`
- `docs/backend-architecture.md`
- `docs/llm-routing.md`
- `docs/ai-analysis-pipeline.md`
- `docs/CLAUDE.md`

It keeps Ask AI consistent with the project’s documented architecture:

- route-based AI feature
- shared AI runner
- centralized model routing
- structured output validation
- platform-context-first answers
- minimal, extensible MVP design
