/**
 * POST /api/ingest/prices
 * Fetches CoinGecko markets, normalizes, upserts assets and inserts market_snapshots.
 */

import { NextResponse } from "next/server";
import { fetchCoinGeckoPrices } from "@/services/ingestion/coingecko";
import { insertMarketSnapshots } from "@/services/ingestion/store";
import type { IngestionResult } from "@/services/ingestion/types";

const LOG_PREFIX = "[ingest/prices]";

export async function POST() {
  const start = Date.now();
  try {
    const prices = await fetchCoinGeckoPrices({ perPage: 100 });
    if (prices.length === 0) {
      console.warn(`${LOG_PREFIX} No prices returned from CoinGecko`);
      return NextResponse.json(
        { success: false, error: "No data from CoinGecko", durationMs: Date.now() - start },
        { status: 502 }
      );
    }
    const { inserted, error } = await insertMarketSnapshots(prices);
    if (error) {
      console.error(`${LOG_PREFIX} Store error: ${error}`);
      return NextResponse.json(
        { success: false, error, inserted: inserted ?? 0, durationMs: Date.now() - start },
        { status: 500 }
      );
    }
    const result: IngestionResult<unknown> = {
      success: true,
      data: prices,
      inserted,
      durationMs: Date.now() - start,
    };
    console.log(`${LOG_PREFIX} OK inserted=${inserted} count=${prices.length} ms=${result.durationMs}`);
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
