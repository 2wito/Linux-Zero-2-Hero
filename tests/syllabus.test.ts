import { describe, expect, it } from "vitest";
import { chapterContent } from "@/lib/content";
import { docHref, localeFromPath, switchLocalePath } from "@/lib/i18n";
import { chapters, trackedChapters } from "@/lib/syllabus";

describe("syllabus", () => {
  it("numbers chapters 1..n in order with matching slug prefixes", () => {
    chapters.forEach((c, i) => {
      expect(c.number).toBe(i + 1);
      expect(c.slug.startsWith(String(c.number).padStart(2, "0") + "-")).toBe(true);
    });
  });

  it("has unique slugs and both languages filled", () => {
    expect(new Set(chapters.map((c) => c.slug)).size).toBe(chapters.length);
    for (const c of chapters) {
      expect(c.he.title && c.he.summary && c.en.title && c.en.summary).toBeTruthy();
    }
  });

  it("tracks the 25 learning chapters, not the extras", () => {
    expect(trackedChapters).toHaveLength(25);
  });

  it("only maps content for chapters that exist", () => {
    const slugs = new Set(chapters.map((c) => c.slug));
    for (const map of Object.values(chapterContent)) {
      for (const slug of Object.keys(map)) expect(slugs.has(slug)).toBe(true);
    }
  });
});

describe("i18n paths", () => {
  it("detects locale from the path", () => {
    expect(localeFromPath("/")).toBe("he");
    expect(localeFromPath("/docs/01-what-is-linux")).toBe("he");
    expect(localeFromPath("/en")).toBe("en");
    expect(localeFromPath("/en/docs/01-what-is-linux")).toBe("en");
    expect(localeFromPath("/english")).toBe("he");
  });

  it("switches to the same page in the other language", () => {
    expect(switchLocalePath("/", "en")).toBe("/en");
    expect(switchLocalePath("/en", "he")).toBe("/");
    expect(switchLocalePath(docHref("he", "05-filesystem-navigation"), "en")).toBe("/en/docs/05-filesystem-navigation");
    expect(switchLocalePath("/en/docs/05-filesystem-navigation", "he")).toBe("/docs/05-filesystem-navigation");
  });
});

describe("levelStats", () => {
  it("counts chapters and minutes per level", async () => {
    const { levelStats } = await import("@/lib/syllabus");
    expect(levelStats("beginner")).toMatchObject({ count: 8, first: { number: 1 }, last: { number: 8 } });
    expect(levelStats("intermediate")).toMatchObject({ count: 9, first: { number: 9 }, last: { number: 17 } });
    expect(levelStats("advanced")).toMatchObject({ count: 8, first: { number: 18 }, last: { number: 25 } });
    expect(levelStats("beginner").minutes).toBe(130);
  });
});

describe("chapter icons", () => {
  it("has an icon component for every chapter", async () => {
    const { chapterIcons } = await import("@/components/chapter-icon");
    for (const c of chapters) expect(chapterIcons[c.icon], `${c.slug}: ${c.icon}`).toBeDefined();
  });
});

describe("hero script", () => {
  it("ends in the directory the last commands left you in", async () => {
    const { finalCwd, heroScript } = await import("@/lib/hero-script");
    expect(finalCwd(heroScript("hi"))).toBe("~/projects");
  });
});

describe("content files", () => {
  it("every mapped chapter has an MDX file on disk", async () => {
    const { existsSync } = await import("node:fs");
    for (const [locale, map] of Object.entries(chapterContent)) {
      const dir = locale === "he" ? "content/docs" : "content/docs-en";
      for (const slug of Object.keys(map)) expect(existsSync(`${dir}/${slug}.mdx`), `${dir}/${slug}.mdx`).toBe(true);
    }
  });
});
