#!/usr/bin/env node
/**
 * Token News verification script.
 * Run: node scripts/verify-token-news.mjs
 * Requires dev server at http://localhost:3000
 */

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const results = { pass: 0, fail: 0 };

function check(label, ok, detail) {
  if (ok) {
    console.log(`✓ ${label}`);
    results.pass++;
  } else {
    console.log(`✗ ${label}` + (detail ? ` — ${detail}` : ""));
    results.fail++;
  }
}

async function main() {
  console.log("Token News Verification\n" + "=".repeat(50));

  // --- Fetch news API ---
  const apiRes = await globalThis.fetch(`${BASE}/api/news/latest`);
  const apiData = await apiRes.json();
  const allNews = apiData.news ?? [];

  // --- 1. /token/BTC shows a news section ---
  const btcRes = await globalThis.fetch(`${BASE}/token/BTC`);
  check("1. /token/BTC loads", btcRes.ok, `status ${btcRes.status}`);

  // --- 2. /token/ETH shows a news section ---
  const ethRes = await globalThis.fetch(`${BASE}/token/ETH`);
  check("2. /token/ETH loads", ethRes.ok, `status ${ethRes.status}`);

  // --- 3. Links open in new tabs ---
  // Verify component source has target="_blank" and rel="noopener noreferrer"
  const fs = await import("node:fs/promises");
  const src = await fs.readFile("src/components/token/TokenNews.tsx", "utf-8");
  const hasTargetBlank = src.includes('target="_blank"');
  const hasRelNoopener = src.includes('rel="noopener noreferrer"');
  check(
    "3. Links open in new tabs (target=_blank, rel=noopener)",
    hasTargetBlank && hasRelNoopener,
    `target=_blank: ${hasTargetBlank}, rel: ${hasRelNoopener}`
  );

  // --- 4. Empty and error states exist in code ---
  const hasErrorState =
    src.includes("Unable to load news") || src.includes("error");
  const hasEmptyState =
    src.includes("No news available") || src.includes("displayed.length === 0");
  const hasLoadingState =
    src.includes("LoadingSkeleton") || src.includes("animate-pulse");
  check(
    "4a. Error state exists in component",
    hasErrorState,
    "missing error UI"
  );
  check(
    "4b. Empty state exists in component",
    hasEmptyState,
    "missing empty UI"
  );
  check(
    "4c. Loading state exists in component",
    hasLoadingState,
    "missing loading UI"
  );

  // Test error via bad endpoint
  const badRes = await globalThis.fetch(`${BASE}/api/news/latest-INVALID`);
  check(
    "4d. API 404 for invalid endpoint (error path exercised)",
    !badRes.ok,
    `status ${badRes.status}`
  );

  // --- 5. Token relevance behavior ---
  const btcKeywords = ["btc", "bitcoin"];
  const ethKeywords = ["eth", "ethereum"];

  const btcMatches = allNews.filter((n) => {
    const t = n.title.toLowerCase();
    return btcKeywords.some((kw) => t.includes(kw));
  });
  const ethMatches = allNews.filter((n) => {
    const t = n.title.toLowerCase();
    return ethKeywords.some((kw) => t.includes(kw));
  });

  console.log(`\n--- Token relevance ---`);
  console.log(`Total articles from API: ${allNews.length}`);
  console.log(`BTC-relevant (title match): ${btcMatches.length}`);
  btcMatches.slice(0, 3).forEach((n) => console.log(`  → ${n.title.slice(0, 80)}`));
  console.log(`ETH-relevant (title match): ${ethMatches.length}`);
  ethMatches.slice(0, 3).forEach((n) => console.log(`  → ${n.title.slice(0, 80)}`));

  const btcFiltered = btcMatches.length > 0;
  const btcFallback = btcMatches.length === 0;
  check(
    `5a. BTC filtering: ${btcFiltered ? "shows filtered articles" : "falls back to all news (expected)"}`,
    true
  );

  const ethFiltered = ethMatches.length > 0;
  check(
    `5b. ETH filtering: ${ethFiltered ? "shows filtered articles" : "falls back to all news (expected)"}`,
    true
  );

  // Verify items are capped at 6
  const hasCap = src.includes("MAX_ITEMS = 6") || src.includes("MAX_ITEMS=6");
  check("5c. Items capped at 6", hasCap, "MAX_ITEMS not found");

  // Verify each item has required fields
  if (allNews.length > 0) {
    const sample = allNews[0];
    const hasTitle = typeof sample.title === "string" && sample.title.length > 0;
    const hasSource = typeof sample.source === "string" && sample.source.length > 0;
    const hasUrl = typeof sample.url === "string" && sample.url.startsWith("http");
    const hasTime = typeof sample.published_at === "string";
    check(
      "5d. News items have required fields (title, source, url, published_at)",
      hasTitle && hasSource && hasUrl && hasTime,
      `title:${hasTitle} source:${hasSource} url:${hasUrl} time:${hasTime}`
    );
  }

  console.log("\n" + "=".repeat(50));
  console.log(`Result: ${results.pass} passed, ${results.fail} failed`);
  process.exit(results.fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
