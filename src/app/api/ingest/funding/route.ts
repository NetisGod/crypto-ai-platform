/**
 * POST /api/ingest/funding
 * Funding-only ingestion. Delegates to the orchestrator with other sources skipped.
 */

import { NextResponse } from "next/server";
import { runIngestionPipeline } from "@/services/ingestion/orchestrator";

export const maxDuration = 30;

export async function POST() {
  try {
    const result = await runIngestionPipeline({
      trigger: "manual",
      skipPrices: true,
      skipNews: true,
      skipEmbeddings: true,
    });
    const httpStatus = result.status === "failed" ? 500 : 200;
    return NextResponse.json(result, { status: httpStatus });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg, status: "failed" }, { status: 500 });
  }
}
