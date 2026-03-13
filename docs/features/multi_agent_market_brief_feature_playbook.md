# Multi-Agent Market Brief — Feature Architecture Playbook

This file describes the **Multi-Agent Market Brief** feature in enough detail that a new AI agent
(Cursor, ChatGPT, Claude, etc.) can immediately understand the feature, its architecture, how it
fits into the app, and how to continue implementation safely.

---

## 1. Feature Goal

Replace the current **single LLM call** used for Market Brief generation with a **multi-agent workflow**
orchestrated by **LangGraph**.

The goal is to produce a **higher-quality AI Market Brief** by decomposing the task into several
specialized sub-analyses, then synthesizing them into one final structured output.

This feature is one of the strongest AI engineering parts of the project.

---

## 2. Where It Appears in the Product

### Main UI location
- **Page:** `/dashboard`
- **Section:** `AI Market Brief`
- **Placement:** below KPI cards, above main chart

### User interaction
- The Market Brief is **not generated automatically on page load**
- On page load, the UI should fetch the **latest cached brief from the database**
- The user clicks **Refresh** to trigger a new multi-agent generation
- The UI updates with the new brief after generation completes

### Additional UI
- Add a button or link:
  - **"How this brief was built"**
- This opens a **drawer/modal**
- The drawer displays outputs of each agent:
  - Market Data Agent
  - News Agent
  - Narrative Agent
  - Risk Agent
  - Synthesizer Agent
  - Validator Agent (if issues exist)

---

## 3. Business Value

This feature turns the product from:
- a simple AI summary card

into:
- an explainable AI market intelligence system
- a multi-stage market reasoning pipeline
- a more credible AI product for portfolio / interviews

This also makes the product much more convincing for:
- AI Engineer roles
- Applied AI roles
- Agentic workflow / RAG-oriented roles

---

## 4. High-Level Flow

```text
User clicks Refresh
        ↓
POST /api/ai/market-brief
        ↓
Load latest market data + news + narratives
        ↓
LangGraph workflow starts
        ↓
Run agents:
- Market Data Agent
- News Agent
- Narrative Agent
- Risk Agent
        ↓
Synthesizer Agent
        ↓
Validator Agent
        ↓
Save final brief to database
        ↓
Save debug_json / agent outputs
        ↓
Log workflow in Langfuse
        ↓
Return final brief to UI
```

On page reload:

```text
Dashboard loads
      ↓
GET /api/ai/market-brief
      ↓
Fetch latest cached brief from database
      ↓
Render UI
```

No LLM generation should happen on GET.

---

## 5. Agents

### 5.1 Market Data Agent
**Responsibility:** analyze quantitative market structure.

**Inputs:**
- BTC / ETH prices
- 24h changes
- volume
- top movers
- optional funding / open interest if available

**Outputs:**
```json
{
  "market_momentum": "string",
  "key_signals": ["string"],
  "market_structure": "string",
  "confidence": 0.0
}
```

**What it should answer:**
- Is the market trending, consolidating, or unstable?
- Are there signs of leverage buildup or weakness?
- What are the strongest quantitative signals?

---

### 5.2 News Agent
**Responsibility:** interpret recent market-moving news.

**Inputs:**
- latest crypto news items from database

**Outputs:**
```json
{
  "news_summary": "string",
  "main_drivers": ["string"],
  "source_titles": ["string"],
  "confidence": 0.0
}
```

**What it should answer:**
- Which news stories matter most today?
- Which of them are likely to drive BTC / ETH sentiment?

---

### 5.3 Narrative Agent
**Responsibility:** identify active market narratives.

**Inputs:**
- recent news
- existing narratives from DB if available
- top movers / token context if useful

**Outputs:**
```json
{
  "top_narratives": ["string"],
  "narrative_summary": "string",
  "affected_tokens": ["string"],
  "confidence": 0.0
}
```

**What it should answer:**
- What are the strongest active themes in the market?
- Which tokens are most affected?

---

### 5.4 Risk Agent
**Responsibility:** detect short-term market risks.

**Inputs:**
- market data
- news
- top movers
- narrative context

**Outputs:**
```json
{
  "top_risks": ["string"],
  "risk_summary": "string",
  "severity": 0.0,
  "confidence": 0.0
}
```

**What it should answer:**
- What downside risks matter most right now?
- Is the market overheated, fragile, or uncertain?

---

### 5.5 Synthesizer Agent
**Responsibility:** combine all sub-analyses into a final brief.

**Inputs:**
- marketDataAnalysis
- newsAnalysis
- narrativeAnalysis
- riskAnalysis

**Outputs:**
```json
{
  "market_summary": "string",
  "drivers": ["string"],
  "risks": ["string"],
  "confidence": 0.0,
  "sources": ["string"]
}
```

**What it should do:**
- merge the sub-analyses into a concise dashboard-ready final brief
- avoid repetition
- preserve meaningful drivers and risks
- use news sources where relevant

---

### 5.6 Validator Agent
**Responsibility:** validate and normalize the final brief.

**Inputs:**
- synthesized brief

**Checks:**
- summary is non-empty
- drivers array exists and is useful
- risks array exists and is useful
- confidence value is sensible
- sources are present if available

**Outputs:**
```json
{
  "valid": true,
  "normalizedBrief": {
    "market_summary": "string",
    "drivers": ["string"],
    "risks": ["string"],
    "confidence": 0.0,
    "sources": ["string"]
  },
  "issues": ["string"]
}
```

---

## 6. LangGraph Orchestration

### Recommended state shape
```ts
type MarketBriefState = {
  marketData: unknown | null
  news: unknown[] | null
  existingNarratives: unknown[] | null

  marketDataAnalysis: unknown | null
  newsAnalysis: unknown | null
  narrativeAnalysis: unknown | null
  riskAnalysis: unknown | null

  synthesizedBrief: unknown | null
  validatedBrief: unknown | null

  issues: string[]
}
```

### Recommended graph flow
```text
START
  ↓
Load context
  ↓
Run in parallel:
- Market Data Agent
- News Agent
- Narrative Agent
- Risk Agent
  ↓
Synthesizer Agent
  ↓
Validator Agent
  ↓
END
```

### Orchestration notes
- Agent outputs should be independent and structured
- Synthesizer must only use agent outputs, not re-derive everything from scratch
- Validator is the final gate before DB save
- Keep the graph simple and production-oriented

---

## 7. Data Sources

### Market inputs
Use the existing **Binance-backed market layer**:
- current prices
- 24h changes
- chart-compatible metrics
- top movers

### News inputs
Use the existing **news ingestion layer**:
- latest news from DB
- avoid direct external API calls in the graph if data is already ingested

### Narrative inputs
Use existing narratives from DB if available.
If not available, Narrative Agent can operate directly from recent news.

---

## 8. Database Requirements

### Existing table
`market_briefs`

The final validated brief should be stored here.

### Required fields
Minimum:
- `id`
- `created_at`
- `market_summary`
- `drivers`
- `risks`
- `confidence`
- `sources`

### Strongly recommended field
- `debug_json`

`debug_json` should store the agent outputs so the drawer/modal can display the internal steps.

Example:
```json
{
  "marketDataAnalysis": { "...": "..." },
  "newsAnalysis": { "...": "..." },
  "narrativeAnalysis": { "...": "..." },
  "riskAnalysis": { "...": "..." },
  "synthesizedBrief": { "...": "..." },
  "validatedBrief": { "...": "..." },
  "issues": []
}
```

If `debug_json` does not exist yet, add it via migration.

---

## 9. API Contract

### GET `/api/ai/market-brief`
Purpose:
- return the latest cached brief from DB
- do not trigger generation

Response example:
```json
{
  "market_summary": "string",
  "drivers": ["string"],
  "risks": ["string"],
  "confidence": 0.82,
  "sources": ["string"],
  "debug_json": {}
}
```

If no brief exists:
```json
{
  "message": "No market brief generated yet"
}
```

### POST `/api/ai/market-brief`
Purpose:
- run the full LangGraph multi-agent workflow
- save final brief to DB
- return new brief

Should:
- create new Langfuse trace
- log sub-steps if possible
- preserve previous brief if generation fails

---

## 10. Langfuse Observability

### Parent workflow
Workflow name:
- `market_brief_pipeline`

### Each agent call
Should appear as a meaningful generation / step if possible.

### Track
- workflow input
- agent prompts
- agent outputs
- final synthesized brief
- validation issues
- tokens
- latency
- retries
- cost

### Important rule
- GET route should not create a generation trace
- POST route should create traces

---

## 11. UI Requirements

### AI Market Brief card
Show:
- `market_summary`
- `drivers`
- `risks`
- `confidence`
- optional `sources count`

### Refresh button
Behavior:
- click triggers POST generation
- disable while loading
- avoid duplicate generation
- do not auto-generate on page load

### "How this brief was built"
Open drawer/modal
Show agent outputs in readable sections:
- Market data interpretation
- News interpretation
- Narratives
- Risks
- Final synthesized brief
- Validation issues (if any)

### UI style
- dark fintech / AI terminal style
- readable and structured
- not raw JSON dump unless no better data is available

---

## 12. Folder Structure

Recommended files:

```text
src/
  ai/
    agents/
      market-data-agent.ts
      news-agent.ts
      narrative-agent.ts
      risk-agent.ts
      synthesizer-agent.ts
      validator-agent.ts

    workflows/
      market-brief-graph.ts

  app/
    api/
      ai/
        market-brief/
          route.ts

  components/
    dashboard/
      ai-market-brief-card.tsx
      market-brief-debug-drawer.tsx
```

---

## 13. Reuse Rules

This feature must reuse:
- shared market data layer
- shared AI workflow runner
- shared Langfuse integration
- shared validation patterns

Do not:
- create separate custom LLM calling logic in every agent
- duplicate prompt execution code
- bypass existing logging patterns

---

## 14. Implementation Order

Recommended implementation order:

1. Implement agent files
2. Implement LangGraph workflow
3. Integrate with `/api/ai/market-brief`
4. Add `debug_json` storage
5. Connect dashboard refresh button to new workflow
6. Build "How this brief was built" drawer
7. QA + Langfuse verification

---

## 15. Manual QA Checklist

### Browser
- open `/dashboard`
- confirm latest cached brief renders
- click `Refresh`
- confirm new brief appears
- click `How this brief was built`
- confirm drawer shows outputs of all agents

### API
- `GET /api/ai/market-brief` returns latest cached brief
- `POST /api/ai/market-brief` runs new multi-agent generation

### Database
- new record appears in `market_briefs`
- `debug_json` contains agent outputs
- previous brief remains if generation fails

### Langfuse
- parent workflow trace exists
- agent generations or substeps are visible
- latency, token usage, cost visible
- retry / validation issue logs visible if applicable

---

## 16. Future Extensions

This feature is the foundation for:
- historical similarity agent
- model router integration
- semantic cache
- richer RAG context
- explainable AI workflows across the app

---

## 17. Short Summary for New AI Agents

If you are a new AI agent reading this file:

This feature replaces a single-call Market Brief generation system with a LangGraph-based multi-agent pipeline.

The dashboard should:
- load the latest cached Market Brief from DB on GET
- generate a new brief only when Refresh is clicked via POST

The generation workflow should:
- gather market data and news
- run specialized agents
- synthesize a final brief
- validate it
- store final output + debug_json
- trace everything in Langfuse

This is one of the most important AI engineering features in the project.
