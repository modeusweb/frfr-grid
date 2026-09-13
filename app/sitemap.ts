import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL = "https://frfr-grid.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
