"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMarketChart } from "@/hooks/use-market-chart";
import { useState } from "react";
import type { AssetSymbol, TimeRange } from "@/services/market/types";

const ASSETS: AssetSymbol[] = ["BTC", "ETH"];

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: "1 Day", value: "1D" },
  { label: "1 Week", value: "1W" },
  { label: "1 Month", value: "1M" },
  { label: "1 Year", value: "1Y" },
  { label: "All", value: "ALL" },
];

interface MarketChartCardProps {
  asset?: AssetSymbol;
  range?: TimeRange;
  onAssetChange?: (asset: AssetSymbol) => void;
  onRangeChange?: (range: TimeRange) => void;
  className?: string;
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`;
  return `$${value.toLocaleString()}`;
}

function ChartSkeleton() {
  return (
    <div className="h-[280px] w-full space-y-3">
      <div className="h-4 w-24 rounded animate-shimmer" />
      <div className="flex h-[230px] items-end gap-0.5">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t animate-shimmer"
            style={{
              height: `${20 + Math.sin((i / 30) * Math.PI * 2) * 30 + ((i * 7 + 3) % 20)}%`,
              animationDelay: `${i * 15}ms`,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        <div className="h-3 w-12 rounded animate-shimmer" />
        <div className="h-3 w-12 rounded animate-shimmer" />
      </div>
    </div>
  );
}

export function MarketChartCard({
  asset: assetProp,
  range: rangeProp,
  onAssetChange,
  onRangeChange,
  className,
}: MarketChartCardProps) {
  const [internalAsset, setInternalAsset] = useState<AssetSymbol>(assetProp ?? "BTC");
  const [internalRange, setInternalRange] = useState<TimeRange>(rangeProp ?? "1D");

  const asset = assetProp ?? internalAsset;
  const range = rangeProp ?? internalRange;

  const handleAssetChange = (a: AssetSymbol) => {
    setInternalAsset(a);
    onAssetChange?.(a);
  };

  const handleRangeChange = (r: TimeRange) => {
    setInternalRange(r);
    onRangeChange?.(r);
  };

  const { data, loading, error } = useMarketChart(asset, range);

  const tickInterval = getTickInterval(data.length, range);

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border-border/60 shadow-soft transition-shadow duration-300 hover:shadow-elegant",
        className,
      )}
    >
      <CardHeader className="space-y-3 pb-2">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/60 p-1 backdrop-blur">
            {ASSETS.map((a) => (
              <button
                key={a}
                onClick={() => handleAssetChange(a)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold tracking-tight transition-colors",
                  asset === a
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {a}
              </button>
            ))}
          </div>
          <div className="inline-flex items-center gap-0.5 rounded-full border border-border/60 bg-card/60 p-0.5 backdrop-blur">
            {TIME_RANGES.map(({ label, value }) => (
              <Button
                key={value}
                size="sm"
                variant="ghost"
                className={cn(
                  "h-7 rounded-full px-2.5 text-[11px]",
                  range === value
                    ? "pointer-events-none bg-accent/15 text-accent"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
                onClick={() => handleRangeChange(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && data.length === 0 ? (
          <ChartSkeleton />
        ) : error ? (
          <div className="flex h-[280px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 text-center text-sm text-muted-foreground">
            <p className="font-medium">Unable to load chart</p>
            <p className="max-w-[280px] text-xs">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
            No chart data available
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="marketChartGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--accent))"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--accent))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={tickInterval}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatYAxis}
                  domain={["auto", "auto"]}
                  width={65}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: number) => [
                    `$${value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`,
                    "Price",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  fill="url(#marketChartGradient)"
                  animationDuration={600}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getTickInterval(dataLength: number, range: TimeRange): number {
  if (dataLength <= 10) return 0;
  switch (range) {
    case "1D":
      return Math.max(Math.floor(dataLength / 8), 1);
    case "1W":
      return Math.max(Math.floor(dataLength / 7), 1);
    case "1M":
      return Math.max(Math.floor(dataLength / 8), 1);
    case "1Y":
      return Math.max(Math.floor(dataLength / 12), 1);
    case "ALL":
      return Math.max(Math.floor(dataLength / 10), 1);
  }
}
