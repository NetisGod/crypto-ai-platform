/**
 * Market Brief API
 *
 * GET /api/ai/market-brief
 *   - Reads the latest cached brief from the database only. No LLM, no Langfuse.
 *   - 200: { brief, model, generatedAt } or { brief: null, message: "No market brief generated yet" }
 *
 * POST /api/ai/market-brief
 *   - Runs AI generation (fetch context, LLM, zod, store in market_briefs, Langfuse trace).
 *   - 200: { brief, model, usage, latencyMs, retryCount, aiRunId }
 *   - 500: { error, durationMs }
 */

import { NextRequest, NextResponse } from "next/server";
import { getLatestMarketBrief } from "@/lib/market-brief-cache";
import { generateMarketBrief } from "@/services/ai/summarize-market";

/** GET: return latest cached brief only. No generation, no Langfuse. */
export async function GET() {
  try {
    const cached = await getLatestMarketBrief();
    if (!cached) {
      return NextResponse.json({
        brief: null,
        message: "No market brief generated yet",
      });
    }
    return NextResponse.json({
      brief: cached.brief,
      model: cached.model,
      generatedAt: cached.generatedAt,
    });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: err, brief: null },
      { status: 500 },
    );
  }
}

/** POST: run AI generation, store in DB, log to Langfuse. */
export async function POST(_req: NextRequest) {
  const start = Date.now();
  try {
    const result = await generateMarketBrief();
    return NextResponse.json(result);
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        error: err,
        durationMs: Date.now() - start,
      },
      { status: 500 },
    );
  }
}
