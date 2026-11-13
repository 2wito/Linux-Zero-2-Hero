import { readFile } from "node:fs/promises";
import path from "node:path";
import GithubSlugger from "github-slugger";
import { cheatAnchor, cheatSheet, cheatTopicNames } from "@/lib/cheatsheet";
import { glossary, glossaryAnchor } from "@/lib/glossary";
import { docHref, type Locale } from "@/lib/i18n";
import type { SearchEntry } from "@/lib/search";
import { chapters, chapterText, findChapter } from "@/lib/syllabus";
import { ui } from "@/lib/ui";

// Builds the site search index at build time (server only). Used by app/search-index/[locale]/route.ts.

const contentDir: Record<Locale, string> = { he: "content/docs", en: "content/docs-en" };

export type Heading = { depth: number; title: string; id: string };

/**
 * The Markdown headings of an MDX source with the ids rehype-slug gives them: one slugger over every heading in
 * order, on the heading's text (inline code without backticks, JSX tags dropped). Fenced code and
 * {`...`} template literals (terminal windows) are skipped, since lines there aren't headings.
 */
export function mdxHeadings(source: string): Heading[] {
  const slugger = new GithubSlugger();
  const found: Heading[] = [];
  let fence = false;
  let literal = false;
  for (const line of source.split(/\r?\n/)) {
    if (!literal && /^\s*(```|~~~)/.test(line)) {
      fence = !fence;
      continue;
    }
    if (fence) continue;
    if (literal) {
      if (line.includes("`}")) literal = false;
      continue;
    }
    if (line.includes("{`") && !line.slice(line.indexOf("{`") + 2).includes("`}")) {
      literal = true;
      continue;
    }
    const m = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!m) continue;
    const text = m[2]
      .replace(/<[^>]*>/g, "")
      .replace(/`([^`]*)`/g, "$1")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\*\*|__/g, "");
    found.push({ depth: m[1].length, title: text.trim(), id: slugger.slug(text) });
  }
  return found;
}

async function headings(locale: Locale, slug: string): Promise<Heading[]> {
  try {
    return mdxHeadings(await readFile(path.join(process.cwd(), contentDir[locale], `${slug}.mdx`), "utf8"));
  } catch {
    // Not written (or not translated) yet.
    return [];
  }
}

export async function buildSearchIndex(locale: Locale): Promise<SearchEntry[]> {
  const label = ui[locale].chapter.label;
  const entries: SearchEntry[] = [];

  for (const chapter of chapters) {
    const { title, summary } = chapterText(chapter, locale);
    const href = docHref(locale, chapter.slug);
    const where = `${label} ${chapter.number}: ${title}`;
    entries.push({ kind: "chapter", title: where, text: summary, href });
    for (const h of await headings(locale, chapter.slug)) {
      // h2/h3 only: h1 is the chapter title, and deeper levels aren't used.
      if (h.depth === 2 || h.depth === 3) entries.push({ kind: "section", title: h.title, text: where, href: `${href}#${h.id}` });
    }
  }

  const glossaryHref = docHref(locale, findChapter("27-glossary")!.slug);
  const other: Locale = locale === "he" ? "en" : "he";
  for (const term of glossary) {
    const name = term[locale].term;
    const otherName = term[other].term;
    entries.push({
      kind: "term",
      title: otherName && otherName !== name ? `${name} (${otherName})` : name,
      text: term[locale].definition,
      href: `${glossaryHref}#${glossaryAnchor(term.id)}`,
    });
  }

  const cheatHref = docHref(locale, findChapter("26-cheat-sheet")!.slug);
  for (const entry of cheatSheet) {
    entries.push({
      kind: "command",
      title: entry.cmd,
      text: `${entry[locale]} · ${cheatTopicNames[entry.topic][locale]}`,
      href: `${cheatHref}#${cheatAnchor(entry.topic)}`,
    });
  }

  return entries;
}
