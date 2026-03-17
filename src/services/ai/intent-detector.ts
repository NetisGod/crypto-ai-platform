import type { AskAiIntent } from "@/ai/schemas/askAi";
import { ASK_AI_TOKENS } from "@/services/ai/ask-ai-constants";

type IntentRule = {
  intent: AskAiIntent;
  /**
   * Multi-word phrases are matched with plain substring matching.
   * Single-word keywords use whole-word boundary matching to avoid false positives
   * (e.g. "op" should not match "opportunity", "apt" should not match "apparently").
   */
  keywords: string[];
};

const INTENT_RULES: IntentRule[] = [
  {
    intent: "top_movers",
    keywords: [
      "top mover",
      "top movers",
      "biggest gainer",
      "biggest gainers",
      "biggest loser",
      "biggest losers",
      "best performing",
      "worst performing",
      "gainer",
      "gainers",
      "loser",
      "losers",
      "pumping",
      "dumping",
    ],
  },
  {
    intent: "market_summary",
    keywords: [
      "summarize the market",
      "market summary",
      "market overview",
      "market today",
      "what happened today",
      "what happened in crypto",
      "crypto today",
      "overall market",
      "how is the market",
      "market sentiment",
      "market conditions",
    ],
  },
  {
    intent: "news_summary",
    keywords: [
      "latest news",
      "latest crypto news",
      "crypto news",
      "trending stories",
      "what's new",
      "whats new",
      "recent news",
      "headlines",
      "news",
    ],
  },
  {
    intent: "token_analysis",
    keywords: [
      // Behavioral phrases — multi-word, safe to substring-match
      "why is",
      "why did",
      "what about",
      "tell me about",
      "what is happening with",
      "what's happening with",
      "whats happening with",
      "should i watch",
      "should i buy",
      "price of",
      // Single-word behavioral keywords — short, whole-word matched in detectAskAiIntent
      "analyze",
      "analysis",
      // Token symbols — injected from shared constants at module load
      ...ASK_AI_TOKENS.map((t) => t.toLowerCase()),
    ],
  },
];

// ─── Matching helpers ─────────────────────────────────────────────────────────

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Tests whether a normalized question matches a given keyword.
 *
 * - Multi-word phrases: plain substring match (safe — phrase context prevents false positives).
 * - Single words: whole-word boundary match (\b) to avoid short-symbol false positives
 *   (e.g. "op" not matching "opportunity", "apt" not matching "apparently").
 */
function matchesKeyword(normalized: string, keyword: string): boolean {
  if (keyword.includes(" ")) {
    return normalized.includes(keyword);
  }
  const pattern = new RegExp(`\\b${escapeRegex(keyword)}\\b`);
  return pattern.test(normalized);
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function detectAskAiIntent(question: string): AskAiIntent {
  // Strip punctuation to avoid matching failures like "BTC?" → "btc?"
  const normalized = question
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  for (const rule of INTENT_RULES) {
    const matched = rule.keywords.some((kw) => matchesKeyword(normalized, kw.toLowerCase()));
    if (matched) return rule.intent;
  }

  return "general_market_question";
}
