/**
 * Narrative feature domain types.
 *
 * Consumed by:
 *   - scoring.ts        (deterministic candidate ranking)
 *   - generate.ts       (AI explanation layer)
 *   - service.ts        (orchestrator)
 *   - API route          (GET/POST /api/ai/narratives)
 *   - UI components      (/narratives page)
 */

export type NarrativeStatus = "emerging" | "active" | "peaking" | "fading";

export interface NarrativeSignal {
  label: string;
  explanation: string;
}

export interface NarrativeTokenRef {
  symbol: string;
  role: "leader" | "related" | "laggard";
}

export interface NarrativeItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  thesis: string;
  status: NarrativeStatus;
  strengthScore: number;
  confidenceScore: number;
  leaderTokens: NarrativeTokenRef[];
  relatedTokens: NarrativeTokenRef[];
  laggardTokens?: NarrativeTokenRef[];
  supportingSignals: NarrativeSignal[];
  riskSignals: string[];
  catalysts: string[];
  updatedAt: string;
}

/**
 * Internal candidate produced by deterministic scoring before AI enrichment.
 */
export interface NarrativeCandidate {
  slug: string;
  name: string;
  tokens: string[];
  /** Total tokens defined in the taxonomy bucket. */
  bucketSize: number;
  /** Fraction of bucket tokens with available market data (0–1). */
  dataCoverage: number;
  performanceScore: number;
  breadthScore: number;
  moverPresenceScore: number;
  compositeScore: number;
  leaderTokens: string[];
  status: NarrativeStatus;
  /** Per-token price change % (24h) for prompt context. */
  tokenPerformance: Record<string, number>;
}
