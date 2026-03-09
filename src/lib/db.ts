import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Supabase client for browser and Server Components.
 * Use createDbClient() when you need a fresh client (e.g. with cookies for RLS).
 */
function createSupabaseClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return createClient<Database>(url, key);
}

let client: SupabaseClient<Database> | null = null;

/**
 * Singleton Supabase client for use in app (avoids creating multiple clients in dev).
 */
export function getDb(): SupabaseClient<Database> {
  if (!client) {
    client = createSupabaseClient();
  }
  return client;
}

/**
 * Use in Server Components / server-only code when you need a fresh client per request
 * (e.g. with cookies for RLS). For simple anon-key usage, getDb() is enough.
 */
export function createDbClient(): SupabaseClient<Database> {
  return createSupabaseClient();
}

/**
 * Semantic search over news_items using the HNSW index.
 * Requires RPC match_news_items (see migration 20250309000002_match_news_rpc.sql).
 */
export async function searchNewsByEmbedding(
  embedding: number[],
  limit = 10
): Promise<{ data: Database["public"]["Tables"]["news_items"]["Row"][]; error: Error | null }> {
  const db = getDb();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db as any).rpc("match_news_items", {
    query_embedding: embedding,
    match_limit: limit,
  });
  return {
    data: (data ?? []) as Database["public"]["Tables"]["news_items"]["Row"][],
    error: error as Error | null,
  };
}

// Re-export types for convenience
export type { Database } from "@/types/database";
