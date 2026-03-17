/**
 * Shared constants for the Ask AI feature.
 *
 * Centralizing token symbols here prevents drift between the intent detector
 * (which uses them for classification) and the context builder (which uses them
 * for token extraction from user questions).
 */

export const ASK_AI_TOKENS = [
  "BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "AVAX", "DOGE",
  "DOT", "LINK", "MATIC", "ATOM", "NEAR", "APT", "ARB", "OP",
  "SUI", "TAO", "FET", "RENDER",
] as const;

export type AskAiToken = (typeof ASK_AI_TOKENS)[number];
