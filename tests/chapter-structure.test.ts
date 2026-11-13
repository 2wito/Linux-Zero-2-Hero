import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { chapterContent } from "@/lib/content";
import { chapters } from "@/lib/syllabus";

// Content rules for learning chapters (docs/PLAN.md §2 chapter template):
// opens with "מה נלמד בפרק", ends with a recap and a 3-question quiz, has 1–2 exercises with solutions.
const learning = new Set(chapters.filter((c) => c.level !== "extra").map((c) => c.slug));
const written = Object.keys(chapterContent.he).filter((slug) => learning.has(slug));

/** Pulls the questions out of the <MiniQuiz questions={[...]}> block by evaluating its array literal. */
function quizQuestions(src: string): { q: string; options: unknown[]; answer: number }[] {
  const start = src.indexOf("<MiniQuiz");
  const open = src.indexOf("[", start);
  let depth = 0;
  let end = open;
  for (; end < src.length; end++) {
    if (src[end] === "[") depth++;
    if (src[end] === "]" && --depth === 0) break;
  }
  return new Function(`return ${src.slice(open, end + 1)}`)();
}

describe.each(written)("%s", (slug) => {
  const src = readFileSync(`content/docs/${slug}.mdx`, "utf8");

  it("starts with an H1 and the 'what you'll learn' callout", () => {
    const body = src.replace(/^\{\/\*[\s\S]*?\*\/\}\s*/, "").trimStart();
    expect(body.startsWith("# ")).toBe(true);
    expect(body.indexOf('title="מה נלמד בפרק"')).toBeGreaterThan(0);
    expect(body.indexOf('title="מה נלמד בפרק"')).toBeLessThan(200);
  });

  it("ends with a recap followed by a 3-question quiz with valid answers", () => {
    expect(src.indexOf("<RecapCards")).toBeGreaterThan(0);
    expect(src.indexOf("<MiniQuiz")).toBeGreaterThan(src.indexOf("<RecapCards"));
    const questions = quizQuestions(src);
    expect(questions).toHaveLength(3);
    for (const q of questions) {
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
    }
  });

  it("has 1–2 exercises, each with a solution", () => {
    const exercises = src.match(/<Exercise\b/g)?.length ?? 0;
    expect(exercises).toBeGreaterThanOrEqual(1);
    expect(exercises).toBeLessThanOrEqual(2);
    expect(src.match(/<Solution>/g)?.length).toBe(exercises);
  });
});

// English mirrors Hebrew (docs/PLAN.md phase 4e): every Hebrew chapter has an English file with the same template,
// the same quiz answers and the same building blocks (terminals, code blocks, callouts, exercises, components).
const english = new Set(Object.keys(chapterContent.en));

describe("English translation", () => {
  it("covers every Hebrew chapter", () => {
    expect([...english].sort()).toEqual(Object.keys(chapterContent.he).sort());
  });

  describe.each(written)("%s (en)", (slug) => {
    const he = readFileSync(`content/docs/${slug}.mdx`, "utf8");
    const en = readFileSync(`content/docs-en/${slug}.mdx`, "utf8");

    it("follows the chapter template in English", () => {
      expect(en.startsWith("# ")).toBe(true);
      expect(en.indexOf(`title="What you'll learn"`)).toBeGreaterThan(0);
      expect(en.indexOf(`title="What you'll learn"`)).toBeLessThan(200);
      expect(en).toContain("## Summary");
      expect(en).toContain("## Quick quiz");
    });

    it("has the same quiz answers as the Hebrew chapter", () => {
      const answers = (src: string) => quizQuestions(src).map((q) => [q.options.length, q.answer]);
      expect(answers(en)).toEqual(answers(he));
    });

    it("keeps the same building blocks", () => {
      const count = (src: string, re: RegExp) => src.match(re)?.length ?? 0;
      for (const re of [/<TerminalWindow\b/g, /^```/gm, /<Callout\b/g, /<Exercise\b/g, /<TerminalSimulator\b/g, /<DistroTabs\b/g, /<Checklist\b/g, /^## /gm]) {
        expect(count(en, re), String(re)).toBe(count(he, re));
      }
    });
  });

  it("keeps the components of the reference pages", () => {
    for (const slug of [...english].filter((s) => !learning.has(s))) {
      const tags = (src: string) => [...src.matchAll(/<([A-Z]\w+)/g)].map((m) => m[1]).sort();
      expect(tags(readFileSync(`content/docs-en/${slug}.mdx`, "utf8")), slug).toEqual(tags(readFileSync(`content/docs/${slug}.mdx`, "utf8")));
    }
  });
});
