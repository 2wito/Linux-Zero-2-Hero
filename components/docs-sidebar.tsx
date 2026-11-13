"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef } from "react";
import { DoneMark } from "@/components/progress-tracker";
import { useLocale, useUi } from "@/components/use-locale";
import { docHref } from "@/lib/i18n";
import { chapters, chapterText, levels } from "@/lib/syllabus";

/** Chapter list grouped by level, driven entirely by lib/syllabus.ts.
 *  Collapsible <details> on small screens, a sticky scrollable column on large ones. */
export function DocsSidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useUi();
  const desktopRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const current = chapters.find((c) => docHref(locale, c.slug) === pathname);

  // Keep the active chapter visible in the desktop list (it scrolls on its own with 30 items).
  useEffect(() => {
    desktopRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest" });
  }, [pathname]);

  // Rendered twice (mobile <details> and the desktop column), so heading ids get a per-copy prefix.
  const list = (copy: string) => (
    <div className="space-y-6">
      {levels.map((level) => (
        <section key={level} aria-labelledby={`${baseId}-${copy}-${level}`}>
          <h2 id={`${baseId}-${copy}-${level}`} className="px-3 text-xs font-bold tracking-wide text-muted">
            {t.levels[level]}
          </h2>
          <ol className="mt-2 space-y-0.5">
            {chapters
              .filter((c) => c.level === level)
              .map((chapter) => {
                const href = docHref(locale, chapter.slug);
                const active = pathname === href;
                return (
                  <li key={chapter.slug}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`flex gap-3 rounded-lg px-3 py-2 text-sm ${
                        active ? "bg-surface-2 font-medium text-ink" : "text-muted hover:bg-surface-2/60 hover:text-ink"
                      }`}
                    >
                      <span className={`w-5 shrink-0 tabular-nums ${active ? "text-accent" : ""}`}>{chapter.number}</span>
                      <span className="flex-1">{chapterText(chapter, locale).title}</span>
                      <DoneMark slug={chapter.slug} className="mt-0.5 size-4" />
                    </Link>
                  </li>
                );
              })}
          </ol>
        </section>
      ))}
    </div>
  );

  return (
    <nav aria-label={t.sidebar.aria} className="print:hidden">
      <details className="rounded-xl border border-line bg-surface p-2 lg:hidden">
        <summary className="cursor-pointer px-3 py-2 font-medium">
          {t.sidebar.all}
          {current && (
            <span className="ms-2 text-sm font-normal text-muted">
              ({t.sidebar.current}: {current.number})
            </span>
          )}
        </summary>
        <div className="mt-3">{list("m")}</div>
      </details>
      <div
        ref={desktopRef}
        className="sticky top-24 hidden max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain pe-2 pb-8 lg:block"
      >
        {list("d")}
      </div>
    </nav>
  );
}
