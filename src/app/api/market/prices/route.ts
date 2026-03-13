import { NextResponse } from "next/server";
import { fetchCurrentPrices } from "@/services/market/binance";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const prices = await fetchCurrentPrices();
    return NextResponse.json({
      prices,
      fetchedAt: new Date().toISOString(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
