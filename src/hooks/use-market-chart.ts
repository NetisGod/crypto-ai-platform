"use client";

import { useEffect, useState } from "react";
import type {
  AssetSymbol,
  ChartPoint,
  MarketChartResponse,
  TimeRange,
} from "@/services/market/types";

interface UseMarketChartReturn {
  data: ChartPoint[];
  loading: boolean;
  error: string | null;
}

export function useMarketChart(
  asset: AssetSymbol,
  range: TimeRange
): UseMarketChartReturn {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(
          `/api/market/chart?asset=${encodeURIComponent(asset)}&range=${encodeURIComponent(range)}`,
          { signal: controller.signal }
        );
        const json = (await res.json()) as MarketChartResponse & {
          error?: string;
        };
        if (!res.ok)
          throw new Error(json.error ?? `Request failed: ${res.status}`);
        setData(json.data);
      } catch (e) {
        if (controller.signal.aborted) return;
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        setData([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [asset, range]);

  return { data, loading, error };
}
