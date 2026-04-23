#!/usr/bin/env tsx
/**
 * CLI entry point for Market Brief evaluation.
 *
 * Usage:
 *   npx tsx scripts/eval-market-brief.ts seed
 *   npx tsx scripts/eval-market-brief.ts run --name "baseline-v1"
 *   npx tsx scripts/eval-market-brief.ts run --name "prompt-v2" --concurrency 2
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { seedFixtures, ensureDataset } from "@/ai/eval/market-brief/dataset";
import {
  runExperiment,
  printResults,
} from "@/ai/eval/market-brief/experiment";
import { shutdownLangfuse } from "@/lib/langfuse";

function usage(): never {
  console.log(`
Market Brief Eval CLI
=====================

Commands:

  seed                        Seed curated fixtures into the Langfuse dataset
  run --name <run-name>       Run an experiment against the dataset

Options (run):

  --name <string>             Required. Name for this experiment run
  --concurrency <number>      Max items to evaluate in parallel (default: 1)

Examples:

  npx tsx scripts/eval-market-brief.ts seed
  npx tsx scripts/eval-market-brief.ts run --name "baseline-v1"
  npx tsx scripts/eval-market-brief.ts run --name "prompt-v2" --concurrency 2
`);
  process.exit(1);
}

function parseArgs(argv: string[]): { command: string; name?: string; concurrency?: number } {
  const args = argv.slice(2);
  const command = args[0];

  if (!command || !["seed", "run"].includes(command)) {
    usage();
  }

  if (command === "seed") {
    return { command };
  }

  let name: string | undefined;
  let concurrency: number | undefined;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--name" && args[i + 1]) {
      name = args[++i];
    } else if (args[i] === "--concurrency" && args[i + 1]) {
      concurrency = parseInt(args[++i], 10);
    }
  }

  if (!name) {
    console.error("Error: --name is required for the 'run' command.\n");
    usage();
  }

  return { command, name, concurrency };
}

async function main(): Promise<void> {
  const { command, name, concurrency } = parseArgs(process.argv);

  try {
    if (command === "seed") {
      console.log("[Eval] Seeding dataset…");
      await ensureDataset();
      const count = await seedFixtures();
      console.log(`[Eval] Done — seeded ${count} items.`);
    } else if (command === "run") {
      console.log(`[Eval] Starting experiment: ${name}`);
      const result = await runExperiment({
        runName: name!,
        concurrency,
      });
      printResults(result);

      const hasErrors = result.items.some((i) => !!i.error);
      const avgScore = result.aggregates.find((a) => a.name === "avg_score");
      if (hasErrors) {
        console.log("[Eval] Some items had pipeline errors.");
        process.exitCode = 1;
      } else if (avgScore && avgScore.score < 0.5) {
        console.log(`[Eval] Average score ${avgScore.score.toFixed(4)} is below 0.5 threshold.`);
        process.exitCode = 1;
      } else {
        console.log("[Eval] Experiment completed successfully.");
      }
    }
  } finally {
    await shutdownLangfuse();
  }
}

main().catch((err) => {
  console.error("[Eval] Fatal error:", err);
  process.exit(2);
});
