/**
 * Token Analysis API
 *
 * POST /api/ai/token-analysis
 *   Body: { "symbol": "BTC" }
 *
 *   1. Validates the symbol against supported assets
 *   2. Fetches live market data (Binance) and recent news (CryptoPanic / RSS)
 *   3. Runs the Token Analysis Agent (reasoning tier → gpt-4.1)
 *   4. Returns structured analysis: summary, bullish/bearish factors, outlook, confidence
 *
 *   200: { analysis, symbol, model, latencyMs }
 *   400: { error } — invalid or missing symbol
 *   500: { error, symbol, durationMs } — data fetch or AI failure
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchCurrentPrices } from "@/services/market/binance";
import { getLatestNews, type NewsItem } from "@/services/news/getLatestNews";
import {
  runTokenAnalysisAgent,
  type TokenMarketData,
} from "@/ai/agents/tokenAnalysisAgent";
import type { NewsRow } from "@/ai/agents/types";
import type { AssetSymbol } from "@/services/market/types";

export const dynamic = "force-dynamic";

const SUPPORTED_SYMBOLS: Set<string> = new Set(["BTC", "ETH"]);

function isValidSymbol(value: unknown): value is AssetSymbol {
  return typeof value === "string" && SUPPORTED_SYMBOLS.has(value.toUpperCase());
}

function newsItemToNewsRow(item: NewsItem): NewsRow {
  return {
    title: item.title,
    source: item.source,
    summary: null,
    url: item.url,
    published_at: item.published_at,
  };
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  let symbol: string | undefined;

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request body must be a JSON object with a 'symbol' field" },
        { status: 400 },
      );
    }

    const rawSymbol = (body as Record<string, unknown>).symbol;
    if (!isValidSymbol(rawSymbol)) {
      return NextResponse.json(
        {
          error: `Unsupported symbol: "${String(rawSymbol ?? "")}". Supported: ${[...SUPPORTED_SYMBOLS].join(", ")}`,
        },
        { status: 400 },
      );
    }
    symbol = rawSymbol.toUpperCase();

    const [prices, newsItems] = await Promise.all([
      fetchCurrentPrices(),
      getLatestNews(10),
    ]);

    const tokenPrice = prices.find((p) => p.symbol === symbol);
    if (!tokenPrice) {
      return NextResponse.json(
        { error: `Market data unavailable for ${symbol}`, symbol },
        { status: 500 },
      );
    }

    const market: TokenMarketData = {
      symbol: tokenPrice.symbol,
      price: tokenPrice.currentPrice,
      change_24h: tokenPrice.priceChangePercentage24h,
      volume_24h: tokenPrice.volume24h,
    };

    const tokenNews: NewsRow[] = newsItems.map(newsItemToNewsRow);

    const analysis = await runTokenAnalysisAgent(
      { market, news: tokenNews },
      null,
    );

    return NextResponse.json({
      analysis,
      symbol,
      latencyMs: Date.now() - start,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(`[token-analysis] POST failed for symbol="${symbol ?? "unknown"}":`, message);
    return NextResponse.json(
      {
        error: message,
        symbol: symbol ?? null,
        durationMs: Date.now() - start,
      },
      { status: 500 },
    );
  }
}
