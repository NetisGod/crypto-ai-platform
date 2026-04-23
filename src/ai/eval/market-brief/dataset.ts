import { getLangfuse, type LangfuseTrace } from "@/lib/langfuse";
import { MARKET_BRIEF_FIXTURES } from "./fixtures";
import type { MarketBriefDatasetItem } from "./types";

export const DATASET_NAME = "market-brief-eval";

// ---------------------------------------------------------------------------
// Ensure dataset exists in Langfuse
// ---------------------------------------------------------------------------

export async function ensureDataset(): Promise<void> {
  const langfuse = getLangfuse();
  if (!langfuse) {
    throw new Error("[Eval] Langfuse client not configured — cannot manage datasets.");
  }

  try {
    await langfuse.getDataset(DATASET_NAME);
  } catch {
    await langfuse.createDataset({
      name: DATASET_NAME,
      description: "Market Brief multi-agent pipeline evaluation scenarios",
      metadata: { version: "1.0", createdBy: "eval-seed" },
    });
    console.log(`[Eval] Created dataset "${DATASET_NAME}"`);
  }
}

// ---------------------------------------------------------------------------
// Seed fixtures into the dataset
// ---------------------------------------------------------------------------

export async function seedFixtures(
  fixtures: MarketBriefDatasetItem[] = MARKET_BRIEF_FIXTURES,
): Promise<number> {
  const langfuse = getLangfuse();
  if (!langfuse) {
    throw new Error("[Eval] Langfuse client not configured.");
  }

  await ensureDataset();

  let created = 0;
  for (const fixture of fixtures) {
    await langfuse.createDatasetItem({
      datasetName: DATASET_NAME,
      input: fixture.input,
      expectedOutput: fixture.expectedOutput,
      metadata: fixture.metadata,
    });
    created++;
    console.log(`[Eval] Seeded item: ${fixture.metadata.scenario}`);
  }

  await langfuse.flushAsync();
  return created;
}

// ---------------------------------------------------------------------------
// Fetch dataset items from Langfuse
// ---------------------------------------------------------------------------

export interface FetchedItem {
  id: string;
  input: MarketBriefDatasetItem["input"];
  expectedOutput: MarketBriefDatasetItem["expectedOutput"];
  metadata: MarketBriefDatasetItem["metadata"];
  link: (trace: LangfuseTrace, runName: string) => Promise<void>;
}

export async function fetchDatasetItems(): Promise<FetchedItem[]> {
  const langfuse = getLangfuse();
  if (!langfuse) {
    throw new Error("[Eval] Langfuse client not configured.");
  }

  const dataset = await langfuse.getDataset(DATASET_NAME);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return dataset.items.map((item: any) => ({
    id: item.id as string,
    input: item.input as MarketBriefDatasetItem["input"],
    expectedOutput: item.expectedOutput as MarketBriefDatasetItem["expectedOutput"],
    metadata: item.metadata as MarketBriefDatasetItem["metadata"],
    link: async (trace: LangfuseTrace, runName: string) => {
      await item.link(trace, runName);
    },
  }));
}

// ---------------------------------------------------------------------------
// Snapshot current DB state as a new dataset item
// ---------------------------------------------------------------------------

export async function snapshotFromDb(
  scenario: string,
  description: string,
  expectedOutput: MarketBriefDatasetItem["expectedOutput"],
): Promise<void> {
  const { getDb } = await import("@/lib/db");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getDb() as any;

  const { data: assetRows } = await db
    .from("assets")
    .select("id, symbol")
    .in("symbol", ["BTC", "ETH", "SOL"]);

  const assets = (assetRows ?? []) as { id: string; symbol: string }[];
  const assetIds = assets.map((a) => a.id);

  const { data: snapshotRows } = await db
    .from("market_snapshots")
    .select("asset_id, price, volume_24h, market_cap, funding_rate, open_interest, snapshot_at")
    .in("asset_id", assetIds)
    .order("snapshot_at", { ascending: false });

  const snapshotsByAsset = new Map<string, Record<string, unknown>>();
  for (const row of (snapshotRows ?? []) as Record<string, unknown>[]) {
    const aid = row.asset_id as string;
    if (snapshotsByAsset.has(aid)) continue;
    const asset = assets.find((a) => a.id === aid);
    if (!asset) continue;
    snapshotsByAsset.set(aid, {
      symbol: asset.symbol,
      price: row.price,
      volume_24h: row.volume_24h,
      market_cap: row.market_cap,
      funding_rate: row.funding_rate,
      open_interest: row.open_interest,
    });
  }

  const { data: newsRows } = await db
    .from("news_items")
    .select("title, source, summary, url, published_at")
    .order("published_at", { ascending: false })
    .limit(20);

  const { data: narrativeRows } = await db
    .from("narratives")
    .select("name, description, strength, trend, sentiment")
    .order("strength", { ascending: false })
    .limit(10);

  const item: MarketBriefDatasetItem = {
    input: {
      snapshots: Array.from(snapshotsByAsset.values()) as MarketBriefDatasetItem["input"]["snapshots"],
      news: (newsRows ?? []) as MarketBriefDatasetItem["input"]["news"],
      narratives: (narrativeRows ?? []) as MarketBriefDatasetItem["input"]["narratives"],
    },
    expectedOutput,
    metadata: {
      scenario,
      description,
      maxNewsAgeHours: 24,
      missingAgents: [],
    },
  };

  await seedFixtures([item]);
}
