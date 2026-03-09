import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNarrativesData } from "@/lib/dashboard-data";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Narratives | Crypto AI Market Intelligence",
  description: "Track crypto market narratives and sentiment.",
};

export default async function NarrativesPage() {
  const narratives = await getNarrativesData();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Narratives</h1>
        <p className="mt-1 text-muted-foreground">
          Market narratives driving sentiment and flows
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {narratives.map((n) => {
          const TrendIcon =
            n.trend === "up"
              ? TrendingUp
              : n.trend === "down"
                ? TrendingDown
                : Minus;
          const trendColor =
            n.trend === "up"
              ? "text-emerald-500"
              : n.trend === "down"
                ? "text-red-500"
                : "text-muted-foreground";
          return (
            <Card
              key={n.id}
              className="transition-colors hover:border-primary/30"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">{n.name}</CardTitle>
                <TrendIcon className={`h-5 w-5 ${trendColor}`} />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {n.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Strength</p>
                    <div className="mt-0.5 h-2 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${n.strength}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sentiment</p>
                    <p className="font-medium">{n.sentiment}%</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {n.tokens.map((t) => (
                    <Link
                      key={t}
                      href={`/token/${t}`}
                      className="rounded bg-primary/15 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/25"
                    >
                      {t}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
