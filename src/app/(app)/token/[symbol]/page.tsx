import { notFound } from "next/navigation";
import Link from "next/link";
import { getTokenPageData, formatCompactNum } from "@/lib/dashboard-data";
import { getTokenBySymbol, MOCK_PRICE_HISTORY } from "@/data/mock-data";
import type { TokenSummary, PricePoint } from "@/data/mock-data";
import { ChartCard } from "@/components/dashboard/chart-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { fetchCurrentPrices, fetchMarketChart } from "@/services/market/binance";
import type { AssetSymbol } from "@/services/market/types";

const BINANCE_ASSETS = new Set<string>(["BTC", "ETH"]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const upper = symbol.toUpperCase();

  if (BINANCE_ASSETS.has(upper)) {
    const prices = await fetchCurrentPrices().catch(() => []);
    const p = prices.find((x) => x.symbol === upper);
    if (p) return { title: `${p.symbol} – ${p.name} | Crypto AI`, description: `Price and metrics for ${p.symbol}.` };
  }

  const data = await getTokenPageData(symbol);
  const token = data?.token ?? getTokenBySymbol(symbol);
  if (!token) return { title: "Token not found" };
  return {
    title: `${token.symbol} – ${token.name} | Crypto AI`,
    description: `Price, metrics, and narrative for ${token.symbol}.`,
  };
}

export default async function TokenPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const upper = symbol.toUpperCase();

  let token: TokenSummary | null = null;
  let chartData: PricePoint[] = [];

  if (BINANCE_ASSETS.has(upper)) {
    const [prices, klines] = await Promise.all([
      fetchCurrentPrices().catch(() => []),
      fetchMarketChart(upper as AssetSymbol, "1D").catch(() => []),
    ]);
    const p = prices.find((x) => x.symbol === upper);
    if (p) {
      token = {
        symbol: p.symbol,
        name: p.name,
        price: p.currentPrice,
        change24h: p.priceChangePercentage24h,
        change7d: 0,
        volume24h: p.volume24h,
        marketCap: 0,
      };
    }
    if (klines.length) {
      chartData = klines.map((k) => ({ time: k.time, value: k.value }));
    }
  }

  if (!token) {
    const data = await getTokenPageData(symbol);
    token = data?.token ?? getTokenBySymbol(symbol) ?? null;
    chartData = data?.chartData ?? MOCK_PRICE_HISTORY[upper] ?? MOCK_PRICE_HISTORY.BTC;
  }

  if (!token) notFound();

  if (!chartData.length) {
    chartData = MOCK_PRICE_HISTORY[token.symbol] ?? MOCK_PRICE_HISTORY.BTC;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {token.symbol} – {token.name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Price, volume, and narrative overview
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Price"
          value={`$${token.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          change={token.change24h}
          changeLabel="24h"
          variant="accent"
        />
        <MetricCard
          title="24h change"
          value={`${token.change24h >= 0 ? "+" : ""}${token.change24h.toFixed(2)}%`}
          change={token.change24h}
        />
        <MetricCard
          title="7d change"
          value={token.change7d !== 0 ? `${token.change7d >= 0 ? "+" : ""}${token.change7d.toFixed(2)}%` : "—"}
          change={token.change7d !== 0 ? token.change7d : undefined}
        />
        <MetricCard
          title="24h volume"
          value={formatCompactNum(token.volume24h)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard
            title={`${token.symbol} 24h price`}
            data={chartData}
            valuePrefix="$"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Narrative</CardTitle>
          </CardHeader>
          <CardContent>
            {token.narrative ? (
              <p className="text-sm text-muted-foreground">
                {token.narrative}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No narrative assigned.
              </p>
            )}
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/narratives">
                Explore narratives <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
