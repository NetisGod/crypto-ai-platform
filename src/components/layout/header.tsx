"use client";

import Link from "next/link";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMarketPrices } from "@/hooks/use-market-prices";
import type { CurrentPrice } from "@/services/market/types";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const TICKER_SYMBOLS = ["BTC", "ETH"] as const;

function formatPrice(v: number | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  if (v >= 1000) return `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (v >= 1) return `$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  return `$${v.toFixed(4)}`;
}

function TickerChip({ symbol, price }: { symbol: string; price?: CurrentPrice }) {
  const change = price?.priceChangePercentage24h;
  const positive = change != null && change >= 0;
  return (
    <Link
      href={`/app/token/${symbol}`}
      className="group hidden items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs font-medium backdrop-blur transition-all hover:border-border hover:bg-card lg:inline-flex"
    >
      <span className="text-muted-foreground">{symbol}</span>
      <span className="tabular-nums text-foreground">
        {formatPrice(price?.currentPrice)}
      </span>
      {change != null && (
        <span
          className={cn(
            "tabular-nums",
            positive ? "text-success" : "text-danger",
          )}
        >
          {positive ? "+" : ""}
          {change.toFixed(2)}%
        </span>
      )}
    </Link>
  );
}

export function Header() {
  const { prices } = useMarketPrices();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border/60 bg-background/60 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tokens, narratives…"
            className="h-9 rounded-full border-border/60 bg-card/60 pl-9 backdrop-blur focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {TICKER_SYMBOLS.map((sym) => (
          <TickerChip
            key={sym}
            symbol={sym}
            price={prices.find((p) => p.symbol === sym)}
          />
        ))}

        <Button
          variant="glass"
          size="sm"
          className="hidden rounded-full px-3 sm:inline-flex"
          asChild
        >
          <Link href="/app/ask" aria-label="Ask AI Why">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="hidden lg:inline">Ask AI Why</span>
          </Link>
        </Button>

        <ThemeToggle />
      </div>
    </header>
  );
}
