import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const publicRoutes = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/ai-crypto-analysis", changeFrequency: "monthly", priority: 0.9 },
  { path: "/crypto-market-intelligence", changeFrequency: "monthly", priority: 0.9 },
  { path: "/ai-token-analysis", changeFrequency: "monthly", priority: 0.9 },
  { path: "/crypto-narratives", changeFrequency: "monthly", priority: 0.85 },
  { path: "/ai-crypto-agents", changeFrequency: "monthly", priority: 0.85 },
  { path: "/bitcoin-ai-analysis", changeFrequency: "monthly", priority: 0.85 },
  { path: "/ethereum-ai-analysis", changeFrequency: "monthly", priority: 0.85 },
  { path: "/about", changeFrequency: "yearly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
  { path: "/risk-disclaimer", changeFrequency: "yearly", priority: 0.5 },
] as const satisfies ReadonlyArray<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}>;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
