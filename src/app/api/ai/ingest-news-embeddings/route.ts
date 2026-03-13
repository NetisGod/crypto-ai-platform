/**
 * POST /api/ai/ingest-news-embeddings
 * Backfill embeddings for news_items that have no embedding yet.
 * Uses title + summary, stores in news_items.embedding.
 * Optional: ?limit=50 to cap how many to process.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateAndStoreEmbedding } from "@/lib/embeddings";

export async function POST(request: NextRequest) {
  const start = Date.now();
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10) || 50)) : 50;

  try {
    const db = getDb();
    const { data: rows, error } = await db
      .from("news_items")
      .select("id, title, summary")
      .is("embedding", null)
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: error.message, processed: 0, durationMs: Date.now() - start },
        { status: 500 }
      );
    }

    const items = (rows ?? []) as { id: string; title: string; summary: string | null }[];
    let processed = 0;
    for (const item of items) {
      const { error: updateErr } = await generateAndStoreEmbedding(
        item.id,
        item.title,
        item.summary
      );
      if (updateErr) {
        console.error(`[ingest-news-embeddings] ${item.id}: ${updateErr}`);
        continue;
      }
      processed++;
    }

    return NextResponse.json({
      processed,
      total: items.length,
      durationMs: Date.now() - start,
    });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: err, processed: 0, durationMs: Date.now() - start },
      { status: 500 }
    );
  }
}
