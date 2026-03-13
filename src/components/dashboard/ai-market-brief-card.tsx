"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefreshCw, Sparkles } from "lucide-react";

type MarketBrief = {
  market_summary: string;
  drivers: string[];
  risks: string[];
  confidence: number;
  sources: string[];
};

/** GET response: cached brief only */
interface GetBriefResponse {
  brief: MarketBrief | null;
  message?: string;
  model?: string;
  generatedAt?: string;
}

/** POST response: full generation result */
interface PostBriefResponse {
  brief: MarketBrief;
  model: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  latencyMs: number;
  retryCount: number;
  aiRunId: string | null;
}

type Status = "idle" | "loading" | "error" | "empty";

export function AiMarketBriefCard() {
  const [status, setStatus] = useState<Status>("idle");
  const [brief, setBrief] = useState<MarketBrief | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /** Load cached brief on mount. GET only — no LLM call. */
  const loadCachedBrief = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/ai/market-brief", { method: "GET" });
      const data = (await res.json()) as GetBriefResponse;

      if (!res.ok) {
        setStatus("empty");
        return;
      }

      if (data.brief) {
        setBrief(data.brief);
        setStatus("idle");
      } else {
        setBrief(null);
        setStatus("empty");
      }
    } catch {
      setStatus("empty");
    }
  }, []);

  /** Refresh: run AI generation. POST only. Keeps previous brief on error. */
  const refreshBrief = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/ai/market-brief", { method: "POST" });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Request failed with ${res.status}`);
      }

      const data = (await res.json()) as PostBriefResponse;
      if (data?.brief) {
        setBrief(data.brief);
        setStatus("idle");
      }
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      setErrorMessage(err);
      setStatus("error");
      // Do not clear brief: keep showing previous cached brief
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  useEffect(() => {
    void loadCachedBrief();
  }, [loadCachedBrief]);

  const isLoading = status === "loading" && !brief;
  const showEmpty = status === "empty" || (!brief && status === "idle");
  const showRefreshSpinner = isRefreshing;

  return (
    <Card
      className={cn(
        "relative overflow-hidden border border-primary/25 bg-gradient-to-br",
        "from-slate-950/90 via-slate-900/90 to-slate-950/90 shadow-lg shadow-primary/20",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.10),transparent_60%)]" />
      <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/20 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-semibold tracking-tight">
            AI Market Brief
          </CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refreshBrief()}
          disabled={showRefreshSpinner}
          className="border-primary/40 bg-slate-950/40 text-xs text-primary hover:bg-primary/10"
        >
          {showRefreshSpinner ? (
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
              Refreshing…
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Refresh
            </span>
          )}
        </Button>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4 text-sm text-muted-foreground">
        {/* Loading skeleton: only when loading cache and no brief yet */}
        {isLoading && (
          <div className="space-y-4">
            <div className="h-4 w-3/4 animate-pulse rounded-md bg-slate-800/70" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-slate-800/70" />
                <div className="space-y-1.5">
                  <div className="h-3 w-full animate-pulse rounded bg-slate-800/60" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-slate-800/60" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-800/60" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-16 animate-pulse rounded bg-slate-800/70" />
                <div className="space-y-1.5">
                  <div className="h-3 w-full animate-pulse rounded bg-slate-800/60" />
                  <div className="h-3 w-4/6 animate-pulse rounded bg-slate-800/60" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error state: after a failed refresh; previous brief may still be shown below */}
        {status === "error" && (
          <div className="space-y-2 text-xs text-red-400">
            <p className="font-medium">Generation failed.</p>
            <p className="text-red-400/80">
              {errorMessage ?? "Please try again."}
            </p>
          </div>
        )}

        {/* Empty state */}
        {showEmpty && !isLoading && (
          <p className="text-xs text-muted-foreground/80">
            No market brief has been generated yet. Click{" "}
            <span className="font-medium text-primary">Refresh</span> to create
            the first AI summary.
          </p>
        )}

        {/* Main content: show when we have a brief and not in initial loading */}
        {brief && !isLoading && (
          <div className="space-y-4">
            {showRefreshSpinner && (
              <p className="text-xs text-primary/80">Updating…</p>
            )}
            <p className="text-sm leading-relaxed text-slate-100">
              {brief.market_summary}
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                  Drivers
                </p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {brief.drivers.map((d, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-400">
                  Risks
                </p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {brief.risks.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-red-400/80" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Confidence: {(brief.confidence * 100).toFixed(0)}%
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/60 px-2.5 py-1 text-slate-300">
                Sources: {brief.sources.length ?? "n/a"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
