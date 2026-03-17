/**
 * Ask AI API
 *
 * POST /api/ai/ask
 *   Body: { "question": "Why is ETH going up today?" }
 *
 *   1. Validates the question with AskAiRequestSchema
 *   2. Delegates to the Ask AI orchestration service
 *   3. Returns a structured market Q&A response
 *
 *   200: { answer, intent, drivers, risks, sources, confidence }
 *   400: { error, details } — missing or invalid question
 *   500: { error, durationMs } — internal service failure
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AskAiRequestSchema } from "@/ai/schemas/askAi";
import { askAI } from "@/services/ai/ask-ai";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const start = Date.now();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  let question: string;
  try {
    ({ question } = AskAiRequestSchema.parse(body));
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: e.flatten().fieldErrors },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const response = await askAI(question);
    return NextResponse.json(response);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[ask] POST failed:", message);
    return NextResponse.json(
      { error: "Ask AI service failed. Please try again.", durationMs: Date.now() - start },
      { status: 500 },
    );
  }
}
