import { fetchCurrentPrices } from "@/services/market/binance";
import type { CurrentPrice } from "@/services/market/types";
import { getLatestNews } from "@/services/news/getLatestNews";
import type { NewsItem } from "@/services/news/getLatestNews";
import type { AskAiIntent } from "@/ai/schemas/askAi";
import { ASK_AI_TOKENS } from "@/services/ai/ask-ai-constants";

// ─── Narrative placeholder type ───────────────────────────────────────────────
// Typed as a minimal shape now so future integration doesn't require consumers
// to add type guards. Extend this type when the narratives layer ships.

export type NarrativeContext = {
  name: string;
  strength?: number; // 0..1
  trend?: "rising" | "stable" | "falling";
  sentiment?: "positive" | "neutral" | "negative";
};

// ─── Context shape ────────────────────────────────────────────────────────────

export type AskAiContext = {
  question: string;
  intent: AskAiIntent;
  token?: string;
  market: {
    prices: CurrentPrice[];
  };
  topMovers?: CurrentPrice[]; // Extension point: replace with real top-movers service when available
  news?: NewsItem[];
  narratives?: NarrativeContext[]; // Extension point: inject narrative context when that layer ships
};

// ─── Token extraction ─────────────────────────────────────────────────────────

function extractTokenSymbol(question: string): string | undefined {
  const normalized = question.toUpperCase();
  return ASK_AI_TOKENS.find((token) => {
    // Match whole word only to avoid false positives (e.g. "NEAR" in "nearly")
    const regex = new RegExp(`\\b${token}\\b`);
    return regex.test(normalized);
  });
}

// ─── Context assembly by intent ───────────────────────────────────────────────

async function fetchPricesSafe(): Promise<CurrentPrice[]> {
  try {
    return await fetchCurrentPrices();
  } catch {
    return [];
  }
}

async function fetchNewsSafe(limit: number): Promise<NewsItem[]> {
  try {
    return await getLatestNews(limit);
  } catch {
    return [];
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function buildAskContext(
  question: string,
  intent: AskAiIntent,
): Promise<AskAiContext> {
  const token = extractTokenSymbol(question);

  switch (intent) {
    case "token_analysis": {
      const [prices, news] = await Promise.all([
        fetchPricesSafe(),
        fetchNewsSafe(5),
      ]);

      // Filter news to token-relevant items if a token was extracted
      const relevantNews = token
        ? news.filter((n) =>
            n.title.toUpperCase().includes(token) ||
            n.source.toUpperCase().includes(token),
          )
        : news;

      return {
        question,
        intent,
        token,
        market: { prices },
        news: relevantNews.length > 0 ? relevantNews : news,
        // Future: inject narratives filtered by token here
        narratives: [],
      };
    }

    case "market_summary": {
      const [prices, news] = await Promise.all([
        fetchPricesSafe(),
        fetchNewsSafe(5),
      ]);

      return {
        question,
        intent,
        market: { prices },
        // Future: replace with real top-movers service when available
        topMovers: prices,
        news,
        // Future: inject active market narratives here
        narratives: [],
      };
    }

    case "top_movers": {
      const prices = await fetchPricesSafe();

      return {
        question,
        intent,
        market: { prices },
        // Future: replace with dedicated top-movers service returning broader asset list
        topMovers: prices,
      };
    }

    case "news_summary": {
      const [prices, news] = await Promise.all([
        fetchPricesSafe(),
        fetchNewsSafe(8),
      ]);

      return {
        question,
        intent,
        market: { prices },
        news,
      };
    }

    case "general_market_question":
    default: {
      const [prices, news] = await Promise.all([
        fetchPricesSafe(),
        fetchNewsSafe(5),
      ]);

      return {
        question,
        intent,
        token,
        market: { prices },
        news,
        // Future: inject narratives context here for richer general answers
        narratives: [],
      };
    }
  }
}
