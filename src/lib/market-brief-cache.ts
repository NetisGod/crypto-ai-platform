/**
 * Market Brief cache: read the latest stored brief from the database.
 *
 * Used by GET /api/ai/market-brief. No LLM or Langfuse.
 */

import { getDb } from "@/lib/db";
import type { MarketBrief } from "@/services/ai/summarize-market";

export interface CachedMarketBrief {
  brief: MarketBrief;
  model: string;
  generatedAt: string;
}

/** Stored shape in market_briefs.content (JSON string). */
interface StoredContent {
  brief?: MarketBrief;
  model?: string;
  context?: { snapshots_count?: number; news_count?: number };
}

/**
 * Returns the latest Market Brief from the database (most recent by generated_at).
 * Does not call the LLM or create any Langfuse trace.
 */
export async function getLatestMarketBrief(): Promise<CachedMarketBrief | null> {
  const db = getDb() as any;

  const { data: rows } = await db
    .from("market_briefs")
    .select("id, content, generated_at")
    .order("generated_at", { ascending: false })
    .limit(1);

  if (!rows?.length) return null;

  const row = rows[0] as { id: string; content: string; generated_at: string };
  let parsed: StoredContent;
  try {
    parsed = JSON.parse(row.content) as StoredContent;
  } catch {
    return null;
  }

  if (!parsed.brief || typeof parsed.brief !== "object") return null;

  const { market_summary, drivers, risks, confidence, sources } = parsed.brief;
  if (
    typeof market_summary !== "string" ||
    !Array.isArray(drivers) ||
    !Array.isArray(risks) ||
    typeof confidence !== "number" ||
    !Array.isArray(sources)
  ) {
    return null;
  }

  return {
    brief: { market_summary, drivers, risks, confidence, sources },
    model: typeof parsed.model === "string" ? parsed.model : "unknown",
    generatedAt: row.generated_at ?? row.id,
  };
}
