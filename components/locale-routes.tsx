import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChapterPage } from "@/components/chapter-page";
import { DocsSidebar } from "@/components/docs-sidebar";
import { JsonLd } from "@/components/json-ld";
import { Landing } from "@/components/landing";
import { ProgressBar } from "@/components/progress-tracker";
import { homeHref, type Locale } from "@/lib/i18n";
import { chapterJsonLd, chapterMetadata, homeJsonLd, homeMetadata } from "@/lib/seo";
import { chapters } from "@/lib/syllabus";
import { ui } from "@/lib/ui";

// Shared bodies of the per-language routes. app/(he) and app/(en)/en keep thin files that pass their locale,
// so URLs stay "/" vs "/en". Segment config stays literal in each route file.

export type ChapterRouteProps = { params: Promise<{ slug: string }> };

export const chapterStaticParams = () => chapters.map((chapter) => ({ slug: chapter.slug }));

export async function chapterRouteMetadata({ params }: ChapterRouteProps, locale: Locale): Promise<Metadata> {
  return chapterMetadata((await params).slug, locale);
}

export async function ChapterRoute({ params, locale }: ChapterRouteProps & { locale: Locale }) {
  const { slug } = await params;
  // Cache Components doesn't support dynamicParams=false, so unknown slugs 404 here.
  if (!chapters.some((c) => c.slug === slug)) notFound();
  return (
    <>
      <JsonLd data={chapterJsonLd(slug, locale)} />
      <ChapterPage slug={slug} locale={locale} />
    </>
  );
}

/** Docs layout: sidebar (start side, i.e. right in Hebrew) plus the reading column, with course progress on top. */
export function DocsChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12 lg:py-10 print:block print:p-0">
      <DocsSidebar />
      <main id="main" tabIndex={-1} className="min-w-0 max-w-3xl pb-24 outline-none print:max-w-none print:pb-0">
        <ProgressBar />
        <article>{children}</article>
      </main>
    </div>
  );
}

/** Home page in either language. */
export function HomeRoute({ locale }: { locale: Locale }) {
  return (
    <>
      <JsonLd data={homeJsonLd(locale)} />
      <Landing locale={locale} />
    </>
  );
}

export const homeRouteMetadata = homeMetadata;

export const notFoundMetadata = (locale: Locale): Metadata => ({ title: ui[locale].notFound.title, robots: { index: false } });

export function NotFoundRoute({ locale }: { locale: Locale }) {
  const t = ui[locale].notFound;
  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-24 outline-none sm:px-6">
      <div dir="ltr" className="overflow-hidden rounded-2xl bg-term font-mono text-sm text-term-ink">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <span className="ms-3 text-xs text-term-dim">~</span>
        </div>
        <p className="px-5 py-5 text-start">
          <span className="text-term-user">you@linux</span>:<span className="text-term-path">~</span>$ cd page
          <br />
          <span className="text-term-accent">bash: cd: page: No such file or directory</span>
        </p>
      </div>
      <h1 className="mt-10 font-display text-4xl">{t.title}</h1>
      <p className="mt-4 text-lg leading-8 text-muted">{t.body}</p>
      <Link href={homeHref(locale)} className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 font-medium text-accent-ink">
        {t.home}
      </Link>
    </main>
  );
}

/** Catch-all: unknown addresses render this language's 404 inside its own root layout. */
export function MissingRoute(): never {
  notFound();
}
