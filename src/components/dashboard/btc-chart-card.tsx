"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { cn } from "@/lib/utils";

type ChartPoint = { time: string; value: number };

export function BtcChartCard({ className }: { className?: string }) {
  const [data, setData] = useState<ChartPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/market/btc-chart");
      const json = (await res.json()) as { data?: ChartPoint[]; error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? `Request failed: ${res.status}`);
      }
      if (Array.isArray(json.data) && json.data.length > 0) {
        setData(json.data);
      } else {
        setData([]);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchChart();
  }, [fetchChart]);

  if (loading && !data) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">BTC 24h price</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] w-full space-y-3">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="flex h-[180px] items-end gap-0.5">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 animate-pulse rounded-t bg-muted/60"
                  style={{
                    height: `${30 + Math.sin((i / 24) * Math.PI) * 50}%`,
                    animationDelay: `${i * 20}ms`,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between">
              <div className="h-3 w-12 animate-pulse rounded bg-muted/60" />
              <div className="h-3 w-12 animate-pulse rounded bg-muted/60" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">BTC 24h price</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[220px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 text-center text-sm text-muted-foreground">
            <p className="font-medium">Unable to load chart</p>
            <p className="max-w-[280px] text-xs">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">BTC 24h price</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
            No chart data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ChartCard
      title="BTC 24h price"
      data={data}
      valuePrefix="$"
      className={className}
    />
  );
}
