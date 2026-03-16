import { NextResponse } from "next/server";
import { getLatestNews, type NewsItem } from "@/services/news/getLatestNews";

// ─── Cache ───────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1_000; // 5 minutes

let cache: { data: NewsItem[]; fetchedAt: string; expiresAt: number } | null =
  null;

// ─── Response type ───────────────────────────────────────────────────────────

interface NewsLatestResponse {
  news: NewsItem[];
  fetchedAt: string;
  cached: boolean;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse<NewsLatestResponse | { error: string }>> {
  try {
    if (cache && Date.now() < cache.expiresAt) {
      return NextResponse.json({
        news: cache.data,
        fetchedAt: cache.fetchedAt,
        cached: true,
      });
    }

    const news = await getLatestNews();
    const fetchedAt = new Date().toISOString();

    if (news.length > 0) {
      cache = { data: news, fetchedAt, expiresAt: Date.now() + CACHE_TTL_MS };
    }

    return NextResponse.json({ news, fetchedAt, cached: false });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[/api/news/latest]", message);

    if (cache) {
      return NextResponse.json({
        news: cache.data,
        fetchedAt: cache.fetchedAt,
        cached: true,
      });
    }

    return NextResponse.json({ news: [], fetchedAt: new Date().toISOString(), cached: false });
  }
}
