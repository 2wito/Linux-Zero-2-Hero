import { notFound } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";
import { pngResponse, renderOgImage } from "@/lib/og";

// The site's social card per language (/og/he, /og/en), rendered once at build time.

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

async function image(locale: Locale) {
  "use cache";
  return renderOgImage(locale);
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  return pngResponse(await image(locale as Locale));
}
