import { describe, expect, it } from "vitest";
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
