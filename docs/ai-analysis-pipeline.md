
FILE: /docs/ai-analysis-pipeline.md
```md
# AI Analysis Pipeline

## Status
- **Shared AI execution pattern:** Confirmed
- **Multi-agent market brief pipeline:** Confirmed
- **Token analysis pipeline:** Confirmed planned
- **RAG pipeline:** Planned
- **Semantic cache pipeline:** Planned

## 1. Core AI execution path

### Confirmed
All AI execution should follow this pattern:

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