import { z } from "zod";

// ---------------------------------------------------------------------------
// AI output sub-schemas
// ---------------------------------------------------------------------------

export const NarrativeAISignalSchema = z.object({
  label: z.string(),
  explanation: z.string(),
});

export const NarrativeAIItemSchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  thesis: z.string(),
  supporting_signals: z.array(NarrativeAISignalSchema),
  risk_signals: z.array(z.string()).default([]),
  catalysts: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
});

// ---------------------------------------------------------------------------
// Top-level AI output schema (validated by runAIStructured)
// ---------------------------------------------------------------------------

export const NarrativesAIOutputSchema = z.object({
  narratives: z.array(NarrativeAIItemSchema),
});

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type NarrativeAISignal = z.infer<typeof NarrativeAISignalSchema>;
export type NarrativeAIItem = z.infer<typeof NarrativeAIItemSchema>;
export type NarrativesAIOutput = z.infer<typeof NarrativesAIOutputSchema>;
