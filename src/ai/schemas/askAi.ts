import { z } from "zod";

export const AskAiIntentSchema = z.enum([
  "token_analysis",
  "market_summary",
  "top_movers",
  "news_summary",
  "general_market_question",
]);

export const AskAiRequestSchema = z.object({
  question: z.string().trim().min(1, "Question is required").max(500),
});

export const AskAiResponseSchema = z.object({
  answer: z.string(),
  intent: AskAiIntentSchema,
  drivers: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  sources: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
});

export type AskAiIntent = z.infer<typeof AskAiIntentSchema>;
export type AskAiRequest = z.infer<typeof AskAiRequestSchema>;
export type AskAiResponse = z.infer<typeof AskAiResponseSchema>;
