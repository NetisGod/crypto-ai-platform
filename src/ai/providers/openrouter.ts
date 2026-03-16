/**
 * OpenRouter provider adapter.
 *
 * Uses the OpenAI SDK pointed at OpenRouter's base URL, since the API
 * is fully compatible with the OpenAI chat completions format.
 *
 * Env: OPENROUTER_API_KEY
 */

import OpenAI from "openai";
import type { ZodType } from "zod";
import type { ModelConfig } from "@/ai/router/modelRouter";

// ---------------------------------------------------------------------------
// Normalized responses — shared shapes that runAI consumes from any provider
// ---------------------------------------------------------------------------

export interface LLMResponse {
  text: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
}

export interface LLMStructuredResponse<T> {
  data: T;
  rawText: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
}

// ---------------------------------------------------------------------------
// Provider errors
// ---------------------------------------------------------------------------

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly statusCode?: number,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (_client) return _client;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new ProviderError(
      "OPENROUTER_API_KEY environment variable is not set",
      "openrouter",
    );
  }

  _client = new OpenAI({
    apiKey,
    baseURL: OPENROUTER_BASE_URL,
    defaultHeaders: {
      "X-Title": "crypto-ai-platform",
      "HTTP-Referer": "https://crypto-ai-platform.local",
    },
  });

  return _client;
}

// ---------------------------------------------------------------------------
// callOpenRouter — main entry point
// ---------------------------------------------------------------------------

/**
 * Send a chat completion request through OpenRouter and return a normalized
 * `LLMResponse` that `runAI` can consume directly.
 *
 * @param config  - ModelConfig from the router (model, temperature, maxTokens)
 * @param prompt  - User message content
 * @param systemPrompt - Optional system message to steer model behavior
 */
export async function callOpenRouter(
  config: ModelConfig,
  prompt: string,
  systemPrompt?: string,
): Promise<LLMResponse> {
  const client = getClient();
  const startMs = Date.now();

  const messages: OpenAI.ChatCompletionMessageParam[] = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  try {
    const response = await client.chat.completions.create({
      model: config.model,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      messages,
    });

    const latencyMs = Date.now() - startMs;
    const choice = response.choices?.[0];

    if (!choice?.message?.content) {
      throw new ProviderError(
        "OpenRouter returned an empty response",
        "openrouter",
      );
    }

    return {
      text: choice.message.content,
      model: response.model ?? config.model,
      promptTokens: response.usage?.prompt_tokens ?? 0,
      completionTokens: response.usage?.completion_tokens ?? 0,
      totalTokens: response.usage?.total_tokens ?? 0,
      latencyMs,
    };
  } catch (error) {
    if (error instanceof ProviderError) throw error;

    const statusCode =
      error instanceof OpenAI.APIError ? error.status : undefined;

    throw new ProviderError(
      `OpenRouter request failed: ${error instanceof Error ? error.message : String(error)}`,
      "openrouter",
      statusCode,
      error,
    );
  }
}

// ---------------------------------------------------------------------------
// callOpenRouterStructured — JSON mode + Zod validation
// ---------------------------------------------------------------------------

const WRAPPER_KEYS = ["data", "result", "output", "brief", "market_brief"];

/**
 * Send a structured JSON request through OpenRouter and validate with Zod.
 *
 * Uses `response_format: { type: "json_object" }` to force JSON output,
 * then parses and validates against the provided schema. Handles cases where
 * models wrap the payload under a common key.
 */
export async function callOpenRouterStructured<T>(
  config: ModelConfig,
  prompt: string,
  schema: ZodType<T>,
  systemPrompt?: string,
): Promise<LLMStructuredResponse<T>> {
  const client = getClient();
  const startMs = Date.now();

  const messages: OpenAI.ChatCompletionMessageParam[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  try {
    const response = await client.chat.completions.create({
      model: config.model,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      response_format: { type: "json_object" },
      messages,
    });

    const latencyMs = Date.now() - startMs;
    const choice = response.choices?.[0];
    const rawText = choice?.message?.content ?? "";

    if (!rawText) {
      throw new ProviderError(
        "OpenRouter returned an empty response",
        "openrouter",
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new ProviderError(
        `OpenRouter returned invalid JSON: ${rawText.slice(0, 200)}`,
        "openrouter",
      );
    }

    let data: T;
    try {
      data = schema.parse(parsed);
    } catch (firstError) {
      let unwrapped: T | null = null;
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
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
      if (unwrapped === null) throw firstError;
      data = unwrapped;
    }

    return {
      data,
      rawText,
      model: response.model ?? config.model,
      promptTokens: response.usage?.prompt_tokens ?? 0,
      completionTokens: response.usage?.completion_tokens ?? 0,
      totalTokens: response.usage?.total_tokens ?? 0,
      latencyMs,
    };
  } catch (error) {
    if (error instanceof ProviderError) throw error;

    const statusCode =
      error instanceof OpenAI.APIError ? error.status : undefined;

    throw new ProviderError(
      `OpenRouter structured request failed: ${error instanceof Error ? error.message : String(error)}`,
      "openrouter",
      statusCode,
      error,
    );
  }
}
