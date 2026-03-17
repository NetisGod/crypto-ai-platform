
FILE: /docs/ai-agents.md
```md
# AI Agents

## Status
- **Market Brief agents:** Confirmed
- **TokenAnalysisAgent:** Confirmed as next feature
- **Historical Similarity Agent:** Planned
- **Exact full code contracts:** Partially specified

## 1. Agent system overview

### Confirmed
The platform uses an agentic AI architecture, especially for the Market Brief.

Current/confirmed agent set:
- Market Data Agent
- News Agent
- Narrative Agent
- Risk Agent
- Synthesizer Agent
- Validator Agent

Planned additional agent:
- TokenAnalysisAgent
- Historical Similarity Agent

### Confirmed execution rules
- agents do not call providers directly
- agents call `runAI()`
- `runAI()` uses Model Router
- Langfuse traces execution
- Zod is used for structured outputs

---

## 2. Market Data Agent

### Purpose
Interpret quantitative market structure.

### Inputs
- BTC / ETH market prices
- 24h changes
- volume
- top movers
- optional funding/open interest

### Outputs
```ts
{
  market_momentum: string,
  key_signals: string[],
  market_structure: string,
  confidence: number
}