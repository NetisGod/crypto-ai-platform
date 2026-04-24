"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
  if (value >= 0.8) return "text-success";
  if (value >= 0.5) return "text-warning";
  return "text-danger";
}

function confidenceBarColor(value: number): string {
  if (value >= 0.8) return "bg-success";
  if (value >= 0.5) return "bg-warning";
  return "bg-danger";
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
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-hero shadow-elegant",
        className,
      )}
      data-testid="token-analysis-card"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative z-10 flex flex-row items-center justify-between border-b border-border/40 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Brain className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              AI Synthesis
            </p>
            <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {symbol} — AI token analysis
            </h3>
          </div>
        </div>
        {status !== "loading" && (
          <Button
            variant="glass"
            size="sm"
            onClick={() => void generate()}
            className="rounded-full text-xs"
            aria-label="Regenerate analysis"
            data-testid="token-analysis-refresh"
          >
            <RefreshCw className="h-3 w-3" />
            <span className="hidden sm:inline">Regenerate</span>
          </Button>
        )}
      </div>

      <div className="relative z-10 px-6 py-5">
        {status === "loading" && <LoadingSkeleton />}

        {status === "error" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <AlertCircle className="h-6 w-6 text-destructive/70" />
            <p className="text-center text-sm text-muted-foreground">
              {errorMsg ?? "Unable to generate analysis"}
            </p>
            <button
              onClick={() => void generate()}
              className="text-xs font-medium text-accent hover:underline"
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
            <p
              className="text-sm leading-relaxed text-foreground sm:text-base"
              data-testid="token-analysis-summary"
            >
              {analysis.summary}
            </p>

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

            <div className="rounded-xl border border-border/50 bg-card/40 p-4 backdrop-blur">
              <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
                <Eye className="h-3.5 w-3.5" />
                Short-term Outlook
              </div>
              <p
                className="text-sm leading-relaxed text-foreground"
                data-testid="token-analysis-outlook"
              >
                {analysis.outlook}
              </p>
            </div>

            <div
              className="flex items-center gap-3"
              data-testid="token-analysis-confidence"
            >
              <span className="text-xs text-muted-foreground">Confidence</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/60">
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
                  "text-xs font-medium tabular-nums",
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
      </div>
    </div>
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
      ? "text-success bg-success/10 border-success/20"
      : "text-danger bg-danger/10 border-danger/20";
  const dotColor = color === "emerald" ? "bg-success" : "bg-danger";

  return (
    <div
      className={cn("rounded-xl border p-4 backdrop-blur", accent)}
      data-testid={testId}
    >
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
        {icon}
        {label}
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-2 text-xs leading-snug text-foreground"
          >
            <span
              className={cn(
                "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                dotColor,
              )}
            />
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
        <div className="h-4 w-full rounded animate-shimmer" />
        <div className="h-4 w-5/6 rounded animate-shimmer" />
        <div className="h-4 w-3/4 rounded animate-shimmer" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-28 rounded-xl animate-shimmer" />
        <div className="h-28 rounded-xl animate-shimmer" />
      </div>
      <div className="h-20 rounded-xl animate-shimmer" />
      <div className="h-4 w-1/2 rounded animate-shimmer" />
    </div>
  );
}
