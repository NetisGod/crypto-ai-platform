import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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
    return { title: "Token not supported | Crypto AI" };
  }
  return {
    title: `${upper} | Crypto AI`,
    description: `Token overview for ${upper}.`,
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild aria-label="Back to dashboard">
          <Link href="/app">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <TokenHeader symbol={upper} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TokenChart symbol={upper} />
        </div>
        <TokenStats symbol={upper} />
      </div>

      <TokenAnalysisCard symbol={upper} />

      <TokenNews symbol={upper} />
    </div>
  );
}
