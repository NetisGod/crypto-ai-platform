/**
 * POST /api/ingest
 * Unified ingestion endpoint. Runs the full orchestrated pipeline.
 *
 * Query params (all optional):
 *   ?trigger=manual|cron|pre_pipeline
 *   &skipPrices=true
 *   &skipNews=true
 *   &skipFunding=true
 *   &skipEmbeddings=true
 */

import { NextRequest, NextResponse } from "next/server";
import { runIngestionPipeline } from "@/services/ingestion/orchestrator";
import type { IngestionOptions } from "@/services/ingestion/types";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trigger = (searchParams.get("trigger") ?? "manual") as IngestionOptions["trigger"];

  const options: IngestionOptions = {
    trigger,
    skipPrices: searchParams.get("skipPrices") === "true",
    skipNews: searchParams.get("skipNews") === "true",
    skipFunding: searchParams.get("skipFunding") === "true",
    skipEmbeddings: searchParams.get("skipEmbeddings") === "true",
  };

  try {
    const result = await runIngestionPipeline(options);

    const httpStatus = result.status === "failed" ? 500 : 200;
    return NextResponse.json(result, { status: httpStatus });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[api/ingest] Unhandled error:", msg);
    return NextResponse.json(
      { error: msg, status: "failed" },
      { status: 500 }
    );
  }
}
