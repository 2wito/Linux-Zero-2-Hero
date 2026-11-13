import type { Locale } from "@/lib/i18n";

// Client-side site search. The index (chapters, their headings, glossary terms and cheat sheet commands) is a
// static JSON file per language, built with the site (app/search-index/[locale]/route.ts) and fetched once when
// the search dialog first opens. Matching runs in the browser.

export type SearchKind = "chapter" | "section" | "term" | "command";

export type SearchEntry = {
  kind: SearchKind;
  title: string;
  /** Short text shown under the title, searched too. */
  text: string;
  href: string;
};

export const searchIndexHref = (locale: Locale) => `/search-index/${locale}`;

const kindOrder: Record<SearchKind, number> = { chapter: 0, section: 1, command: 2, term: 3 };

/** Lowercase, and drop Hebrew points and the geresh/gershayim variants so "ג׳" and "ג'" match. */
export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[֑-ׇ]/g, "")
    .replace(/[׳’]/g, "'")
    .replace(/[״“”]/g, '"');
}

/** Entries that contain every word of the query; title matches first, then by kind. */
export function searchEntries(entries: SearchEntry[], query: string, limit = 30): SearchEntry[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const scored: { entry: SearchEntry; score: number; i: number }[] = [];
  entries.forEach((entry, i) => {
    const title = normalize(entry.title);
    if (!words.every((w) => title.includes(w) || normalize(entry.text).includes(w))) return;
    const rank = title === words.join(" ") ? 0 : title.startsWith(words[0]) ? 1 : words.every((w) => title.includes(w)) ? 2 : 3;
    scored.push({ entry, score: rank * 10 + kindOrder[entry.kind], i });
  });
  return scored
    .sort((a, b) => a.score - b.score || a.i - b.i)
    .slice(0, limit)
    .map((s) => s.entry);
}
