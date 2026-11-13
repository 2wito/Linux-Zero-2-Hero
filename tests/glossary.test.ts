import { describe, expect, it } from "vitest";
import { glossary } from "@/lib/glossary";
import { chapters } from "@/lib/syllabus";

describe("glossary", () => {
  it("has unique ids and Hebrew terms", () => {
    expect(new Set(glossary.map((t) => t.id)).size).toBe(glossary.length);
    expect(new Set(glossary.map((t) => t.he.term)).size).toBe(glossary.length);
  });

  it("links every term to a real learning chapter", () => {
    const numbers = new Set(chapters.filter((c) => c.level !== "extra").map((c) => c.number));
    for (const term of glossary) expect(numbers.has(term.chapter), term.id).toBe(true);
  });

  it("fills both languages", () => {
    for (const term of glossary) {
      expect(term.he.term && term.he.definition && term.en.term && term.en.definition, term.id).toBeTruthy();
    }
  });
});
