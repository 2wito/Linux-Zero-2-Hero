import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";
import { pngResponse, renderOgImage } from "@/lib/og";
import { chapters, chapterText, findChapter } from "@/lib/syllabus";
import { ui } from "@/lib/ui";

// One social card per chapter and language (/og/he/05-filesystem-navigation, ...), rendered once at build time.

export function generateStaticParams() {
  return locales.flatMap((locale) => chapters.map((c) => ({ locale, slug: c.slug })));
}

async function image(locale: Locale, slug: string) {
  "use cache";
  const chapter = findChapter(slug)!;
  return renderOgImage(locale, { label: `${ui[locale].chapter.label} ${chapter.number}`, title: chapterText(chapter, locale).title });
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!locales.includes(locale as Locale) || !findChapter(slug)) notFound();
  return pngResponse(await image(locale as Locale, slug));
}
