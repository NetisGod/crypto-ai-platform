import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";

interface TokenUnsupportedFallbackProps {
  symbol: string;
}

const SUPPORTED_SYMBOLS = ["BTC", "ETH"] as const;

export function TokenUnsupportedFallback({
  symbol,
}: TokenUnsupportedFallbackProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="glass" size="sm" asChild className="rounded-full">
          <Link href="/app">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Market Overview
          </Link>
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-warning/30 bg-gradient-hero p-8 shadow-elegant sm:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-warning/15 blur-3xl"
        />
        <div className="relative flex flex-col items-center gap-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10 ring-1 ring-warning/30">
            <AlertCircle className="h-7 w-7 text-warning" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Not available for AI token analysis
            </h1>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{symbol}</span> is
              not available yet. We currently support:
            </p>
            <p className="text-sm font-semibold tracking-tight text-foreground">
              {SUPPORTED_SYMBOLS.join(" · ")}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {SUPPORTED_SYMBOLS.map((sym) => (
              <Button
                key={sym}
                variant="glass"
                size="sm"
                asChild
                className="rounded-full"
              >
                <Link href={`/app/token/${sym}`}>{sym}</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
