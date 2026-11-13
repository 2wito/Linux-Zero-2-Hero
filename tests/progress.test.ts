import { describe, expect, it } from "vitest";
import {
  countDone,
  emptyProgress,
  isTracked,
  nextChapter,
  parseProgress,
  withAnswer,
  withCompleted,
  withMission,
} from "@/lib/progress";
import { trackedChapters } from "@/lib/syllabus";

const first = trackedChapters[0].slug;
const second = trackedChapters[1].slug;

describe("parseProgress", () => {
  it("returns empty progress for missing, broken or foreign data", () => {
    for (const raw of [null, "", "not json", "42", "[]", '{"completed":"x"}']) {
      expect(parseProgress(raw)).toEqual(emptyProgress());
    }
  });

  it("keeps valid fields and drops unknown chapters and malformed quizzes", () => {
    const raw = JSON.stringify({
      completed: [first, "no-such-chapter", 7, "26-cheat-sheet"],
      quizzes: { [first]: { firstTry: [true, null], answered: [true, false] }, bad: { firstTry: [true] } },
      missions: ["navigate", 3],
    });
    expect(parseProgress(raw)).toEqual({
      completed: [first],
      quizzes: { [first]: { firstTry: [true, null], answered: [true, false] } },
      missions: ["navigate"],
    });
  });
});

describe("progress updates", () => {
  it("marks and unmarks chapters, ignoring extras", () => {
    let p = withCompleted(emptyProgress(), first, true);
    p = withCompleted(p, first, true);
    expect(p.completed).toEqual([first]);
    expect(withCompleted(p, "27-glossary", true).completed).toEqual([first]);
    expect(withCompleted(p, first, false).completed).toEqual([]);
    expect(isTracked("27-glossary")).toBe(false);
  });

  it("scores the first answer only and completes the chapter when every answer is right", () => {
    let p = withAnswer(emptyProgress(), first, 0, 3, false);
    p = withAnswer(p, first, 0, 3, true);
    p = withAnswer(p, first, 1, 3, true);
    expect(p.quizzes[first].firstTry).toEqual([false, true, null]);
    expect(p.completed).toEqual([]);
    p = withAnswer(p, first, 2, 3, true);
    expect(p.quizzes[first]).toEqual({ firstTry: [false, true, true], answered: [true, true, true] });
    expect(p.completed).toEqual([first]);
  });

  it("starts the quiz over when its question count changed", () => {
    const p = withAnswer(withAnswer(emptyProgress(), first, 0, 3, true), first, 0, 4, false);
    expect(p.quizzes[first].firstTry).toEqual([false, null, null, null]);
  });

  it("records each mission once", () => {
    expect(withMission(withMission(emptyProgress(), "navigate"), "navigate").missions).toEqual(["navigate"]);
  });
});

describe("progress summaries", () => {
  it("counts per level and finds the next chapter", () => {
    const p = withCompleted(emptyProgress(), first, true);
    const beginners = trackedChapters.filter((c) => c.level === "beginner").length;
    expect(countDone(p)).toEqual({ done: 1, total: trackedChapters.length });
    expect(countDone(p, "beginner")).toEqual({ done: 1, total: beginners });
    expect(countDone(p, "advanced").done).toBe(0);
    expect(nextChapter(p)?.slug).toBe(second);
    const all = trackedChapters.reduce((acc, c) => withCompleted(acc, c.slug, true), emptyProgress());
    expect(nextChapter(all)).toBeNull();
  });
});
