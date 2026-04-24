"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { RefreshCw, TrendingUp, Zap, AlertTriangle, X, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import type {
  NarrativeItem,
  NarrativeTokenRef,
  NarrativeStatus,
} from "@/services/narratives/types";

// ---------------------------------------------------------------------------
// API response shapes
// ---------------------------------------------------------------------------

interface GetNarrativesResponse {
  narratives: NarrativeItem[] | null;
  message?: string;
  model?: string;
  updatedAt?: string;
}

interface PostNarrativesResponse {
  narratives: NarrativeItem[];
  updatedAt: string;
  model: string;
  latencyMs: number;
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

type PageStatus = "idle" | "loading" | "error" | "empty";

const REFRESH_STEPS = [
  "Loading market data",
  "Scoring narrative candidates",
  "Fetching news context",
  "Generating AI explanations",
  "Finalizing",
] as const;

const STATUS_CONFIG: Record<NarrativeStatus, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  },
  emerging: {
    label: "Emerging",
    className: "border-sky-500/40 bg-sky-500/10 text-sky-400",
  },
  peaking: {
    label: "Peaking",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  },
  fading: {
    label: "Fading",
    className: "border-slate-500/40 bg-slate-500/10 text-slate-400",
  },
};

function tokenBadgeClass(role: NarrativeTokenRef["role"]): string {
  switch (role) {
    case "leader":
      return "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25";
    case "laggard":
      return "bg-red-500/15 text-red-400 hover:bg-red-500/25";
    default:
      return "bg-primary/15 text-primary hover:bg-primary/25";
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function NarrativesPage() {
  const [status, setStatus] = useState<PageStatus>("idle");
  const [narratives, setNarratives] = useState<NarrativeItem[] | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStep, setRefreshStep] = useState(0);
  const [selectedNarrative, setSelectedNarrative] = useState<NarrativeItem | null>(null);

  const loadCached = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/ai/narratives", { method: "GET" });
      const data = (await res.json()) as GetNarrativesResponse;

      if (!res.ok) {
        setStatus("empty");
        return;
      }

      if (data.narratives && data.narratives.length > 0) {
        setNarratives(data.narratives);
        setUpdatedAt(data.updatedAt ?? null);
        setStatus("idle");
      } else {
        setNarratives(null);
        setStatus("empty");
      }
    } catch {
      setStatus("empty");
    }
  }, []);

  const refresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setRefreshStep(0);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/ai/narratives", { method: "POST" });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Request failed with ${res.status}`);
      }

      const data = (await res.json()) as PostNarrativesResponse;
      if (data?.narratives?.length) {
        setNarratives(data.narratives);
        setUpdatedAt(data.updatedAt ?? null);
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
    void loadCached();
  }, [loadCached]);

  // Advance progress steps while refreshing (simulated for UX feedback)
  useEffect(() => {
    if (!isRefreshing) return;
    const advance = () =>
      setRefreshStep((s) => Math.min(s + 1, REFRESH_STEPS.length - 1));
    const id = setInterval(advance, 2500);
    return () => clearInterval(id);
  }, [isRefreshing]);

  const isLoading = status === "loading" && !narratives;
  const showEmpty = status === "empty" || (!narratives && status === "idle");

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Narratives</h1>
          <p className="mt-1 text-muted-foreground">
            Market narratives driving sentiment and flows
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refresh()}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
              Generating…
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3" />
              Refresh
            </span>
          )}
        </Button>
      </div>

      {/* Refresh progress steps */}
      {isRefreshing && (
        <Card className="border-primary/30">
          <CardContent className="p-6">
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              Generating narratives…
            </p>
            <ul className="space-y-3">
              {REFRESH_STEPS.map((label, i) => {
                const done = i < refreshStep;
                const current = i === refreshStep;
                return (
                  <li
                    key={label}
                    className={cn(
                      "flex items-center gap-3 text-sm",
                      done && "text-muted-foreground",
                      current && "font-medium text-foreground",
                      !done && !current && "text-muted-foreground/60",
                    )}
                  >
                    {done ? (
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : current ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                    ) : (
                      <span className="h-4 w-4 shrink-0 rounded-full border border-muted-foreground/30" />
                    )}
                    <span>{label}</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-muted/60" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted/60" />
                <div className="flex gap-2">
                  <div className="h-6 w-12 animate-pulse rounded-full bg-muted/40" />
                  <div className="h-6 w-12 animate-pulse rounded-full bg-muted/40" />
                  <div className="h-6 w-12 animate-pulse rounded-full bg-muted/40" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <Card className="border-red-500/30">
          <CardContent className="flex items-center gap-3 p-6 text-sm text-red-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Generation failed</p>
              <p className="mt-0.5 text-red-400/80">
                {errorMessage ?? "Please try again."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty */}
      {showEmpty && !isLoading && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            <Zap className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            <p>
              No narratives generated yet. Click{" "}
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 font-medium text-primary"
                onClick={() => void refresh()}
                disabled={isRefreshing}
              >
                Refresh
              </Button>{" "}
              to run the first analysis.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Narrative cards */}
      {narratives && narratives.length > 0 && !isLoading && (
        <>
          {isRefreshing && (
            <p className="text-xs text-primary/80">Updating narratives…</p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {narratives.map((n) => (
              <NarrativeCard
                key={n.id}
                narrative={n}
                onSelect={setSelectedNarrative}
              />
            ))}
          </div>

          {updatedAt && (
            <p className="text-xs text-muted-foreground/60">
              Last updated:{" "}
              {new Date(updatedAt).toLocaleString()}
            </p>
          )}
        </>
      )}

      <NarrativeDetailDrawer
        narrative={selectedNarrative}
        onClose={() => setSelectedNarrative(null)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Narrative card
// ---------------------------------------------------------------------------

function NarrativeCard({
  narrative: n,
  onSelect,
}: {
  narrative: NarrativeItem;
  onSelect: (n: NarrativeItem) => void;
}) {
  const statusCfg = STATUS_CONFIG[n.status];
  const allTokens: NarrativeTokenRef[] = [
    ...n.leaderTokens,
    ...n.relatedTokens,
    ...(n.laggardTokens ?? []),
  ];

  return (
    <Card
      className="cursor-pointer transition-colors hover:border-primary/30"
      onClick={() => onSelect(n)}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">{n.title}</CardTitle>
          <Badge variant="outline" className={statusCfg.className}>
            {statusCfg.label}
          </Badge>
        </div>
        <TrendingUp className="h-5 w-5 text-muted-foreground/50" />
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {n.summary}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Strength</p>
            <div className="mt-0.5 h-2 w-24 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(n.strengthScore, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Confidence</p>
            <p className="text-sm font-medium">
              {(n.confidenceScore * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {allTokens.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTokens.map((t) => (
              <Link
                key={`${t.symbol}-${t.role}`}
                href={`/token/${t.symbol}`}
                onClick={(e) => e.stopPropagation()}
                className={`rounded px-2 py-1 text-xs font-medium ${tokenBadgeClass(t.role)}`}
              >
                {t.symbol}
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Detail drawer (mirrors market-brief-debug-drawer.tsx shell)
// ---------------------------------------------------------------------------

function NarrativeDetailDrawer({
  narrative,
  onClose,
}: {
  narrative: NarrativeItem | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!narrative) return;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handler);
    };
  }, [narrative, onClose]);

  if (!narrative) return null;

  const n = narrative;
  const statusCfg = STATUS_CONFIG[n.status];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={cn(
          "relative z-10 flex w-full max-w-xl flex-col",
          "border-l border-slate-800 bg-slate-950 shadow-2xl",
          "animate-in slide-in-from-right duration-200",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-semibold tracking-tight text-slate-100">
              {n.title}
            </h2>
            <Badge variant="outline" className={cn("text-[10px]", statusCfg.className)}>
              {statusCfg.label}
            </Badge>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="space-y-5 p-5">
            {/* Scores bar */}
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
              <span className="rounded bg-slate-900 px-2 py-0.5">
                Strength: {n.strengthScore.toFixed(0)}/100
              </span>
              <ConfidencePill value={n.confidenceScore} />
              <span className="rounded bg-slate-900 px-2 py-0.5">
                Updated: {new Date(n.updatedAt).toLocaleString()}
              </span>
            </div>

            {/* Thesis */}
            <DrawerSection title="Thesis">
              <p className="text-[11px] leading-relaxed text-slate-300">
                {n.thesis}
              </p>
            </DrawerSection>

            {/* Supporting signals */}
            {n.supportingSignals.length > 0 && (
              <DrawerSection title="Supporting Signals">
                <ul className="space-y-2">
                  {n.supportingSignals.map((s, i) => (
                    <li key={i} className="text-[11px]">
                      <span className="font-medium text-slate-200">
                        {s.label}
                      </span>
                      <p className="mt-0.5 text-slate-400">{s.explanation}</p>
                    </li>
                  ))}
                </ul>
              </DrawerSection>
            )}

            {/* Risk signals */}
            {n.riskSignals.length > 0 && (
              <DrawerSection title="Risk Signals">
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  {n.riskSignals.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-red-400/70" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </DrawerSection>
            )}

            {/* Catalysts */}
            {n.catalysts.length > 0 && (
              <DrawerSection title="Catalysts">
                <ul className="space-y-1.5 text-[11px] text-slate-300">
                  {n.catalysts.map((c, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-amber-400/70" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </DrawerSection>
            )}

            {/* Tokens */}
            <DrawerSection title="Leader Tokens">
              <TokenList tokens={n.leaderTokens} />
            </DrawerSection>

            {n.laggardTokens && n.laggardTokens.length > 0 && (
              <DrawerSection title="Laggard Tokens">
                <TokenList tokens={n.laggardTokens} />
              </DrawerSection>
            )}

            {n.relatedTokens.length > 0 && (
              <DrawerSection title="Related Tokens">
                <TokenList tokens={n.relatedTokens} />
              </DrawerSection>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Drawer sub-components (mirrors market-brief-debug-drawer.tsx style)
// ---------------------------------------------------------------------------

function DrawerSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-4">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
        {title}
      </p>
      {children}
    </div>
  );
}

function ConfidencePill({ value }: { value: number }) {
  const pct = (value * 100).toFixed(0);
  const color =
    value >= 0.7
      ? "text-emerald-400"
      : value >= 0.4
        ? "text-amber-400"
        : "text-red-400";
  return (
    <span className={cn("rounded bg-slate-900 px-2 py-0.5", color)}>
      Confidence: {pct}%
    </span>
  );
}

function TokenList({ tokens }: { tokens: NarrativeTokenRef[] }) {
  if (tokens.length === 0) {
    return (
      <p className="text-[11px] text-slate-500">None</p>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {tokens.map((t) => (
        <Link
          key={`${t.symbol}-${t.role}`}
          href={`/token/${t.symbol}`}
          className={`rounded px-2 py-1 text-[11px] font-medium ${tokenBadgeClass(t.role)}`}
        >
          {t.symbol}
        </Link>
      ))}
    </div>
  );
}
