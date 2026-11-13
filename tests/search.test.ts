import { describe, expect, it } from "vitest";
import { normalize, searchEntries, type SearchEntry } from "@/lib/search";
import { buildSearchIndex, mdxHeadings } from "@/lib/search-index";
import { glossary } from "@/lib/glossary";
import { cheatSheet } from "@/lib/cheatsheet";
import { chapters } from "@/lib/syllabus";

const entry = (kind: SearchEntry["kind"], title: string, text = ""): SearchEntry => ({ kind, title, text, href: `/${title}` });

describe("searchEntries", () => {
  const entries = [
    entry("term", "הרשאות (Permissions)", "מי מותר לקרוא, לכתוב ולהריץ"),
    entry("command", "chmod 755 script.sh", "rwxr-xr-x בצורה מספרית"),
    entry("chapter", "פרק 9: משתמשים, קבוצות והרשאות", "chmod, chown ו-sudo"),
    entry("section", "משנים הרשאות: chmod בצורה סמלית", "פרק 9"),
  ];

  it("returns nothing for an empty query", () => {
    expect(searchEntries(entries, "  ")).toEqual([]);
  });

  it("needs every word, in the title or the text", () => {
    expect(searchEntries(entries, "chmod סמלית").map((e) => e.kind)).toEqual(["section"]);
    expect(searchEntries(entries, "chmod nothing")).toEqual([]);
  });

  it("ranks title prefix matches first, then by kind", () => {
    expect(searchEntries(entries, "chmod").map((e) => e.kind)).toEqual(["command", "section", "chapter"]);
    expect(searchEntries(entries, "הרשאות").map((e) => e.kind)).toEqual(["term", "chapter", "section"]);
  });

  it("ignores case, Hebrew points and geresh style", () => {
    expect(normalize("CHMOD")).toBe("chmod");
    expect(normalize("שָׁלוֹם")).toBe("שלום");
    expect(normalize("צ׳יפ")).toBe(normalize("צ'יפ"));
    expect(searchEntries(entries, "PERMISSIONS")).toHaveLength(1);
  });
});

describe("mdxHeadings", () => {
  it("gives the same ids as rehype-slug, skipping code and terminal windows", () => {
    const src = [
      "# כותרת",
      "## איפה אני? `pwd`",
      "```bash",
      "# not a heading",
      "```",
      "<TerminalWindow>{`",
      "# also not a heading",
      "`}</TerminalWindow>",
      "### <Kbd keys=\"Ctrl+C\" /> מול <Kbd keys=\"Ctrl+Z\" />",
      "## איפה אני? `pwd`",
      "## `>>`: להוסיף לסוף",
    ].join("\n");
    expect(mdxHeadings(src)).toEqual([
      { depth: 1, title: "כותרת", id: "כותרת" },
      { depth: 2, title: "איפה אני? pwd", id: "איפה-אני-pwd" },
      { depth: 3, title: "מול", id: "-מול-" },
      { depth: 2, title: "איפה אני? pwd", id: "איפה-אני-pwd-1" },
      { depth: 2, title: ">>: להוסיף לסוף", id: "-להוסיף-לסוף" },
    ]);
  });
});

describe("search index", () => {
  it("covers every chapter, glossary term and cheat sheet command in both languages", async () => {
    for (const locale of ["he", "en"] as const) {
      const index = await buildSearchIndex(locale);
      const count = (kind: string) => index.filter((e) => e.kind === kind).length;
      expect(count("chapter")).toBe(chapters.length);
      expect(count("term")).toBe(glossary.length);
      expect(count("command")).toBe(cheatSheet.length);
      for (const e of index) expect(e.href.startsWith(locale === "en" ? "/en/docs/" : "/docs/"), e.href).toBe(true);
    }
    const he = await buildSearchIndex("he");
    expect(he.filter((e) => e.kind === "section").length).toBeGreaterThan(200);
    expect(he.some((e) => e.href === "/docs/05-filesystem-navigation#איפה-אני-pwd")).toBe(true);
  });
});
