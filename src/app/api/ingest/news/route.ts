/**
 * POST /api/ingest/news
 * Fetches CryptoPanic news, normalizes, inserts into news_items.
 * Optional: ?filter=hot|rising|bullish|bearish&limit=50
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchCryptoPanicNews } from "@/services/ingestion/cryptopanic";
import { insertNewsItems } from "@/services/ingestion/store";
import type { IngestionResult } from "@/services/ingestion/types";

const LOG_PREFIX = "[ingest/news]";

const VALID_FILTERS = ["rising", "hot", "bullish", "bearish", "important", "saved", "lol"] as const;

export async function POST(request: NextRequest) {
  const start = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(Math.max(1, parseInt(limitParam, 10)), 50) : 50;
    const options: { filter?: typeof VALID_FILTERS[number]; limit: number } = { limit };
    if (filter && VALID_FILTERS.includes(filter as typeof VALID_FILTERS[number])) {
      options.filter = filter as typeof VALID_FILTERS[number];
    }

    const items = await fetchCryptoPanicNews(options);
    if (items.length === 0) {
      console.warn(`${LOG_PREFIX} No news returned from CryptoPanic`);
      return NextResponse.json(
        { success: false, error: "No data from CryptoPanic (check CRYPTOPANIC_AUTH_TOKEN?)", durationMs: Date.now() - start },
        { status: 502 }
      );
    }
    const { inserted, error } = await insertNewsItems(items);
    if (error) {
      console.error(`${LOG_PREFIX} Store error: ${error}`);
      return NextResponse.json(
        { success: false, error, inserted: inserted ?? 0, durationMs: Date.now() - start },
        { status: 500 }
      );
    }
    const result: IngestionResult<unknown> = {
      success: true,
      data: items,
      inserted,
      durationMs: Date.now() - start,
    };
    console.log(`${LOG_PREFIX} OK inserted=${inserted} count=${items.length} ms=${result.durationMs}`);
    return NextResponse.json(result);
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error(`${LOG_PREFIX} Error: ${err}`);
    return NextResponse.json(
      { success: false, error: err, durationMs: Date.now() - start },
      { status: 500 }
    );
  }
}
