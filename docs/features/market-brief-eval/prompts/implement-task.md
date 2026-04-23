# Prompt Template: Implement Task

Use this prompt when asking an AI agent to implement a specific task from the eval layer.

---

## Template

```
Read the following documentation files in order:

1. docs/features/market-brief-eval/feature.md -- full feature specification
2. docs/features/market-brief-eval/tasks.md -- task breakdown with status and requirements

Then implement Task [NUMBER]: [TASK NAME].

Requirements for this task are listed in tasks.md under the corresponding section.

Rules:
- Follow the existing project conventions in .cursor/rules/project-rules.mdc
- Reuse existing Langfuse helpers from src/lib/langfuse.ts
- Reuse existing types from src/ai/eval/market-brief/types.ts
- All AI calls must go through the model router (never call providers directly)
- TypeScript strict mode, no `any` types unless absolutely necessary
- After implementing, run linter and fix any errors

Already completed tasks (do not re-implement):
[LIST COMPLETED TASKS]

Key files to read before implementing:
[LIST RELEVANT FILES FOR THIS SPECIFIC TASK]
```

---

## Example: Task 5 (Experiment Runner)

```
Read the following documentation files in order:

1. docs/features/market-brief-eval/feature.md -- full feature specification
2. docs/features/market-brief-eval/tasks.md -- task breakdown with status and requirements

Then implement Task 5: Experiment Runner.

Requirements for this task are listed in tasks.md under the corresponding section.

Rules:
- Follow the existing project conventions in .cursor/rules/project-rules.mdc
- Reuse existing Langfuse helpers from src/lib/langfuse.ts
- Reuse existing types from src/ai/eval/market-brief/types.ts
- All AI calls must go through the model router
- TypeScript strict mode, no `any` types unless absolutely necessary
- After implementing, run linter and fix any errors

Already completed tasks (do not re-implement):
- Task 1: Pipeline override (src/ai/workflows/market-brief-graph.ts)
- Task 2: Fixtures (src/ai/eval/market-brief/fixtures.ts)
- Task 3: Dataset module (src/ai/eval/market-brief/dataset.ts)
- Task 4: Evaluators (src/ai/eval/market-brief/evaluators.ts)

Key files to read before implementing:
- src/ai/eval/market-brief/types.ts (ItemEvalResult, EvalScore)
- src/ai/eval/market-brief/dataset.ts (fetchDatasetItems, FetchedItem)
- src/ai/eval/market-brief/evaluators.ts (runAllEvaluators, computeRunAggregates)
- src/ai/workflows/market-brief-graph.ts (runMarketBriefPipeline, PipelineOptions)
- src/lib/langfuse.ts (startTrace, logScore, finishTrace)
```

---

## Tips

- Always list completed tasks so the agent doesn't redo work
- Include specific file paths the agent should read -- this avoids hallucination
- For multiple tasks in one session, implement sequentially (5 -> 6 -> 7)
- If the session is getting long, split: tasks 5-6 in one chat, task 7 in another
