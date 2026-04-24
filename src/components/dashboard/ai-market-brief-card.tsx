"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { StatPill } from "@/components/ui/stat-pill";
import { RefreshCw, Sparkles, Eye } from "lucide-react";
import {
  MarketBriefDebugDrawer,
  type DebugJson,
} from "./market-brief-debug-drawer";

type MarketBrief = {
  market_summary: string;
  drivers: string[];
  risks: string[];
  confidence: number;
  sources: string[];
};

interface GetBriefResponse {
  brief: MarketBrief | null;
  message?: string;
  model?: string;
  generatedAt?: string;
  debugJson?: Record<string, unknown> | null;
}

interface PostBriefResponse {
  brief: MarketBrief;
  model: string;
  latencyMs: number;
  aiRunId: string | null;
  debugJson?: Record<string, unknown> | null;
}

type Status = "idle" | "loading" | "error" | "empty";

export function AiMarketBriefCard() {
  const [status, setStatus] = useState<Status>("idle");
  const [brief, setBrief] = useState<MarketBrief | null>(null);
  const [debugJson, setDebugJson] = useState<DebugJson | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
        setDebugJson((data.debugJson as DebugJson) ?? null);
        setStatus("idle");
      } else {
        setBrief(null);
        setStatus("empty");
      }
    } catch {
      setStatus("empty");
    }
  }, []);

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
        setDebugJson((data.debugJson as DebugJson) ?? null);
        setStatus("idle");
      }
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      setErrorMessage(err);
      setStatus("error");
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

  const confidenceTone = brief
    ? brief.confidence >= 0.7
      ? "success"
      : brief.confidence >= 0.4
        ? "warning"
        : "danger"
    : "neutral";

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-hero shadow-elegant">
        {/* Accent wash (matches landing hero) */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        />

        <div className="relative z-10 flex flex-col gap-3 border-b border-border/40 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                Multi-agent synthesis
              </p>
              <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                AI Market Brief
              </h3>
            </div>
          </div>
          <Button
            variant="glass"
            size="sm"
            onClick={() => void refreshBrief()}
            disabled={showRefreshSpinner}
            className="rounded-full text-xs"
          >
            {showRefreshSpinner ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 animate-spin rounded-full border border-accent border-t-transparent" />
                Refreshing…
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3" />
                Refresh
              </span>
            )}
          </Button>
        </div>

        <div className="relative z-10 space-y-5 px-6 py-5">
          {isLoading && (
            <div className="space-y-4">
              <div className="h-4 w-3/4 rounded-md animate-shimmer" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="h-3 w-20 rounded animate-shimmer" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-full rounded animate-shimmer" />
                    <div className="h-3 w-5/6 rounded animate-shimmer" />
                    <div className="h-3 w-2/3 rounded animate-shimmer" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-16 rounded animate-shimmer" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-full rounded animate-shimmer" />
                    <div className="h-3 w-4/6 rounded animate-shimmer" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-1 text-xs text-danger">
              <p className="font-medium">Generation failed.</p>
              <p className="text-danger/80">
                {errorMessage ?? "Please try again."}
              </p>
            </div>
          )}

          {showEmpty && !isLoading && (
            <p className="text-sm text-muted-foreground">
              No market brief has been generated yet. Click{" "}
              <span className="font-medium text-accent">Refresh</span> to
              create the first AI synthesis.
            </p>
          )}

          {brief && !isLoading && (
            <div className="space-y-5">
              {showRefreshSpinner && (
                <p className="text-xs font-medium text-success">Updating…</p>
              )}
              <p className="text-sm leading-relaxed text-foreground sm:text-base">
                {brief.market_summary}
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 rounded-xl border border-border/60 bg-card/80 p-4 shadow-soft backdrop-blur dark:border-border/50 dark:bg-card/40 dark:shadow-none">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-success">
                    Drivers
                  </p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {brief.drivers.map((d, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-success/80" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2 rounded-xl border border-border/60 bg-card/80 p-4 shadow-soft backdrop-blur dark:border-border/50 dark:bg-card/40 dark:shadow-none">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-danger">
                    Risks
                  </p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {brief.risks.map((r, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-danger/80" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="flex flex-wrap items-center gap-2">
                  <StatPill tone={confidenceTone} dot>
                    Confidence · {(brief.confidence * 100).toFixed(0)}%
                  </StatPill>
                  <StatPill tone="neutral">
                    {brief.sources.length ?? 0} sources
                  </StatPill>
                </div>
                <Button
                  type="button"
                  variant="default"
                  onClick={() => setDrawerOpen(true)}
                  className="w-full shrink-0 rounded-full font-semibold shadow-md sm:w-auto"
                >
                  <Eye className="h-4 w-4" />
                  How this brief was built
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <MarketBriefDebugDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        debugJson={debugJson}
      />
    </>
  );
}
