"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, CircleCheck, RotateCcw } from "lucide-react";
import { useLocale, useUi } from "@/components/use-locale";
import { docHref } from "@/lib/i18n";
import { countDone, isTracked, nextChapter, resetProgress, setCompleted, useProgress } from "@/lib/progress";
import { levels, type Level } from "@/lib/syllabus";

const trackedLevels = levels.filter((l): l is Exclude<Level, "extra"> => l !== "extra");

function Bar({ done, total, label, className = "h-2" }: { done: number; total: number; label: string; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-valuetext={`${done} / ${total}`}
      className={`overflow-hidden rounded-full bg-surface-2 ${className}`}
    >
      <div className="h-full rounded-full bg-accent transition-[width] motion-reduce:transition-none" style={{ width: `${(done / total) * 100}%` }} />
    </div>
  );
}

/** Reset with an inline "are you sure?" step (no browser dialog). */
function ResetButton() {
  const t = useUi().progress;
  const [asking, setAsking] = useState(false);
  if (!asking)
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted hover:text-ink"
      >
        <RotateCcw className="size-3" aria-hidden />
        {t.reset}
      </button>
    );
  return (
    <span role="group" aria-label={t.resetConfirm} className="flex flex-wrap items-center gap-2 text-xs">
      <span className="font-medium">{t.resetConfirm}</span>
      <button
        type="button"
        onClick={() => {
          resetProgress();
          setAsking(false);
        }}
        className="rounded-full border border-danger/60 px-2.5 py-0.5 font-medium text-danger hover:bg-danger/10"
      >
        {t.resetYes}
      </button>
      {/* autoFocus: the safe choice gets focus after the "reset" button disappears. */}
      <button type="button" autoFocus onClick={() => setAsking(false)} className="rounded-full border border-line px-2.5 py-0.5 hover:bg-surface-2">
        {t.resetNo}
      </button>
    </span>
  );
}

/** Course progress at the top of every docs page: all tracked chapters plus one small bar per level. */
export function ProgressBar() {
  const { progress, ready } = useProgress();
  const ui = useUi();
  const t = ui.progress;
  const all = countDone(progress);

  return (
    <section aria-label={t.title} className="mb-8 rounded-xl border border-line bg-surface px-4 py-3 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
        <span className="font-medium">{t.title}</span>
        <span className="flex flex-wrap items-center gap-3">
          <span className="text-muted tabular-nums">{ready ? t.count(all.done, all.total) : t.count(0, all.total)}</span>
          {ready && all.done > 0 && <ResetButton />}
        </span>
      </div>
      <Bar done={ready ? all.done : 0} total={all.total} label={t.aria} className="mt-2 h-2" />
      <ul className="mt-2.5 grid grid-cols-3 gap-3 text-xs text-muted">
        {trackedLevels.map((level) => {
          const c = countDone(progress, level);
          const done = ready ? c.done : 0;
          return (
            <li key={level} className="min-w-0">
              <span className="block truncate tabular-nums">{t.level(ui.levels[level], done, c.total)}</span>
              <Bar done={done} total={c.total} label={ui.levels[level]} className="mt-1 h-1" />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** "Mark as done" toggle at the end of a learning chapter, with the chapter's first-try quiz score. */
export function CompleteButton({ slug }: { slug: string }) {
  const { progress, ready } = useProgress();
  const t = useUi().progress;
  if (!isTracked(slug)) return null;
  const done = ready && progress.completed.includes(slug);
  const quiz = ready ? progress.quizzes[slug] : undefined;
  const score = quiz?.firstTry.filter((v) => v === true).length ?? 0;

  return (
    <div className="mt-12 flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface p-4 print:hidden">
      <button
        type="button"
        aria-pressed={done}
        onClick={() => setCompleted(slug, !done)}
        className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-medium ${
          done ? "bg-accent text-accent-ink" : "border border-accent text-accent hover:bg-accent/10"
        }`}
      >
        <Check className="size-4" aria-hidden />
        {done ? t.done : t.markDone}
      </button>
      <p className="text-sm text-muted" aria-live="polite">
        {quiz ? t.quizScore(score, quiz.firstTry.length) : t.quizHint}
      </p>
    </div>
  );
}

/** A small check shown next to a completed chapter (sidebar, landing cards). Renders nothing until done. */
export function DoneMark({ slug, className = "size-4" }: { slug: string; className?: string }) {
  const { progress, ready } = useProgress();
  const t = useUi().progress;
  if (!ready || !progress.completed.includes(slug)) return null;
  return (
    <span className="inline-flex shrink-0 text-ok" title={t.doneMark}>
      <CircleCheck className={className} aria-hidden />
      <span className="sr-only">{t.doneMark}</span>
    </span>
  );
}

/** Landing page card: overall and per-level progress plus a "continue" link. Hidden until the reader has progress. */
export function LandingProgress() {
  const { progress, ready } = useProgress();
  const locale = useLocale();
  const ui = useUi();
  const t = ui.progress;
  const all = countDone(progress);
  if (!ready || all.done === 0) return null;
  const next = nextChapter(progress);

  return (
    <section aria-label={t.title} className="mt-8 rounded-2xl border border-line bg-bg p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-lg font-bold">{t.title}</h3>
        <span className="text-sm text-muted tabular-nums">{t.count(all.done, all.total)}</span>
      </div>
      <Bar done={all.done} total={all.total} label={t.aria} className="mt-3 h-2.5" />
      <ul className="mt-3 grid gap-3 text-sm text-muted sm:grid-cols-3">
        {trackedLevels.map((level) => {
          const c = countDone(progress, level);
          return (
            <li key={level}>
              <span className="tabular-nums">{t.level(ui.levels[level], c.done, c.total)}</span>
              <Bar done={c.done} total={c.total} label={ui.levels[level]} className="mt-1 h-1.5" />
            </li>
          );
        })}
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        {next ? (
          <Link href={docHref(locale, next.slug)} className="rounded-full bg-accent px-5 py-2.5 font-medium text-accent-ink">
            {t.continue(next.number)}
          </Link>
        ) : (
          <p className="font-medium text-ok">{t.allDone}</p>
        )}
        <span className="text-xs text-muted">{t.saved}</span>
      </div>
    </section>
  );
}
