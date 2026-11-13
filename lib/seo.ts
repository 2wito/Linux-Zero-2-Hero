import type { Metadata, Viewport } from "next";
import { docHref, homeHref, type Locale } from "@/lib/i18n";
import { ogSize } from "@/lib/og";
import { AUTHOR, SITE_URL } from "@/lib/site";
import { chapterText, findChapter, trackedChapters } from "@/lib/syllabus";
import { ui } from "@/lib/ui";

// Per-page metadata (title, description, canonical, hreflang, Open Graph, Twitter) and JSON-LD.
// Every string comes from lib/ui.ts (meta) or the syllabus, in the page's language.

/** The page background (`--bg` in globals.css) per theme, for the browser chrome and the installed app. */
export const themeColors = { light: "#f4f1ea", dark: "#12100c" } as const;

export const siteViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: themeColors.light },
    { media: "(prefers-color-scheme: dark)", color: themeColors.dark },
  ],
};

const other = (locale: Locale): Locale => (locale === "he" ? "en" : "he");

/** Defaults for a language's root layout (also what 404 pages get). Pages set their own canonical and cards. */
export function rootMetadata(locale: Locale): Metadata {
  const t = ui[locale].meta;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.homeTitle, template: `%s | ${t.siteName}` },
    description: t.description,
    applicationName: t.siteName,
    authors: [{ name: AUTHOR[locale].name }],
    creator: AUTHOR[locale].name,
    appleWebApp: { capable: true, title: t.siteName, statusBarStyle: "default" },
    formatDetection: { telephone: false },
  };
}

export const ogHref = (locale: Locale, slug?: string) => (slug ? `/og/${locale}/${slug}` : `/og/${locale}`);

type PageMeta = {
  locale: Locale;
  title: string;
  description: string;
  paths: Record<Locale, string>;
  type: "website" | "article";
  image: { url: string; alt: string };
};

function pageMetadata({ locale, title, description, paths, type, image }: PageMeta): Metadata {
  const t = ui[locale].meta;
  const card = { ...image, ...ogSize, type: "image/png" };
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: paths[locale],
      languages: { he: paths.he, en: paths.en, "x-default": paths.he },
    },
    openGraph: {
      type,
      url: paths[locale],
      title,
      description,
      siteName: t.siteName,
      locale: t.ogLocale,
      alternateLocale: ui[other(locale)].meta.ogLocale,
      images: [card],
    },
    twitter: { card: "summary_large_image", title, description, images: [card] },
  };
}

export function homeMetadata(locale: Locale): Metadata {
  const t = ui[locale].meta;
  return pageMetadata({
    locale,
    title: t.homeTitle,
    description: t.description,
    paths: { he: homeHref("he"), en: homeHref("en") },
    type: "website",
    image: { url: ogHref(locale), alt: t.ogAlt },
  });
}

export function chapterMetadata(slug: string, locale: Locale): Metadata {
  const chapter = findChapter(slug);
  if (!chapter) return {};
  const t = ui[locale].meta;
  const text = chapterText(chapter, locale);
  const headline = t.chapterTitle(chapter.number, text.title);
  return pageMetadata({
    locale,
    title: `${headline} | ${t.siteName}`,
    description: text.summary,
    paths: { he: docHref("he", slug), en: docHref("en", slug) },
    type: "article",
    image: { url: ogHref(locale, slug), alt: headline },
  });
}

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();

const author = (locale: Locale) => ({ "@type": "Person", name: AUTHOR[locale].name, description: AUTHOR[locale].bio });

/** Landing page: the site and the course (with its learning chapters as parts). */
export function homeJsonLd(locale: Locale) {
  const t = ui[locale].meta;
  const url = absoluteUrl(homeHref(locale));
  return [
    { "@context": "https://schema.org", "@type": "WebSite", name: t.siteName, url, inLanguage: locale, description: t.description },
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: t.homeTitle,
      description: t.description,
      url,
      inLanguage: locale,
      isAccessibleForFree: true,
      educationalLevel: "Beginner",
      provider: author(locale),
      author: author(locale),
      offers: { "@type": "Offer", price: 0, priceCurrency: "ILS", category: "Free" },
      hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online", courseWorkload: `PT${Math.round(trackedChapters.reduce((s, c) => s + c.minutes, 0) / 60)}H` },
      hasPart: trackedChapters.map((c) => ({
        "@type": "LearningResource",
        name: t.chapterTitle(c.number, chapterText(c, locale).title),
        url: absoluteUrl(docHref(locale, c.slug)),
      })),
    },
  ];
}

/** Chapter page: the article and its breadcrumb (site › chapter). */
export function chapterJsonLd(slug: string, locale: Locale) {
  const chapter = findChapter(slug);
  if (!chapter) return [];
  const t = ui[locale].meta;
  const text = chapterText(chapter, locale);
  const url = absoluteUrl(docHref(locale, slug));
  const home = absoluteUrl(homeHref(locale));
  const headline = t.chapterTitle(chapter.number, text.title);
  return [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline,
      description: text.summary,
      url,
      mainEntityOfPage: url,
      inLanguage: locale,
      image: absoluteUrl(ogHref(locale, slug)),
      author: author(locale),
      timeRequired: `PT${chapter.minutes}M`,
      isPartOf: { "@type": "Course", name: t.homeTitle, url: home },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t.siteName, item: home },
        { "@type": "ListItem", position: 2, name: headline, item: url },
      ],
    },
  ];
}
