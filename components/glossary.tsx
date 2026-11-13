"use client";

import Link from "next/link";
import { useState } from "react";
import { FilterChips, matchesQuery, SearchField } from "@/components/filter-controls";
import { useLocale, useUi } from "@/components/use-locale";
import { glossary, glossaryCategories, glossaryAnchor, type GlossaryCategory } from "@/lib/glossary";
import { docHref } from "@/lib/i18n";
import { chapters } from "@/lib/syllabus";

/** Searchable glossary (chapter 27): every term in both languages, filtered by topic, linked to its chapter. */
export function Glossary() {
  const locale = useLocale();
  const t = useUi().glossary;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GlossaryCategory | "all">("all");
  const other = locale === "he" ? "en" : "he";

  const sorted = [...glossary].sort((a, b) => a[locale].term.localeCompare(b[locale].term, locale));
  const results = sorted.filter(
    (term) =>
      (category === "all" || term.category === category) &&
      matchesQuery(query, [term.he.term, term.en.term, term[locale].definition]),
  );

  return (
    <div className="mt-8">
      <SearchField value={query} onChange={setQuery} label={t.search} placeholder={t.placeholder} />
      <FilterChips
        options={glossaryCategories.map((id) => ({ id, label: t.categories[id] }))}
        value={category}
        onChange={setCategory}
        label={t.filter}
        allLabel={t.all}
      />
      <p aria-live="polite" className="mt-4 text-sm text-muted">
        {t.count(results.length)}
      </p>

      {results.length ? (
        <dl className="mt-2 grid gap-3">
          {results.map((term) => {
            const chapter = chapters.find((c) => c.number === term.chapter)!;
            const otherTerm = term[other].term;
            return (
              <div
                key={term.id}
                id={glossaryAnchor(term.id)}
                className="scroll-mt-24 rounded-xl border border-line bg-surface p-4 target:border-accent target:ring-2 target:ring-accent/40"
              >
                <dt className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-lg font-bold">{term[locale].term}</span>
                  {otherTerm !== term[locale].term && (
                    <span dir="auto" lang={other} className="text-sm text-muted">
                      {otherTerm}
                    </span>
                  )}
                  <span className="ms-auto rounded-full border border-line px-2 py-0.5 text-xs text-muted">{t.categories[term.category]}</span>
                </dt>
                <dd className="mt-1.5 leading-7">
                  {term[locale].definition}{" "}
                  <Link href={docHref(locale, chapter.slug)} className="text-sm font-medium whitespace-nowrap text-accent hover:underline">
                    {t.chapter(chapter.number)}
                  </Link>
                </dd>
              </div>
            );
          })}
        </dl>
      ) : (
        <p className="mt-2 rounded-xl border border-dashed border-line p-4">{t.empty}</p>
      )}
    </div>
  );
}
