"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { MarketChartCard } from "@/components/dashboard/market-chart-card";
import { NewsFeed } from "@/components/dashboard/news-feed";
import { MarketNews } from "@/components/dashboard/MarketNews";
import { AiMarketBriefCard } from "@/components/dashboard/ai-market-brief-card";
import { useMarketPrices } from "@/hooks/use-market-prices";
import { formatCompactNum } from "@/data/mock-data";
import type { TokenSummary, NewsItem } from "@/data/mock-data";
import type { AssetSymbol, TimeRange } from "@/services/market/types";
import { TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_TOKENS, MOCK_NEWS } from "@/data/mock-data";

type DashboardData = {
  tokens: TokenSummary[];
  news: NewsItem[];
};

function isBinanceAsset(symbol: string): symbol is AssetSymbol {
  return symbol === "BTC" || symbol === "ETH";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const { prices, loading: pricesLoading } = useMarketPrices();

  const [selectedAsset, setSelectedAsset] = useState<AssetSymbol>("BTC");
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1D");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(setData)
      .catch(() =>
        setData({
          tokens: MOCK_TOKENS,
          news: MOCK_NEWS,
        })
      );
  }, []);

  const tokens = data?.tokens ?? MOCK_TOKENS;
  const news = data?.news ?? MOCK_NEWS;

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Market overview and key metrics at a glance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="BTC Price"
          value={btcPrice != null ? `$${btcPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
          change={btcChange}
          changeLabel="24h"
          icon={DollarSign}
          variant="accent"
          selected={selectedAsset === "BTC"}
          onClick={() => setSelectedAsset("BTC")}
          loading={pricesLoading && !liveBtc}
        />
        <MetricCard
          title="ETH Price"
          value={ethPrice != null ? `$${ethPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
          change={ethChange}
          changeLabel="24h"
          icon={TrendingUp}
          selected={selectedAsset === "ETH"}
          onClick={() => setSelectedAsset("ETH")}
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
        <div className="lg:col-span-2">
          <MarketChartCard
            asset={selectedAsset}
            range={selectedRange}
            onRangeChange={setSelectedRange}
          />
        </div>
        <MarketNews />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Top movers</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/token/BTC">
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {topMovers.map((token) => {
              const sym = token.symbol;
              return isBinanceAsset(sym) ? (
                <button
                  key={sym}
                  onClick={() => setSelectedAsset(sym)}
                  className={cn(
                    "flex min-w-[140px] items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors",
                    selectedAsset === sym
                      ? "border-primary/50 bg-muted/50 ring-2 ring-primary/60"
                      : "border-border bg-muted/30 hover:border-primary/30 hover:bg-muted/50"
                  )}
                >
                  <div>
                    <p className="font-semibold">{sym}</p>
                    <p
                      className={
                        token.change24h >= 0
                          ? "text-sm text-emerald-500"
                          : "text-sm text-red-500"
                      }
                    >
                      {token.change24h >= 0 ? "+" : ""}
                      {token.change24h.toFixed(2)}%
                    </p>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    ${token.price.toLocaleString()}
                  </p>
                </button>
              ) : (
                <Link
                  key={sym}
                  href={`/token/${sym}`}
                  className="flex min-w-[140px] items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-muted/50"
                >
                  <div>
                    <p className="font-semibold">{sym}</p>
                    <p
                      className={
                        token.change24h >= 0
                          ? "text-sm text-emerald-500"
                          : "text-sm text-red-500"
                      }
                    >
                      {token.change24h >= 0 ? "+" : ""}
                      {token.change24h.toFixed(2)}%
                    </p>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    ${token.price.toLocaleString()}
                  </p>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
