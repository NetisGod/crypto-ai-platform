import { Sparkles, TrendingUp, TrendingDown, Database, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AskAiResponse, AskAiIntent } from "@/ai/schemas/askAi";

// ─── Intent labels ─────────────────────────────────────────────────────────────

const INTENT_LABELS: Record<AskAiIntent, string> = {
  token_analysis: "Token Analysis",
  market_summary: "Market Summary",
  top_movers: "Top Movers",
  news_summary: "News Summary",
  general_market_question: "Market Q&A",
};

// ─── Confidence helpers ────────────────────────────────────────────────────────

function confidenceColor(value: number): string {
  if (value >= 0.7) return "text-emerald-400";
  if (value >= 0.4) return "text-amber-400";
  return "text-red-400";
}

function confidenceDot(value: number): string {
  if (value >= 0.7) return "bg-emerald-400";
  if (value >= 0.4) return "bg-amber-400";
  return "bg-red-400";
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────

export function AskAILoadingSkeleton() {
  return (
    <Card className="border border-slate-800 bg-slate-950/60">
      <CardContent className="space-y-4 pt-6">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800/80" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-800/70" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-slate-800/60" />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="h-3 w-20 animate-pulse rounded bg-slate-800/80" />
            <div className="space-y-1.5">
              <div className="h-3 w-full animate-pulse rounded bg-slate-800/60" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-slate-800/50" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-16 animate-pulse rounded bg-slate-800/80" />
            <div className="space-y-1.5">
              <div className="h-3 w-full animate-pulse rounded bg-slate-800/60" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-slate-800/50" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Error card ────────────────────────────────────────────────────────────────

export interface AskAIErrorCardProps {
  message: string;
  onRetry: () => void;
}

export function AskAIErrorCard({ message, onRetry }: AskAIErrorCardProps) {
  return (
    <Card className="border border-red-900/40 bg-red-950/20">
      <CardContent className="flex items-start gap-3 pt-6">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
        <div className="space-y-2">
          <p className="text-sm font-medium text-red-400">Something went wrong</p>
          <p className="text-xs text-red-400/70">{message}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-1 border-red-900/50 text-xs text-red-400 hover:bg-red-950/40"
          >
            Try again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Response card ─────────────────────────────────────────────────────────────

export interface AskAIResponseCardProps {
  response: AskAiResponse;
}

export function AskAIResponseCard({ response }: AskAIResponseCardProps) {
  const hasDriversOrRisks = response.drivers.length > 0 || response.risks.length > 0;

  return (
    <Card className="border border-slate-800 bg-slate-950/60">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <CardTitle className="text-sm font-semibold">Answer</CardTitle>
        </div>
        <Badge variant="outline" className="border-slate-700 text-xs text-slate-400">
          {INTENT_LABELS[response.intent]}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-5 text-sm">
        {/* Answer */}
        <p className="leading-relaxed text-slate-100">{response.answer}</p>

        {/* Drivers + Risks */}
        {hasDriversOrRisks && (
          <div className="grid gap-4 md:grid-cols-2">
            {response.drivers.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                    Key Drivers
                  </p>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {response.drivers.map((d, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/80" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {response.risks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-400">
                    Risks
                  </p>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {response.risks.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-red-400/80" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Metadata row: confidence + sources */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-800/60 pt-4">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs",
              confidenceColor(response.confidence),
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", confidenceDot(response.confidence))} />
            Confidence: {(response.confidence * 100).toFixed(0)}%
          </span>

          {response.sources.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/60 px-2.5 py-1 text-xs text-slate-400">
              <Database className="h-3 w-3" />
              {response.sources.join(", ")}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
