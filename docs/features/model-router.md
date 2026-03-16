# Feature Architecture: Model Router

## Overview

Model Router is the central AI infrastructure component responsible for selecting which LLM model should handle a given AI task.

Instead of agents calling LLM providers directly, all LLM requests must pass through the AI Runner and Model Router.

This design enables:

* cost optimization
* model specialization
* hybrid AI architecture
* easy switching between models and providers
* centralized observability

---

# System Architecture

AI execution flow:

LangGraph Workflow
↓
Agent
↓
AI Runner
↓
Model Router
↓
Provider Layer
(OpenRouter / OpenAI / Anthropic / Local)
↓
LLM Model

Agents must never call LLM APIs directly.

---

# Folder Structure

Create the following folders:

src/ai/

agents/
workflows/

runner/
runAI.ts

router/
modelRouter.ts

providers/
openrouter.ts

---

# Responsibilities

## Model Router

File:

src/ai/router/modelRouter.ts

Responsibilities:

* determine which model to use
* determine which provider to use
* configure model parameters

Router should return a ModelConfig object.

---

# ModelConfig Type

Example structure:

```ts
type ModelConfig = {
  provider: "openrouter"
  model: string
  temperature: number
  maxTokens: number
}
```

---

# Task-Based Model Routing

Different tasks should use different models.

Example mapping:

classification → gpt-4o-mini
extraction → gpt-4.1-mini
reasoning → gpt-4.1
synthesis → gpt-4.1
validation → gpt-4o-mini

This allows cost-efficient AI execution.

---

# Router Interface

Router exposes:

```ts
chooseModel(task: string): ModelConfig
```

Example return value:

```ts
{
  provider: "openrouter",
  model: "gpt-4.1",
  temperature: 0.2,
  maxTokens: 1200
}
```

---

# AI Runner

File:

src/ai/runner/runAI.ts

Responsibilities:

1. receive AI task
2. call Model Router
3. select provider
4. execute request
5. return response

Execution flow:

runAI(task, prompt)
↓
chooseModel(task)
↓
call provider
↓
return response

---

# Provider Layer

Providers implement the actual API calls.

Example provider:

src/ai/providers/openrouter.ts

Responsibilities:

* send request to OpenRouter
* handle API response
* normalize output

Example endpoint:

POST https://openrouter.ai/api/v1/chat/completions

---

# Example Execution

Example for Market Brief Synthesizer Agent:

LangGraph
↓
Synthesizer Agent
↓
runAI("synthesis", prompt)
↓
Model Router
↓
OpenRouter Provider
↓
GPT-4.1

---

# Agent Usage

Agents must call the AI Runner.

Correct usage:

```ts
const result = await runAI("reasoning", prompt)
```

Incorrect usage:

```ts
openai.chat(...)
```

Direct provider calls are not allowed.

---

# Future Extensions

The router will later support:

* Claude models
* local models via Ollama
* hybrid routing strategies

Example hybrid rule:

classification → local model
reasoning → cloud model

---

# QA Checklist

Before moving to the next feature verify:

* router selects correct model
* AI Runner uses router
* provider layer works
* agents never call providers directly
* models can be switched easily

---

# Cursor Usage

Before implementing run this prompt:

Read docs/features/model-router.md
Implement the Model Router exactly as described.

Do not simplify architecture.
