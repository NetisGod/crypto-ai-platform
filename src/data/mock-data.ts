export interface TokenSummary {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  narrative?: string;
}

export interface Narrative {
  id: string;
  name: string;
  description: string;
  strength: number;
  trend: "up" | "down" | "neutral";
  tokens: string[];
  sentiment: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  summary: string;
  sentiment: "positive" | "negative" | "neutral";
  relatedTokens: string[];
  url: string;
}

export interface PricePoint {
  time: string;
  value: number;
}

export interface AlertRule {
  id: string;
  name: string;
  type: "price" | "volume" | "sentiment" | "narrative";
  condition: string;
  value: string | number;
  active: boolean;
  lastTriggered?: string;
}

export const MOCK_TOKENS: TokenSummary[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 97234.5,
    change24h: 2.34,
    change7d: 8.12,
    volume24h: 28450000000,
    marketCap: 1912000000000,
    narrative: "Institutional adoption",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 3542.8,
    change24h: -0.89,
    change7d: 4.56,
    volume24h: 15200000000,
    marketCap: 426000000000,
    narrative: "DeFi & L2 growth",
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 218.42,
    change24h: 5.67,
    change7d: 18.9,
    volume24h: 4200000000,
    marketCap: 101000000000,
    narrative: "Meme coins & NFTs",
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    price: 38.92,
    change24h: 1.23,
    change7d: -2.1,
    volume24h: 580000000,
    marketCap: 15200000000,
    narrative: "DeFi & gaming",
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    price: 16.78,
    change24h: 3.45,
    change7d: 12.3,
    volume24h: 920000000,
    marketCap: 10200000000,
    narrative: "AI & oracles",
  },
];

export const MOCK_NARRATIVES: Narrative[] = [
  {
    id: "n1",
    name: "AI + Crypto",
    description: "Tokens tied to AI infrastructure, oracles, and ML on-chain.",
    strength: 85,
    trend: "up",
    tokens: ["LINK", "FET", "RENDER", "TAO"],
    sentiment: 78,
  },
  {
    id: "n2",
    name: "Institutional adoption",
    description: "ETFs, custody, and traditional finance entering crypto.",
    strength: 92,
    trend: "up",
    tokens: ["BTC", "ETH", "COIN"],
    sentiment: 82,
  },
  {
    id: "n3",
    name: "Meme coins",
    description: "Retail-driven meme tokens and viral narratives.",
    strength: 68,
    trend: "neutral",
    tokens: ["DOGE", "PEPE", "WIF", "BONK"],
    sentiment: 55,
  },
  {
    id: "n4",
    name: "DeFi resurgence",
    description: "Lending, DEXs, and yield protocols regaining traction.",
    strength: 72,
    trend: "up",
    tokens: ["ETH", "AVAX", "UNI", "AAVE"],
    sentiment: 65,
  },
  {
    id: "n5",
    name: "Layer 2 scaling",
    description: "L2s and rollups capturing Ethereum activity.",
    strength: 78,
    trend: "up",
    tokens: ["ETH", "ARB", "OP", "STRK", "MATIC"],
    sentiment: 71,
  },
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: "news1",
    title: "Major Bank Announces Bitcoin Custody Product for Institutional Clients",
    source: "CoinDesk",
    timeAgo: "12m ago",
    summary: "Traditional finance continues to embrace digital assets with new custody solutions.",
    sentiment: "positive",
    relatedTokens: ["BTC"],
    url: "#",
  },
  {
    id: "news2",
    title: "Ethereum L2 Daily Volume Hits New All-Time High",
    source: "The Block",
    timeAgo: "1h ago",
    summary: "Layer 2 networks see record activity as users seek lower fees.",
    sentiment: "positive",
    relatedTokens: ["ETH", "ARB", "OP"],
    url: "#",
  },
  {
    id: "news3",
    title: "AI-Oracle Partnership Expands On-Chain Data Feeds",
    source: "Decrypt",
    timeAgo: "2h ago",
    summary: "Leading oracle network adds ML-powered price feeds for DeFi.",
    sentiment: "positive",
    relatedTokens: ["LINK"],
    url: "#",
  },
  {
    id: "news4",
    title: "Regulatory Clarity Delayed: SEC Pushes Back Key Ruling",
    source: "Bloomberg Crypto",
    timeAgo: "3h ago",
    summary: "Uncertainty continues as regulatory timeline extends.",
    sentiment: "negative",
    relatedTokens: [],
    url: "#",
  },
  {
    id: "news5",
    title: "Solana Ecosystem TVL Surges Past $8B",
    source: "DefiLlama",
    timeAgo: "4h ago",
    summary: "DeFi and NFT activity drive total value locked higher.",
    sentiment: "positive",
    relatedTokens: ["SOL"],
    url: "#",
  },
];

export const MOCK_PRICE_HISTORY: Record<string, PricePoint[]> = {
  BTC: [
    { time: "00:00", value: 94800 },
    { time: "04:00", value: 95200 },
    { time: "08:00", value: 96100 },
    { time: "12:00", value: 96800 },
    { time: "16:00", value: 96500 },
    { time: "20:00", value: 97000 },
    { time: "24:00", value: 97234.5 },
  ],
  ETH: [
    { time: "00:00", value: 3520 },
    { time: "04:00", value: 3540 },
    { time: "08:00", value: 3560 },
    { time: "12:00", value: 3550 },
    { time: "16:00", value: 3545 },
    { time: "20:00", value: 3548 },
    { time: "24:00", value: 3542.8 },
  ],
  SOL: [
    { time: "00:00", value: 205 },
    { time: "04:00", value: 208 },
    { time: "08:00", value: 212 },
    { time: "12:00", value: 215 },
    { time: "16:00", value: 217 },
    { time: "20:00", value: 218 },
    { time: "24:00", value: 218.42 },
  ],
};

export const MOCK_ALERTS: AlertRule[] = [
  {
    id: "a1",
    name: "BTC above $100k",
    type: "price",
    condition: "above",
    value: 100000,
    active: true,
    lastTriggered: undefined,
  },
  {
    id: "a2",
    name: "ETH volume spike",
    type: "volume",
    condition: "2x_avg",
    value: 2,
    active: true,
    lastTriggered: "2h ago",
  },
  {
    id: "a3",
    name: "AI narrative sentiment > 80",
    type: "narrative",
    condition: "sentiment_above",
    value: 80,
    active: true,
    lastTriggered: "1d ago",
  },
];

export function getTokenBySymbol(symbol: string): TokenSummary | undefined {
  return MOCK_TOKENS.find((t) => t.symbol.toUpperCase() === symbol.toUpperCase());
}

export function formatCompactNum(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toFixed(2);
}
