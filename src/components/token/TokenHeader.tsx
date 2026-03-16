"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useMarketPrices } from "@/hooks/use-market-prices";

interface TokenHeaderProps {
  symbol: string;
}

function formatPrice(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function TokenHeader({ symbol }: TokenHeaderProps) {
  const { prices, loading, error } = useMarketPrices();
  const priceData = prices.find((p) => p.symbol === symbol);

  const change24h = priceData?.priceChangePercentage24h;
  const positive = change24h !== undefined && change24h >= 0;

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{symbol}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Unable to load market data</p>
            <p className="mt-0.5 text-xs text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardContent className="flex items-center justify-between pt-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{symbol}</h1>
          {loading && !priceData ? (
            <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          ) : priceData ? (
            <p className="text-2xl font-semibold">{formatPrice(priceData.currentPrice)}</p>
          ) : (
            <p className="text-muted-foreground">No price data available</p>
          )}
        </div>
        {change24h !== undefined ? (
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5",
              positive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
            )}
          >
            {positive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {positive ? "+" : ""}
              {change24h.toFixed(2)}%
            </span>
            <span className="text-xs text-muted-foreground">24h</span>
          </div>
        ) : loading ? (
          <div className="h-9 w-20 animate-pulse rounded-lg bg-muted/60" />
        ) : null}
      </CardContent>
    </Card>
  );
}
