/**
 * Extract full article body from a URL.
 * Falls back to null if extraction fails (caller should use title+summary).
 */

import { extract } from "@extractus/article-extractor";

const EXTRACT_TIMEOUT_MS = 8_000;

const log = (msg: string, meta?: Record<string, unknown>) => {
  console.log(`[ingestion/article-extractor] ${msg}`, meta ? JSON.stringify(meta) : "");
};

export interface ExtractedArticle {
  url: string;
  content: string | null;
  title: string | null;
}

/**
 * Fetch and extract readable text from a URL.
 * Returns null content if extraction fails (network error, paywall, etc.).
 */
export async function extractArticle(url: string): Promise<ExtractedArticle> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), EXTRACT_TIMEOUT_MS);

    const article = await extract(url, {}, { signal: controller.signal });
    clearTimeout(timer);

    if (!article?.content) {
      return { url, content: null, title: article?.title ?? null };
    }

    const cleaned = stripHtml(article.content);
    return { url, content: cleaned || null, title: article.title ?? null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("extraction failed", { url: url.slice(0, 80), error: msg });
    return { url, content: null, title: null };
  }
}

/**
 * Extract articles for multiple URLs with concurrency limit.
 * Skips URLs that are null/empty.
 */
export async function extractArticlesBatch(
  urls: string[],
  concurrency = 3
): Promise<Map<string, ExtractedArticle>> {
  const results = new Map<string, ExtractedArticle>();
  const validUrls = urls.filter(Boolean);

  for (let i = 0; i < validUrls.length; i += concurrency) {
    const batch = validUrls.slice(i, i + concurrency);
    const settled = await Promise.allSettled(batch.map((u) => extractArticle(u)));

    for (let j = 0; j < settled.length; j++) {
      const result = settled[j];
      const url = batch[j];
      if (result.status === "fulfilled") {
        results.set(url, result.value);
      } else {
        results.set(url, { url, content: null, title: null });
      }
    }
  }

  return results;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
