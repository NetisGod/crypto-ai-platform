/**
 * Unified AI execution runner with Langfuse observability.
 *
 * Entry point for all LLM calls in the platform.
 *
 * Two modes:
 *   runAI(task, prompt)            — plain text response
 *   runAIStructured(task, prompt)  — JSON mode + Zod validation + retries
 *
 * Every call creates a Langfuse trace that captures:
 *   - task, model, provider (metadata)
 *   - prompt + response (generation)
 *   - token usage + latency (usage)
 *   - errors + retries (events)
 *
 * Flow:
 *   runAI*(task, prompt)
 *     → startTrace()               — open Langfuse trace
 *     → chooseModel(task)          — resolve ModelConfig from the router
 *     → callOpenRouter*(config)    — execute via the provider
 *     → logGeneration()            — record prompt/response/tokens
 *     → setTraceOutput() + flush   — finalize trace
 *     → return normalized result
 */

import type { ZodType } from "zod";
import { chooseModel } from "@/ai/router/modelRouter";
import {
  callOpenRouter,
  callOpenRouterStructured,
  ProviderError,
  type LLMResponse,
  type LLMStructuredResponse,
} from "@/ai/providers/openrouter";
import type { ModelConfig } from "@/ai/router/modelRouter";
import {
  startTrace,
  setTraceOutput,
  finishTrace,
  logGeneration,
  logScore,
  logError,
  type LangfuseTrace,
} from "@/lib/langfuse";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface RunAIOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  trace?: LangfuseTrace | null;
}

export interface RunAIResult {
  text: string;
  model: string;
  provider: string;
  task: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
}

// ---------------------------------------------------------------------------
// Structured types
// ---------------------------------------------------------------------------

export interface RunAIStructuredOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  maxRetries?: number;
  trace?: LangfuseTrace | null;
}

export interface RunAIStructuredResult<T> {
  data: T;
  rawText: string;
  model: string;
  provider: string;
  task: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  retryCount: number;
}

// ---------------------------------------------------------------------------
// Console logging
// ---------------------------------------------------------------------------

function logRequest(task: string, config: ModelConfig): void {
  console.log(
    `[runAI] task="${task}" provider="${config.provider}" model="${config.model}"`,
  );
}

function logSuccess(task: string, model: string, tokens: number, latencyMs: number): void {
  console.log(
    `[runAI] completed task="${task}" model="${model}" tokens=${tokens} latency=${latencyMs}ms`,
  );
}

function logRetry(task: string, attempt: number, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(
    `[runAI] retry task="${task}" attempt=${attempt} error="${message}"`,
  );
}

function logFailure(task: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[runAI] failed task="${task}" error="${message}"`);
}

function applyOverrides(config: ModelConfig, options: RunAIOptions): void {
  if (options.temperature !== undefined) config.temperature = options.temperature;
  if (options.maxTokens !== undefined) config.maxTokens = options.maxTokens;
}

// ---------------------------------------------------------------------------
// Langfuse helpers
// ---------------------------------------------------------------------------

function createRunTrace(
  task: string,
  config: ModelConfig,
  prompt: string,
  existingTrace?: LangfuseTrace | null,
  systemPrompt?: string,
): LangfuseTrace | null {
  if (existingTrace) {
    return existingTrace;
  }
  return startTrace(`runAI:${task}`, {
    task,
    model: config.model,
    provider: config.provider,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  }, {
    prompt,
    ...(systemPrompt && { systemPrompt }),
  });
}

async function traceGeneration(
  trace: LangfuseTrace | null,
  config: ModelConfig,
  prompt: string,
  systemPrompt: string | undefined,
  responseText: string,
  promptTokens: number,
  completionTokens: number,
  latencyMs: number,
): Promise<void> {
  await logGeneration(trace, {
    model: config.model,
    prompt,
    systemPrompt,
    response: responseText,
    inputTokens: promptTokens,
    outputTokens: completionTokens,
    latencyMs,
  });
}

// ---------------------------------------------------------------------------
// runAI — plain text
// ---------------------------------------------------------------------------

/**
 * Execute an LLM call and return plain text.
 *
 * Creates a Langfuse trace that captures the full request/response lifecycle.
 */
export async function runAI(
  task: string,
  prompt: string,
  options: RunAIOptions = {},
): Promise<RunAIResult> {
  const config = chooseModel(task);
  applyOverrides(config, options);
  logRequest(task, config);

  const trace = createRunTrace(
    task,
    config,
    prompt,
    options.trace,
    options.systemPrompt,
  );

  try {
    const response: LLMResponse = await callOpenRouter(
      config,
      prompt,
      options.systemPrompt,
    );

    logSuccess(task, response.model, response.totalTokens, response.latencyMs);

    await traceGeneration(
      trace,
      config,
      prompt,
      options.systemPrompt,
      response.text,
      response.promptTokens,
      response.completionTokens,
      response.latencyMs,
    );
    await logScore(trace, "latency_ms", response.latencyMs);
    if (!options.trace) {
      setTraceOutput(trace, { text: response.text });
    }

    return {
      text: response.text,
      model: response.model,
      provider: config.provider,
      task,
      promptTokens: response.promptTokens,
      completionTokens: response.completionTokens,
      totalTokens: response.totalTokens,
      latencyMs: response.latencyMs,
    };
  } catch (error) {
    logFailure(task, error);
    await logError(trace, error);
    await logScore(trace, "success", 0);
    throw error;
  } finally {
    await finishTrace(trace);
  }
}

// ---------------------------------------------------------------------------
// runAIStructured — JSON mode + Zod validation + retries
// ---------------------------------------------------------------------------

const DEFAULT_MAX_RETRIES = 2;

/**
 * Execute an LLM call, parse as JSON, and validate with a Zod schema.
 *
 * Creates a single Langfuse trace that wraps all retry attempts. Each attempt
 * is logged as a generation; failures are logged as error events. The final
 * successful output (or terminal failure) is set as the trace output.
 *
 * @example
 * ```ts
 * const result = await runAIStructured("extraction", prompt, MySchema, {
 *   systemPrompt: SYSTEM_PROMPT,
 * });
 * console.log(result.data); // typed, validated object
 * ```
 */
export async function runAIStructured<T>(
  task: string,
  prompt: string,
  schema: ZodType<T>,
  options: RunAIStructuredOptions = {},
): Promise<RunAIStructuredResult<T>> {
  const config = chooseModel(task);
  applyOverrides(config, options);
  logRequest(task, config);

  const trace = createRunTrace(
    task,
    config,
    prompt,
    options.trace,
    options.systemPrompt,
  );
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  let lastError: unknown = null;

  try {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response: LLMStructuredResponse<T> = await callOpenRouterStructured(
          config,
          prompt,
          schema,
          options.systemPrompt,
        );

        logSuccess(task, response.model, response.totalTokens, response.latencyMs);

        await traceGeneration(
          trace,
          config,
          prompt,
          options.systemPrompt,
          response.rawText,
          response.promptTokens,
          response.completionTokens,
          response.latencyMs,
        );
        await logScore(trace, "latency_ms", response.latencyMs);
        await logScore(trace, "structured_output_valid", 1);
        await logScore(trace, "retry_count", attempt);
        if (!options.trace) {
          setTraceOutput(trace, response.data);
        }

        return {
          data: response.data,
          rawText: response.rawText,
          model: response.model,
          provider: config.provider,
          task,
          promptTokens: response.promptTokens,
          completionTokens: response.completionTokens,
          totalTokens: response.totalTokens,
          latencyMs: response.latencyMs,
          retryCount: attempt,
        };
      } catch (error) {
        lastError = error;
        await logError(trace, error);
        if (attempt < maxRetries - 1) {
          logRetry(task, attempt + 1, error);
          await logScore(trace, "structured_output_valid", 0);
        }
      }
    }

    logFailure(task, lastError);
    await logScore(trace, "success", 0);
    throw lastError instanceof Error
      ? lastError
      : new Error(`runAIStructured failed for task "${task}" after ${maxRetries} attempts`);
  } finally {
    await finishTrace(trace);
  }
}

// Re-export for convenience
export { ProviderError } from "@/ai/providers/openrouter";
