# Market Brief Eval Layer -- Task Breakdown

## Status Overview

| # | Task | Status | Files |
|---|------|--------|-------|
| 1 | Pipeline override | DONE | `src/ai/workflows/market-brief-graph.ts` |
| 2 | Curated fixtures | DONE | `src/ai/eval/market-brief/fixtures.ts` |
| 3 | Dataset management module | DONE | `src/ai/eval/market-brief/dataset.ts` |
| 4 | Evaluators | DONE | `src/ai/eval/market-brief/evaluators.ts` |
| 5 | Experiment runner | DONE | `src/ai/eval/market-brief/experiment.ts` |
| 6 | CLI entry point | DONE | `scripts/eval-market-brief.ts` |
| 7 | Package.json updates | DONE | `package.json` |

---

## Task 1: Pipeline Override (DONE)

**Goal**: Allow the eval layer to inject context and skip DB persistence.

**Changes**:
- Added `PipelineOptions` interface with `overrideContext` and `skipPersistence`
- `loadContextNode` returns override data when provided, skips Supabase
- `skipPersistence = true` disables `market_briefs` insert, `ai_runs` tracking
- Trace named `market_brief_eval` during eval mode
- Default graph is cached at module level; override builds a fresh graph per call
- Backward-compatible -- existing `runMarketBriefPipeline()` with no args works identically

**File**: `src/ai/workflows/market-brief-graph.ts`

---

## Task 2: Curated Fixtures (DONE)

**Goal**: Hand-craft 6 market scenarios covering bull, bear, mixed, partial data, stale data, and minimal context.

**File**: `src/ai/eval/market-brief/fixtures.ts`

**Scenarios**:
1. `bull-full-context` -- BTC $97.5K, record ETF inflows, rate cut, all agents fire
2. `bear-selloff` -- BTC $52K, SEC action, $800M liquidations, negative sentiment
3. `mixed-signals` -- BTC $71K, CPI pending, whale buying vs VC decline
4. `missing-news` -- BTC $84K, empty news array, tests news agent degradation
5. `stale-data` -- BTC $67.5K, news 48-52h old, tests staleness awareness
6. `minimal-context` -- BTC $62K only, no news/narratives, extreme edge case

Each fixture has: `input`, `expectedOutput` (9 assertion fields), `metadata` (scenario conditions).

**Also created**: `src/ai/eval/market-brief/types.ts` -- shared types for the eval layer.

---

## Task 3: Dataset Management Module (DONE)

**Goal**: Manage Langfuse dataset lifecycle (create, seed, fetch, snapshot from DB).

**File**: `src/ai/eval/market-brief/dataset.ts`

**Exports**:
- `ensureDataset()` -- create dataset in Langfuse if it doesn't exist
- `seedFixtures(items?)` -- upload fixtures as dataset items
- `fetchDatasetItems()` -- retrieve items with typed `link()` for experiment runs
- `snapshotFromDb(scenario, description, expectedOutput)` -- capture live DB state as a new item

---

## Task 4: Evaluators (DONE)

**Goal**: Implement all 14 deterministic evaluators + 2 run-level aggregates.

**File**: `src/ai/eval/market-brief/evaluators.ts`

**Exports**:
- 4 structural: `schemaValidity`, `structuralCompleteness`, `noDuplication`, `sourceAttribution`
- 8 expectedOutput-driven: `mentionPresence`, `negativeClaim`, `driverCoverage`, `riskCoverage`, `narrativeCoverage`, `toneMatch`, `confidenceThreshold`, `assetCoverage`
- 2 metadata-driven: `stalenessAwareness`, `gracefulDegradation`
- `runAllEvaluators(brief, input, expected, meta, debugJson)` -- runs all 14
- `computeRunAggregates(allItemScores)` -- `avgScore` and `worstCase`

---

## Task 5: Experiment Runner (DONE)

**Goal**: Build the orchestrator that loops through dataset items, runs the pipeline, evaluates outputs, links traces, and persists run metrics.

**File**: `src/ai/eval/market-brief/experiment.ts`

**Implemented**:
- `runExperiment({ runName, concurrency })` fetches dataset items and evaluates them in batches
- Each item is processed by `evaluateItem()` with `runMarketBriefPipeline({ overrideContext, skipPersistence: true })`
- All 14 evaluators run through `runAllEvaluators()`
- Evaluator scores are logged to Langfuse
- Dataset items are linked to the named dataset run via `item.link(trace, runName)`
- A summarized run record is inserted into `eval_runs`
- Run-level aggregates are computed via `computeRunAggregates()`
- Results are returned in a structured shape for CLI display
- `printResults()` prints a human-readable console summary

---

## Task 6: CLI Entry Point (DONE)

**Goal**: Create a script with `seed` and `run` subcommands for dataset seeding and experiment execution.

**File**: `scripts/eval-market-brief.ts`

**Implemented**:
- `seed` calls `ensureDataset()` and `seedFixtures()`
- `run --name <name> [--concurrency <n>]` runs the experiment and prints formatted output
- Args are parsed with simple `process.argv` handling
- Non-zero exit codes are returned for fatal failures, pipeline errors, or low aggregate quality
- Langfuse shutdown is handled in `finally`

---

## Task 7: Package.json Updates (DONE)

**Goal**: Add tsx devDependency and eval script.

**File**: `package.json`

**Implemented**:
- Added `tsx` to `devDependencies`
- Added `eval:market-brief` script to `scripts`

---

## Scope Note

This feature package no longer includes a dedicated automated test task.

Reason:
- The original test task was framed as E2E / integration coverage, but this feature does not add a browser surface
- The repository guidance for Playwright and the broader project guidance are not aligned for this case
- The implemented eval layer is currently validated through the CLI workflow, fixture coverage, evaluator determinism, Langfuse dataset runs, and persisted `eval_runs` records

If automated coverage is added later, it should be introduced as a separate follow-up task using the repository's agreed test strategy rather than keeping an ambiguous placeholder here.
