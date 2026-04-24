"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/dashboard/metric-card";
import { MarketChartCard } from "@/components/dashboard/market-chart-card";
import { MarketNews } from "@/components/dashboard/MarketNews";
import { AiMarketBriefCard } from "@/components/dashboard/ai-market-brief-card";
import { useMarketPrices } from "@/hooks/use-market-prices";
import { formatCompactNum } from "@/data/mock-data";
import type { TokenSummary } from "@/data/mock-data";
import { TrendingUp, DollarSign, BarChart3, ChevronRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlowCard } from "@/components/ui/glow-card";
import { cn } from "@/lib/utils";
import { MOCK_TOKENS } from "@/data/mock-data";

type DashboardData = {
  tokens: TokenSummary[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const { prices, loading: pricesLoading } = useMarketPrices();

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(setData)
      .catch(() =>
        setData({
          tokens: MOCK_TOKENS,
        })
      );
  }, []);

  const tokens = data?.tokens ?? MOCK_TOKENS;

  const liveBtc = prices.find((p) => p.symbol === "BTC");
  const liveEth = prices.find((p) => p.symbol === "ETH");

  const btcPrice = liveBtc?.currentPrice ?? tokens.find((t) => t.symbol === "BTC")?.price;
  const btcChange = liveBtc?.priceChangePercentage24h ?? tokens.find((t) => t.symbol === "BTC")?.change24h;
  const ethPrice = liveEth?.currentPrice ?? tokens.find((t) => t.symbol === "ETH")?.price;
  const ethChange = liveEth?.priceChangePercentage24h ?? tokens.find((t) => t.symbol === "ETH")?.change24h;

  const totalVolume = liveBtc && liveEth
    ? liveBtc.volume24h + liveEth.volume24h
    : tokens.reduce((s, t) => s + t.volume24h, 0);

  const avgChange = liveBtc && liveEth
    ? (liveBtc.priceChangePercentage24h + liveEth.priceChangePercentage24h) / 2
    : tokens.length
      ? tokens.reduce((s, t) => s + t.change24h, 0) / tokens.length
      : 0;

  const topMovers = tokens.slice(0, 5).map((token) => {
    const live = prices.find((p) => p.symbol === token.symbol);
    return live
      ? { ...token, price: live.currentPrice, change24h: live.priceChangePercentage24h }
      : token;
  });

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Market Overview"
        live
        title="Market intelligence, at a glance."
        description="Live market structure, AI-generated briefings, and real-time signals across the assets you care about."
        size="lg"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="BTC Price"
          value={btcPrice != null ? `$${btcPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
          change={btcChange}
          changeLabel="24h"
          icon={DollarSign}
          variant="accent"
          href="/app/token/BTC"
          loading={pricesLoading && !liveBtc}
        />
        <MetricCard
          title="ETH Price"
          value={ethPrice != null ? `$${ethPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
          change={ethChange}
          changeLabel="24h"
          icon={TrendingUp}
          href="/app/token/ETH"
          loading={pricesLoading && !liveEth}
        />
        <MetricCard
          title="24h Volume"
          value={formatCompactNum(totalVolume)}
          icon={BarChart3}
          loading={pricesLoading && !liveBtc}
        />
        <MetricCard
          title="Market sentiment"
          value={`${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`}
          change={avgChange}
          changeLabel="avg 24h"
          icon={TrendingUp}
          loading={pricesLoading && !liveBtc}
        />
      </div>

      <AiMarketBriefCard />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <MarketChartCard />
        </div>
        <MarketNews />
      </div>

      <GlowCard padding="md" noHoverBlob>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Top movers
            </h2>
            <span className="text-xs text-muted-foreground">· 24h</span>
          </div>
          <Link
            href="/app/token/BTC"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {topMovers.map((token) => {
            const positive = token.change24h >= 0;
            return (
              <Link
                key={token.symbol}
                href={`/app/token/${token.symbol}`}
                className="group flex flex-col gap-1 rounded-xl border border-border/60 bg-card/60 p-3 backdrop-blur transition-all hover:border-accent/40 hover:bg-card hover:shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold tracking-tight text-foreground">
                    {token.symbol}
                  </p>
                  <span
                    className={cn(
                      "text-xs font-medium tabular-nums",
                      positive ? "text-success" : "text-danger",
                    )}
                  >
                    {positive ? "+" : ""}
                    {token.change24h.toFixed(2)}%
                  </span>
                </div>
                <p className="text-sm tabular-nums text-muted-foreground">
                  ${token.price.toLocaleString()}
                </p>
              </Link>
            );
          })}
        </div>
      </GlowCard>
    </div>
  );
}
