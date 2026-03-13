"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { BtcChartCard } from "@/components/dashboard/btc-chart-card";
import { NewsFeed } from "@/components/dashboard/news-feed";
import { AiMarketBriefCard } from "@/components/dashboard/ai-market-brief-card";
import { formatCompactNum } from "@/data/mock-data";
import type { TokenSummary } from "@/data/mock-data";
import type { NewsItem } from "@/data/mock-data";
import { TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { MOCK_TOKENS, MOCK_NEWS } from "@/data/mock-data";

type DashboardData = {
  tokens: TokenSummary[];
  news: NewsItem[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

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

  const btc = tokens.find((t) => t.symbol === "BTC");
  const eth = tokens.find((t) => t.symbol === "ETH");
  const totalVolume = tokens.reduce((s, t) => s + t.volume24h, 0);
  const avgChange = tokens.length ? tokens.reduce((s, t) => s + t.change24h, 0) / tokens.length : 0;

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
          value={btc ? `$${btc.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
          change={btc?.change24h}
          changeLabel="24h"
          icon={DollarSign}
          variant="accent"
        />
        <MetricCard
          title="ETH Price"
          value={eth ? `$${eth.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
          change={eth?.change24h}
          changeLabel="24h"
          icon={TrendingUp}
        />
        <MetricCard
          title="24h Volume"
          value={formatCompactNum(totalVolume)}
          icon={BarChart3}
        />
        <MetricCard
          title="Market sentiment"
          value={`${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`}
          change={avgChange}
          changeLabel="avg 24h"
          icon={TrendingUp}
        />
      </div>

      <AiMarketBriefCard />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BtcChartCard />
        </div>
        <NewsFeed items={news} maxHeight="280px" />
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
            {tokens.slice(0, 5).map((token) => (
              <Link
                key={token.symbol}
                href={`/token/${token.symbol}`}
                className="flex min-w-[140px] items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-muted/50"
              >
                <div>
                  <p className="font-semibold">{token.symbol}</p>
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
