# AI Crypto Market Intelligence Platform — System Overview

## Status
- **Project type:** Confirmed
- **Product direction:** Confirmed
- **Production maturity:** In Progress
- **Single source of truth status of this document:** Confirmed intent

## What the product is

This project is an **AI-powered crypto market intelligence platform**. It combines:

- real-time crypto market data
- crypto market news
- structured AI-generated market analysis
- token-level intelligence
- multi-agent explainable workflows
- future retrieval / RAG capabilities
- future historical similarity analysis
- future semantic caching and hybrid model infrastructure

into a single product experience.

The product is intended to function as both:
- a usable market intelligence dashboard
- a portfolio-grade AI engineering system demonstrating:
  - agentic workflows
  - model routing
  - observability
  - structured outputs
  - future RAG and hybrid AI architecture

## Core problem it solves

### Confirmed
The product solves the problem of fragmented crypto market research.

A user typically needs to check multiple sources to answer questions like:
- what is happening in the market right now?
- why is BTC or ETH moving?
- what are the key drivers and risks?
- what narratives are active?
- which assets are leading or lagging?
- how can all of this be summarized in a structured, explainable way?

The platform centralizes:
- market data
- charts
- movers
- news
- AI-generated summaries
- token-level AI analysis
- multi-agent reasoning

## Target users

### Confirmed
- crypto traders
- analysts
- researchers
- advanced market participants
- technically strong users who want fast market context

### Inferred from chat context
- hiring managers / interviewers evaluating AI engineering skill
- founders / solo builders wanting a startup-style AI product

## Main user-facing capabilities

### Confirmed
1. **Dashboard**
   - BTC / ETH KPI cards
   - price chart with multiple ranges
   - Top Movers
   - Market News panel
   - AI Market Brief

2. **Token Pages**
   - token-specific page such as:
     - `/token/BTC`
     - `/token/ETH`
   - current price
   - chart
   - stats
   - news
   - later AI token analysis

3. **Narratives**
   - view active market narratives
   - linked news and confidence

4. **Ask AI**
   - ask structured questions about the market

5. **Monitoring**
   - latency
   - cost
   - token usage
   - retry / success / failure data

6. **Evaluation**
   - golden dataset and scoring

## Product philosophy

### Confirmed
The product is being built in a staged way:

1. establish reliable data layers
2. build stable product surfaces
3. add AI workflows
4. evolve to multi-agent workflows
5. add retrieval / RAG
6. add optimization layers such as:
   - semantic cache
   - model routing
   - hybrid model support

This staged progression was emphasized repeatedly as the correct implementation order.

## Main product modules

### Confirmed
- Dashboard
- Token Pages
- AI Market Brief
- Market News
- Top Movers
- Narratives
- Ask AI
- Monitoring
- Evaluation layer
- Multi-Agent Market Brief
- Model Router
- Future RAG / historical similarity / hybrid AI

## High-level system diagram (text)

### Confirmed
```text
User / Browser
    ↓
Next.js Frontend
    ↓
Next.js API Routes
    ↓
Shared Service Layer
  - Market Data Services
  - News Services
  - AI Runner
  - Model Router
    ↓
AI Workflows / LangGraph Agents
    ↓
External Providers
  - Binance
  - News Source
  - OpenRouter
  - (future local models)
    ↓
Supabase / Postgres / pgvector
    ↓
Langfuse Observability