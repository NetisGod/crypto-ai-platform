import { runAI, runAIStructured } from "@/ai/runner/runAI";
import { AskAiResponseSchema } from "@/ai/schemas/askAi";
import type { AskAiResponse } from "@/ai/schemas/askAi";
import { detectAskAiIntent } from "@/services/ai/intent-detector";
import { buildAskContext } from "@/services/ai/build-ask-context";
import type { AskAiContext } from "@/services/ai/build-ask-context";

// ─── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a crypto market analyst assistant for an AI-powered trading intelligence platform.

Rules:
- Answer using ONLY the platform context provided in the user message.
- Be concise, factual, and specific. No filler phrases.
- If the provided context is insufficient to answer confidently, say so clearly in the answer field.
- Do not invent prices, news, or market data not present in the context.
- Do not provide financial guarantees, investment advice, or price predictions.
- Confidence should reflect how well the supplied context supports the answer (0.0 = no data, 1.0 = strong data).

You must return a JSON object with exactly these fields:
{
  "answer": "string — main answer paragraph",
  "intent": "one of: token_analysis | market_summary | top_movers | news_summary | general_market_question",
  "drivers": ["array of key factors driving the answer"],
  "risks": ["array of risks or caveats"],
  "sources": ["array from: market-data, news, top-movers, narratives, ai-inference"],
  "confidence": 0.0 to 1.0
}`;

const KNOWN_SOURCES = [
  "market-data",
  "news",
  "top-movers",
  "narratives",
  "ai-inference",
] as const;

type KnownSource = (typeof KNOWN_SOURCES)[number];

// ─── Prompt builder ────────────────────────────────────────────────────────────

function buildPrompt(context: AskAiContext): string {
  const lines: string[] = [];

  lines.push(`USER QUESTION: ${context.question}`);
  lines.push(`DETECTED INTENT: ${context.intent}`);

  if (context.token) {
    lines.push(`TOKEN OF INTEREST: ${context.token}`);
  }

  if (context.market.prices.length > 0) {
    lines.push("\nMARKET PRICES:");
    for (const p of context.market.prices) {
      const change = p.priceChangePercentage24h >= 0
        ? `+${p.priceChangePercentage24h.toFixed(2)}%`
        : `${p.priceChangePercentage24h.toFixed(2)}%`;
      lines.push(
        `  ${p.symbol} (${p.name}): $${p.currentPrice.toLocaleString()} | 24h: ${change} | Vol: $${(p.volume24h / 1_000_000).toFixed(0)}M`,
      );
    }
  } else {
    lines.push("\nMARKET PRICES: unavailable");
  }

  if (context.topMovers && context.topMovers.length > 0) {
    lines.push("\nTOP MOVERS (24h):");
    const sorted = [...context.topMovers].sort(
      (a, b) => Math.abs(b.priceChangePercentage24h) - Math.abs(a.priceChangePercentage24h),
    );
    for (const m of sorted) {
      const change = m.priceChangePercentage24h >= 0
        ? `+${m.priceChangePercentage24h.toFixed(2)}%`
        : `${m.priceChangePercentage24h.toFixed(2)}%`;
      lines.push(`  ${m.symbol}: ${change}`);
    }
  }

  if (context.news && context.news.length > 0) {
    lines.push("\nRECENT NEWS:");
    for (const item of context.news) {
      lines.push(`  [${item.source}] ${item.title} (${item.published_at.slice(0, 10)})`);
    }
  } else {
    lines.push("\nRECENT NEWS: unavailable");
  }

  // Future: narratives context will be injected here when the narratives layer ships
  // if (context.narratives && context.narratives.length > 0) { ... }

  lines.push("\nAnswer the user question using only the context above. Return valid JSON.");

  return lines.join("\n");
}

// ─── Fallback response ─────────────────────────────────────────────────────────

function buildFallback(
  intent: AskAiResponse["intent"],
  context?: AskAiContext,
): AskAiResponse {
  const fallbackSources = deriveSourcesFromContext(context);
  if (!fallbackSources.includes("ai-inference")) fallbackSources.push("ai-inference");

  return {
    answer:
      "I could not fully structure a reliable answer from the current platform context. " +
      "Some market or news inputs may be missing, so treat this as low-confidence guidance and retry shortly.",
    intent,
    drivers: [],
    risks: [
      "Limited or unavailable platform context",
      "AI output could not be safely normalized",
    ],
    sources: fallbackSources,
    confidence: 0.2,
  };
}

function clampConfidence(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(1, value));
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function normalizeSource(value: string): KnownSource | null {
  const v = value.toLowerCase().trim().replace(/[_\s]+/g, "-");

  if (v.includes("market")) return "market-data";
  if (v.includes("news") || v.includes("headline")) return "news";
  if (v.includes("top") || v.includes("mover") || v.includes("gainer") || v.includes("loser")) {
    return "top-movers";
  }
  if (v.includes("narrative")) return "narratives";
  if (v.includes("ai") || v.includes("model") || v.includes("inference")) return "ai-inference";

  return null;
}

function deriveSourcesFromContext(context?: AskAiContext): KnownSource[] {
  const sources: KnownSource[] = [];
  if (!context) return ["ai-inference"];

  if (context.market.prices.length > 0) sources.push("market-data");
  if ((context.news?.length ?? 0) > 0) sources.push("news");
  if ((context.topMovers?.length ?? 0) > 0) sources.push("top-movers");
  if ((context.narratives?.length ?? 0) > 0) sources.push("narratives");
  if (sources.length === 0) sources.push("ai-inference");
  return sources;
}

function normalizeSources(
  rawSources: unknown,
  context?: AskAiContext,
  includeAiInference: boolean = false,
): KnownSource[] {
  const input = toStringArray(rawSources);
  const normalized = input
    .map(normalizeSource)
    .filter((source): source is KnownSource => source !== null);

  const merged = normalized.length > 0 ? normalized : deriveSourcesFromContext(context);
  if (includeAiInference && !merged.includes("ai-inference")) {
    merged.push("ai-inference");
  }
  return [...new Set(merged)];
}

function extractJsonCandidate(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced && fenced[1]) return fenced[1].trim();

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1).trim();
  }

  return null;
}

function safeParseJson(text: string): unknown | null {
  const direct = text.trim();
  if (!direct) return null;

  try {
    return JSON.parse(direct);
  } catch {
    // Fall through to extracted JSON block parsing.
  }

  const extracted = extractJsonCandidate(text);
  if (!extracted) return null;

  try {
    return JSON.parse(extracted);
  } catch {
    return null;
  }
}

function normalizeResponse(
  value: unknown,
  intent: AskAiResponse["intent"],
  context?: AskAiContext,
  includeAiInference: boolean = false,
): AskAiResponse {
  if (typeof value !== "object" || value === null) {
    return buildFallback(intent, context);
  }

  const raw = value as Record<string, unknown>;
  const answer =
    typeof raw.answer === "string" && raw.answer.trim().length > 0
      ? raw.answer.trim()
      : "I do not have enough structured context to provide a high-confidence answer.";

  const drivers = toStringArray(raw.drivers);
  const risks = toStringArray(raw.risks);
  const sources = normalizeSources(raw.sources, context, includeAiInference);
  const confidence = clampConfidence(raw.confidence, 0.25);

  const normalized: AskAiResponse = {
    answer,
    intent,
    drivers,
    risks,
    sources,
    confidence,
  };

  const parsed = AskAiResponseSchema.safeParse(normalized);
  return parsed.success ? parsed.data : buildFallback(intent, context);
}

// ─── Main export ───────────────────────────────────────────────────────────────

export async function askAI(question: string): Promise<AskAiResponse> {
  // [Observability hook #1] Trace start point:
  // Create a feature-level trace/span here (e.g., "ask_ai_request") if we later
  // want end-to-end visibility beyond the lower-level runAI/runAIStructured traces.
  const requestStartedAt = Date.now();

  const intent = detectAskAiIntent(question);
  const context = await buildAskContext(question, intent);
  const prompt = buildPrompt(context);

  // [Observability hook #2] Context metadata attachment point:
  // This is where we can attach lightweight request metadata to a future trace/log:
  // - intent
  // - token extracted vs not extracted
  // - market/news/top-movers item counts
  // - prompt length (chars/tokens estimate)
  // Keep payloads summarized; avoid logging full raw context by default.
  const contextMeta = {
    intent,
    token: context.token ?? null,
    marketCount: context.market.prices.length,
    topMoversCount: context.topMovers?.length ?? 0,
    newsCount: context.news?.length ?? 0,
    narrativesCount: context.narratives?.length ?? 0,
    promptChars: prompt.length,
  };
  void requestStartedAt;
  void contextMeta;

  try {
    const result = await runAIStructured(
      "reasoning",
      prompt,
      AskAiResponseSchema,
      { systemPrompt: SYSTEM_PROMPT },
    );

    // Ensure the returned intent matches what we detected — model may hallucinate
    const normalized = normalizeResponse({ ...result.data, intent }, intent, context);

    // [Observability hook #3] Response metadata logging point:
    // In a future integration, log:
    // - success/fallback status
    // - latency (Date.now() - requestStartedAt)
    // - confidence
    // - sources used
    // - list lengths (drivers/risks)
    // Example: logAskAiRun({ ...contextMeta, latencyMs, confidence, sources, success: true })
    void normalized;

    return normalized;
  } catch (structuredError) {
    console.warn("[askAI] structured generation failed, attempting safe JSON parsing");

    try {
      const raw = await runAI("reasoning", prompt, { systemPrompt: SYSTEM_PROMPT });
      const parsed = safeParseJson(raw.text);
      if (!parsed) {
        const fallback = buildFallback(intent, context);
        // [Observability hook #3] Response metadata logging point (fallback path)
        // Example: logAskAiRun({ ...contextMeta, latencyMs, success: false, fallback: true })
        void fallback;
        return fallback;
      }
      const normalized = normalizeResponse(parsed, intent, context, true);
      // [Observability hook #3] Response metadata logging point (raw parse recovery path)
      void normalized;
      return normalized;
    } catch (rawError) {
      console.error("[askAI] fallback generation failed:", structuredError, rawError);
      const fallback = buildFallback(intent, context);
      // [Observability hook #3] Response metadata logging point (terminal fallback path)
      void fallback;
      return fallback;
    }
  }
}
