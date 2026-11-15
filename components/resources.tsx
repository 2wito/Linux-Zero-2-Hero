"use client";

import { ExternalLink } from "lucide-react";
import { InlineCode } from "@/components/mdx/inline-code";
import { resourceKindNames, resourceLevelIntro, resourceLevels, resources } from "@/lib/resources";
import { useLocale, useUi } from "@/components/use-locale";

/** Further resources (chapter 29), grouped by level, each with a short description, type and site language. */
export function Resources() {
  const locale = useLocale();
  const t = useUi();
  return (
    <div className="mt-6">
      {resourceLevels.map((level) => (
        <section key={level} aria-labelledby={`resources-${level}`}>
          <h2 id={`resources-${level}`} className="mt-12 scroll-mt-24 font-display text-2xl sm:text-3xl">
            {t.levels[level]}
          </h2>
          <p className="mt-3 text-lg leading-8 text-muted">{resourceLevelIntro[level][locale]}</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {resources
              .filter((r) => r.level === level)
              .map((r) => (
                <li key={r.url} className="min-w-0">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col rounded-xl border border-line bg-surface p-4 hover:border-accent"
                  >
                    <span className="flex items-start gap-2">
                      <span dir="auto" lang={r.lang} className="min-w-0 flex-1 font-bold leading-snug [overflow-wrap:anywhere] group-hover:text-accent">
                        {r.title}
                      </span>
                      <ExternalLink className="mt-1 size-4 shrink-0 text-muted group-hover:text-accent" aria-hidden />
                    </span>
                    <span className="mt-2 flex-1 text-[15px] leading-6 text-muted">
                      <InlineCode text={r[locale]} />
                    </span>
                    <span className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-line px-2 py-0.5 text-muted">{resourceKindNames[r.kind][locale]}</span>
                      <span className={`rounded-full border px-2 py-0.5 ${r.lang === "he" ? "border-ok/50 text-ok" : "border-line text-muted"}`}>
                        {t.resources.language[r.lang]}
                      </span>
                    </span>
                    <span className="sr-only">{t.resources.external}</span>
                  </a>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
