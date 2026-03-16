import { z } from "zod";
import { Annotation } from "@langchain/langgraph";
import type { LangfuseTrace } from "@/lib/langfuse";

// ---------------------------------------------------------------------------
// Data types shared across agents (mirrors DB row shapes)
// ---------------------------------------------------------------------------

export interface SnapshotRow {
  symbol: string;
  price: number;
  volume_24h: number | null;
  market_cap: number | null;
  funding_rate: number | null;
  open_interest: number | null;
}

export interface NewsRow {
  title: string;
  source: string;
  summary: string | null;
  url: string | null;
  published_at: string | null;
}

export interface NarrativeRow {
  name: string;
  description: string | null;
  strength: number;
  trend: string;
  sentiment: number;
}

// ---------------------------------------------------------------------------
// Agent output schemas (Zod)
// ---------------------------------------------------------------------------

export const MarketDataAnalysisSchema = z.object({
  market_momentum: z.string(),
  key_signals: z.array(z.string()),
  market_structure: z.string(),
  confidence: z.number(),
});
export type MarketDataAnalysis = z.infer<typeof MarketDataAnalysisSchema>;

export const NewsAnalysisSchema = z.object({
  news_summary: z.string(),
  main_drivers: z.array(z.string()),
  source_titles: z.array(z.string()),
  confidence: z.number(),
});
export type NewsAnalysis = z.infer<typeof NewsAnalysisSchema>;

export const NarrativeAnalysisSchema = z.object({
  top_narratives: z.array(z.string()),
  narrative_summary: z.string(),
  affected_tokens: z.array(z.string()),
  confidence: z.number(),
});
export type NarrativeAnalysis = z.infer<typeof NarrativeAnalysisSchema>;

export const RiskAnalysisSchema = z.object({
  top_risks: z.array(z.string()),
  risk_summary: z.string(),
  severity: z.number(),
  confidence: z.number(),
});
export type RiskAnalysis = z.infer<typeof RiskAnalysisSchema>;

export const SynthesizedBriefSchema = z.object({
  market_summary: z.string(),
  drivers: z.array(z.string()),
  risks: z.array(z.string()),
  confidence: z.number(),
  sources: z.array(z.string()),
});
export type SynthesizedBrief = z.infer<typeof SynthesizedBriefSchema>;

export const ValidationResultSchema = z.object({
  valid: z.boolean(),
  normalized_brief: SynthesizedBriefSchema,
  issues: z.array(z.string()),
});
export type ValidationResult = z.infer<typeof ValidationResultSchema>;

// ---------------------------------------------------------------------------
// Agent task types (mirrors router TaskType for use in agent-layer code)
// ---------------------------------------------------------------------------

export type AgentTaskType =
  | "classification"
  | "extraction"
  | "reasoning"
  | "synthesis"
  | "validation";

// ---------------------------------------------------------------------------
// AI execution metadata (captured by the runner for observability / debug)
// ---------------------------------------------------------------------------

export interface AIExecutionMetadata {
  task: AgentTaskType | string;
  model: string;
  provider: string;
  temperature: number;
  maxTokens: number;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  retryCount: number;
}

// ---------------------------------------------------------------------------
// Debug payload for the Multi-Agent Market Brief (stored as debug_json)
// ---------------------------------------------------------------------------

export interface MarketBriefDebugPayload {
  marketDataAnalysis: MarketDataAnalysis | null;
  newsAnalysis: NewsAnalysis | null;
  narrativeAnalysis: NarrativeAnalysis | null;
  riskAnalysis: RiskAnalysis | null;
  synthesizedBrief: SynthesizedBrief | null;
  validationResult: {
    valid: boolean;
    issues: string[];
  } | null;
  issues: string[];
  meta: {
    latencyMs: number;
    agentCoverage: string[];
    model: string;
    snapshotCount: number;
    newsCount: number;
  };
}

// ---------------------------------------------------------------------------
// LangGraph state annotation
// ---------------------------------------------------------------------------

export const MarketBriefGraphState = Annotation.Root({
  snapshots: Annotation<SnapshotRow[]>,
  news: Annotation<NewsRow[]>,
  narratives: Annotation<NarrativeRow[]>,

  marketDataAnalysis: Annotation<MarketDataAnalysis | null>,
  newsAnalysis: Annotation<NewsAnalysis | null>,
  narrativeAnalysis: Annotation<NarrativeAnalysis | null>,
  riskAnalysis: Annotation<RiskAnalysis | null>,

  synthesizedBrief: Annotation<SynthesizedBrief | null>,
  validationResult: Annotation<ValidationResult | null>,

  issues: Annotation<string[]>({
    reducer: (prev: string[], next: string[]) => [...prev, ...next],
    default: () => [],
  }),

  trace: Annotation<LangfuseTrace | null>,
});

export type MarketBriefState = typeof MarketBriefGraphState.State;
export type MarketBriefUpdate = typeof MarketBriefGraphState.Update;

// ---------------------------------------------------------------------------
// Langfuse span helper — wraps a child span as a LangfuseTrace for agents
// ---------------------------------------------------------------------------

export function createAgentSpan(
  parentTrace: LangfuseTrace | null,
  name: string,
  input?: unknown,
): { span: LangfuseTrace | null; end: (output?: unknown) => void } {
  if (!parentTrace) {
    return { span: null, end: () => {} };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const langfuseSpan = (parentTrace as any).span({ name, input });
  return {
    span: langfuseSpan as unknown as LangfuseTrace,
    end: (output?: unknown) => {
      langfuseSpan.end({ output });
    },
  };
}

