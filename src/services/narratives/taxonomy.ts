/**
 * Static narrative taxonomy — maps theme slugs to token groups.
 *
 * Tokens listed here are limited to those the app actually tracks via
 * Binance, CoinGecko ingestion, ASK_AI_TOKENS, or mock data.
 * Tokens can appear in multiple themes (e.g. BONK in both memes and sol_eco).
 *
 * Extend this mapping as the app adds broader token coverage.
 */

export interface NarrativeBucket {
  name: string;
  description: string;
  tokens: string[];
}

export const NARRATIVE_TAXONOMY: Record<string, NarrativeBucket> = {
  ai: {
    name: "AI + Crypto",
    description: "Tokens tied to AI infrastructure, oracles, and ML on-chain.",
    tokens: ["FET", "RENDER", "TAO", "LINK", "NEAR"],
  },
  l2: {
    name: "Layer 2 Scaling",
    description: "L2s and rollups capturing Ethereum activity.",
    tokens: ["ARB", "OP", "MATIC"],
  },
  memes: {
    name: "Meme Coins",
    description: "Retail-driven meme tokens and viral narratives.",
    tokens: ["DOGE", "PEPE", "WIF", "BONK"],
  },
  defi: {
    name: "DeFi Resurgence",
    description: "Lending, DEXs, and yield protocols regaining traction.",
    tokens: ["UNI", "AAVE", "AVAX"],
  },
  sol_eco: {
    name: "Solana Ecosystem",
    description: "Solana-native tokens and ecosystem growth.",
    tokens: ["SOL", "BONK", "WIF"],
  },
  btc_beta: {
    name: "Bitcoin Beta / Majors",
    description: "Large-cap tokens that move with Bitcoin risk appetite.",
    tokens: ["BTC", "ETH", "BNB"],
  },
};

// ---------------------------------------------------------------------------
// Derived lookups (computed once at import time)
// ---------------------------------------------------------------------------

/** Flat set of all symbols tracked by the taxonomy. */
export const ALL_TAXONOMY_SYMBOLS: string[] = [
  ...new Set(Object.values(NARRATIVE_TAXONOMY).flatMap((b) => b.tokens)),
];

