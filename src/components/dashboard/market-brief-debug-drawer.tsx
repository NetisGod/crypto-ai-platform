"use client";

import { useEffect } from "react";
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

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative z-10 flex w-full max-w-xl flex-col",
          "border-l border-slate-800 bg-slate-950 shadow-2xl",
          "animate-in slide-in-from-right duration-200",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="text-sm font-semibold tracking-tight text-slate-100">
            How this brief was built
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="space-y-3 p-5">
            {!debugJson ? (
              <p className="text-xs text-slate-500">
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MetaBar({ meta }: { meta?: DebugMeta }) {
  if (!meta) return null;
  return (
    <div className="mb-4 flex flex-wrap gap-2 text-[11px] text-slate-400">
      {meta.model && (
        <span className="rounded bg-slate-900 px-2 py-0.5">
          Model: {meta.model}
        </span>
      )}
      {meta.latencyMs != null && (
        <span className="rounded bg-slate-900 px-2 py-0.5">
          {(meta.latencyMs / 1000).toFixed(1)}s
        </span>
      )}
      {meta.agentCoverage && (
        <span className="rounded bg-slate-900 px-2 py-0.5">
          {meta.agentCoverage.length}/4 agents
        </span>
      )}
      {meta.snapshotCount != null && (
        <span className="rounded bg-slate-900 px-2 py-0.5">
          {meta.snapshotCount} snapshots
        </span>
      )}
      {meta.newsCount != null && (
        <span className="rounded bg-slate-900 px-2 py-0.5">
          {meta.newsCount} news
        </span>
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
    <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
          <span className="text-primary/80">{icon}</span>
          {title}
        </div>
        {!available && (
          <Badge
            variant="outline"
            className="border-slate-700 text-[10px] text-slate-500"
          >
            unavailable
          </Badge>
        )}
      </div>
      {available ? (
        children
      ) : (
        <p className="text-[11px] text-slate-600">
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
      ? "text-emerald-400 border-emerald-400/30"
      : value >= 0.4
        ? "text-amber-400 border-amber-400/30"
        : "text-red-400 border-red-400/30";
  return (
    <Badge variant="outline" className={cn("text-[10px]", color)}>
      {pct}% confidence
    </Badge>
  );
}

function BulletList({ items, color = "bg-slate-500" }: { items: string[]; color?: string }) {
  return (
    <ul className="space-y-1.5 text-[11px] text-slate-300">
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
    <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
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
        <span className="text-slate-400">
          Momentum:{" "}
          <span className="font-medium text-slate-200">{data.market_momentum}</span>
        </span>
        <ConfidenceBadge value={data.confidence} />
      </div>
      <div>
        <FieldLabel>Market Structure</FieldLabel>
        <p className="text-slate-300">{data.market_structure}</p>
      </div>
      <div>
        <FieldLabel>Key Signals</FieldLabel>
        <BulletList items={data.key_signals} color="bg-sky-400/70" />
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
      <p className="text-slate-300">{data.news_summary}</p>
      <div>
        <FieldLabel>Main Drivers</FieldLabel>
        <BulletList items={data.main_drivers} color="bg-emerald-400/70" />
      </div>
      {data.source_titles.length > 0 && (
        <div>
          <FieldLabel>Sources</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {data.source_titles.map((s, i) => (
              <span
                key={i}
                className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400"
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
      <p className="text-slate-300">{data.narrative_summary}</p>
      <div>
        <FieldLabel>Top Narratives</FieldLabel>
        <BulletList items={data.top_narratives} color="bg-violet-400/70" />
      </div>
      {data.affected_tokens.length > 0 && (
        <div>
          <FieldLabel>Affected Tokens</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {data.affected_tokens.map((t, i) => (
              <span
                key={i}
                className="rounded bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-medium text-violet-300"
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
      ? "text-red-400"
      : data.severity >= 0.4
        ? "text-amber-400"
        : "text-emerald-400";

  return (
    <div className="space-y-3 text-[11px]">
      <div className="flex items-center justify-between">
        <span className="text-slate-400">
          Severity:{" "}
          <span className={cn("font-medium", severityColor)}>
            {severityLabel} ({(data.severity * 100).toFixed(0)}%)
          </span>
        </span>
        <ConfidenceBadge value={data.confidence} />
      </div>
      <div>
        <FieldLabel>Risk Summary</FieldLabel>
        <p className="text-slate-300">{data.risk_summary}</p>
      </div>
      <div>
        <FieldLabel>Top Risks</FieldLabel>
        <BulletList items={data.top_risks} color="bg-red-400/70" />
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
      <p className="text-slate-300">{data.market_summary}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel>Drivers</FieldLabel>
          <BulletList items={data.drivers} color="bg-emerald-400/70" />
        </div>
        <div>
          <FieldLabel>Risks</FieldLabel>
          <BulletList items={data.risks} color="bg-red-400/70" />
        </div>
      </div>
      {data.sources.length > 0 && (
        <div>
          <FieldLabel>Sources</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {data.sources.map((s, i) => (
              <span
                key={i}
                className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400"
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
      <Separator className="bg-slate-800" />
      <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-200">
          {passed ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          )}
          Validation
          <Badge
            variant="outline"
            className={cn(
              "ml-auto text-[10px]",
              passed
                ? "border-emerald-400/30 text-emerald-400"
                : "border-amber-400/30 text-amber-400",
            )}
          >
            {passed ? "passed" : `${allIssues.length} issue${allIssues.length === 1 ? "" : "s"}`}
          </Badge>
        </div>
        {allIssues.length > 0 && (
          <ul className="space-y-1 text-[11px] text-amber-300/80">
            {allIssues.map((issue, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-amber-400/60" />
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        )}
        {allIssues.length === 0 && (
          <p className="text-[11px] text-slate-500">
            All quality checks passed.
          </p>
        )}
      </div>
    </>
  );
}
