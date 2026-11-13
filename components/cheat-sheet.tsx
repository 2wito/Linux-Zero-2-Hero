"use client";

import Link from "next/link";
import { useState } from "react";
import { Printer } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { FilterChips, matchesQuery, SearchField } from "@/components/filter-controls";
import { useLocale, useUi } from "@/components/use-locale";
import { cheatAnchor, cheatSheet, cheatTopicNames, cheatTopics, type CheatTopic } from "@/lib/cheatsheet";
import { docHref } from "@/lib/i18n";
import { chapters } from "@/lib/syllabus";

/**
 * The cheat sheet (chapter 26): every command grouped by topic, with search, a topic filter and copy per row.
 * Printing always shows every command: rows hidden by the filter come back with `print:` classes.
 */
export function CheatSheet() {
  const locale = useLocale();
  const t = useUi().cheatSheet;
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<CheatTopic | "all">("all");

  const visible = (topicId: CheatTopic, texts: string[]) => (topic === "all" || topic === topicId) && matchesQuery(query, texts);
  const shown = cheatSheet.filter((e) => visible(e.topic, [e.cmd, e.he, e.en]));

  return (
    <div className="mt-8">
      <SearchField value={query} onChange={setQuery} label={t.search} placeholder={t.placeholder} />
      <FilterChips
        options={cheatTopics.map((id) => ({ id, label: cheatTopicNames[id][locale] }))}
        value={topic}
        onChange={setTopic}
        label={t.filter}
        allLabel={t.all}
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p aria-live="polite" className="text-sm text-muted">
          {t.count(shown.length)}
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          title={t.printNote}
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium hover:bg-surface-2"
        >
          <Printer className="size-4" aria-hidden />
          {t.print}
        </button>
      </div>
      {shown.length === 0 && <p className="mt-4 rounded-xl border border-dashed border-line p-4 print:hidden">{t.empty}</p>}

      {cheatTopics.map((topicId) => {
        const entries = cheatSheet.filter((e) => e.topic === topicId);
        const anyShown = entries.some((e) => shown.includes(e));
        return (
          <section
            key={topicId}
            id={cheatAnchor(topicId)}
            aria-labelledby={`${cheatAnchor(topicId)}-title`}
            className={`scroll-mt-24 break-inside-avoid-page ${anyShown ? "" : "hidden print:block"}`}
          >
            <h2 id={`${cheatAnchor(topicId)}-title`} className="mt-10 font-display text-2xl print:mt-5 print:text-lg">
              {cheatTopicNames[topicId][locale]}
            </h2>
            <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface print:rounded-none">
              {entries.map((entry) => {
                const chapter = chapters.find((c) => c.number === entry.chapter)!;
                return (
                  <li
                    key={entry.cmd}
                    className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-4 py-2.5 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] print:break-inside-avoid print:py-1 ${
                      shown.includes(entry) ? "" : "hidden print:grid"
                    }`}
                  >
                    <code dir="ltr" className="justify-self-start font-mono text-[0.92em] [overflow-wrap:anywhere] text-ink">
                      {entry.cmd}
                    </code>
                    <span className="col-start-1 row-start-2 text-[15px] leading-6 text-muted sm:col-start-2 sm:row-start-1 print:text-ink">
                      {entry[locale]}{" "}
                      <Link href={docHref(locale, chapter.slug)} className="text-xs whitespace-nowrap text-accent hover:underline print:hidden">
                        {t.chapterLink(chapter.number)}
                      </Link>
                    </span>
                    <span className="col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1 print:hidden">
                      <CopyButton text={entry.cmd} label={t.copy(entry.cmd)} className="text-muted hover:bg-surface-2 hover:text-ink" />
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
