import { describe, expect, it } from "vitest";
import { challengeLevelIntro, challengeLevels, challenges } from "@/lib/challenges";
import { cheatSheet, cheatTopicNames, cheatTopics } from "@/lib/cheatsheet";
import { resourceLevels, resources } from "@/lib/resources";
import { chapters } from "@/lib/syllabus";

const learning = new Set(chapters.filter((c) => c.level !== "extra").map((c) => c.number));

describe("cheat sheet", () => {
  it("links every command to a learning chapter, with no duplicates", () => {
    expect(new Set(cheatSheet.map((e) => e.cmd)).size).toBe(cheatSheet.length);
    for (const e of cheatSheet) {
      expect(learning.has(e.chapter), e.cmd).toBe(true);
      expect(e.he && e.en, e.cmd).toBeTruthy();
    }
  });

  it("has commands in every topic, and a name for each topic in both languages", () => {
    for (const topic of cheatTopics) {
      expect(cheatSheet.some((e) => e.topic === topic), topic).toBe(true);
      expect(cheatTopicNames[topic].he && cheatTopicNames[topic].en).toBeTruthy();
    }
  });
});

describe("resources", () => {
  it("uses unique https links with both descriptions", () => {
    expect(new Set(resources.map((r) => r.url)).size).toBe(resources.length);
    for (const r of resources) {
      expect(r.url.startsWith("https://"), r.url).toBe(true);
      expect(r.title && r.he && r.en, r.url).toBeTruthy();
    }
  });

  it("has links for every level", () => {
    for (const level of resourceLevels) expect(resources.filter((r) => r.level === level).length, level).toBeGreaterThanOrEqual(5);
  });
});

describe("challenges", () => {
  it("have unique ids, both languages, learning chapters and a solution to show", () => {
    expect(new Set(challenges.map((c) => c.id)).size).toBe(challenges.length);
    for (const c of challenges) {
      for (const text of [c.title, c.task, c.hint, c.solution.explain]) expect(text.he && text.en, c.id).toBeTruthy();
      expect(c.chapters.length, c.id).toBeGreaterThan(0);
      for (const n of c.chapters) expect(learning.has(n), `${c.id}: ${n}`).toBe(true);
      expect(c.solution.commands || c.solution.file, c.id).toBeTruthy();
      for (const line of c.solution.commands?.split("\n") ?? []) expect(line.startsWith("$ "), `${c.id}: ${line}`).toBe(true);
    }
  });

  it("has four challenges and an intro per level", () => {
    for (const level of challengeLevels) {
      expect(challenges.filter((c) => c.level === level).length, level).toBe(4);
      expect(challengeLevelIntro[level].he && challengeLevelIntro[level].en).toBeTruthy();
    }
  });
});
