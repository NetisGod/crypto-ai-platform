"use client";

import { useEffect, useState, useCallback } from "react";
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

const VISIBLE_ITEMS = 6;

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

  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch("/api/news/latest");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as NewsLatestResponse;
      setNews(data.news.slice(0, VISIBLE_ITEMS));
      setStatus("idle");
    } catch {
      setStatus((prev) => (prev === "loading" ? "error" : prev));
    }
  }, []);

  useEffect(() => {
    void fetchNews();
  }, [fetchNews]);

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-medium">Market News</CardTitle>
        </div>
        {status === "idle" && (
          <button
            onClick={() => void fetchNews()}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Refresh news"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </CardHeader>

      <CardContent className="flex-1 p-0">
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
              className="mt-2 text-xs font-medium text-primary hover:underline"
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
          <div className="divide-y divide-border">
            {news.map((item, i) => (
              <a
                key={`${item.url}-${i}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 px-6 py-3.5 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug text-foreground line-clamp-2 group-hover:text-primary">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.source}
                    <span className="mx-1.5">·</span>
                    {timeAgo(item.published_at)}
                  </p>
                </div>
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-primary" />
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: VISIBLE_ITEMS }).map((_, i) => (
        <div key={i} className="px-6 py-3.5">
          <div className="h-4 w-11/12 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-muted/60" />
        </div>
      ))}
    </div>
  );
}
