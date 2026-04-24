"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { NewsItem } from "@/data/mock-data";
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface NewsFeedProps {
  items: NewsItem[];
  title?: string;
  className?: string;
  maxHeight?: string;
}

const sentimentIcon = {
  positive: TrendingUp,
  negative: TrendingDown,
  neutral: Minus,
};

const sentimentColor = {
  positive: "text-success",
  negative: "text-danger",
  neutral: "text-muted-foreground",
};

export function NewsFeed({
  items,
  title = "Market News",
  className,
  maxHeight = "400px",
}: NewsFeedProps) {
  return (
    <Card
      className={cn(
        "min-w-0 rounded-2xl border-border/60 shadow-soft transition-shadow duration-300 hover:shadow-elegant",
        className,
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold tracking-tight">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }}>
          <div className="divide-y divide-border/60">
            {items.map((item) => {
              const Icon = sentimentIcon[item.sentiment];
              return (
                <a
                  key={item.id}
                  href={item.url}
                  className="group block px-6 py-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        sentimentColor[item.sentiment],
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-accent">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.source} · {item.timeAgo}
                      </p>
                      {item.relatedTokens.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.relatedTokens.map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-accent" />
                  </div>
                </a>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
