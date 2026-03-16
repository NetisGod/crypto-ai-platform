"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useMarketPrices } from "@/hooks/use-market-prices";
import { formatCompactNum } from "@/data/mock-data";

interface TokenStatsProps {
  symbol: string;
  className?: string;
}

function formatPrice(value: number): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function StatRow({
  label,
  value,
  loading,
  change,
}: {
  label: string;
  value: string | null;
  loading?: boolean;
  change?: number;
}) {
  const positive = change !== undefined && change >= 0;

  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {loading ? (
        <div className="h-5 w-16 animate-pulse rounded bg-muted" />
      ) : value ? (
        <span className={cn("font-medium", change !== undefined && (positive ? "text-emerald-500" : "text-red-500"))}>
          {value}
          {change !== undefined && (
            <span className="ml-1 inline-flex items-center">
              {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            </span>
          )}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )}
    </div>
  );
}

export function TokenStats({ symbol, className }: TokenStatsProps) {
  const { prices, loading, error } = useMarketPrices();
  const priceData = prices.find((p) => p.symbol === symbol);

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Market Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-6">
            <AlertCircle className="h-8 w-8 text-destructive/70" />
            <p className="text-center text-sm text-muted-foreground">
              Unable to load stats
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isEmpty = !loading && !priceData;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Market Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No stats available for {symbol}
          </div>
        ) : (
          <div className="divide-y divide-border">
            <StatRow
              label="Price"
              value={priceData ? formatPrice(priceData.currentPrice) : null}
              loading={loading && !priceData}
            />
            <StatRow
              label="24h change"
              value={
                priceData
                  ? `${priceData.priceChangePercentage24h >= 0 ? "+" : ""}${priceData.priceChangePercentage24h.toFixed(2)}%`
                  : null
              }
              loading={loading && !priceData}
              change={priceData?.priceChangePercentage24h}
            />
            <StatRow
              label="24h volume"
              value={priceData ? `$${formatCompactNum(priceData.volume24h)}` : null}
              loading={loading && !priceData}
            />
            <StatRow
              label="Market cap"
              value={null}
              loading={false}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
