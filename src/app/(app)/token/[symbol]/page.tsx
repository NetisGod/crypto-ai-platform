import { notFound } from "next/navigation";
import Link from "next/link";
import { getTokenPageData, formatCompactNum } from "@/lib/dashboard-data";
import { getTokenBySymbol, MOCK_PRICE_HISTORY } from "@/data/mock-data";
import { ChartCard } from "@/components/dashboard/chart-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
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
  const data = await getTokenPageData(symbol);
  const token = data?.token ?? getTokenBySymbol(symbol);
  if (!token) notFound();

  const chartData = data?.chartData ?? MOCK_PRICE_HISTORY[token.symbol] ?? MOCK_PRICE_HISTORY.BTC;

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
          value={`${token.change7d >= 0 ? "+" : ""}${token.change7d.toFixed(2)}%`}
          change={token.change7d}
        />
        <MetricCard
          title="Market cap"
          value={formatCompactNum(token.marketCap)}
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">24h volume</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatCompactNum(token.volume24h)}
          </p>
          <p className="text-sm text-muted-foreground">
            Total trading volume in the last 24 hours
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
