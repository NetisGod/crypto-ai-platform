/**
 * GET /api/market/btc-chart
 *
 * Returns BTC 24h price chart data from CoinGecko. Cached ~60s in the service.
 * Response: { data: { time: string; value: number }[] } or { error: string }
 */

import { NextResponse } from "next/server";
import { getBtcChartData } from "@/services/market/get-btc-chart";

export async function GET() {
  try {
    const data = await getBtcChartData();
    return NextResponse.json({ data });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
