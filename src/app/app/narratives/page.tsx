"use client";

import { useCallback, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  RefreshCw,
  TrendingUp,
  Zap,
  AlertTriangle,
  X,
  Check,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import type {
  NarrativeItem,
  NarrativeTokenRef,
  NarrativeStatus,
} from "@/services/narratives/types";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlowCard } from "@/components/ui/glow-card";
import { StatPill, type StatPillTone } from "@/components/ui/stat-pill";

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

const STATUS_CONFIG: Record<
  NarrativeStatus,
  { label: string; tone: StatPillTone }
> = {
  active: { label: "Active", tone: "success" },
  emerging: { label: "Emerging", tone: "accent" },
  peaking: { label: "Peaking", tone: "warning" },
  fading: { label: "Fading", tone: "neutral" },
};

function tokenBadgeClass(role: NarrativeTokenRef["role"]): string {
  switch (role) {
    case "leader":
      return "border-success/30 bg-success/10 text-success hover:bg-success/20";
    case "laggard":
      return "border-danger/30 bg-danger/10 text-danger hover:bg-danger/20";
    default:
      return "border-accent/30 bg-accent/10 text-accent hover:bg-accent/20";
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
  const [selectedNarrative, setSelectedNarrative] =
    useState<NarrativeItem | null>(null);

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
      <SectionHeading
        eyebrow="Narratives"
        title="Market narratives driving flows."
        description="AI-detected themes connecting price action, news, and crowd behavior across the market."
        actions={
          <Button
            variant="glass"
            size="sm"
            onClick={() => void refresh()}
            disabled={isRefreshing}
            className="rounded-full"
          >
            {isRefreshing ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin text-accent" />
                Generating…
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3" />
                Refresh
              </span>
            )}
          </Button>
        }
      />

      {isRefreshing && (
        <GlowCard variant="gradient" padding="md" noHoverBlob>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
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
                    <Check className="h-4 w-4 shrink-0 text-success" />
                  ) : current ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" />
                  ) : (
                    <span className="h-4 w-4 shrink-0 rounded-full border border-muted-foreground/30" />
                  )}
                  <span>{label}</span>
                </li>
              );
            })}
          </ul>
        </GlowCard>
      )}

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <GlowCard key={i} padding="md" noHoverBlob>
              <div className="space-y-3">
                <div className="h-5 w-2/3 rounded animate-shimmer" />
                <div className="h-4 w-full rounded animate-shimmer" />
                <div className="h-4 w-5/6 rounded animate-shimmer" />
                <div className="flex gap-2">
                  <div className="h-6 w-12 rounded-full animate-shimmer" />
                  <div className="h-6 w-12 rounded-full animate-shimmer" />
                  <div className="h-6 w-12 rounded-full animate-shimmer" />
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      )}

      {status === "error" && (
        <GlowCard
          padding="md"
          noHoverBlob
          className="border-danger/30 bg-danger/5"
        >
          <div className="flex items-center gap-3 text-sm text-danger">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Generation failed</p>
              <p className="mt-0.5 text-danger/80">
                {errorMessage ?? "Please try again."}
              </p>
            </div>
          </div>
        </GlowCard>
      )}

      {showEmpty && !isLoading && (
        <GlowCard padding="lg" noHoverBlob>
          <div className="text-center">
            <Zap className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No narratives generated yet. Click{" "}
              <button
                type="button"
                onClick={() => void refresh()}
                disabled={isRefreshing}
                className="font-medium text-accent hover:underline disabled:opacity-60"
              >
                Refresh
              </button>{" "}
              to run the first analysis.
            </p>
          </div>
        </GlowCard>
      )}

      {narratives && narratives.length > 0 && !isLoading && (
        <>
          {isRefreshing && (
            <p className="text-xs text-accent/80">Updating narratives…</p>
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
              Last updated: {new Date(updatedAt).toLocaleString()}
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
    <GlowCard
      padding="md"
      onClick={() => onSelect(n)}
      className="cursor-pointer"
    >
      <div className="flex flex-row items-start justify-between pb-3">
        <div className="min-w-0 space-y-2">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {n.title}
          </h3>
          <StatPill tone={statusCfg.tone} dot pulse={n.status === "active"}>
            {statusCfg.label}
          </StatPill>
        </div>
        <TrendingUp className="h-5 w-5 shrink-0 text-muted-foreground/50" />
      </div>

      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {n.summary}
        </p>

        <div className="flex flex-wrap items-center gap-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Strength
            </p>
            <div className="mt-1 h-2 w-28 overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full rounded-full bg-gradient-primary"
                style={{ width: `${Math.min(n.strengthScore, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Confidence
            </p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
              {(n.confidenceScore * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {allTokens.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTokens.map((t) => (
              <Link
                key={`${t.symbol}-${t.role}`}
                href={`/app/token/${t.symbol}`}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors",
                  tokenBadgeClass(t.role),
                )}
              >
                {t.symbol}
              </Link>
            ))}
          </div>
        )}
      </div>
    </GlowCard>
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
          "border-l border-border/60 bg-background shadow-elegant",
          "animate-in slide-in-from-right duration-200",
        )}
      >
        <div className="flex items-center justify-between border-b border-border/60 bg-card/60 px-5 py-4 backdrop-blur">
          <div className="flex min-w-0 items-center gap-2.5">
            <h2 className="truncate text-sm font-semibold tracking-tight text-foreground">
              {n.title}
            </h2>
            <StatPill tone={statusCfg.tone} dot pulse={n.status === "active"}>
              {statusCfg.label}
            </StatPill>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-5 p-5">
            <div className="flex flex-wrap gap-1.5">
              <StatPill tone="neutral">
                Strength · {n.strengthScore.toFixed(0)}/100
              </StatPill>
              <ConfidencePill value={n.confidenceScore} />
              <StatPill tone="neutral">
                Updated · {new Date(n.updatedAt).toLocaleString()}
              </StatPill>
            </div>

            <DrawerSection title="Thesis">
              <p className="text-[11px] leading-relaxed text-foreground/80">
                {n.thesis}
              </p>
            </DrawerSection>

            {n.supportingSignals.length > 0 && (
              <DrawerSection title="Supporting Signals">
                <ul className="space-y-2">
                  {n.supportingSignals.map((s, i) => (
                    <li key={i} className="text-[11px]">
                      <span className="font-semibold text-foreground">
                        {s.label}
                      </span>
                      <p className="mt-0.5 text-muted-foreground">
                        {s.explanation}
                      </p>
                    </li>
                  ))}
                </ul>
              </DrawerSection>
            )}

            {n.riskSignals.length > 0 && (
              <DrawerSection title="Risk Signals">
                <ul className="space-y-1.5 text-[11px] text-foreground/80">
                  {n.riskSignals.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-danger/80" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </DrawerSection>
            )}

            {n.catalysts.length > 0 && (
              <DrawerSection title="Catalysts">
                <ul className="space-y-1.5 text-[11px] text-foreground/80">
                  {n.catalysts.map((c, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-warning/80" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </DrawerSection>
            )}

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
    <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function ConfidencePill({ value }: { value: number }) {
  const pct = (value * 100).toFixed(0);
  const tone: StatPillTone =
    value >= 0.7 ? "success" : value >= 0.4 ? "warning" : "danger";
  return (
    <StatPill tone={tone} dot>
      Confidence · {pct}%
    </StatPill>
  );
}

function TokenList({ tokens }: { tokens: NarrativeTokenRef[] }) {
  if (tokens.length === 0) {
    return <p className="text-[11px] text-muted-foreground/70">None</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {tokens.map((t) => (
        <Link
          key={`${t.symbol}-${t.role}`}
          href={`/app/token/${t.symbol}`}
          className={cn(
            "rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors",
            tokenBadgeClass(t.role),
          )}
        >
          {t.symbol}
        </Link>
      ))}
    </div>
  );
}
