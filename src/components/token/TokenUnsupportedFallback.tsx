import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";

interface TokenUnsupportedFallbackProps {
  symbol: string;
}

const SUPPORTED_SYMBOLS = ["BTC", "ETH"] as const;

export function TokenUnsupportedFallback({ symbol }: TokenUnsupportedFallbackProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Token not supported</h1>
          <p className="mt-1 text-muted-foreground">
            <span className="font-medium">{symbol}</span> is not available yet.
          </p>
        </div>
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex flex-col items-center gap-6 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
            <AlertCircle className="h-7 w-7 text-amber-500" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">
              We currently support the following tokens:
            </p>
            <p className="text-muted-foreground text-sm">
              {SUPPORTED_SYMBOLS.join(", ")}
            </p>
          </div>
          <div className="flex gap-3">
            {SUPPORTED_SYMBOLS.map((sym) => (
              <Button key={sym} variant="outline" asChild>
                <Link href={`/app/token/${sym}`}>{sym}</Link>
              </Button>
            ))}
          </div>
          <Button variant="secondary" asChild>
            <Link href="/app">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
