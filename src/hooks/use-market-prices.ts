"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CurrentPrice, MarketPricesResponse } from "@/services/market/types";

const POLL_INTERVAL = 20_000; // 20 seconds

interface UseMarketPricesReturn {
  prices: CurrentPrice[];
  loading: boolean;
  error: string | null;
}

export function useMarketPrices(): UseMarketPricesReturn {
  const [prices, setPrices] = useState<CurrentPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPrices = useCallback(async (isInitial: boolean) => {
    if (isInitial) setLoading(true);
    try {
      const res = await fetch("/api/market/prices");
      const json = (await res.json()) as MarketPricesResponse & { error?: string };
      if (!res.ok) throw new Error(json.error ?? `Request failed: ${res.status}`);
      setPrices(json.prices);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (isInitial) setError(msg);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPrices(true);
    intervalRef.current = setInterval(() => void fetchPrices(false), POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchPrices]);

  return { prices, loading, error };
}
