import type { MetadataRoute } from "next";

const SITE_URL = "https://cointraceai.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/#features`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/#analytics`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/#samples`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/#pricing`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
