import type { SnapshotRow, NewsRow, NarrativeRow, SynthesizedBrief, MarketBriefDebugPayload } from "@/ai/agents/types";

// ---------------------------------------------------------------------------
// Dataset item — input fed to the pipeline
// ---------------------------------------------------------------------------

export interface MarketBriefDatasetInput {
  snapshots: SnapshotRow[];
  news: NewsRow[];
  narratives: NarrativeRow[];
}

// ---------------------------------------------------------------------------
// Dataset item — expected output assertions
// ---------------------------------------------------------------------------

export type BriefTone = "bullish" | "bearish" | "neutral" | "cautious" | "mixed";

export interface MarketBriefExpectedOutput {
  mustMention: string[];
  mustNotClaim: string[];
  expectedDrivers: string[];
  requiredRisks: string[];
  expectedNarratives: string[];
  expectedTone: BriefTone;
  minConfidence: number;
  targetAssets: string[];
}

// ---------------------------------------------------------------------------
// Dataset item — scenario metadata
// ---------------------------------------------------------------------------

export interface MarketBriefDatasetMetadata {
  scenario: string;
  description: string;
  maxNewsAgeHours: number;
  missingAgents: string[];
}

// ---------------------------------------------------------------------------
// Full dataset item (combines all three layers)
// ---------------------------------------------------------------------------

export interface MarketBriefDatasetItem {
  input: MarketBriefDatasetInput;
  expectedOutput: MarketBriefExpectedOutput;
  metadata: MarketBriefDatasetMetadata;
}

// ---------------------------------------------------------------------------
// Evaluator result
// ---------------------------------------------------------------------------

export interface EvalScore {
  name: string;
  score: number;
  comment?: string;
}

// ---------------------------------------------------------------------------
// Full eval result for a single dataset item
// ---------------------------------------------------------------------------

export interface ItemEvalResult {
  itemIndex: number;
  scenario: string;
  brief: SynthesizedBrief | null;
  debugJson: MarketBriefDebugPayload | null;
  scores: EvalScore[];
  error?: string;
  latencyMs: number;
}
