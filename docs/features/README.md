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

---

## Adding new feature docs

When documenting a new feature:

1. Create a file in this folder: `docs/features/<feature_name>.md`
2. Follow the structure used in the Market Brief playbook (goal, flow, agents, API, DB, UI, QA)
3. Add a corresponding Cursor rule in `.cursor/rules/` that references the doc
4. Update this README table with the new entry
