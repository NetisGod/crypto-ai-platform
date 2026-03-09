/**
 * CryptoPanic news ingestion.
 * API: https://cryptopanic.com/api/v1/posts/
 * Requires CRYPTOPANIC_AUTH_TOKEN in env (get from cryptopanic.com/about/api).
 */

import type { NormalizedNewsItem } from "./types";
import type { Sentiment } from "@/types/database";

const CRYPTOPANIC_URL = "https://cryptopanic.com/api/v1/posts/";

interface CryptoPanicPost {
  id: number;
  title: string;
  url: string;
  source: { name: string };
  published_at: string;
  created_at: string;
  currencies?: { code: string }[];
  kind?: string;
  votes?: { positive: number; negative: number; important: number; liked: number; disliked: number; lol: number; toxic: number; saved: number };
}

interface CryptoPanicResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CryptoPanicPost[];
}

function votesToSentiment(votes: CryptoPanicPost["votes"]): Sentiment {
  if (!votes) return "neutral";
  const { positive = 0, negative = 0 } = votes;
  if (positive > negative) return "positive";
  if (negative > positive) return "negative";
  return "neutral";
}

export async function fetchCryptoPanicNews(options?: {
  authToken?: string;
  filter?: "rising" | "hot" | "bullish" | "bearish" | "important" | "saved" | "lol";
  limit?: number;
}): Promise<NormalizedNewsItem[]> {
  const token =
    options?.authToken ?? process.env.CRYPTOPANIC_AUTH_TOKEN ?? "";
  const { filter, limit = 50 } = options ?? {};

  const url = new URL(CRYPTOPANIC_URL);
  if (token) url.searchParams.set("auth_token", token);
  url.searchParams.set("public", "true");
  if (filter) url.searchParams.set("filter", filter);
  if (limit) url.searchParams.set("limit", String(Math.min(limit, 50)));

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`CryptoPanic API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as CryptoPanicResponse;
  const results = data.results ?? [];

  return results.map((post) => ({
    title: post.title ?? "Untitled",
    source: post.source?.name ?? "CryptoPanic",
    summary: null,
    url: post.url ?? null,
    sentiment: votesToSentiment(post.votes),
    related_tokens: post.currencies?.map((c) => c.code) ?? [],
    published_at: post.published_at ?? post.created_at ?? null,
  }));
}
