# Feature Architecture: AI Token Analysis

## Overview

AI Token Analysis generates a token-specific market explanation for assets such as BTC and ETH.

This feature transforms the token page from a static data view into an AI-powered analysis surface.

The analysis should explain:
- what is happening with the token
- bullish factors
- bearish factors
- short-term outlook
- confidence

This feature uses:
- market data
- recent news
- optional narratives
- shared AI runner
- model router
- Langfuse observability

---

## Product Location

Main route:
- /token/BTC
- /token/ETH

Placement on page:
- below Token Header / Stats / Chart
- above or near Token News

---

## Architecture

This feature has 4 layers:

1. Data collection layer
2. AI agent / workflow
3. API route
4. UI component

Suggested structure:

src/ai/agents/
  tokenAnalysisAgent.ts

src/ai/schemas/
  tokenAnalysis.ts

app/api/ai/token-analysis/route.ts

components/token/
  TokenAnalysisCard.tsx

---

## Inputs

The AI Token Analysis should consume:

### Market data
- current price
- 24h change
- volume
- optional chart trend summary

### News
- latest token-relevant news

### Optional later inputs
- narratives
- historical similarity
- funding / open interest

For MVP, market data + news is enough.

---

## Output Schema

```ts
{
  summary: string
  bullish_factors: string[]
  bearish_factors: string[]
  outlook: string
  confidence: number
}
```
