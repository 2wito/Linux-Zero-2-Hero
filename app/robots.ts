import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // The search index is a data file for the search dialog, not a page.
    rules: { userAgent: "*", allow: "/", disallow: ["/search-index/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
