/**
 * Ingestion pipeline orchestrator.
 * Single entry point that coordinates all ingestion steps in the correct order.
 */

import { fetchCoinGeckoPrices } from "./coingecko";
import { fetchBinanceFundingAndOI } from "./binance";
import { fetchCryptoPanicNews } from "./cryptopanic";
import {
  insertMarketSnapshots,
  insertNewsItems,
  insertDocumentChunks,
  createIngestionRun,
  completeIngestionRun,
} from "./store";
import { chunkText } from "./chunker";
import { embedBatch } from "./embedder";
import { extractArticlesBatch } from "./article-extractor";
import type {
  IngestionOptions,
  IngestionRunRecord,
  SourceResult,
  NormalizedNewsItem,
} from "./types";
import type { DocumentChunkInsert } from "@/types/database";

const log = (msg: string, meta?: Record<string, unknown>) => {
  console.log(`[ingestion/orchestrator] ${msg}`, meta ? JSON.stringify(meta) : "");
};

/**
 * Run the full ingestion pipeline.
 *
 * Phase 1 (parallel): Prices + News
 * Phase 2 (sequential): Funding (needs prices) + Article extraction + embedding (needs news)
 * Phase 3: Record metadata
 */
export async function runIngestionPipeline(
  options: IngestionOptions
): Promise<IngestionRunRecord> {
  const pipelineStart = Date.now();
  const runId = await createIngestionRun(options.trigger);

  const results: {
    prices: SourceResult | null;
    funding: SourceResult | null;
    news: SourceResult | null;
    embeddings: SourceResult | null;
  } = { prices: null, funding: null, news: null, embeddings: null };

  let pricesOk = false;
  let newsOk = false;
  let newsItems: NormalizedNewsItem[] = [];
  let newsInsertedIds: string[] = [];

  // --- Phase 1: Parallel independent sources ---
  const phase1: Promise<void>[] = [];

  if (!options.skipPrices) {
    phase1.push(
      (async () => {
        const start = Date.now();
        try {
          const prices = await fetchCoinGeckoPrices({ perPage: 25 });
          const { inserted, error } = await insertMarketSnapshots(prices);
          results.prices = {
            count: inserted,
            source: "coingecko",
            duration_ms: Date.now() - start,
            ...(error ? { error } : {}),
          };
          pricesOk = !error && inserted > 0;
          log("prices done", { inserted, ms: Date.now() - start });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          results.prices = { count: 0, source: "coingecko", duration_ms: Date.now() - start, error: msg };
          log("prices failed", { error: msg });
        }
      })()
    );
  }

  if (!options.skipNews) {
    phase1.push(
      (async () => {
        const start = Date.now();
        try {
          newsItems = await fetchCryptoPanicNews({ limit: 50 });
          const { inserted, insertedIds, error } = await insertNewsItems(newsItems);
          newsInsertedIds = insertedIds;
          results.news = {
            count: inserted,
            source: "cryptopanic",
            duration_ms: Date.now() - start,
            ...(error ? { error } : {}),
          };
          newsOk = inserted > 0;
          log("news done", { inserted, total: newsItems.length, ms: Date.now() - start });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          results.news = { count: 0, source: "cryptopanic", duration_ms: Date.now() - start, error: msg };
          log("news failed", { error: msg });
        }
      })()
    );
  }

  await Promise.allSettled(phase1);

  // --- Phase 2: Dependent steps ---

  if (!options.skipFunding && pricesOk) {
    const start = Date.now();
    try {
      const funding = await fetchBinanceFundingAndOI();
      const { updateSnapshotsFunding } = await import("./store");
      const { updated, error } = await updateSnapshotsFunding(funding);
      results.funding = {
        count: updated,
        source: "binance",
        duration_ms: Date.now() - start,
        ...(error ? { error } : {}),
      };
      log("funding done", { updated, ms: Date.now() - start });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.funding = { count: 0, source: "binance", duration_ms: Date.now() - start, error: msg };
      log("funding failed", { error: msg });
    }
  }

  if (!options.skipEmbeddings && newsOk && newsInsertedIds.length > 0) {
    const start = Date.now();
    try {
      const embeddedCount = await ingestArticlesAndEmbed(newsItems, newsInsertedIds);
      results.embeddings = {
        count: embeddedCount,
        source: "openai",
        duration_ms: Date.now() - start,
      };
      log("embeddings done", { count: embeddedCount, ms: Date.now() - start });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.embeddings = { count: 0, source: "openai", duration_ms: Date.now() - start, error: msg };
      log("embeddings failed", { error: msg });
    }
  }

  // --- Phase 3: Metadata ---
  const hasAnySuccess = pricesOk || newsOk;
  const hasAnyFailure = results.prices?.error || results.news?.error;
  const status: IngestionRunRecord["status"] = !hasAnySuccess
    ? "failed"
    : hasAnyFailure
      ? "partial"
      : "completed";

  if (runId) {
    await completeIngestionRun(runId, status, results);
  }

  const record: IngestionRunRecord = {
    id: runId ?? "unknown",
    started_at: new Date(pipelineStart).toISOString(),
    completed_at: new Date().toISOString(),
    status,
    prices: results.prices,
    funding: results.funding,
    news: results.news,
    embeddings: results.embeddings,
    trigger: options.trigger,
  };

  log("pipeline complete", { status, ms: Date.now() - pipelineStart });
  return record;
}

/**
 * Extract article bodies, chunk, embed, and store in document_chunks.
 * Falls back to title+summary if article extraction fails.
 */
async function ingestArticlesAndEmbed(
  newsItems: NormalizedNewsItem[],
  insertedIds: string[]
): Promise<number> {
  const itemsWithIds = newsItems
    .filter((_, i) => insertedIds[i])
    .map((item, i) => ({ ...item, id: insertedIds[i] }));

  if (itemsWithIds.length === 0) return 0;

  const urlsToExtract = itemsWithIds
    .filter((item) => item.url)
    .map((item) => item.url!);

  let extractedArticles = new Map<string, { content: string | null }>();
  if (urlsToExtract.length > 0) {
    try {
      extractedArticles = await extractArticlesBatch(urlsToExtract, 3);
    } catch {
      log("article extraction batch failed, falling back to title+summary");
    }
  }

  const allChunks: (DocumentChunkInsert & { _text: string })[] = [];

  for (const item of itemsWithIds) {
    const extracted = item.url ? extractedArticles.get(item.url) : null;
    const articleBody = extracted?.content;
    const textToEmbed = articleBody || buildShortText(item.title, item.summary);

    const chunks = await chunkText(textToEmbed);
    for (const chunk of chunks) {
      allChunks.push({
        source_table: "news_items",
        source_id: item.id,
        chunk_index: chunk.chunkIndex,
        content: chunk.content,
        token_count: chunk.tokenCount,
        metadata: {
          title: item.title,
          source: item.source,
          published_at: item.published_at,
          has_full_article: !!articleBody,
        },
        _text: chunk.content,
      });
    }
  }

  if (allChunks.length === 0) return 0;

  const texts = allChunks.map((c) => c._text);
  const embeddings = await embedBatch(texts);

  const dbChunks: DocumentChunkInsert[] = allChunks.map((chunk, i) => {
    const { _text, ...rest } = chunk;
    void _text;
    return { ...rest, embedding: embeddings[i] };
  });

  const { inserted } = await insertDocumentChunks(dbChunks);
  return inserted;
}

function buildShortText(title: string, summary: string | null): string {
  const s = (summary ?? "").trim();
  return s ? `${title}\n${s}` : title;
}
