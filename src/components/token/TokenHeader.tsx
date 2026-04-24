"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useMarketPrices } from "@/hooks/use-market-prices";
import { StatPill } from "@/components/ui/stat-pill";

interface TokenHeaderProps {
  symbol: string;
}

function formatPrice(value: number): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function TokenHeader({ symbol }: TokenHeaderProps) {
  const { prices, loading, error } = useMarketPrices();
  const priceData = prices.find((p) => p.symbol === symbol);

  const change24h = priceData?.priceChangePercentage24h;
  const positive = change24h !== undefined && change24h >= 0;

  if (error) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {symbol}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Unable to load market data
            </p>
            <p className="mt-0.5 text-xs text-destructive">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-hero p-6 shadow-elegant sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <StatPill tone="accent" dot pulse>
              Live · {symbol}
            </StatPill>
            <StatPill tone="neutral">USDT pair</StatPill>
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {symbol}
          </h1>
          {loading && !priceData ? (
            <div className="h-12 w-48 rounded-lg animate-shimmer" />
          ) : priceData ? (
            <p className="bg-gradient-text bg-clip-text text-4xl font-semibold tabular-nums tracking-tight text-transparent sm:text-5xl">
              {formatPrice(priceData.currentPrice)}
            </p>
          ) : (
            <p className="text-muted-foreground">No price data available</p>
          )}
        </div>

        {change24h !== undefined ? (
          <div
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 backdrop-blur",
              positive
                ? "border-success/30 bg-success/10 text-success"
                : "border-danger/30 bg-danger/10 text-danger",
            )}
          >
            {positive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="text-sm font-semibold tabular-nums">
              {positive ? "+" : ""}
              {change24h.toFixed(2)}%
            </span>
            <span className="text-xs text-muted-foreground">24h</span>
          </div>
        ) : loading ? (
          <div className="h-10 w-24 shrink-0 rounded-full animate-shimmer" />
        ) : null}
      </div>
    </div>
  );
}
