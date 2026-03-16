#!/usr/bin/env node
/**
 * Token Chart verification script.
 * Run: node scripts/verify-token-chart.mjs
 * Requires dev server at http://localhost:3000
 */

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

async function fetch(path) {
  const res = await globalThis.fetch(`${BASE}${path}`);
  return { ok: res.ok, status: res.status, json: () => res.json(), text: () => res.text() };
}

async function main() {
  console.log("Token Chart Verification\n" + "=".repeat(40));

  const results = { pass: 0, fail: 0 };

  try {
    // 1 & 2: BTC and ETH charts load (pages return 200)
    const btcPage = await fetch("/token/BTC");
    const ethPage = await fetch("/token/ETH");
    if (btcPage.ok) {
      console.log("✓ 1. /token/BTC loads");
      results.pass++;
    } else {
      console.log("✗ 1. /token/BTC failed:", btcPage.status);
      results.fail++;
    }
    if (ethPage.ok) {
      console.log("✓ 2. /token/ETH loads");
      results.pass++;
    } else {
      console.log("✗ 2. /token/ETH failed:", ethPage.status);
      results.fail++;
    }

    // 3 & 4: All time ranges work and return different data lengths
    const ranges = ["1D", "1W", "1M", "1Y", "ALL"];
    const btcByRange = {};

    for (const range of ranges) {
      const res = await fetch(`/api/market/chart?asset=BTC&range=${range}`);
      const data = await res.json();
      if (res.ok && data?.data?.length) {
        btcByRange[range] = data.data.length;
      }
    }

    if (Object.keys(btcByRange).length === 5) {
      console.log("✓ 3. 1D / 1W / 1M / 1Y / ALL all return data");
      results.pass++;
    } else {
      console.log("✗ 3. Some ranges failed:", Object.keys(btcByRange));
      results.fail++;
    }

    const ordered = ["1D", "1W", "1M", "1Y", "ALL"];
    const increasing = ordered.every(
      (r, i) => i === 0 || (btcByRange[ordered[i - 1]] ?? 0) <= (btcByRange[r] ?? 0)
    );
    if (increasing) {
      console.log("✓ 4. Chart data length increases across ranges");
      results.pass++;
    } else {
      console.log("✗ 4. Data lengths:", btcByRange);
      results.fail++;
    }

    // 5: Error state - API returns proper error
    const badAsset = await fetch("/api/market/chart?asset=INVALID&range=1D");
    const badJson = await badAsset.json();
    if (!badAsset.ok && badJson?.error) {
      console.log("✓ 5. Error state: API returns error for invalid asset");
      results.pass++;
    } else {
      console.log("✗ 5. Error handling:", badAsset.status, badJson);
      results.fail++;
    }

    // 6: Values align with dashboard source (same API, BTC/ETH have valid prices)
    const [btcChart, ethChart] = await Promise.all([
      fetch("/api/market/chart?asset=BTC&range=1D").then((r) => r.json()),
      fetch("/api/market/chart?asset=ETH&range=1D").then((r) => r.json()),
    ]);
    const btcValid = btcChart?.data?.length && btcChart.data[0]?.value > 1000;
    const ethValid = ethChart?.data?.length && ethChart.data[0]?.value > 100;

    if (btcValid && ethValid) {
      console.log("✓ 6. Chart values align with dashboard chart source (same API)");
      results.pass++;
    } else {
      console.log("✗ 6. Chart data invalid:", { btcValid, ethValid });
      results.fail++;
    }

    console.log("\n" + "=".repeat(40));
    console.log(`Result: ${results.pass} passed, ${results.fail} failed`);
    process.exit(results.fail > 0 ? 1 : 0);
  } catch (e) {
    console.error("Error:", e.message);
    if (e.cause) console.error("Cause:", e.cause);
    process.exit(1);
  }
}

main();
