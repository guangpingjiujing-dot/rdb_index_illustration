import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { topics } from "@/content/topics";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = ["/", "/rdb-index", "/about", "/privacy", "/terms", "/contact"];
  const topicPaths = topics.map((t) => t.path);
  return [...staticPaths, ...topicPaths].map((p) => ({
    url: `${site.url}${p}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: p === "/" ? 1 : 0.7,
  }));
}
