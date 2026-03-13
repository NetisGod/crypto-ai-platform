/**
 * Market Brief API
 *
 * GET /api/ai/market-brief
 *   - Reads the latest cached brief from the database only. No LLM, no Langfuse.
 *   - 200: { brief, model, generatedAt, debugJson } or { brief: null, message }
 *
 * POST /api/ai/market-brief
 *   - Runs the multi-agent LangGraph pipeline (market data, news, narrative,
 *     risk → synthesizer → validator), stores result + debug_json, traces in Langfuse.
 *   - 200: { brief, model, latencyMs, aiRunId, debugJson }
 *   - 500: { error, durationMs }
 */

import { NextRequest, NextResponse } from "next/server";
import { getLatestMarketBrief } from "@/lib/market-brief-cache";
import { runMarketBriefPipeline } from "@/ai/workflows/market-brief-graph";

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
      debugJson: cached.debugJson,
    });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: err, brief: null },
      { status: 500 },
    );
  }
}

/** POST: run the multi-agent LangGraph pipeline. */
export async function POST(_req: NextRequest) {
  const start = Date.now();
  try {
    const result = await runMarketBriefPipeline();
    return NextResponse.json({
      brief: result.brief,
      model: result.model,
      latencyMs: result.latencyMs,
      aiRunId: result.aiRunId,
      debugJson: result.debugJson,
    });
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
