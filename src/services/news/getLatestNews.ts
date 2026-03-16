/**
 * Lightweight news service for dashboard and AI workflows.
 *
 * Primary source:  CryptoPanic API (requires CRYPTOPANIC_AUTH_TOKEN).
 * Fallback source: CoinDesk RSS feed (free, no key required).
 *
 * Always returns a NewsItem[] — never throws.
 */

import { fetchCryptoPanicNews } from "@/services/ingestion/cryptopanic";

// ─── Public types ────────────────────────────────────────────────────────────

export type NewsItem = {
  title: string;
  source: string;
  url: string;
  published_at: string; // ISO-8601
};

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_ITEMS = 10;
const COINDESK_RSS_URL = "https://www.coindesk.com/arc/outboundfeeds/rss/";
const RSS_FETCH_TIMEOUT_MS = 8_000;

// ─── Main entry point ────────────────────────────────────────────────────────

export async function getLatestNews(
  limit: number = MAX_ITEMS,
): Promise<NewsItem[]> {
  const count = Math.min(Math.max(limit, 1), MAX_ITEMS);

  const items = await fetchWithFallback(count);
  return items.slice(0, count);
}

// ─── Source orchestration ────────────────────────────────────────────────────

async function fetchWithFallback(count: number): Promise<NewsItem[]> {
  try {
    const items = await fetchFromCryptoPanic(count);
    if (items.length > 0) return items;
  } catch (err) {
    console.warn("[getLatestNews] CryptoPanic failed, trying RSS fallback:", err);
  }

  try {
    return await fetchFromCoinDeskRSS(count);
  } catch (err) {
    console.warn("[getLatestNews] CoinDesk RSS fallback also failed:", err);
  }

  return [];
}

// ─── CryptoPanic adapter ────────────────────────────────────────────────────

async function fetchFromCryptoPanic(count: number): Promise<NewsItem[]> {
  const raw = await fetchCryptoPanicNews({ limit: count });

  return raw
    .filter((item) => item.title)
    .map((item) => ({
      title: item.title,
      source: item.source || "CryptoPanic",
      url: item.url || buildCryptoPanicSearchUrl(item.title),
      published_at: item.published_at ?? new Date().toISOString(),
    }));
}

function buildCryptoPanicSearchUrl(title: string): string {
  const firstWords = title.split(/\s+/).slice(0, 5).join(" ");
  return `https://cryptopanic.com/news/?search=${encodeURIComponent(firstWords)}`;
}

// ─── CoinDesk RSS adapter ───────────────────────────────────────────────────

async function fetchFromCoinDeskRSS(count: number): Promise<NewsItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RSS_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(COINDESK_RSS_URL, {
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`CoinDesk RSS HTTP ${res.status}`);
    }

    const xml = await res.text();
    return parseRSSItems(xml, "CoinDesk").slice(0, count);
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Minimal RSS parser ─────────────────────────────────────────────────────

function parseRSSItems(xml: string, fallbackSource: string): NewsItem[] {
  const items: NewsItem[] = [];

  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    const pubDate = extractTag(block, "pubDate");
    const source = extractTag(block, "source") || fallbackSource;

    if (!title || !link) continue;

    items.push({
      title: decodeXMLEntities(title),
      source,
      url: link,
      published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
    });
  }

  return items;
}

function extractTag(xml: string, tag: string): string | null {
  // Handle both regular tags and CDATA-wrapped content
  const regex = new RegExp(
    `<${tag}[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${tag}>`,
    "i",
  );
  const m = regex.exec(xml);
  if (!m) return null;
  return (m[1] ?? m[2] ?? "").trim() || null;
}

function decodeXMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    );
}
