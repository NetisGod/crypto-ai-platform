"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Newspaper, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";

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

const MAX_ITEMS = 6;

const TOKEN_KEYWORDS: Record<string, string[]> = {
  BTC: ["btc", "bitcoin"],
  ETH: ["eth", "ethereum"],
};

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

function filterByToken(items: NewsItem[], symbol: string): NewsItem[] {
  const keywords = TOKEN_KEYWORDS[symbol] ?? [symbol.toLowerCase()];
  const relevant = items.filter((item) => {
    const lower = item.title.toLowerCase();
    return keywords.some((kw) => lower.includes(kw));
  });
  return relevant.length > 0 ? relevant : items;
}

interface TokenNewsProps {
  symbol: string;
  className?: string;
}

export function TokenNews({ symbol, className }: TokenNewsProps) {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch("/api/news/latest");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as NewsLatestResponse;
      setAllNews(data.news);
      setStatus("idle");
    } catch {
      setStatus((prev) => (prev === "loading" ? "error" : prev));
    }
  }, []);

  useEffect(() => {
    void fetchNews();
  }, [fetchNews]);

  const filtered = filterByToken(allNews, symbol);
  const displayed = filtered.slice(0, MAX_ITEMS);
  const isFiltered = filtered.length < allNews.length;

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
            {symbol} News
          </CardTitle>
          {status === "idle" && isFiltered && (
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
              filtered
            </span>
          )}
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

      <CardContent className="flex-1 p-0">
        {status === "loading" && <LoadingSkeleton />}

        {status === "error" && (
          <div className="flex flex-col items-center gap-3 px-6 py-8">
            <AlertCircle className="h-6 w-6 text-destructive/70" />
            <p className="text-sm text-muted-foreground">
              Unable to load news right now.
            </p>
            <button
              onClick={() => {
                setStatus("loading");
                void fetchNews();
              }}
              className="text-xs font-medium text-accent hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {status === "idle" && displayed.length === 0 && (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No news available for {symbol}.
            </p>
          </div>
        )}

        {status === "idle" && displayed.length > 0 && (
          <div className="divide-y divide-border/60">
            {displayed.map((item, i) => (
              <a
                key={`${item.url}-${i}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
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
        )}

        {status === "idle" && !isFiltered && displayed.length > 0 && (
          <div className="border-t border-border/60 px-6 py-2.5">
            <p className="text-[11px] text-muted-foreground">
              Showing latest crypto news — no {symbol}-specific articles found
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="divide-y divide-border/60">
      {Array.from({ length: MAX_ITEMS }).map((_, i) => (
        <div key={i} className="px-6 py-3.5">
          <div className="h-4 w-11/12 rounded animate-shimmer" />
          <div className="mt-2 h-3 w-1/3 rounded animate-shimmer" />
        </div>
      ))}
    </div>
  );
}
