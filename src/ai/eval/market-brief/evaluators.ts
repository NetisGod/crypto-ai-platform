import { SynthesizedBriefSchema } from "@/ai/agents/types";
import type { SynthesizedBrief, MarketBriefDebugPayload } from "@/ai/agents/types";
import type {
  EvalScore,
  MarketBriefExpectedOutput,
  MarketBriefDatasetMetadata,
  MarketBriefDatasetInput,
} from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lower(s: string): string {
  return s.toLowerCase();
}

function allText(brief: SynthesizedBrief): string {
  return [
    brief.market_summary,
    ...brief.drivers,
    ...brief.risks,
    ...brief.sources,
  ]
    .join(" ")
    .toLowerCase();
}

function fuzzyContains(haystack: string, needle: string): boolean {
  return lower(haystack).includes(lower(needle));
}

const KNOWN_ASSET_ALIASES: Record<string, string[]> = {
  BTC: ["btc", "bitcoin"],
  ETH: ["eth", "ethereum"],
  SOL: ["sol", "solana"],
  XRP: ["xrp", "ripple"],
  DOGE: ["doge", "dogecoin"],
  ADA: ["ada", "cardano"],
  BNB: ["bnb", "binance coin", "binancecoin"],
};

// ---------------------------------------------------------------------------
// 1. Structural evaluators (always run, no expectedOutput needed)
// ---------------------------------------------------------------------------

export function schemaValidity(brief: unknown): EvalScore {
  const result = SynthesizedBriefSchema.safeParse(brief);
  return {
    name: "schema_validity",
    score: result.success ? 1 : 0,
    comment: result.success
      ? "Output matches SynthesizedBriefSchema"
      : `Schema validation failed: ${String((result as { error?: { message?: string } }).error?.message ?? "unknown")}`,
  };
}

export function structuralCompleteness(brief: SynthesizedBrief): EvalScore {
  let total = 0;
  let passed = 0;

  total++;
  if (brief.market_summary.trim().length > 20) passed++;

  total++;
  if (brief.drivers.length >= 3 && brief.drivers.length <= 6) passed++;

  total++;
  if (brief.risks.length >= 3 && brief.risks.length <= 5) passed++;

  total++;
  if (brief.sources.length > 0) passed++;

  total++;
  if (brief.confidence >= 0 && brief.confidence <= 1) passed++;

  const score = total > 0 ? passed / total : 0;
  return {
    name: "structural_completeness",
    score,
    comment: `${passed}/${total} structural checks passed`,
  };
}

export function noDuplication(brief: SynthesizedBrief): EvalScore {
  function hasDupes(items: string[]): string[] {
    const dupes: string[] = [];
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = lower(items[i]);
        const b = lower(items[j]);
        const shorter = Math.min(a.length, b.length);
        const overlap = longestCommonSubstring(a, b);
        if (shorter > 0 && overlap / shorter > 0.7) {
          dupes.push(`"${items[i]}" ~ "${items[j]}"`);
        }
      }
    }
    return dupes;
  }

  const driverDupes = hasDupes(brief.drivers);
  const riskDupes = hasDupes(brief.risks);
  const allDupes = [...driverDupes, ...riskDupes];

  return {
    name: "no_duplication",
    score: allDupes.length === 0 ? 1 : 0,
    comment:
      allDupes.length === 0
        ? "No duplicates detected"
        : `Potential duplicates: ${allDupes.join("; ")}`,
  };
}

function longestCommonSubstring(a: string, b: string): number {
  let max = 0;
  const table: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0) as number[],
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        table[i][j] = table[i - 1][j - 1] + 1;
        if (table[i][j] > max) max = table[i][j];
      }
    }
  }
  return max;
}

export function sourceAttribution(
  brief: SynthesizedBrief,
  input: MarketBriefDatasetInput,
): EvalScore {
  if (input.news.length === 0) {
    return {
      name: "source_attribution",
      score: brief.sources.length === 0 ? 1 : 0,
      comment: brief.sources.length === 0
        ? "No sources expected (no news input)"
        : "Sources listed but no news was provided — possible hallucination",
    };
  }

  if (brief.sources.length === 0) {
    return {
      name: "source_attribution",
      score: 0,
      comment: "No sources in output despite news being available",
    };
  }

  const newsTitles = input.news.map((n) => lower(n.title));
  let matched = 0;
  for (const src of brief.sources) {
    if (newsTitles.some((t) => fuzzyContains(t, src) || fuzzyContains(src, t))) {
      matched++;
    }
  }

  const score = matched / brief.sources.length;
  return {
    name: "source_attribution",
    score,
    comment: `${matched}/${brief.sources.length} sources matched to input news titles`,
  };
}

export function unsupportedClaims(
  brief: SynthesizedBrief,
  input: MarketBriefDatasetInput,
  expected: MarketBriefExpectedOutput,
): EvalScore {
  const violations: string[] = [];
  const briefText = allText(brief);
  const newsText = input.news
    .map((n) => `${n.title} ${n.summary ?? ""}`)
    .join(" ")
    .toLowerCase();
  const narrativeText = input.narratives
    .map((n) => `${n.name} ${n.description ?? ""}`)
    .join(" ")
    .toLowerCase();
  const contextText = [newsText, narrativeText].filter(Boolean).join(" ");

  for (const source of brief.sources) {
    const matched = input.news.some((n) => {
      const title = lower(n.title);
      const candidate = lower(source);
      return fuzzyContains(title, candidate) || fuzzyContains(candidate, title);
    });
    if (!matched) {
      violations.push(`unsupported source "${source}"`);
    }
  }

  const allowedAssets = new Set(expected.targetAssets.map((asset) => asset.toUpperCase()));
  for (const [asset, aliases] of Object.entries(KNOWN_ASSET_ALIASES)) {
    if (!allowedAssets.has(asset) && aliases.some((alias) => briefText.includes(alias))) {
      violations.push(`unsupported asset mention "${asset}"`);
    }
  }

  if (input.news.length === 0) {
    const newsLikeClaims = [
      "according to reports",
      "breaking news",
      "just announced",
      "reported by",
      "news flow",
    ];
    for (const claim of newsLikeClaims) {
      if (briefText.includes(claim)) {
        violations.push(`news-like claim without news input: "${claim}"`);
      }
    }
  }

  const unsupportedPhrases = [
    ...expected.mustNotClaim,
    "etf approval",
    "token unlock",
    "exploit",
    "hack",
    "partnership announcement",
    "listing announcement",
  ];
  for (const phrase of unsupportedPhrases) {
    const term = lower(phrase);
    if (!briefText.includes(term)) continue;
    if (contextText.includes(term)) continue;
    violations.push(`claim not grounded in input: "${phrase}"`);
  }

  const uniqueViolations = [...new Set(violations)];
  const penaltyBase = Math.max(1, uniqueViolations.length);
  const score = uniqueViolations.length === 0
    ? 1
    : Math.max(0, 1 - uniqueViolations.length / (penaltyBase + 1));

  return {
    name: "unsupported_claims",
    score,
    comment: uniqueViolations.length === 0
      ? "No unsupported sources, assets, or claims detected"
      : uniqueViolations.join("; "),
  };
}

// ---------------------------------------------------------------------------
// 2. ExpectedOutput-driven evaluators
// ---------------------------------------------------------------------------

export function mentionPresence(
  brief: SynthesizedBrief,
  expected: MarketBriefExpectedOutput,
): EvalScore {
  if (expected.mustMention.length === 0) {
    return { name: "mention_presence", score: 1, comment: "No mustMention terms specified" };
  }

  const summary = lower(brief.market_summary);
  let found = 0;
  const missing: string[] = [];

  for (const term of expected.mustMention) {
    if (summary.includes(lower(term))) {
      found++;
    } else {
      missing.push(term);
    }
  }

  const score = found / expected.mustMention.length;
  return {
    name: "mention_presence",
    score,
    comment: missing.length === 0
      ? "All required terms found in summary"
      : `Missing: ${missing.join(", ")}`,
  };
}

export function negativeClaim(
  brief: SynthesizedBrief,
  expected: MarketBriefExpectedOutput,
): EvalScore {
  if (expected.mustNotClaim.length === 0) {
    return { name: "negative_claim", score: 1, comment: "No mustNotClaim terms specified" };
  }

  const text = allText(brief);
  const violations: string[] = [];

  for (const claim of expected.mustNotClaim) {
    if (text.includes(lower(claim))) {
      violations.push(claim);
    }
  }

  return {
    name: "negative_claim",
    score: violations.length === 0 ? 1 : 0,
    comment: violations.length === 0
      ? "No forbidden claims found"
      : `Violations found: ${violations.join(", ")}`,
  };
}

export function driverCoverage(
  brief: SynthesizedBrief,
  expected: MarketBriefExpectedOutput,
): EvalScore {
  if (expected.expectedDrivers.length === 0) {
    return { name: "driver_coverage", score: 1, comment: "No expectedDrivers specified" };
  }

  const driversText = brief.drivers.map(lower).join(" ");
  const summaryText = lower(brief.market_summary);
  const combined = driversText + " " + summaryText;

  let matched = 0;
  const missing: string[] = [];

  for (const driver of expected.expectedDrivers) {
    const keywords = lower(driver).split(/\s+/);
    const keywordHits = keywords.filter((kw) => kw.length > 3 && combined.includes(kw)).length;
    if (keywordHits >= Math.ceil(keywords.filter((kw) => kw.length > 3).length * 0.5)) {
      matched++;
    } else {
      missing.push(driver);
    }
  }

  const score = matched / expected.expectedDrivers.length;
  return {
    name: "driver_coverage",
    score,
    comment: missing.length === 0
      ? "All expected drivers covered"
      : `Missing drivers: ${missing.join(", ")}`,
  };
}

export function riskCoverage(
  brief: SynthesizedBrief,
  expected: MarketBriefExpectedOutput,
): EvalScore {
  if (expected.requiredRisks.length === 0) {
    return { name: "risk_coverage", score: 1, comment: "No requiredRisks specified" };
  }

  const risksText = brief.risks.map(lower).join(" ");
  const summaryText = lower(brief.market_summary);
  const combined = risksText + " " + summaryText;

  let matched = 0;
  const missing: string[] = [];

  for (const risk of expected.requiredRisks) {
    const keywords = lower(risk).split(/\s+/);
    const keywordHits = keywords.filter((kw) => kw.length > 3 && combined.includes(kw)).length;
    if (keywordHits >= Math.ceil(keywords.filter((kw) => kw.length > 3).length * 0.5)) {
      matched++;
    } else {
      missing.push(risk);
    }
  }

  const score = matched / expected.requiredRisks.length;
  return {
    name: "risk_coverage",
    score,
    comment: missing.length === 0
      ? "All required risks covered"
      : `Missing risks: ${missing.join(", ")}`,
  };
}

export function narrativeCoverage(
  brief: SynthesizedBrief,
  expected: MarketBriefExpectedOutput,
): EvalScore {
  if (expected.expectedNarratives.length === 0) {
    return { name: "narrative_coverage", score: 1, comment: "No expectedNarratives specified" };
  }

  const text = allText(brief);
  let matched = 0;
  const missing: string[] = [];

  for (const narrative of expected.expectedNarratives) {
    const keywords = lower(narrative).split(/\s+/);
    const hits = keywords.filter((kw) => kw.length > 3 && text.includes(kw)).length;
    if (hits >= Math.ceil(keywords.filter((kw) => kw.length > 3).length * 0.5)) {
      matched++;
    } else {
      missing.push(narrative);
    }
  }

  const score = matched / expected.expectedNarratives.length;
  return {
    name: "narrative_coverage",
    score,
    comment: missing.length === 0
      ? "All expected narratives surfaced"
      : `Missing narratives: ${missing.join(", ")}`,
  };
}

const TONE_KEYWORDS: Record<string, string[]> = {
  bullish: ["bullish", "rally", "surge", "gains", "momentum", "upside", "optimistic", "positive", "strong"],
  bearish: ["bearish", "decline", "drop", "selloff", "downside", "pessimistic", "weakness", "crash", "fall"],
  neutral: ["sideways", "flat", "range-bound", "consolidat", "unchanged", "stable", "mixed"],
  cautious: ["cautious", "uncertain", "risk", "caution", "wary", "vigilant", "careful", "watch"],
  mixed: ["mixed", "divergent", "conflicting", "on one hand", "however", "despite"],
};

export function toneMatch(
  brief: SynthesizedBrief,
  expected: MarketBriefExpectedOutput,
): EvalScore {
  const text = lower(brief.market_summary);

  const toneScores: Record<string, number> = {};
  for (const [tone, keywords] of Object.entries(TONE_KEYWORDS)) {
    toneScores[tone] = keywords.filter((kw) => text.includes(kw)).length;
  }

  const detectedTone = Object.entries(toneScores).reduce(
    (best, [tone, score]) => (score > best.score ? { tone, score } : best),
    { tone: "neutral", score: 0 },
  ).tone;

  const match = detectedTone === expected.expectedTone;
  return {
    name: "tone_match",
    score: match ? 1 : 0,
    comment: match
      ? `Tone matches: ${expected.expectedTone}`
      : `Expected "${expected.expectedTone}", detected "${detectedTone}" (scores: ${JSON.stringify(toneScores)})`,
  };
}

export function confidenceThreshold(
  brief: SynthesizedBrief,
  expected: MarketBriefExpectedOutput,
): EvalScore {
  const passed = brief.confidence >= expected.minConfidence;
  return {
    name: "confidence_threshold",
    score: passed ? 1 : 0,
    comment: passed
      ? `Confidence ${brief.confidence} >= threshold ${expected.minConfidence}`
      : `Confidence ${brief.confidence} < threshold ${expected.minConfidence}`,
  };
}

export function assetCoverage(
  brief: SynthesizedBrief,
  expected: MarketBriefExpectedOutput,
): EvalScore {
  if (expected.targetAssets.length === 0) {
    return { name: "asset_coverage", score: 1, comment: "No targetAssets specified" };
  }

  const text = allText(brief);
  let found = 0;
  const missing: string[] = [];

  for (const asset of expected.targetAssets) {
    if (text.includes(lower(asset))) {
      found++;
    } else {
      missing.push(asset);
    }
  }

  const score = found / expected.targetAssets.length;
  return {
    name: "asset_coverage",
    score,
    comment: missing.length === 0
      ? "All target assets mentioned"
      : `Missing assets: ${missing.join(", ")}`,
  };
}

// ---------------------------------------------------------------------------
// 3. Metadata-driven evaluators
// ---------------------------------------------------------------------------

export function stalenessAwareness(
  brief: SynthesizedBrief,
  input: MarketBriefDatasetInput,
  meta: MarketBriefDatasetMetadata,
): EvalScore {
  if (meta.maxNewsAgeHours <= 24) {
    return { name: "staleness_awareness", score: 1, comment: "News is fresh — no staleness concern" };
  }

  const hasAcknowledgment =
    fuzzyContains(brief.market_summary, "stale") ||
    fuzzyContains(brief.market_summary, "outdated") ||
    fuzzyContains(brief.market_summary, "limited recent") ||
    fuzzyContains(brief.market_summary, "older") ||
    brief.confidence < 0.5;

  return {
    name: "staleness_awareness",
    score: hasAcknowledgment ? 1 : 0,
    comment: hasAcknowledgment
      ? "Brief acknowledges stale data or has reduced confidence"
      : `News is ${meta.maxNewsAgeHours}h+ old but brief doesn't reflect this`,
  };
}

export function gracefulDegradation(
  brief: SynthesizedBrief,
  debugJson: MarketBriefDebugPayload | null,
  meta: MarketBriefDatasetMetadata,
): EvalScore {
  if (meta.missingAgents.length === 0) {
    return { name: "graceful_degradation", score: 1, comment: "No missing agents expected" };
  }

  const issues: string[] = [];

  if (debugJson) {
    for (const agent of meta.missingAgents) {
      const agentKey = `${agent}Analysis` as keyof MarketBriefDebugPayload;
      if (debugJson[agentKey] !== null && debugJson[agentKey] !== undefined) {
        issues.push(`Expected ${agent} agent to be null but got data`);
      }
    }
  }

  if (meta.missingAgents.includes("news") && brief.sources.length > 0) {
    const text = allText(brief);
    if (
      fuzzyContains(text, "according to") ||
      fuzzyContains(text, "reports suggest") ||
      fuzzyContains(text, "breaking news")
    ) {
      issues.push("Brief references news-like language despite missing news agent");
    }
  }

  return {
    name: "graceful_degradation",
    score: issues.length === 0 ? 1 : 0,
    comment: issues.length === 0
      ? `Gracefully handled missing agents: ${meta.missingAgents.join(", ")}`
      : issues.join("; "),
  };
}

// ---------------------------------------------------------------------------
// 4. Aggregate: run all evaluators for a single item
// ---------------------------------------------------------------------------

export function runAllEvaluators(
  brief: SynthesizedBrief,
  input: MarketBriefDatasetInput,
  expected: MarketBriefExpectedOutput,
  meta: MarketBriefDatasetMetadata,
  debugJson: MarketBriefDebugPayload | null,
): EvalScore[] {
  return [
    schemaValidity(brief),
    structuralCompleteness(brief),
    noDuplication(brief),
    sourceAttribution(brief, input),
    unsupportedClaims(brief, input, expected),
    mentionPresence(brief, expected),
    negativeClaim(brief, expected),
    driverCoverage(brief, expected),
    riskCoverage(brief, expected),
    narrativeCoverage(brief, expected),
    toneMatch(brief, expected),
    confidenceThreshold(brief, expected),
    assetCoverage(brief, expected),
    stalenessAwareness(brief, input, meta),
    gracefulDegradation(brief, debugJson, meta),
  ];
}

// ---------------------------------------------------------------------------
// 5. Run-level aggregate evaluators
// ---------------------------------------------------------------------------

export function computeRunAggregates(allItemScores: EvalScore[][]): EvalScore[] {
  const flat = allItemScores.flat();
  if (flat.length === 0) {
    return [
      { name: "avg_score", score: 0, comment: "No items evaluated" },
      { name: "worst_case", score: 0, comment: "No items evaluated" },
    ];
  }

  const itemAvgs = allItemScores.map((scores) => {
    const sum = scores.reduce((acc, s) => acc + s.score, 0);
    return scores.length > 0 ? sum / scores.length : 0;
  });

  const avgScore = itemAvgs.reduce((a, b) => a + b, 0) / itemAvgs.length;
  const worstCase = Math.min(...itemAvgs);

  return [
    {
      name: "avg_score",
      score: parseFloat(avgScore.toFixed(4)),
      comment: `Average across ${allItemScores.length} items`,
    },
    {
      name: "worst_case",
      score: parseFloat(worstCase.toFixed(4)),
      comment: `Weakest item scored ${worstCase.toFixed(4)}`,
    },
  ];
}
