/**
 * Central AI client abstraction for LLM calls.
 *
 * Features:
 * - Model selection
 * - Structured JSON responses (zod-validated)
 * - Token usage extraction
 * - Latency measurement
 * - Langfuse logging (prompt, response, model, tokens, latency)
 *
 * Server-side only: do not import into Client Components.
 */

import OpenAI from "openai";
import { z, type ZodType } from "zod";
import { logError, logGeneration, type LangfuseTrace } from "@/lib/langfuse";

const DEFAULT_MODEL = "gpt-4.1-mini";

function getOpenAIClient(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is required for AI client");
  }
  return new OpenAI({ apiKey: key });
}

export interface AiUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AiStructuredResult<T> {
  data: T;
  model: string;
  usage: AiUsage;
  latencyMs: number;
  rawText: string;
}

export interface AiStructuredParams<T> {
  /** Target model (e.g. gpt-4.1-mini). Defaults to gpt-4.1-mini. */
  model?: string;
  /** Optional system prompt to steer model behavior. */
  systemPrompt?: string;
  /** User prompt content (already assembled string). */
  userPrompt: string;
  /** Zod schema for validating the structured JSON output. */
  schema: ZodType<T>;
  /** Optional Langfuse trace to attach logging to. */
  trace?: LangfuseTrace | null;
  /** Sampling temperature (default 0.2). */
  temperature?: number;
}

/**
 * Call the LLM and return a structured JSON object validated by zod.
 * - Uses OpenAI Chat Completions with response_format: json_object
 * - Validates the JSON against the provided schema
 * - Extracts token usage and measures latency
 * - Logs generation details to Langfuse (if a trace is provided)
 */
export async function callStructuredJson<T>(
  params: AiStructuredParams<T>,
): Promise<AiStructuredResult<T>> {
  const {
    model = DEFAULT_MODEL,
    systemPrompt,
    userPrompt,
    schema,
    trace,
    temperature = 0.2,
  } = params;

  const client = getOpenAIClient();
  const startedAt = Date.now();

  try {
    const response = await client.chat.completions.create({
      model,
      temperature,
      response_format: { type: "json_object" },
      messages: [
        ...(systemPrompt
          ? [
              {
                role: "system" as const,
                content: systemPrompt,
              },
            ]
          : []),
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const latencyMs = Date.now() - startedAt;
    const choice = response.choices[0];
    const rawText = choice?.message?.content ?? "";

    const usage: AiUsage = {
      promptTokens: response.usage?.prompt_tokens ?? 0,
      completionTokens: response.usage?.completion_tokens ?? 0,
      totalTokens: response.usage?.total_tokens ?? 0,
    };

    // Langfuse logging (best-effort).
    await logGeneration(trace ?? null, {
      model,
      prompt: userPrompt,
      systemPrompt,
      response: rawText,
      inputTokens: usage.promptTokens,
      outputTokens: usage.completionTokens,
      latencyMs,
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      await logError(trace ?? null, err);
      throw new Error(`Failed to parse model JSON: ${err.message}`);
    }

    // Try top-level first; if the model wrapped the payload, try common keys.
    const WRAPPER_KEYS = ["market_brief", "brief", "data", "result", "output"];
    let data: T;
    try {
      data = schema.parse(parsed);
    } catch (firstError) {
      let unwrapped: T | null = null;
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        const obj = parsed as Record<string, unknown>;
        for (const key of WRAPPER_KEYS) {
          if (key in obj && typeof obj[key] === "object") {
            try {
              unwrapped = schema.parse(obj[key]) as T;
              break;
            } catch {
              continue;
            }
          }
        }
      }
      if (unwrapped === null) {
        throw firstError;
      }
      data = unwrapped;
    }

    return {
      data,
      model,
      usage,
      latencyMs,
      rawText,
    };
  } catch (e) {
    await logError(trace ?? null, e);
    throw e;
  }
}

/**
 * Simple convenience helper for unstructured text responses while still
 * tracking usage and latency via the same abstraction.
 */
export async function callText(
  params: Omit<AiStructuredParams<string>, "schema">,
): Promise<AiStructuredResult<string>> {
  const textSchema = z.string();
  return callStructuredJson<string>({ ...params, schema: textSchema });
}

