/**
 * Batch embedding wrapper for the ingestion pipeline.
 * Uses OpenAI text-embedding-3-small (1536 dimensions).
 */

import OpenAI from "openai";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;
const MAX_BATCH_SIZE = 100;
const MAX_INPUT_LENGTH = 8191;

function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is required for embeddings");
  return new OpenAI({ apiKey: key });
}

/** Generate embedding for a single text string. */
export async function embedSingle(text: string): Promise<number[]> {
  const openai = getOpenAI();
  const input = text.trim().slice(0, MAX_INPUT_LENGTH) || " ";
  const { data } = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input,
    dimensions: EMBEDDING_DIMENSIONS,
  });
  const vec = data[0]?.embedding;
  if (!vec) throw new Error("OpenAI embeddings returned no vector");
  return vec as number[];
}

/**
 * Generate embeddings for multiple texts in a single API call.
 * Splits into batches of MAX_BATCH_SIZE to stay within API limits.
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const openai = getOpenAI();
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
    const batch = texts.slice(i, i + MAX_BATCH_SIZE).map(
      (t) => t.trim().slice(0, MAX_INPUT_LENGTH) || " "
    );

    const { data } = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    const sorted = data.sort((a, b) => a.index - b.index);
    for (const item of sorted) {
      results.push(item.embedding as number[]);
    }
  }

  return results;
}
