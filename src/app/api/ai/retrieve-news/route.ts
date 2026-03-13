/**
 * GET /api/ai/retrieve-news
 * Semantic search over crypto news using embeddings.
 * Query params: q (search query), k (top-k, default 10, max 50).
 * Returns: { results: { id, title, source, url, similarity }[] }
 */

import { NextRequest, NextResponse } from "next/server";
import { searchRelevantNews } from "@/lib/embeddings";

export async function GET(request: NextRequest) {
  const start = Date.now();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const kParam = searchParams.get("k");
  const k = kParam ? Math.min(50, Math.max(1, parseInt(kParam, 10) || 10)) : 10;

  if (!q.trim()) {
    return NextResponse.json(
      { error: "Missing or empty query parameter: q", results: [] },
      { status: 400 }
    );
  }

  try {
    const { results, error } = await searchRelevantNews(q.trim(), k);
    if (error) {
      return NextResponse.json(
        { error, results: [], durationMs: Date.now() - start },
        { status: 500 }
      );
    }
    return NextResponse.json({
      results,
      durationMs: Date.now() - start,
    });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: err, results: [], durationMs: Date.now() - start },
      { status: 500 }
    );
  }
}
