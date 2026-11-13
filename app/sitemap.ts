import type { MetadataRoute } from "next";
import { docHref, homeHref, locales } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/seo";
import { chapters } from "@/lib/syllabus";

/** One entry per page and language, each listing its counterpart (hreflang). Hebrew is the primary version. */
function entries(paths: { he: string; en: string }, changeFrequency: "weekly" | "monthly", priority: number): MetadataRoute.Sitemap {
  const languages = { he: absoluteUrl(paths.he), en: absoluteUrl(paths.en), "x-default": absoluteUrl(paths.he) };
  return locales.map((locale) => ({
    url: absoluteUrl(paths[locale]),
    changeFrequency,
    priority: locale === "he" ? priority : Math.round((priority - 0.2) * 10) / 10,
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...entries({ he: homeHref("he"), en: homeHref("en") }, "weekly", 1),
    ...chapters.flatMap((c) => entries({ he: docHref("he", c.slug), en: docHref("en", c.slug) }, "monthly", c.level === "extra" ? 0.6 : 0.8)),
  ];
}
