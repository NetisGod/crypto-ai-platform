/**
 * Text chunking for the ingestion pipeline.
 * Uses LangChain's RecursiveCharacterTextSplitter for paragraph-aware splitting.
 */

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { ChunkConfig, TextChunk } from "./types";

const DEFAULT_CONFIG: ChunkConfig = {
  chunkSize: 1200,
  chunkOverlap: 200,
  minChunkSize: 120,
  separators: ["\n\n", "\n", ". ", " "],
};

const CHARS_PER_TOKEN = 4;
const SINGLE_CHUNK_THRESHOLD = 1800;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/** Whether content needs splitting into multiple chunks. */
export function shouldChunk(content: string): boolean {
  return content.length > SINGLE_CHUNK_THRESHOLD;
}

/**
 * Split text into chunks with overlap for embedding.
 * Short texts are returned as a single chunk.
 */
export async function chunkText(
  text: string,
  config: Partial<ChunkConfig> = {}
): Promise<TextChunk[]> {
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (!shouldChunk(trimmed)) {
    return [{ content: trimmed, chunkIndex: 0, tokenCount: estimateTokens(trimmed) }];
  }

  const cfg = { ...DEFAULT_CONFIG, ...config };
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: cfg.chunkSize,
    chunkOverlap: cfg.chunkOverlap,
    separators: cfg.separators,
  });

  const docs = await splitter.createDocuments([trimmed]);

  return docs
    .map((doc, i) => ({
      content: doc.pageContent,
      chunkIndex: i,
      tokenCount: estimateTokens(doc.pageContent),
    }))
    .filter((chunk) => chunk.content.length >= cfg.minChunkSize);
}
