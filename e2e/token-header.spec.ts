import { test, expect } from "@playwright/test";

test.describe("Token Header", () => {
  test("1. /token/BTC shows BTC price and 24h change", async ({ page }) => {
    await page.goto("/token/BTC");

    await expect(page.getByRole("heading", { name: "BTC" })).toBeVisible();

    await expect(
      page.getByText(/\$[\d,]+\.\d{2}/, { exact: false })
    ).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByText(/[+-]?\d+\.\d+%.*24h/, { exact: false })
    ).toBeVisible({ timeout: 10000 });
  });

  test("2. /token/ETH shows ETH price and 24h change", async ({ page }) => {
    await page.goto("/token/ETH");

    await expect(page.getByRole("heading", { name: "ETH" })).toBeVisible();

    await expect(
      page.getByText(/\$[\d,]+\.\d{2}/, { exact: false })
    ).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByText(/[+-]?\d+\.\d+%.*24h/, { exact: false })
    ).toBeVisible({ timeout: 10000 });
  });

  test("3. Token page values match dashboard KPI cards", async ({
    page,
    request,
  }) => {
    const apiRes = await request.get("/api/market/prices");
    expect(apiRes.ok()).toBeTruthy();
    const { prices } = (await apiRes.json()) as {
      prices: Array<{
        symbol: string;
        currentPrice: number;
        priceChangePercentage24h: number;
      }>;
    };

    const btc = prices.find((p) => p.symbol === "BTC");
    const eth = prices.find((p) => p.symbol === "ETH");
    expect(btc).toBeDefined();
    expect(eth).toBeDefined();

    const formatPrice = (n: number) =>
      `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    await page.goto("/token/BTC");
    await expect(
      page.getByText(formatPrice(btc!.currentPrice), { exact: true })
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText(
        `${btc!.priceChangePercentage24h >= 0 ? "+" : ""}${btc!.priceChangePercentage24h.toFixed(2)}%`,
        { exact: false }
      )
    ).toBeVisible({ timeout: 5000 });

    await page.goto("/token/ETH");
    await expect(
      page.getByText(formatPrice(eth!.currentPrice), { exact: true })
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText(
        `${eth!.priceChangePercentage24h >= 0 ? "+" : ""}${eth!.priceChangePercentage24h.toFixed(2)}%`,
        { exact: false }
      )
    ).toBeVisible({ timeout: 5000 });
  });

  test("4. Positive/negative visual state works for 24h change", async ({
    page,
    request,
  }) => {
    const apiRes = await request.get("/api/market/prices");
    const { prices } = (await apiRes.json()) as {
      prices: Array<{ symbol: string; priceChangePercentage24h: number }>;
    };

    const btc = prices.find((p) => p.symbol === "BTC");
    if (!btc) return;

    await page.goto("/token/BTC");

    const changeBadge = page.locator('[class*="emerald-500"], [class*="red-500"]').first();
    await expect(changeBadge).toBeVisible({ timeout: 10000 });

    if (btc.priceChangePercentage24h >= 0) {
      await expect(
        page.locator('[class*="emerald-500"]').first()
      ).toBeVisible();
    } else {
      await expect(page.locator('[class*="red-500"]').first()).toBeVisible();
    }
  });

  test("5. Error state displays when API fails", async ({ page }) => {
    await page.route("**/api/market/prices**", (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ error: "Simulated failure" }) })
    );

    await page.goto("/token/BTC");

    await expect(page.getByText("Unable to load market data")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("Simulated failure")).toBeVisible();
  });

  test("5b. Loading state shows skeleton before data", async ({ page }) => {
    await page.route("**/api/market/prices**", async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      return route.continue();
    });

    await page.goto("/token/BTC");

    await expect(page.getByRole("heading", { name: "BTC" })).toBeVisible();
    await expect(page.locator(".animate-pulse").first()).toBeVisible({
      timeout: 3000,
    });
  });
});
