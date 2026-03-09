/**
 * POST /api/ingest/funding
 * Fetches Binance funding + open interest, updates latest market_snapshots per asset.
 * Run /api/ingest/prices first so snapshots exist.
 */

import { NextResponse } from "next/server";
import { fetchBinanceFundingAndOI } from "@/services/ingestion/binance";
import { updateSnapshotsFunding } from "@/services/ingestion/store";
import type { IngestionResult } from "@/services/ingestion/types";

const LOG_PREFIX = "[ingest/funding]";

export async function POST() {
  const start = Date.now();
  try {
    const funding = await fetchBinanceFundingAndOI();
    if (funding.length === 0) {
      console.warn(`${LOG_PREFIX} No funding data from Binance`);
      return NextResponse.json(
        { success: false, error: "No funding data", durationMs: Date.now() - start },
        { status: 502 }
      );
    }
    const { updated, error } = await updateSnapshotsFunding(funding);
    if (error) {
      console.error(`${LOG_PREFIX} Store error: ${error}`);
      return NextResponse.json(
        { success: false, error, updated: updated ?? 0, durationMs: Date.now() - start },
        { status: 500 }
      );
    }
    const result: IngestionResult<unknown> = {
      success: true,
      data: funding,
      updated,
      durationMs: Date.now() - start,
    };
    console.log(`${LOG_PREFIX} OK updated=${updated} count=${funding.length} ms=${result.durationMs}`);
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
