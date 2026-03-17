import { z } from "zod";

export const TokenAnalysisSchema = z.object({
  summary: z.string(),
  bullish_factors: z.array(z.string()),
  bearish_factors: z.array(z.string()),
  outlook: z.string(),
  confidence: z.number().min(0).max(1),
});

export type TokenAnalysis = z.infer<typeof TokenAnalysisSchema>;
