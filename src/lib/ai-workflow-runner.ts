/**
 * Generic AI workflow runner for all LLM-based workflows.
 *
 * Handles in one place:
 * - Langfuse trace (with trace input/output visible in UI)
 * - LLM execution via ai-client
 * - Structured output validation (zod)
 * - Retries and optional fallback model
 * - Token usage, latency, scores, error logging
 *
 * Use this for: market_brief, token_analysis, ask_market, narrative_detection, etc.
 */

import { type ZodType } from "zod";
import { callStructuredJson } from "@/lib/ai-client";
import {
  startTrace,
  setTraceOutput,
  finishTrace,
  logScore,
  logError,
} from "@/lib/langfuse";

export interface RunStructuredWorkflowParams<T> {
  /** Workflow name (e.g. "market_brief", "token_analysis"). Used for trace name and tags. */
  workflowName: string;
  /** Model id (e.g. "gpt-4.1-mini"). */
  model: string;
  /** User prompt (full content). */
  prompt: string;
  /** Optional system prompt. */
  systemPrompt?: string;
  /** Workflow business input — set as trace.input in Langfuse. */
  traceInput: unknown;
  /** Zod schema for validating the LLM JSON output. */
  schema: ZodType<T>;
  /** Optional metadata merged into the trace. */
  metadata?: Record<string, unknown>;
  /** Fallback model to try if the primary model fails validation. */
  fallbackModel?: string;
  /** Custom scores to log on success (e.g. source_presence, confidence_score). Can be a function of output. */
  customScores?: Record<string, number> | ((output: T) => Record<string, number>);
  /** Max LLM attempts (validation or parse failure). Default 2. */
  maxRetries?: number;
  /** Temperature for the LLM call. Default 0.2. */
  temperature?: number;
}

export interface RunStructuredWorkflowResult<T> {
  /** Validated structured output, or null on failure. */
  output: T | null;
  /** Raw model response text. */
  rawOutput: string;
  success: boolean;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  model: string;
  retryCount: number;
  /** Set when success is false. */
  error?: unknown;
}

const DEFAULT_MAX_RETRIES = 2;

/**
 * Run an AI workflow with tracing, validation, retries, and optional fallback model.
 *
 * - Starts a Langfuse trace with traceInput as trace.input.
 * - Calls the LLM (with retries); each attempt is logged as a generation (via ai-client).
 * - Validates response with zod; on success sets trace.output to the validated JSON and logs scores.
 * - On failure logs structured_output_valid = 0 and error, then retries or finishes.
 */
export async function runStructuredWorkflow<T>(
  params: RunStructuredWorkflowParams<T>,
): Promise<RunStructuredWorkflowResult<T>> {
  const {
    workflowName,
    model: primaryModel,
    prompt,
    systemPrompt,
    traceInput,
    schema,
    metadata,
    fallbackModel,
    customScores,
    maxRetries = DEFAULT_MAX_RETRIES,
    temperature = 0.2,
  } = params;

  const trace = startTrace(workflowName, metadata as Record<string, unknown> | undefined, traceInput);
  // When Langfuse is disabled, trace is null; setTraceOutput/logScore/logError/finishTrace no-op.

  let lastError: unknown = null;
  let attempt = 0;
  let rawOutput = "";
  let latencyMs = 0;
  let inputTokens = 0;
  let outputTokens = 0;
  let modelUsed = primaryModel;

  try {
    while (attempt < maxRetries) {
      const model = attempt === 0 ? primaryModel : fallbackModel ?? primaryModel;
      try {
        const result = await callStructuredJson<T>({
          model,
          systemPrompt,
          userPrompt: prompt,
          schema,
          trace,
          temperature,
        });

        rawOutput = result.rawText;
        latencyMs = result.latencyMs;
        inputTokens = result.usage.promptTokens;
        outputTokens = result.usage.completionTokens;
        modelUsed = result.model;

        // Success: set trace output and log scores
        setTraceOutput(trace, result.data);
        await logScore(trace, "structured_output_valid", 1);

        let scores: Record<string, number> | undefined;
        try {
          scores =
            typeof customScores === "function"
              ? customScores(result.data)
              : customScores;
        } catch (scoreErr) {
          await logError(trace, scoreErr);
          scores = undefined;
        }
        if (scores && typeof scores === "object") {
          for (const [name, value] of Object.entries(scores)) {
            await logScore(trace, name, value);
          }
        }

        return {
          output: result.data,
          rawOutput: result.rawText,
          success: true,
          latencyMs: result.latencyMs,
          inputTokens: result.usage.promptTokens,
          outputTokens: result.usage.completionTokens,
          model: result.model,
          retryCount: attempt,
        };
      } catch (err) {
        lastError = err;
        await logScore(trace, "structured_output_valid", 0);
        await logError(trace, err);
      }
      attempt += 1;
    }

    // All attempts failed
    return {
      output: null,
      rawOutput,
      success: false,
      latencyMs,
      inputTokens,
      outputTokens,
      model: modelUsed,
      retryCount: attempt,
      error: lastError ?? undefined,
    };
  } finally {
    await finishTrace(trace);
  }
}
