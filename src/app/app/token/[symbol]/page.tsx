import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { TokenHeader } from "@/components/token/TokenHeader";
import { TokenChart } from "@/components/token/TokenChart";
import { TokenStats } from "@/components/token/TokenStats";
import { TokenNews } from "@/components/token/TokenNews";
import { TokenAnalysisCard } from "@/components/token/TokenAnalysisCard";
import { TokenUnsupportedFallback } from "@/components/token/TokenUnsupportedFallback";

const SUPPORTED_SYMBOLS = new Set<string>(["BTC", "ETH"]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const upper = symbol.toUpperCase();
  if (!SUPPORTED_SYMBOLS.has(upper)) {
    return { title: "Not available for AI token analysis | Crypto AI" };
  }
  return {
    title: `${upper} | Crypto AI`,
    description: `AI token analysis and market view for ${upper}.`,
  };
}

export default async function TokenPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const upper = symbol.toUpperCase();

  if (!SUPPORTED_SYMBOLS.has(upper)) {
    return <TokenUnsupportedFallback symbol={upper} />;
  }

  return (
    <div className="space-y-8">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-foreground"
      >
        <Link
          href="/app"
          className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/60 px-2.5 py-1 backdrop-blur transition-colors hover:border-border hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Market Overview
        </Link>
        <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
        <span className="text-foreground">AI Token Analysis</span>
        <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
        <span className="text-foreground">{upper}</span>
      </nav>

      <TokenHeader symbol={upper} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <TokenChart symbol={upper} />
        </div>
        <TokenStats symbol={upper} />
      </div>

      <TokenAnalysisCard symbol={upper} />

      <TokenNews symbol={upper} />
    </div>
  );
}
