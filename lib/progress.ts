"use client";

import { useSyncExternalStore } from "react";
import { useLocalStore, writeLocalStore } from "@/lib/local-store";
import { trackedChapters, type Level } from "@/lib/syllabus";

// Course progress, stored only in this browser (localStorage via lib/local-store.ts, every access in try/catch).
// Slugs are the same in both languages, so progress is shared between Hebrew and English.

export const PROGRESS_KEY = "linux-progress:v1";

/** firstTry[i] is null until question i gets its first answer; answered[i] turns true once it's answered right. */
export type QuizResult = { firstTry: (boolean | null)[]; answered: boolean[] };
export type Progress = { completed: string[]; quizzes: Record<string, QuizResult>; missions: string[] };

export const emptyProgress = (): Progress => ({ completed: [], quizzes: {}, missions: [] });

const tracked = new Set(trackedChapters.map((c) => c.slug));
export const isTracked = (slug: string) => tracked.has(slug);

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : []);

/** The stored progress, or empty progress for anything missing or malformed (old format, hand-edited storage). */
export function parseProgress(raw: string | null): Progress {
  try {
    const data = JSON.parse(raw ?? "null");
    if (!data || typeof data !== "object") return emptyProgress();
    const quizzes: Record<string, QuizResult> = {};
    if (data.quizzes && typeof data.quizzes === "object") {
      for (const [slug, q] of Object.entries(data.quizzes as Record<string, QuizResult>)) {
        if (Array.isArray(q?.firstTry) && Array.isArray(q?.answered) && q.firstTry.length === q.answered.length) quizzes[slug] = q;
      }
    }
    return { completed: strings(data.completed).filter(isTracked), quizzes, missions: strings(data.missions) };
  } catch {
    return emptyProgress();
  }
}

export function withCompleted(p: Progress, slug: string, done: boolean): Progress {
  if (!isTracked(slug)) return p;
  const set = new Set(p.completed);
  if (done) set.add(slug);
  else set.delete(slug);
  return { ...p, completed: [...set] };
}

/** Records a quiz answer. A question counts as first-try correct only if its first answer was right.
 *  Answering every question correctly marks the chapter as done. */
export function withAnswer(p: Progress, slug: string, index: number, total: number, correct: boolean): Progress {
  const prev = p.quizzes[slug];
  const q: QuizResult =
    prev && prev.firstTry.length === total
      ? { firstTry: [...prev.firstTry], answered: [...prev.answered] }
      : { firstTry: Array(total).fill(null), answered: Array(total).fill(false) };
  if (q.firstTry[index] === null) q.firstTry[index] = correct;
  if (correct) q.answered[index] = true;
  const next = { ...p, quizzes: { ...p.quizzes, [slug]: q } };
  return q.answered.every(Boolean) ? withCompleted(next, slug, true) : next;
}

export function withMission(p: Progress, id: string): Progress {
  return p.missions.includes(id) ? p : { ...p, missions: [...p.missions, id] };
}

/** Done/total for all tracked chapters, or for one level. */
export function countDone(p: Progress, level?: Level) {
  const list = level ? trackedChapters.filter((c) => c.level === level) : trackedChapters;
  return { done: list.filter((c) => p.completed.includes(c.slug)).length, total: list.length };
}

/** The first tracked chapter not yet done (where "continue" leads), or null when everything is done. */
export function nextChapter(p: Progress) {
  return trackedChapters.find((c) => !p.completed.includes(c.slug)) ?? null;
}

function update(change: (p: Progress) => Progress) {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(PROGRESS_KEY);
  } catch {}
  writeLocalStore(PROGRESS_KEY, JSON.stringify(change(parseProgress(raw))));
}

export const setCompleted = (slug: string, done: boolean) => update((p) => withCompleted(p, slug, done));
export const recordAnswer = (slug: string, index: number, total: number, correct: boolean) =>
  update((p) => (isTracked(slug) ? withAnswer(p, slug, index, total, correct) : p));
export const recordMission = (id: string) => update((p) => withMission(p, id));
export const resetProgress = () => writeLocalStore(PROGRESS_KEY, null);

/** Live progress, shared by every component on the page and across tabs. `ready` is false during server render
 *  and the first client render, so done-state UI can stay neutral instead of flashing "0 of 25". */
export function useProgress(): { progress: Progress; ready: boolean } {
  const [raw] = useLocalStore(PROGRESS_KEY);
  const ready = useSyncExternalStore(noSubscribe, () => true, () => false);
  return { progress: parseProgress(raw), ready };
}

const noSubscribe = () => () => {};
