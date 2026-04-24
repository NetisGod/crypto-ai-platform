import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Database,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatPill, type StatPillTone } from "@/components/ui/stat-pill";
import type { AskAiResponse, AskAiIntent } from "@/ai/schemas/askAi";

const INTENT_LABELS: Record<AskAiIntent, string> = {
  token_analysis: "AI Token Analysis",
  market_summary: "Market Summary",
  top_movers: "Top Movers",
  news_summary: "News Summary",
  general_market_question: "Market Q&A",
};

function confidenceTone(value: number): StatPillTone {
  if (value >= 0.7) return "success";
  if (value >= 0.4) return "warning";
  return "danger";
}

export function AskAILoadingSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-hero p-6 shadow-elegant">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl"
      />
      <div className="relative space-y-4">
        <div className="h-4 w-3/4 rounded animate-shimmer" />
        <div className="h-4 w-full rounded animate-shimmer" />
        <div className="h-4 w-5/6 rounded animate-shimmer" />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="h-3 w-20 rounded animate-shimmer" />
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded animate-shimmer" />
              <div className="h-3 w-4/5 rounded animate-shimmer" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-16 rounded animate-shimmer" />
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded animate-shimmer" />
              <div className="h-3 w-3/5 rounded animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface AskAIErrorCardProps {
  message: string;
  onRetry: () => void;
}

export function AskAIErrorCard({ message, onRetry }: AskAIErrorCardProps) {
  return (
    <div className="rounded-2xl border border-danger/30 bg-danger/5 p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
        <div className="space-y-2">
          <p className="text-sm font-semibold text-danger">
            Something went wrong
          </p>
          <p className="text-xs text-danger/70">{message}</p>
          <Button
            variant="glass"
            size="sm"
            onClick={onRetry}
            className="mt-1 rounded-full border-danger/30 text-xs text-danger hover:bg-danger/10"
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}

export interface AskAIResponseCardProps {
  response: AskAiResponse;
}

export function AskAIResponseCard({ response }: AskAIResponseCardProps) {
  const hasDriversOrRisks =
    response.drivers.length > 0 || response.risks.length > 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-hero shadow-elegant">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative z-10 flex flex-row items-center justify-between border-b border-border/40 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Answer
            </p>
            <h3 className="bg-gradient-text bg-clip-text text-sm font-semibold tracking-tight text-transparent">
              {INTENT_LABELS[response.intent]}
            </h3>
          </div>
        </div>
      </div>

      <div className="relative z-10 space-y-5 px-6 py-5 text-sm">
        <p className="leading-relaxed text-foreground sm:text-base">
          {response.answer}
        </p>

        {hasDriversOrRisks && (
          <div className="grid gap-4 md:grid-cols-2">
            {response.drivers.length > 0 && (
              <div className="space-y-2 rounded-xl border border-border/60 bg-card/80 p-4 shadow-soft backdrop-blur dark:border-border/50 dark:bg-card/40 dark:shadow-none">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-success">
                    Key Drivers
                  </p>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {response.drivers.map((d, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-success/80" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {response.risks.length > 0 && (
              <div className="space-y-2 rounded-xl border border-border/60 bg-card/80 p-4 shadow-soft backdrop-blur dark:border-border/50 dark:bg-card/40 dark:shadow-none">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-danger" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-danger">
                    Risks
                  </p>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {response.risks.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-danger/80" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
          <StatPill tone={confidenceTone(response.confidence)} dot>
            Confidence · {(response.confidence * 100).toFixed(0)}%
          </StatPill>
          {response.sources.length > 0 && (
            <StatPill tone="neutral" icon={<Database className="h-3 w-3" />}>
              {response.sources.join(", ")}
            </StatPill>
          )}
        </div>
      </div>
    </div>
  );
}
