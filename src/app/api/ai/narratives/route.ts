/**
 * Narratives API
 *
 * GET /api/ai/narratives
 *   - Reads the latest cached narrative snapshot from the database only.
 *     No LLM, no Langfuse.
 *   - 200: { narratives, model, updatedAt, debugJson }
 *          or { narratives: null, message }
 *   - 500: { error, narratives: null }
 *
 * POST /api/ai/narratives
 *   - Runs the narratives generation pipeline (market data → scoring →
 *     AI explanation → merge → persist), traces in Langfuse.
 *   - 200: { narratives, updatedAt, model, latencyMs, aiRunId, debugJson }
 *   - 500: { error, durationMs }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getLatestNarratives,
  generateNarratives,
} from "@/services/narratives/service";

/** GET: return latest cached narratives only. No generation, no Langfuse. */
export async function GET() {
  try {
    const cached = await getLatestNarratives();
    if (!cached) {
      return NextResponse.json({
        narratives: null,
        message: "No narratives generated yet",
      });
    }
    return NextResponse.json({
      narratives: cached.narratives,
      model: cached.model,
      updatedAt: cached.updatedAt,
      debugJson: cached.debugJson,
    });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: err, narratives: null },
      { status: 500 },
    );
  }
}

/** POST: run the narratives generation pipeline. */
export async function POST(_req: NextRequest) {
  const start = Date.now();
  try {
    const result = await generateNarratives();
    return NextResponse.json({
      narratives: result.narratives,
      updatedAt: result.updatedAt,
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
