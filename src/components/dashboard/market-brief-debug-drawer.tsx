"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  X,
  BarChart3,
  Newspaper,
  Compass,
  ShieldAlert,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types mirroring debug_json shape from the pipeline
// ---------------------------------------------------------------------------

interface MarketDataAnalysis {
  market_momentum: string;
  key_signals: string[];
  market_structure: string;
  confidence: number;
}

interface NewsAnalysis {
  news_summary: string;
  main_drivers: string[];
  source_titles: string[];
  confidence: number;
}

interface NarrativeAnalysis {
  top_narratives: string[];
  narrative_summary: string;
  affected_tokens: string[];
  confidence: number;
}

interface RiskAnalysis {
  top_risks: string[];
  risk_summary: string;
  severity: number;
  confidence: number;
}

interface SynthesizedBrief {
  market_summary: string;
  drivers: string[];
  risks: string[];
  confidence: number;
  sources: string[];
}

interface ValidationResult {
  valid: boolean;
  issues: string[];
}

interface DebugMeta {
  latencyMs?: number;
  agentCoverage?: string[];
  model?: string;
  snapshotCount?: number;
  newsCount?: number;
}

export interface DebugJson {
  marketDataAnalysis?: MarketDataAnalysis | null;
  newsAnalysis?: NewsAnalysis | null;
  narrativeAnalysis?: NarrativeAnalysis | null;
  riskAnalysis?: RiskAnalysis | null;
  synthesizedBrief?: SynthesizedBrief | null;
  validationResult?: ValidationResult | null;
  issues?: string[];
  meta?: DebugMeta;
}

interface Props {
  open: boolean;
  onClose: () => void;
  debugJson: DebugJson | null;
}

// ---------------------------------------------------------------------------
// Drawer
// ---------------------------------------------------------------------------

export function MarketBriefDebugDrawer({ open, onClose, debugJson }: Props) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handler);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop — portal + z above sticky app header (z-20) */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        className={cn(
          "relative z-10 flex h-full min-h-0 w-full max-w-xl flex-col",
          "border-l border-border/60 bg-background shadow-elegant",
          "animate-in slide-in-from-right duration-200",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-5 py-4 backdrop-blur dark:bg-card/60">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Layers className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              How this brief was built
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="space-y-3 p-5">
            {!debugJson ? (
              <p className="text-xs text-muted-foreground">
                No agent-level data available for this brief. It may have been
                generated before multi-agent tracing was enabled.
              </p>
            ) : (
              <>
                <MetaBar meta={debugJson.meta} />

                <AgentSection
                  icon={<BarChart3 className="h-3.5 w-3.5" />}
                  title="Market Data Agent"
                  available={!!debugJson.marketDataAnalysis}
                >
                  {debugJson.marketDataAnalysis && (
                    <MarketDataSection data={debugJson.marketDataAnalysis} />
                  )}
                </AgentSection>

                <AgentSection
                  icon={<Newspaper className="h-3.5 w-3.5" />}
                  title="News Agent"
                  available={!!debugJson.newsAnalysis}
                >
                  {debugJson.newsAnalysis && (
                    <NewsSection data={debugJson.newsAnalysis} />
                  )}
                </AgentSection>

                <AgentSection
                  icon={<Compass className="h-3.5 w-3.5" />}
                  title="Narrative Agent"
                  available={!!debugJson.narrativeAnalysis}
                >
                  {debugJson.narrativeAnalysis && (
                    <NarrativeSection data={debugJson.narrativeAnalysis} />
                  )}
                </AgentSection>

                <AgentSection
                  icon={<ShieldAlert className="h-3.5 w-3.5" />}
                  title="Risk Agent"
                  available={!!debugJson.riskAnalysis}
                >
                  {debugJson.riskAnalysis && (
                    <RiskSection data={debugJson.riskAnalysis} />
                  )}
                </AgentSection>

                <AgentSection
                  icon={<Layers className="h-3.5 w-3.5" />}
                  title="Synthesizer Agent"
                  available={!!debugJson.synthesizedBrief}
                >
                  {debugJson.synthesizedBrief && (
                    <SynthesizerSection data={debugJson.synthesizedBrief} />
                  )}
                </AgentSection>

                <ValidationSection
                  result={debugJson.validationResult}
                  issues={debugJson.issues}
                />
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MetaBar({ meta }: { meta?: DebugMeta }) {
  if (!meta) return null;
  const pillClass =
    "rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 backdrop-blur dark:bg-card/60";
  return (
    <div className="mb-4 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
      {meta.model && <span className={pillClass}>Model: {meta.model}</span>}
      {meta.latencyMs != null && (
        <span className={pillClass}>{(meta.latencyMs / 1000).toFixed(1)}s</span>
      )}
      {meta.agentCoverage && (
        <span className={pillClass}>{meta.agentCoverage.length}/4 agents</span>
      )}
      {meta.snapshotCount != null && (
        <span className={pillClass}>{meta.snapshotCount} snapshots</span>
      )}
      {meta.newsCount != null && (
        <span className={pillClass}>{meta.newsCount} news</span>
      )}
    </div>
  );
}

function AgentSection({
  icon,
  title,
  available,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  available: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/40 p-4 shadow-soft backdrop-blur dark:bg-card/60 dark:shadow-none">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-tight text-foreground">
          <span className="text-accent">{icon}</span>
          {title}
        </div>
        {!available && (
          <Badge
            variant="outline"
            className="border-border/60 text-[10px] text-muted-foreground"
          >
            unavailable
          </Badge>
        )}
      </div>
      {available ? (
        children
      ) : (
        <p className="text-[11px] text-muted-foreground/70">
          This agent did not produce output for this brief.
        </p>
      )}
    </div>
  );
}

function ConfidenceBadge({ value }: { value: number }) {
  const pct = (value * 100).toFixed(0);
  const color =
    value >= 0.7
      ? "text-success border-success/40"
      : value >= 0.4
        ? "text-warning border-warning/40"
        : "text-danger border-danger/40";
  return (
    <Badge variant="outline" className={cn("text-[10px]", color)}>
      {pct}% confidence
    </Badge>
  );
}

function BulletList({
  items,
  color = "bg-muted-foreground",
}: {
  items: string[];
  color?: string;
}) {
  return (
    <ul className="space-y-1.5 text-[11px] text-foreground/80">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className={cn("mt-[5px] h-1 w-1 shrink-0 rounded-full", color)} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Agent-specific renderers
// ---------------------------------------------------------------------------

function MarketDataSection({ data }: { data: MarketDataAnalysis }) {
  return (
    <div className="space-y-3 text-[11px]">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">
          Momentum:{" "}
          <span className="font-medium text-foreground">{data.market_momentum}</span>
        </span>
        <ConfidenceBadge value={data.confidence} />
      </div>
      <div>
        <FieldLabel>Market Structure</FieldLabel>
        <p className="text-foreground/80">{data.market_structure}</p>
      </div>
      <div>
        <FieldLabel>Key Signals</FieldLabel>
        <BulletList items={data.key_signals} color="bg-info/80" />
      </div>
    </div>
  );
}

function NewsSection({ data }: { data: NewsAnalysis }) {
  return (
    <div className="space-y-3 text-[11px]">
      <div className="flex items-end justify-between">
        <FieldLabel>Summary</FieldLabel>
        <ConfidenceBadge value={data.confidence} />
      </div>
      <p className="text-foreground/80">{data.news_summary}</p>
      <div>
        <FieldLabel>Main Drivers</FieldLabel>
        <BulletList items={data.main_drivers} color="bg-success/80" />
      </div>
      {data.source_titles.length > 0 && (
        <div>
          <FieldLabel>Sources</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {data.source_titles.map((s, i) => (
              <span
                key={i}
                className="rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground backdrop-blur dark:bg-card/60"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NarrativeSection({ data }: { data: NarrativeAnalysis }) {
  return (
    <div className="space-y-3 text-[11px]">
      <div className="flex items-end justify-between">
        <FieldLabel>Summary</FieldLabel>
        <ConfidenceBadge value={data.confidence} />
      </div>
      <p className="text-foreground/80">{data.narrative_summary}</p>
      <div>
        <FieldLabel>Top Narratives</FieldLabel>
        <BulletList items={data.top_narratives} color="bg-ai/80" />
      </div>
      {data.affected_tokens.length > 0 && (
        <div>
          <FieldLabel>Affected Tokens</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {data.affected_tokens.map((t, i) => (
              <span
                key={i}
                className="rounded bg-ai/15 px-1.5 py-0.5 text-[10px] font-medium text-ai"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RiskSection({ data }: { data: RiskAnalysis }) {
  const severityLabel =
    data.severity >= 0.8
      ? "Extreme"
      : data.severity >= 0.6
        ? "High"
        : data.severity >= 0.4
          ? "Elevated"
          : data.severity >= 0.2
            ? "Normal"
            : "Low";
  const severityColor =
    data.severity >= 0.6
      ? "text-danger"
      : data.severity >= 0.4
        ? "text-warning"
        : "text-success";

  return (
    <div className="space-y-3 text-[11px]">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">
          Severity:{" "}
          <span className={cn("font-medium", severityColor)}>
            {severityLabel} ({(data.severity * 100).toFixed(0)}%)
          </span>
        </span>
        <ConfidenceBadge value={data.confidence} />
      </div>
      <div>
        <FieldLabel>Risk Summary</FieldLabel>
        <p className="text-foreground/80">{data.risk_summary}</p>
      </div>
      <div>
        <FieldLabel>Top Risks</FieldLabel>
        <BulletList items={data.top_risks} color="bg-danger/80" />
      </div>
    </div>
  );
}

function SynthesizerSection({ data }: { data: SynthesizedBrief }) {
  return (
    <div className="space-y-3 text-[11px]">
      <div className="flex items-end justify-between">
        <FieldLabel>Synthesized Summary</FieldLabel>
        <ConfidenceBadge value={data.confidence} />
      </div>
      <p className="text-foreground/80">{data.market_summary}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel>Drivers</FieldLabel>
          <BulletList items={data.drivers} color="bg-success/80" />
        </div>
        <div>
          <FieldLabel>Risks</FieldLabel>
          <BulletList items={data.risks} color="bg-danger/80" />
        </div>
      </div>
      {data.sources.length > 0 && (
        <div>
          <FieldLabel>Sources</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {data.sources.map((s, i) => (
              <span
                key={i}
                className="rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground backdrop-blur dark:bg-card/60"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ValidationSection({
  result,
  issues,
}: {
  result?: ValidationResult | null;
  issues?: string[];
}) {
  const allIssues = [
    ...(result?.issues ?? []),
    ...(issues ?? []),
  ].filter(Boolean);

  const passed = result?.valid ?? allIssues.length === 0;

  return (
    <>
      <Separator className="bg-border/60" />
      <div className="rounded-xl border border-border/60 bg-muted/40 p-4 shadow-soft backdrop-blur dark:bg-card/60 dark:shadow-none">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-tight text-foreground">
          {passed ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
          )}
          Validation
          <Badge
            variant="outline"
            className={cn(
              "ml-auto text-[10px]",
              passed
                ? "border-success/40 text-success"
                : "border-warning/40 text-warning",
            )}
          >
            {passed
              ? "passed"
              : `${allIssues.length} issue${allIssues.length === 1 ? "" : "s"}`}
          </Badge>
        </div>
        {allIssues.length > 0 && (
          <ul className="space-y-1 text-[11px] text-warning">
            {allIssues.map((issue, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-warning/70" />
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        )}
        {allIssues.length === 0 && (
          <p className="text-[11px] text-muted-foreground/70">
            All quality checks passed.
          </p>
        )}
      </div>
    </>
  );
}
