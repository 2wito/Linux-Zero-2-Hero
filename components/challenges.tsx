"use client";

import { Check, ChevronDown, Lightbulb, SquareTerminal, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { InlineCode } from "@/components/mdx/inline-code";
import { TerminalSimulator } from "@/components/terminal-simulator";
import { TerminalWindow } from "@/components/terminal-window";
import { useLocale, useUi } from "@/components/use-locale";
import { challengeLevelIntro, challengeLevels, challenges, type Challenge } from "@/lib/challenges";
import { docHref } from "@/lib/i18n";
import { useLocalStore } from "@/lib/local-store";
import { useProgress } from "@/lib/progress";
import { chapters } from "@/lib/syllabus";

const STORAGE_KEY = "linux-challenges:v1";

/** Solved challenge ids saved in this browser; anything malformed counts as nothing solved. */
function parseSolved(raw: string | null): string[] {
  try {
    const data = JSON.parse(raw ?? "null");
    return Array.isArray(data) ? data.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/** A <details> panel (hint or solution): native, so it works with the keyboard and screen readers. */
function Panel({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <details className="group mt-3 rounded-xl border border-line bg-bg">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-2.5 font-medium hover:bg-surface-2/60 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t border-line px-4 pb-4">{children}</div>
    </details>
  );
}

/** `bySimulator`: solved by finishing the simulator mission, so it can't be unmarked by hand. */
function ChallengeCard({ c, marked, bySimulator, onToggle }: { c: Challenge; marked: boolean; bySimulator: boolean; onToggle: () => void }) {
  const locale = useLocale();
  const t = useUi().challenges;
  const [simOpen, setSimOpen] = useState(false);
  const solved = marked || bySimulator;

  return (
    <li id={`challenge-${c.id}`} className={`scroll-mt-24 rounded-2xl border bg-surface p-5 sm:p-6 ${solved ? "border-ok/60" : "border-line"}`}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <h3 className="text-xl font-bold">{c.title[locale]}</h3>
        {bySimulator ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ok bg-ok/10 px-3 py-1 text-sm font-medium text-ok">
            <Check className="size-4" strokeWidth={3} aria-hidden />
            {t.solved}
          </span>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={marked}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${
              marked ? "border-ok bg-ok/10 text-ok" : "border-line text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {marked && <Check className="size-4" strokeWidth={3} aria-hidden />}
            {marked ? t.solved : t.markSolved}
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-muted">
        {t.practices}{" "}
        {c.chapters.map((n, i) => {
          const ch = chapters.find((x) => x.number === n)!;
          return (
            <span key={n}>
              {i > 0 && ", "}
              <Link href={docHref(locale, ch.slug)} className="text-accent underline underline-offset-2">
                {t.chapterLink(n)}
              </Link>
            </span>
          );
        })}
      </p>
      <p className="mt-3 text-lg leading-8">
        <InlineCode text={c.task[locale]} />
      </p>

      {c.mission && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setSimOpen((v) => !v)}
            aria-expanded={simOpen}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-ink"
          >
            {simOpen ? <X className="size-4" aria-hidden /> : <SquareTerminal className="size-4" aria-hidden />}
            {simOpen ? t.simulatorClose : t.simulatorOpen}
          </button>
          {simOpen && <TerminalSimulator mission={c.mission} />}
        </div>
      )}

      <Panel label={t.hint} icon={<Lightbulb className="size-4 text-accent" aria-hidden />}>
        <p className="mt-3 leading-7">
          <InlineCode text={c.hint[locale]} />
        </p>
      </Panel>
      <Panel label={t.solution}>
        {c.solution.file && (
          <div className="mt-4 overflow-hidden rounded-xl bg-term text-term-ink ring-1 ring-black/5 dark:ring-white/10">
            <div dir="ltr" className="flex items-center justify-between gap-3 border-b border-white/10 py-1.5 ps-4 pe-2">
              <span className="truncate font-mono text-xs text-term-dim">{c.solution.file.name}</span>
              <CopyButton text={c.solution.file.code} />
            </div>
            <pre dir="ltr" className="overflow-x-auto px-4 py-3.5 text-start font-mono text-[13px] leading-6 sm:text-sm">
              {c.solution.file.code}
            </pre>
          </div>
        )}
        {c.solution.commands && <TerminalWindow>{c.solution.commands}</TerminalWindow>}
        <p className="mt-4 leading-7">
          <InlineCode text={c.solution.explain[locale]} />
        </p>
      </Panel>
    </li>
  );
}

/** Practice challenges (chapter 28), grouped by level: task, hint, solution, and a simulator for the beginner ones. */
export function Challenges() {
  const locale = useLocale();
  const ui = useUi();
  const t = ui.challenges;
  const [raw, save] = useLocalStore(STORAGE_KEY);
  const { progress, ready } = useProgress();
  const marked = parseSolved(raw);
  // A challenge counts as solved when it's marked by hand, or when its simulator mission was completed.
  const bySimulator = (c: Challenge) => ready && !!c.mission && progress.missions.includes(c.mission);
  const solvedCount = challenges.filter((c) => marked.includes(c.id) || bySimulator(c)).length;

  function toggle(c: Challenge) {
    save(JSON.stringify(marked.includes(c.id) ? marked.filter((id) => id !== c.id) : [...marked, c.id]));
  }

  return (
    <div className="mt-6">
      <p aria-live="polite" className="text-sm text-muted tabular-nums">
        {ready ? t.count(solvedCount, challenges.length) : null}
      </p>
      {challengeLevels.map((level) => (
        <section key={level} aria-labelledby={`challenges-${level}`}>
          <h2 id={`challenges-${level}`} className="mt-12 scroll-mt-24 font-display text-2xl sm:text-3xl">
            {ui.levels[level]}
          </h2>
          <p className="mt-3 text-lg leading-8 text-muted">{challengeLevelIntro[level][locale]}</p>
          <ol className="mt-5 space-y-5">
            {challenges
              .filter((c) => c.level === level)
              .map((c) => (
                <ChallengeCard key={c.id} c={c} marked={marked.includes(c.id)} bySimulator={bySimulator(c)} onToggle={() => toggle(c)} />
              ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
