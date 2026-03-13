/**
 * OpenAI embeddings and vector search for crypto news.
 * - Generate embeddings for title + body (summary), store in news_items.embedding
 * - Search top-k relevant news by semantic similarity via pgvector.
 * Requires OPENAI_API_KEY and NEWS_EMBEDDING_DIMENSION = 1536 (text-embedding-3-small).
 */

import OpenAI from "openai";
import { getDb } from "@/lib/db";
import { NEWS_EMBEDDING_DIMENSION } from "@/types/database";

const EMBEDDING_MODEL = "text-embedding-3-small";

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is required for embeddings");
  }
  return new OpenAI({ apiKey: key });
}

/**
 * Build text to embed from news title and body (summary).
 * Used for both storing embeddings and for consistent representation.
 */
export function buildNewsText(title: string, body: string | null): string {
  const summary = (body ?? "").trim();
  return summary ? `${title}\n${summary}` : title;
}

/**
 * Generate embedding vector for a single text using OpenAI.
 * Returns 1536-dim vector (text-embedding-3-small default).
 */
export async function embedText(text: string): Promise<number[]> {
  const openai = getOpenAI();
  const input = text.trim().slice(0, 8191); // model limit 8192 tokens, keep safe
  const {
    data: [result],
  } = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: input || " ",
    dimensions: NEWS_EMBEDDING_DIMENSION,
  });
  if (!result?.embedding) {
    throw new Error("OpenAI embeddings returned no vector");
  }
  return result.embedding as number[];
}

/**
 * Generate embedding for a news item (title + summary) and store in news_items.embedding.
 */
export async function generateAndStoreEmbedding(
  id: string,
  title: string,
  summary: string | null
): Promise<{ error?: string }> {
  const text = buildNewsText(title, summary);
  const embedding = await embedText(text);
  const db = getDb();
  const { error } = await db
    .from("news_items")
    .update({ embedding } as { embedding: number[] })
    .eq("id", id);
  if (error) {
    return { error: error.message };
  }
  return {};
}

/**
 * Result shape for semantic news search: public fields + similarity score.
 */
export interface RelevantNewsResult {
  id: string;
  title: string;
  source: string;
  url: string | null;
  /** Cosine similarity in [0, 1]; 1 = identical. */
  similarity: number;
}

/**
 * Search top-k news items by semantic similarity to the query.
 * Embeds the query, runs pgvector search, returns results with similarity score.
 */
export async function searchRelevantNews(
  query: string,
  k: number = 10
): Promise<{ results: RelevantNewsResult[]; error?: string }> {
  const embedding = await embedText(query.trim() || " ");
  const limit = Math.max(1, Math.min(k, 50));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (getDb() as any).rpc(
    "match_news_items_with_scores",
    { query_embedding: embedding, match_limit: limit }
  );

  if (error) {
    return { results: [], error: error.message };
  }

  interface ScoreRow {
    id: string;
    title: string;
    source: string;
    url: string | null;
    summary: string | null;
    published_at: string | null;
    distance: number;
  }
  const rows = (data ?? []) as ScoreRow[];
  const results: RelevantNewsResult[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    source: row.source,
    url: row.url,
    similarity: 1 - row.distance,
  }));

  return { results };
}
