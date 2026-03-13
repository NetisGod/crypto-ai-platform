/**
 * Market Brief cache: read the latest stored brief from the database.
 *
 * Used by GET /api/ai/market-brief. No LLM or Langfuse.
 */

import { getDb } from "@/lib/db";

export interface MarketBriefShape {
  market_summary: string;
  drivers: string[];
  risks: string[];
  confidence: number;
  sources: string[];
}

export interface CachedMarketBrief {
  brief: MarketBriefShape;
  model: string;
  generatedAt: string;
  debugJson: Record<string, unknown> | null;
}

/** Stored shape in market_briefs.content (JSON string). */
interface StoredContent {
  brief?: MarketBriefShape;
  model?: string;
  context?: { snapshots_count?: number; news_count?: number };
}

/**
 * Returns the latest Market Brief from the database (most recent by generated_at).
 * Does not call the LLM or create any Langfuse trace.
 */
export async function getLatestMarketBrief(): Promise<CachedMarketBrief | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;

  const { data: rows } = await db
    .from("market_briefs")
    .select("id, content, generated_at, debug_json")
    .order("generated_at", { ascending: false })
    .limit(1);

  if (!rows?.length) return null;

  const row = rows[0] as {
    id: string;
    content: string;
    generated_at: string;
    debug_json: Record<string, unknown> | null;
  };

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
    debugJson: row.debug_json ?? null,
  };
}
