import { test, expect } from "@playwright/test";

const MOCK_ANALYSIS = {
  analysis: {
    summary:
      "BTC is trading at $73.6K, up 3.2% in the last 24 hours on strong volume.",
    bullish_factors: [
      "Record ETF inflows signal institutional demand",
      "Fed rate pause supports risk-on sentiment",
    ],
    bearish_factors: [
      "Approaching key resistance at $74K",
      "Volume may fade after initial spike",
    ],
    outlook:
      "Short-term bias is bullish. BTC is likely to test $74K resistance within 24-48 hours.",
    confidence: 0.82,
  },
  symbol: "BTC",
  latencyMs: 5000,
};

function mockAnalysisRoute(
  page: import("@playwright/test").Page,
  response: Record<string, unknown> = MOCK_ANALYSIS,
  status = 200,
  delay = 0,
) {
  return page.route("**/api/ai/token-analysis", async (route) => {
    if (delay) await new Promise((r) => setTimeout(r, delay));
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
}

test.describe("Token Analysis Card", () => {
  test("1. Summary renders", async ({ page }) => {
    await mockAnalysisRoute(page);
    await page.goto("/token/BTC");

    const summary = page.getByTestId("token-analysis-summary");
    await expect(summary).toBeVisible({ timeout: 10_000 });
    await expect(summary).toContainText("BTC is trading at $73.6K");
  });

  test("2. Bullish factors render as a list", async ({ page }) => {
    await mockAnalysisRoute(page);
    await page.goto("/token/BTC");

    const bullish = page.getByTestId("token-analysis-bullish");
    await expect(bullish).toBeVisible({ timeout: 10_000 });
    await expect(bullish.getByText("Bullish")).toBeVisible();

    const items = bullish.locator("li");
    await expect(items).toHaveCount(2);
    await expect(items.nth(0)).toContainText("Record ETF inflows");
    await expect(items.nth(1)).toContainText("Fed rate pause");
  });

  test("3. Bearish factors render as a list", async ({ page }) => {
    await mockAnalysisRoute(page);
    await page.goto("/token/BTC");

    const bearish = page.getByTestId("token-analysis-bearish");
    await expect(bearish).toBeVisible({ timeout: 10_000 });
    await expect(bearish.getByText("Bearish")).toBeVisible();

    const items = bearish.locator("li");
    await expect(items).toHaveCount(2);
    await expect(items.nth(0)).toContainText("Approaching key resistance");
    await expect(items.nth(1)).toContainText("Volume may fade");
  });

  test("4. Outlook renders", async ({ page }) => {
    await mockAnalysisRoute(page);
    await page.goto("/token/BTC");

    const outlook = page.getByTestId("token-analysis-outlook");
    await expect(outlook).toBeVisible({ timeout: 10_000 });
    await expect(outlook).toContainText("Short-term bias is bullish");
    await expect(page.getByText("Short-term Outlook")).toBeVisible();
  });

  test("5. Confidence renders with bar and label", async ({ page }) => {
    await mockAnalysisRoute(page);
    await page.goto("/token/BTC");

    const confidence = page.getByTestId("token-analysis-confidence");
    await expect(confidence).toBeVisible({ timeout: 10_000 });
    await expect(confidence).toContainText("High");
    await expect(confidence).toContainText("82%");
  });

  test("6. Loading state shows skeleton", async ({ page }) => {
    await mockAnalysisRoute(page, MOCK_ANALYSIS, 200, 3000);
    await page.goto("/token/BTC");

    const skeleton = page.getByTestId("token-analysis-loading");
    await expect(skeleton).toBeVisible({ timeout: 3000 });
    await expect(skeleton.locator(".animate-pulse").first()).toBeVisible();

    await expect(page.getByTestId("token-analysis-content")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("7. Error state shows message and retry button", async ({ page }) => {
    await mockAnalysisRoute(
      page,
      { error: "AI service temporarily unavailable" },
      500,
    );
    await page.goto("/token/BTC");

    await expect(
      page.getByText("AI service temporarily unavailable"),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("token-analysis-retry")).toBeVisible();
    await expect(page.getByTestId("token-analysis-retry")).toHaveText(
      "Try again",
    );
  });

  test("8. Full card structure on /token/ETH", async ({ page }) => {
    const ethResponse = {
      ...MOCK_ANALYSIS,
      symbol: "ETH",
      analysis: {
        ...MOCK_ANALYSIS.analysis,
        summary: "ETH is trading at $3.9K, up 5.1% on strong DeFi activity.",
        confidence: 0.45,
      },
    };
    await mockAnalysisRoute(page, ethResponse);
    await page.goto("/token/ETH");

    const card = page.getByTestId("token-analysis-card");
    await expect(card).toBeVisible({ timeout: 10_000 });
    await expect(card.getByText("AI Analysis")).toBeVisible();

    const content = page.getByTestId("token-analysis-content");
    await expect(content).toBeVisible({ timeout: 10_000 });

    const confidence = page.getByTestId("token-analysis-confidence");
    await expect(confidence).toContainText("Low");
    await expect(confidence).toContainText("45%");
  });
});
