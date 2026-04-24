"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Newspaper, ExternalLink, RefreshCw } from "lucide-react";

type NewsItem = {
  title: string;
  source: string;
  url: string;
  published_at: string;
};

interface NewsLatestResponse {
  news: NewsItem[];
  fetchedAt: string;
  cached: boolean;
}

type Status = "loading" | "idle" | "error";

const ITEMS_PER_PAGE = 3;
const TOTAL_ITEMS = 9;

function timeAgo(iso: string): string {
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return "recently";
  const seconds = Math.floor((Date.now() - ms) / 1_000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function MarketNews({ className }: { className?: string }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [page, setPage] = useState(0);

  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch("/api/news/latest");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as NewsLatestResponse;
      setNews(data.news.slice(0, TOTAL_ITEMS));
      setPage(0);
      setStatus("idle");
    } catch {
      setStatus((prev) => (prev === "loading" ? "error" : prev));
    }
  }, []);

  useEffect(() => {
    void fetchNews();
  }, [fetchNews]);

  const pages = useMemo(() => {
    const result: NewsItem[][] = [];
    for (let i = 0; i < news.length; i += ITEMS_PER_PAGE) {
      result.push(news.slice(i, i + ITEMS_PER_PAGE));
    }
    return result;
  }, [news]);

  const pageCount = pages.length;
  const currentPage = Math.min(page, Math.max(0, pageCount - 1));

  return (
    <Card
      className={cn(
        "flex min-w-0 flex-col rounded-2xl border-border/60 shadow-soft transition-shadow duration-300 hover:shadow-elegant",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Newspaper className="h-3.5 w-3.5" />
          </div>
          <CardTitle className="text-base font-semibold tracking-tight">
            Market News
          </CardTitle>
        </div>
        {status === "idle" && (
          <button
            onClick={() => void fetchNews()}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Refresh news"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-0">
        {status === "loading" && <LoadingSkeleton />}

        {status === "error" && (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Unable to load news right now.
            </p>
            <button
              onClick={() => {
                setStatus("loading");
                void fetchNews();
              }}
              className="mt-2 text-xs font-medium text-accent hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {status === "idle" && news.length === 0 && (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">No news available.</p>
          </div>
        )}

        {status === "idle" && news.length > 0 && (
          <>
            <div className="flex-1 overflow-hidden">
              <div
                className="flex h-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentPage * 100}%)` }}
              >
                {pages.map((pageItems, pageIdx) => (
                  <div
                    key={pageIdx}
                    className="w-full shrink-0"
                    aria-hidden={pageIdx !== currentPage}
                  >
                    <div className="divide-y divide-border/60">
                      {pageItems.map((item, i) => (
                        <a
                          key={`${item.url}-${i}`}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          tabIndex={pageIdx === currentPage ? 0 : -1}
                          className="group flex items-start gap-3 px-6 py-3.5 transition-colors hover:bg-muted/40"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-accent">
                              {item.title}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {item.source}
                              <span className="mx-1.5">·</span>
                              {timeAgo(item.published_at)}
                            </p>
                          </div>
                          <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-accent" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {pageCount > 1 && (
              <div className="flex items-center justify-center gap-2 px-6 py-4">
                {pages.map((_, idx) => {
                  const isActive = idx === currentPage;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPage(idx)}
                      aria-label={`Go to page ${idx + 1}`}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        isActive
                          ? "w-6 bg-accent"
                          : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                      )}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="divide-y divide-border/60">
      {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
        <div key={i} className="px-6 py-3.5">
          <div className="h-4 w-11/12 rounded animate-shimmer" />
          <div className="mt-2 h-3 w-1/3 rounded animate-shimmer" />
        </div>
      ))}
    </div>
  );
}
