# Feature Documentation

This folder contains architecture playbooks and detailed feature specifications
for the AI Crypto Market Intelligence Platform.

Each document is written so that AI agents (Cursor, ChatGPT, Claude, etc.)
can understand a feature end-to-end and implement or modify it safely.

---

## Features

| Feature | Document | Status |
|---------|----------|--------|
| Multi-Agent Market Brief | [multi_agent_market_brief_feature_playbook.md](multi_agent_market_brief_feature_playbook.md) | In progress |
| Market Brief Eval Layer | [market-brief-eval/feature.md](market-brief-eval/feature.md) | In progress (4/8 tasks done) |

---

## Adding new feature docs

When documenting a new feature:

1. Create a file or folder in this directory:
   - **Simple features**: `docs/features/<feature_name>.md`
   - **Complex features**: `docs/features/<feature-name>/` with the structure below
2. Follow the structure used in the Market Brief playbook (goal, flow, agents, API, DB, UI, QA)
3. Add a corresponding Cursor rule in `.cursor/rules/` that references the doc
4. Update this README table with the new entry

### Folder structure for complex features

```
docs/features/<feature-name>/
  feature.md                    -- full feature specification
  tasks.md                      -- task breakdown with status
  prompts/
    implement-task.md           -- prompt template for implementing tasks
    review-task.md              -- prompt template for reviewing completed tasks
    test-task.md                -- prompt template for writing tests
```
