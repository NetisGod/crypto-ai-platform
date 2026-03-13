import { NextRequest, NextResponse } from "next/server";
import { fetchMarketChart } from "@/services/market/binance";
import type { AssetSymbol, TimeRange } from "@/services/market/types";

const VALID_ASSETS = new Set<AssetSymbol>(["BTC", "ETH"]);
const VALID_RANGES = new Set<TimeRange>(["1D", "1W", "1M", "1Y", "ALL"]);

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const asset = searchParams.get("asset") as AssetSymbol | null;
  const range = searchParams.get("range") as TimeRange | null;

  if (!asset || !VALID_ASSETS.has(asset)) {
    return NextResponse.json(
      { error: `Invalid asset. Use: ${[...VALID_ASSETS].join(", ")}` },
      { status: 400 }
    );
  }

  if (!range || !VALID_RANGES.has(range)) {
    return NextResponse.json(
      { error: `Invalid range. Use: ${[...VALID_RANGES].join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const data = await fetchMarketChart(asset, range);
    return NextResponse.json({
      asset,
      range,
      data,
      fetchedAt: new Date().toISOString(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
