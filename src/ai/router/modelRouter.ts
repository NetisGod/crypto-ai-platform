/**
 * Model Router — decides which LLM model handles a given AI task.
 *
 * Routing strategy:
 *   cheap  tasks (classification, validation)  → fast, low-cost model
 *   medium tasks (extraction)                  → balanced model
 *   strong tasks (reasoning, synthesis)        → most capable model
 *
 * To add a new task:
 *   1. Add the task name to the `TaskType` union
 *   2. Add an entry in `TASK_ROUTE_TABLE`
 *   That's it — `chooseModel` picks it up automatically.
 */

// ---------------------------------------------------------------------------
// Provider & tier types
// ---------------------------------------------------------------------------

export type ProviderName = "openrouter" | "openai" | "ollama" | "vllm";

export type ModelTier = "cheap" | "medium" | "strong";

// ---------------------------------------------------------------------------
// Task types — extend this union when new AI tasks are introduced
// ---------------------------------------------------------------------------

export type TaskType =
  | "classification"
  | "extraction"
  | "reasoning"
  | "synthesis"
  | "validation";

// ---------------------------------------------------------------------------
// ModelConfig — the shape returned by chooseModel()
// ---------------------------------------------------------------------------

export interface ModelConfig {
  provider: "openrouter";
  model: string;
  temperature: number;
  maxTokens: number;
}

// ---------------------------------------------------------------------------
// Model registry entry (extended metadata for budgeting / debug UIs)
// ---------------------------------------------------------------------------

export interface ModelEntry {
  id: string;
  provider: ProviderName;
  tier: ModelTier;
  contextWindow: number;
  costPer1kInput: number;
  costPer1kOutput: number;
}

export interface ResolvedModel {
  model: ModelEntry;
  fallback: ModelEntry | null;
}

// ---------------------------------------------------------------------------
// Routing table — maps every TaskType to a concrete ModelConfig
// ---------------------------------------------------------------------------

const TASK_ROUTE_TABLE: Record<TaskType, ModelConfig> = {
  classification: {
    provider: "openrouter",
    model: "gpt-4o-mini",
    temperature: 0.0,
    maxTokens: 512,
  },
  extraction: {
    provider: "openrouter",
    model: "gpt-4.1-mini",
    temperature: 0.1,
    maxTokens: 2048,
  },
  reasoning: {
    provider: "openrouter",
    model: "gpt-4.1",
    temperature: 0.3,
    maxTokens: 1536,
  },
  synthesis: {
    provider: "openrouter",
    model: "gpt-4.1",
    temperature: 0.4,
    maxTokens: 1536,
  },
  validation: {
    provider: "openrouter",
    model: "gpt-4o-mini",
    temperature: 0.0,
    maxTokens: 1024,
  },
};

const DEFAULT_CONFIG: ModelConfig = {
  provider: "openrouter",
  model: "gpt-4.1-mini",
  temperature: 0.2,
  maxTokens: 2048,
};

// ---------------------------------------------------------------------------
// chooseModel — primary routing function
// ---------------------------------------------------------------------------

/**
 * Select the LLM configuration for a given task.
 *
 * Returns a matched `ModelConfig` from the routing table, or the default
 * fallback when the task is not explicitly mapped.
 *
 * @example
 * ```ts
 * const cfg = chooseModel("reasoning");
 * // { provider: "openrouter", model: "gpt-4.1", temperature: 0.3, maxTokens: 4096 }
 *
 * const unknown = chooseModel("some_future_task");
 * // falls back to default config (gpt-4.1-mini)
 * ```
 */
export function chooseModel(task: string): ModelConfig {
  if (isKnownTask(task)) {
    return { ...TASK_ROUTE_TABLE[task] };
  }
  return { ...DEFAULT_CONFIG };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isKnownTask(task: string): task is TaskType {
  return task in TASK_ROUTE_TABLE;
}

/**
 * List all explicitly routed tasks and their configs (useful for debug UIs).
 */
export function listRoutes(): ReadonlyArray<{ task: TaskType; config: ModelConfig }> {
  return (Object.keys(TASK_ROUTE_TABLE) as TaskType[]).map((task) => ({
    task,
    config: TASK_ROUTE_TABLE[task],
  }));
}

// ---------------------------------------------------------------------------
// Tier-based resolution (kept for backward compatibility with runner/runAI.ts)
// ---------------------------------------------------------------------------

const MODEL_REGISTRY: ModelEntry[] = [
  {
    id: "gpt-4o-mini",
    provider: "openrouter",
    tier: "cheap",
    contextWindow: 128_000,
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
  },
  {
    id: "gpt-4.1-mini",
    provider: "openrouter",
    tier: "medium",
    contextWindow: 128_000,
    costPer1kInput: 0.0004,
    costPer1kOutput: 0.0016,
  },
  {
    id: "gpt-4.1",
    provider: "openrouter",
    tier: "strong",
    contextWindow: 128_000,
    costPer1kInput: 0.002,
    costPer1kOutput: 0.008,
  },
];

export function resolveModel(tier: ModelTier, _taskName?: string): ResolvedModel {
  const match = MODEL_REGISTRY.find((m) => m.tier === tier);
  if (!match) {
    throw new Error(`No model registered for tier "${tier}"`);
  }

  const fallbackTier: ModelTier = tier === "strong" ? "medium" : "cheap";
  const fallback =
    MODEL_REGISTRY.find((m) => m.tier === fallbackTier && m.id !== match.id) ?? null;

  return { model: match, fallback };
}

export function listModels(): readonly ModelEntry[] {
  return MODEL_REGISTRY;
}
