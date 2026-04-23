import type { MarketBriefDatasetItem } from "./types";

// ---------------------------------------------------------------------------
// Scenario 1: Bull market, full context — all agents should fire
// ---------------------------------------------------------------------------

const bullFullContext: MarketBriefDatasetItem = {
  input: {
    snapshots: [
      { symbol: "BTC", price: 97500, volume_24h: 42_000_000_000, market_cap: 1_920_000_000_000, funding_rate: 0.012, open_interest: 18_500_000_000 },
      { symbol: "ETH", price: 3850, volume_24h: 18_000_000_000, market_cap: 462_000_000_000, funding_rate: 0.008, open_interest: 8_200_000_000 },
      { symbol: "SOL", price: 185, volume_24h: 4_500_000_000, market_cap: 82_000_000_000, funding_rate: 0.015, open_interest: 2_800_000_000 },
    ],
    news: [
      { title: "Bitcoin ETF inflows hit $1.2B daily record", source: "CoinDesk", summary: "Spot Bitcoin ETFs saw record single-day net inflows of $1.2 billion, led by BlackRock's IBIT fund.", url: null, published_at: new Date(Date.now() - 2 * 3600_000).toISOString() },
      { title: "Ethereum layer-2 TVL surpasses $50B milestone", source: "The Block", summary: "Combined TVL across Ethereum L2s has exceeded $50 billion for the first time, driven by Arbitrum and Base.", url: null, published_at: new Date(Date.now() - 4 * 3600_000).toISOString() },
      { title: "Fed signals potential rate cut in September", source: "Reuters", summary: "Federal Reserve Chair indicated openness to rate cuts at the next FOMC meeting if inflation data remains favorable.", url: null, published_at: new Date(Date.now() - 6 * 3600_000).toISOString() },
      { title: "Solana DeFi volume surges 40% week-over-week", source: "DeFi Llama", summary: "Solana-based DEX volume jumped 40% in the past week, with Jupiter and Raydium leading activity.", url: null, published_at: new Date(Date.now() - 8 * 3600_000).toISOString() },
    ],
    narratives: [
      { name: "Institutional Adoption", description: "Growing institutional capital flowing into crypto via ETFs and treasury allocations", strength: 0.9, trend: "rising", sentiment: 0.85 },
      { name: "L2 Scaling", description: "Ethereum L2 ecosystems gaining significant traction and TVL", strength: 0.75, trend: "rising", sentiment: 0.7 },
      { name: "Macro Tailwinds", description: "Favorable macro environment with potential rate cuts", strength: 0.8, trend: "stable", sentiment: 0.75 },
    ],
  },
  expectedOutput: {
    mustMention: ["BTC", "ETF", "rate cut"],
    mustNotClaim: ["crash", "bear market", "capitulation", "market collapse"],
    expectedDrivers: ["ETF inflows", "rate cut expectations", "L2 growth"],
    requiredRisks: ["overheated funding rates", "concentration risk"],
    expectedNarratives: ["Institutional Adoption", "L2 Scaling"],
    expectedTone: "bullish",
    minConfidence: 0.7,
    targetAssets: ["BTC", "ETH", "SOL"],
  },
  metadata: {
    scenario: "bull-full-context",
    description: "Strong bull market with record ETF inflows, favorable macro, and full agent coverage.",
    maxNewsAgeHours: 12,
    missingAgents: [],
  },
};

// ---------------------------------------------------------------------------
// Scenario 2: Bear market, fear-driven selloff
// ---------------------------------------------------------------------------

const bearSelloff: MarketBriefDatasetItem = {
  input: {
    snapshots: [
      { symbol: "BTC", price: 52_000, volume_24h: 65_000_000_000, market_cap: 1_020_000_000_000, funding_rate: -0.025, open_interest: 12_000_000_000 },
      { symbol: "ETH", price: 2100, volume_24h: 28_000_000_000, market_cap: 252_000_000_000, funding_rate: -0.018, open_interest: 5_500_000_000 },
      { symbol: "SOL", price: 78, volume_24h: 6_000_000_000, market_cap: 34_000_000_000, funding_rate: -0.03, open_interest: 1_200_000_000 },
    ],
    news: [
      { title: "SEC files enforcement action against major exchange", source: "Bloomberg", summary: "The SEC filed an enforcement action against a top-3 crypto exchange alleging securities law violations.", url: null, published_at: new Date(Date.now() - 3 * 3600_000).toISOString() },
      { title: "Bitcoin drops below $55K as liquidations exceed $800M", source: "CoinTelegraph", summary: "Over $800 million in long positions were liquidated in the past 24 hours as BTC fell sharply.", url: null, published_at: new Date(Date.now() - 5 * 3600_000).toISOString() },
      { title: "Stablecoin outflows signal risk-off sentiment", source: "Glassnode", summary: "Significant stablecoin outflows from centralized exchanges suggest investors are moving to risk-off positions.", url: null, published_at: new Date(Date.now() - 7 * 3600_000).toISOString() },
    ],
    narratives: [
      { name: "Regulatory Crackdown", description: "Increasing regulatory pressure across multiple jurisdictions", strength: 0.95, trend: "rising", sentiment: -0.8 },
      { name: "De-risking", description: "Institutional and retail investors de-risking portfolios", strength: 0.85, trend: "rising", sentiment: -0.7 },
    ],
  },
  expectedOutput: {
    mustMention: ["SEC", "liquidation", "BTC"],
    mustNotClaim: ["bullish reversal", "buying opportunity", "bottom is in"],
    expectedDrivers: ["SEC enforcement action", "mass liquidations", "stablecoin outflows"],
    requiredRisks: ["further regulatory action", "cascading liquidations", "exchange solvency concerns"],
    expectedNarratives: ["Regulatory Crackdown"],
    expectedTone: "bearish",
    minConfidence: 0.65,
    targetAssets: ["BTC", "ETH"],
  },
  metadata: {
    scenario: "bear-selloff",
    description: "Sharp bearish selloff driven by SEC action and cascading liquidations.",
    maxNewsAgeHours: 12,
    missingAgents: [],
  },
};

// ---------------------------------------------------------------------------
// Scenario 3: Mixed signals — divergent indicators
// ---------------------------------------------------------------------------

const mixedSignals: MarketBriefDatasetItem = {
  input: {
    snapshots: [
      { symbol: "BTC", price: 71_000, volume_24h: 32_000_000_000, market_cap: 1_395_000_000_000, funding_rate: 0.003, open_interest: 15_000_000_000 },
      { symbol: "ETH", price: 3200, volume_24h: 14_000_000_000, market_cap: 384_000_000_000, funding_rate: -0.002, open_interest: 6_800_000_000 },
      { symbol: "SOL", price: 145, volume_24h: 3_800_000_000, market_cap: 64_000_000_000, funding_rate: 0.001, open_interest: 2_100_000_000 },
    ],
    news: [
      { title: "Bitcoin holds $70K as market awaits CPI data", source: "CoinDesk", summary: "BTC consolidates above $70K ahead of key US CPI release, with traders uncertain about direction.", url: null, published_at: new Date(Date.now() - 2 * 3600_000).toISOString() },
      { title: "Ethereum whale accumulation continues despite flat price", source: "Santiment", summary: "Large Ethereum holders have added 340K ETH in the past week despite lack of price movement.", url: null, published_at: new Date(Date.now() - 5 * 3600_000).toISOString() },
      { title: "Crypto VC funding drops 30% quarter-over-quarter", source: "The Block", summary: "Venture capital investment in crypto startups declined 30% in Q1, signaling cautious sentiment.", url: null, published_at: new Date(Date.now() - 10 * 3600_000).toISOString() },
    ],
    narratives: [
      { name: "Macro Uncertainty", description: "Markets waiting for CPI and Fed direction", strength: 0.7, trend: "stable", sentiment: 0 },
      { name: "Smart Money Accumulation", description: "Whale and institutional accumulation during consolidation", strength: 0.65, trend: "rising", sentiment: 0.3 },
    ],
  },
  expectedOutput: {
    mustMention: ["CPI", "consolidat"],
    mustNotClaim: ["crash", "parabolic", "guaranteed"],
    expectedDrivers: ["CPI anticipation", "whale accumulation", "VC funding decline"],
    requiredRisks: ["CPI miss leading to selloff", "declining VC funding"],
    expectedNarratives: ["Macro Uncertainty"],
    expectedTone: "cautious",
    minConfidence: 0.5,
    targetAssets: ["BTC", "ETH"],
  },
  metadata: {
    scenario: "mixed-signals",
    description: "Consolidation with mixed signals: whale buying but declining VC funding, CPI uncertainty.",
    maxNewsAgeHours: 12,
    missingAgents: [],
  },
};

// ---------------------------------------------------------------------------
// Scenario 4: Partial data — news agent missing (empty news)
// ---------------------------------------------------------------------------

const missingNews: MarketBriefDatasetItem = {
  input: {
    snapshots: [
      { symbol: "BTC", price: 84_000, volume_24h: 35_000_000_000, market_cap: 1_650_000_000_000, funding_rate: 0.005, open_interest: 16_000_000_000 },
      { symbol: "ETH", price: 3400, volume_24h: 15_000_000_000, market_cap: 408_000_000_000, funding_rate: 0.004, open_interest: 7_000_000_000 },
    ],
    news: [],
    narratives: [
      { name: "Bitcoin Dominance", description: "BTC dominance rising as altcoins underperform", strength: 0.8, trend: "rising", sentiment: 0.4 },
    ],
  },
  expectedOutput: {
    mustMention: ["BTC"],
    mustNotClaim: ["according to news reports", "breaking news"],
    expectedDrivers: ["BTC dominance trend"],
    requiredRisks: ["limited data availability"],
    expectedNarratives: ["Bitcoin Dominance"],
    expectedTone: "neutral",
    minConfidence: 0.4,
    targetAssets: ["BTC", "ETH"],
  },
  metadata: {
    scenario: "missing-news",
    description: "No news available — tests graceful degradation of the news agent and source attribution.",
    maxNewsAgeHours: 0,
    missingAgents: ["news"],
  },
};

// ---------------------------------------------------------------------------
// Scenario 5: Stale data — all news is 48+ hours old
// ---------------------------------------------------------------------------

const staleData: MarketBriefDatasetItem = {
  input: {
    snapshots: [
      { symbol: "BTC", price: 67_500, volume_24h: 25_000_000_000, market_cap: 1_325_000_000_000, funding_rate: 0.002, open_interest: 14_000_000_000 },
      { symbol: "ETH", price: 3050, volume_24h: 11_000_000_000, market_cap: 366_000_000_000, funding_rate: 0.001, open_interest: 6_200_000_000 },
      { symbol: "SOL", price: 132, volume_24h: 3_200_000_000, market_cap: 58_000_000_000, funding_rate: 0.001, open_interest: 1_900_000_000 },
    ],
    news: [
      { title: "Weekly market recap: crypto flat amid low volatility", source: "CoinDesk", summary: "Crypto markets traded sideways for the second consecutive week with historically low volatility.", url: null, published_at: new Date(Date.now() - 52 * 3600_000).toISOString() },
      { title: "Ethereum developers confirm Pectra upgrade timeline", source: "The Block", summary: "Core developers confirmed the Pectra upgrade will go live in Q3, bringing account abstraction to mainnet.", url: null, published_at: new Date(Date.now() - 50 * 3600_000).toISOString() },
    ],
    narratives: [
      { name: "Low Volatility Regime", description: "Extended period of compressed volatility", strength: 0.6, trend: "stable", sentiment: 0.1 },
    ],
  },
  expectedOutput: {
    mustMention: ["BTC"],
    mustNotClaim: ["breaking", "just announced", "today's news"],
    expectedDrivers: ["low volatility", "Pectra upgrade"],
    requiredRisks: ["volatility expansion risk", "stale information"],
    expectedNarratives: ["Low Volatility Regime"],
    expectedTone: "neutral",
    minConfidence: 0.35,
    targetAssets: ["BTC", "ETH"],
  },
  metadata: {
    scenario: "stale-data",
    description: "All news is 48+ hours old — tests staleness awareness and confidence calibration.",
    maxNewsAgeHours: 48,
    missingAgents: [],
  },
};

// ---------------------------------------------------------------------------
// Scenario 6: Minimal context — only BTC snapshot, nothing else
// ---------------------------------------------------------------------------

const minimalContext: MarketBriefDatasetItem = {
  input: {
    snapshots: [
      { symbol: "BTC", price: 62_000, volume_24h: 20_000_000_000, market_cap: 1_218_000_000_000, funding_rate: 0.001, open_interest: 13_000_000_000 },
    ],
    news: [],
    narratives: [],
  },
  expectedOutput: {
    mustMention: ["BTC"],
    mustNotClaim: ["ETH rally", "SOL surge", "altcoin season", "according to sources"],
    expectedDrivers: [],
    requiredRisks: ["insufficient data for comprehensive analysis"],
    expectedNarratives: [],
    expectedTone: "cautious",
    minConfidence: 0.25,
    targetAssets: ["BTC"],
  },
  metadata: {
    scenario: "minimal-context",
    description: "Only BTC snapshot, no news, no narratives — extreme edge case for graceful degradation.",
    maxNewsAgeHours: 0,
    missingAgents: ["news", "narrative"],
  },
};

// ---------------------------------------------------------------------------
// Export all fixtures
// ---------------------------------------------------------------------------

export const MARKET_BRIEF_FIXTURES: MarketBriefDatasetItem[] = [
  bullFullContext,
  bearSelloff,
  mixedSignals,
  missingNews,
  staleData,
  minimalContext,
];
