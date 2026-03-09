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
  positive: "text-emerald-500",
  negative: "text-red-500",
  neutral: "text-muted-foreground",
};

export function NewsFeed({
  items,
  title = "Market News",
  className,
  maxHeight = "400px",
}: NewsFeedProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }}>
          <div className="divide-y divide-border">
            {items.map((item) => {
              const Icon = sentimentIcon[item.sentiment];
              return (
                <a
                  key={item.id}
                  href={item.url}
                  className="block px-6 py-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        sentimentColor[item.sentiment]
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug text-foreground line-clamp-2">
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
                              className="rounded bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
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
