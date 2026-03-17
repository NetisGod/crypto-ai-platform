"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Eye,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import type { TokenAnalysis } from "@/ai/schemas/tokenAnalysis";

interface TokenAnalysisCardProps {
  symbol: string;
  className?: string;
}

type Status = "idle" | "loading" | "error";

function confidenceLabel(value: number): string {
  if (value >= 0.8) return "High";
  if (value >= 0.5) return "Moderate";
  return "Low";
}

function confidenceColor(value: number): string {
  if (value >= 0.8) return "text-emerald-500";
  if (value >= 0.5) return "text-yellow-500";
  return "text-red-400";
}

function confidenceBarColor(value: number): string {
  if (value >= 0.8) return "bg-emerald-500";
  if (value >= 0.5) return "bg-yellow-500";
  return "bg-red-400";
}

export function TokenAnalysisCard({ symbol, className }: TokenAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<TokenAnalysis | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setStatus("loading");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/ai/token-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          (body as Record<string, string> | null)?.error ?? `HTTP ${res.status}`,
        );
      }
      const data = (await res.json()) as { analysis: TokenAnalysis };
      setAnalysis(data.analysis);
      setStatus("idle");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }, [symbol]);

  useEffect(() => {
    void generate();
  }, [generate]);

  return (
    <Card className={cn("flex flex-col", className)} data-testid="token-analysis-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Brain className="h-4 w-4 text-muted-foreground" />
          AI Analysis
        </CardTitle>
        {status !== "loading" && (
          <button
            onClick={() => void generate()}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Regenerate analysis"
            data-testid="token-analysis-refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        {status === "loading" && <LoadingSkeleton />}

        {status === "error" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <AlertCircle className="h-6 w-6 text-destructive/70" />
            <p className="text-center text-sm text-muted-foreground">
              {errorMsg ?? "Unable to generate analysis"}
            </p>
            <button
              onClick={() => void generate()}
              className="text-xs font-medium text-primary hover:underline"
              data-testid="token-analysis-retry"
            >
              Try again
            </button>
          </div>
        )}

        {status === "idle" && !analysis && (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No analysis available for {symbol}.
            </p>
          </div>
        )}

        {status === "idle" && analysis && (
          <div className="space-y-5" data-testid="token-analysis-content">
            {/* Summary */}
            <p className="text-sm leading-relaxed text-foreground" data-testid="token-analysis-summary">
              {analysis.summary}
            </p>

            {/* Bullish / Bearish */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FactorList
                label="Bullish"
                items={analysis.bullish_factors}
                icon={<TrendingUp className="h-3.5 w-3.5" />}
                color="emerald"
                testId="token-analysis-bullish"
              />
              <FactorList
                label="Bearish"
                items={analysis.bearish_factors}
                icon={<TrendingDown className="h-3.5 w-3.5" />}
                color="red"
                testId="token-analysis-bearish"
              />
            </div>

            {/* Outlook */}
            <div className="rounded-lg border border-border bg-muted/30 p-3.5">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Eye className="h-3.5 w-3.5" />
                Short-term Outlook
              </div>
              <p className="text-sm leading-relaxed text-foreground" data-testid="token-analysis-outlook">
                {analysis.outlook}
              </p>
            </div>

            {/* Confidence */}
            <div className="flex items-center gap-3" data-testid="token-analysis-confidence">
              <span className="text-xs text-muted-foreground">Confidence</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    confidenceBarColor(analysis.confidence),
                  )}
                  style={{ width: `${Math.round(analysis.confidence * 100)}%` }}
                />
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  confidenceColor(analysis.confidence),
                )}
              >
                {confidenceLabel(analysis.confidence)}{" "}
                <span className="text-muted-foreground">
                  ({Math.round(analysis.confidence * 100)}%)
                </span>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FactorList({
  label,
  items,
  icon,
  color,
  testId,
}: {
  label: string;
  items: string[];
  icon: React.ReactNode;
  color: "emerald" | "red";
  testId: string;
}) {
  const accent =
    color === "emerald"
      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
      : "text-red-400 bg-red-500/10 border-red-500/20";
  const dotColor = color === "emerald" ? "bg-emerald-500" : "bg-red-400";

  return (
    <div className={cn("rounded-lg border p-3", accent)} data-testid={testId}>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium">
        {icon}
        {label}
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-xs leading-snug text-foreground">
            <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dotColor)} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5" data-testid="token-analysis-loading">
      <div className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-28 animate-pulse rounded-lg bg-muted/60" />
        <div className="h-28 animate-pulse rounded-lg bg-muted/60" />
      </div>
      <div className="h-20 animate-pulse rounded-lg bg-muted/60" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-muted/40" />
    </div>
  );
}
