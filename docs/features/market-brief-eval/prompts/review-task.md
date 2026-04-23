# Prompt Template: Review Task

Use this prompt when asking an AI agent to review a completed task for correctness, code quality, and spec compliance.

---

## Template

```
Read the following documentation files:

1. docs/features/market-brief-eval/feature.md -- feature specification
2. docs/features/market-brief-eval/tasks.md -- task requirements

Then review the implementation of Task [NUMBER]: [TASK NAME].

Files to review:
[LIST FILES THAT WERE CREATED OR MODIFIED]

Check the following:

1. SPEC COMPLIANCE
   - Does the implementation match the requirements in tasks.md?
   - Are all required exports/functions present?
   - Does it integrate with existing code correctly?

2. TYPE SAFETY
   - No untyped `any` (except where eslint-disabled for Langfuse/Supabase)
   - All inputs and outputs properly typed
   - Zod schemas used where applicable

3. ERROR HANDLING
   - Graceful failure paths (try/catch, null checks)
   - Meaningful error messages
   - No silent swallowing of errors

4. LANGFUSE INTEGRATION
   - Traces created correctly for eval runs
   - Scores logged per evaluator
   - Dataset items linked to traces
   - Flush called at end

5. EXISTING CODE COMPATIBILITY
   - No breaking changes to existing API routes or pipeline
   - Backward-compatible function signatures
   - No duplicate logic (reuses shared services)

6. PROJECT CONVENTIONS
   - TypeScript strict
   - File naming: kebab-case
   - Function naming: camelCase
   - No hardcoded secrets
   - Comments only where non-obvious

Report:
- List any issues found (critical / minor)
- Suggest specific fixes with file paths and line numbers
- Confirm which checks passed
```

---

## Example: Review Task 1 (Pipeline Override)

```
Read the following documentation files:

1. docs/features/market-brief-eval/feature.md
2. docs/features/market-brief-eval/tasks.md

Then review the implementation of Task 1: Pipeline Override.

Files to review:
- src/ai/workflows/market-brief-graph.ts

Check that:
- PipelineOptions interface is exported
- overrideContext bypasses loadContextFromDb entirely
- skipPersistence prevents market_briefs and ai_runs writes
- Trace is named "market_brief_eval" when skipPersistence=true
- Default call with no args still works identically (backward-compatible)
- The API route in src/app/api/ai/market-brief/route.ts was NOT modified
```
