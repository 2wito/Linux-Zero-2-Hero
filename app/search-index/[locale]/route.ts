import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";
import { buildSearchIndex } from "@/lib/search-index";

// The site search index per language: built at build time, served as static JSON,
// and fetched by the search dialog (components/site-search.tsx) the first time it opens.

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

async function cachedIndex(locale: Locale) {
  "use cache";
  return buildSearchIndex(locale);
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  return Response.json(await cachedIndex(locale as Locale));
}
