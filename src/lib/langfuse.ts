/**
 * Langfuse observability utilities.
 *
 * Provides:
 * - A singleton Langfuse client configured from environment variables
 * - Helper functions to start/finish traces and log generations/scores/errors
 *
 * This module is designed for server-side usage only (API routes, server actions,
 * background jobs). Do not import it into Client Components.
 */

import { Langfuse, type LangfuseOptions } from "langfuse";

const LANGFUSE_WORKFLOW_TAG = "crypto-ai-platform";

let langfuseClient: Langfuse | null = null;

export type LangfuseTrace = ReturnType<Langfuse["trace"]>;

function createLangfuseClient(): Langfuse | null {
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  // Support both LANGFUSE_HOST and LANGFUSE_BASE_URL (docs use either).
  const host =
    process.env.LANGFUSE_HOST ??
    process.env.LANGFUSE_BASE_URL ??
    "https://cloud.langfuse.com";

  if (!publicKey || !secretKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Langfuse] Disabled: set LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY in .env.local to enable tracing.",
      );
    }
    return null;
  }

  const options: LangfuseOptions = {
    publicKey,
    secretKey,
    baseUrl: host,
  };

  return new Langfuse(options);
}

export function getLangfuse(): Langfuse | null {
  if (!langfuseClient) {
    langfuseClient = createLangfuseClient();
  }
  return langfuseClient;
}

export interface GenerationLogInput {
  model: string;
  /** User prompt (or full prompt if no system). */
  prompt: string;
  /** Optional system prompt; when set, generation input is sent as { system, user } for full visibility. */
  systemPrompt?: string;
  response: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

/**
 * Start a Langfuse trace for an AI workflow.
 *
 * - traceInput: workflow business input (shown as trace.input in Langfuse UI).
 * - metadata: optional extra key-value metadata.
 *
 * Returns the TraceClient or null if Langfuse is not configured.
 */
export function startTrace(
  workflowName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>,
  traceInput?: unknown,
): LangfuseTrace | null {
  const client = getLangfuse();
  if (!client) return null;

  const trace = client.trace({
    name: workflowName,
    tags: [LANGFUSE_WORKFLOW_TAG, workflowName],
    metadata,
    ...(traceInput !== undefined && { input: traceInput }),
  });

  return trace;
}

/**
 * Set trace-level output (final validated result) so it appears on the root trace in Langfuse UI.
 * Call this before finishTrace when the workflow completes successfully.
 */
export function setTraceOutput(
  trace: LangfuseTrace | null,
  output: unknown,
): void {
  if (!trace) return;
  const t = trace as { update?: (body: { output?: unknown }) => void };
  if (typeof t.update === "function") {
    t.update({ output });
  }
}

/**
 * Log a model generation (prompt/response) under a trace.
 */
export async function logGeneration(
  trace: LangfuseTrace | null,
  details: GenerationLogInput,
): Promise<void> {
  if (!trace) return;

  const { model, prompt, response, inputTokens, outputTokens, latencyMs } =
    details;
  const systemPrompt = details.systemPrompt;

  trace.generation({
    name: "generation",
    model,
    input:
      systemPrompt !== undefined
        ? { system: systemPrompt, user: prompt }
        : prompt,
    output: response,
    usage: {
      input: inputTokens,
      output: outputTokens,
      total: inputTokens + outputTokens,
    },
  });
}

/**
 * Log a numeric score (e.g. confidence, quality rating) for the trace.
 */
export async function logScore(
  trace: LangfuseTrace | null,
  name: string,
  value: number,
): Promise<void> {
  if (!trace) return;
  trace.score({
    name,
    value,
  });
}

/**
 * Attach an error to the trace.
 */
export async function logError(
  trace: LangfuseTrace | null,
  error: unknown,
): Promise<void> {
  if (!trace) return;
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error";
  trace.event({
    name: "error",
    input: { message },
  });
}

/**
 * Finish a trace and flush events to Langfuse.
 *
 * Should be awaited at the end of a request or workflow.
 * In serverless/short-lived environments, consider also calling flushLangfuse() or shutdownLangfuse().
 */
export async function finishTrace(trace: LangfuseTrace | null): Promise<void> {
  const client = getLangfuse();
  if (!client || !trace) return;
  try {
    await client.flushAsync();
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Langfuse] flushAsync failed:", e);
    }
    // Swallow in production to avoid impacting main request path.
  }
}

/**
 * Flush Langfuse client (e.g. at end of serverless invocation).
 * Safe to call even when Langfuse is not configured.
 */
export async function flushLangfuse(): Promise<void> {
  const client = getLangfuse();
  if (!client) return;
  try {
    await client.flushAsync();
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Langfuse] flushAsync failed:", e);
    }
  }
}

/**
 * Shutdown Langfuse client and flush remaining events.
 * Use in serverless or before process exit when you need delivery guarantee.
 */
export async function shutdownLangfuse(): Promise<void> {
  const client = getLangfuse();
  if (!client) return;
  try {
    await client.shutdownAsync();
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Langfuse] shutdownAsync failed:", e);
    }
  }
}

