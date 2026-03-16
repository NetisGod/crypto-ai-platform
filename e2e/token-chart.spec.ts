import { test, expect } from "@playwright/test";

test.describe("Token Chart", () => {
  test("1. /token/BTC shows BTC chart", async ({ page }) => {
    await page.goto("/token/BTC");

    await expect(page.getByRole("heading", { name: "BTC" })).toBeVisible();
    await expect(page.getByText("BTC Price")).toBeVisible();

    await expect(
      page.locator('[class*="recharts-responsive-container"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("2. /token/ETH shows ETH chart", async ({ page }) => {
    await page.goto("/token/ETH");

    await expect(page.getByRole("heading", { name: "ETH" })).toBeVisible();
    await expect(page.getByText("ETH Price")).toBeVisible();

    await expect(
      page.locator('[class*="recharts-responsive-container"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("3. 1D / 1W / 1M / 1Y / ALL range buttons work", async ({ page }) => {
    await page.goto("/token/BTC");

    const ranges = ["1 Day", "1 Week", "1 Month", "1 Year", "All"];
    for (const range of ranges) {
      await page.getByRole("button", { name: range }).click();
      await expect(page.getByRole("button", { name: range })).toHaveClass(
        /pointer-events-none/,
        { timeout: 3000 }
      );
    }
  });

  test("4. Chart data changes correctly across ranges", async ({
    page,
    request,
  }) => {
    const ranges = ["1D", "1W", "1M", "1Y", "ALL"] as const;
    const dataByRange: Record<string, number> = {};

    for (const range of ranges) {
      const res = await request.get(
        `/api/market/chart?asset=BTC&range=${range}`
      );
      expect(res.ok()).toBeTruthy();
      const { data } = (await res.json()) as { data: Array<{ value: number }> };
      expect(data.length).toBeGreaterThan(0);
      dataByRange[range] = data.length;
    }

    expect(dataByRange["1D"]).toBeLessThanOrEqual(dataByRange["1W"] ?? 0);
    expect(dataByRange["1W"]).toBeLessThanOrEqual(dataByRange["1M"] ?? 0);
    expect(dataByRange["1M"]).toBeLessThanOrEqual(dataByRange["1Y"] ?? 0);
    expect(dataByRange["1Y"]).toBeLessThanOrEqual(dataByRange["ALL"] ?? 0);

    await page.goto("/token/BTC");
    await expect(
      page.locator('[class*="recharts-responsive-container"]').first()
    ).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: "1 Week" }).click();
    await expect(
      page.locator('[class*="recharts-responsive-container"]').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("5a. Error state displays when chart API fails", async ({ page }) => {
    await page.route("**/api/market/chart**", (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Chart fetch failed" }),
      })
    );

    await page.goto("/token/BTC");

    await expect(page.getByText("Unable to load chart")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("Chart fetch failed")).toBeVisible();
  });

  test("5b. Loading state shows skeleton before chart data", async ({
    page,
  }) => {
    await page.route("**/api/market/chart**", async (route) => {
      await new Promise((r) => setTimeout(r, 2500));
      return route.continue();
    });

    await page.goto("/token/BTC");

    await expect(page.getByText("BTC Price")).toBeVisible();
    await expect(page.locator(".animate-pulse").first()).toBeVisible({
      timeout: 3000,
    });
  });

  test("6. Chart values align with dashboard chart source (same API)", async ({
    request,
  }) => {
    const [btcRes, ethRes] = await Promise.all([
      request.get("/api/market/chart?asset=BTC&range=1D"),
      request.get("/api/market/chart?asset=ETH&range=1D"),
    ]);

    expect(btcRes.ok()).toBeTruthy();
    expect(ethRes.ok()).toBeTruthy();

    const btcJson = (await btcRes.json()) as { asset: string; data: unknown[] };
    const ethJson = (await ethRes.json()) as { asset: string; data: unknown[] };

    expect(btcJson.asset).toBe("BTC");
    expect(ethJson.asset).toBe("ETH");
    expect(btcJson.data.length).toBeGreaterThan(0);
    expect(ethJson.data.length).toBeGreaterThan(0);

    const btcPoints = btcJson.data as Array<{ value: number }>;
    const ethPoints = ethJson.data as Array<{ value: number }>;
    expect(btcPoints[0]?.value).toBeGreaterThan(1000);
    expect(ethPoints[0]?.value).toBeGreaterThan(100);
  });
});
