
FILE: /docs/llm-routing.md
```md
# LLM Routing Strategy

## Status
- **Task-based routing:** Confirmed
- **Final routing table:** Confirmed
- **Provider:** Confirmed as OpenRouter
- **Hybrid local/cloud routing:** Planned

## 1. Final routing table

| Task | Model | Temperature | Max tokens |
|---|---|---:|---:|
| classification | gpt-4o-mini | 0.0 | 512 |
| extraction | gpt-4.1-mini | 0.1 | 2048 |
| reasoning | gpt-4.1 | 0.3 | 4096 |
| synthesis | gpt-4.1 | 0.4 | 4096 |
| validation | gpt-4o-mini | 0.0 | 1024 |
| anything else | gpt-4.1-mini | 0.2 | 2048 |

## 2. Why this routing strategy exists

### Confirmed
The platform has different classes of AI tasks:
- cheap deterministic tasks
- structured extraction tasks
- deeper reasoning tasks
- synthesis-heavy tasks
- validation tasks

Using one model for everything was explicitly rejected in favor of routing.

## 3. Cheap models

### classification → gpt-4o-mini
Used for:
- classification
- tagging
- simple checks

Why:
- low cost
- high speed
- enough for lightweight deterministic work

### validation → gpt-4o-mini
Used for:
- final checks
- lightweight structured validation

Why:
- strong reasoning is unnecessary for many validation cases
- better cost control

## 4. Medium models

### extraction → gpt-4.1-mini
Used for:
- extraction
- structured JSON-style tasks
- lighter analysis

Why:
- better structured output reliability than 4o-mini
- still cheaper than strong reasoning tier

### anything else → gpt-4.1-mini
Used as:
- default fallback

## 5. Strong models

### reasoning → gpt-4.1
Used for:
- token analysis
- market reasoning
- deeper multi-source analysis

### synthesis → gpt-4.1
Used for:
- final Market Brief synthesis
- composing multiple agent outputs into one coherent brief

Why:
- stronger reasoning quality
- better synthesis quality
- better for multi-input market interpretation

## 6. Routing architecture

### Confirmed
```text
Agent
  ↓
runAI(task, prompt)
  ↓
chooseModel(task)
  ↓
Provider
  ↓
LLM response