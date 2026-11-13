"use client";

import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { InlineCode } from "@/components/mdx/inline-code";
import { useUi } from "@/components/use-locale";
import { recordAnswer } from "@/lib/progress";

export type QuizQuestion = {
  q: string;
  options: { text: string; why: string }[];
  answer: number;
};

/**
 * Multiple-choice quiz with instant feedback. A wrong answer explains why and lets the reader try again;
 * the right answer locks the question. Strings support `backticks` for inline code.
 * Answers are saved to course progress (first-try score); answering every question right completes the chapter.
 */
export function MiniQuiz({ questions, title }: { questions: QuizQuestion[]; title?: string }) {
  const t = useUi().quiz;
  return (
    <section aria-label={title ?? t.title} className="mt-6 space-y-5">
      {questions.map((question, i) => (
        <QuizCard key={i} index={i} total={questions.length} question={question} />
      ))}
    </section>
  );
}

function QuizCard({ index, total, question }: { index: number; total: number; question: QuizQuestion }) {
  // The chapter slug is the last path segment (/docs/<slug> or /en/docs/<slug>); untracked pages are ignored.
  const slug = usePathname()?.split("/").pop() ?? "";
  const [picked, setPicked] = useState<number | null>(null);
  const baseId = useId();
  const t = useUi().quiz;
  const correct = picked === question.answer;

  return (
    <div
      role="group"
      aria-labelledby={`${baseId}-q`}
      className={`rounded-xl border p-4 sm:p-5 ${
        picked === null ? "border-line bg-surface" : correct ? "border-ok/50 bg-ok/[0.07]" : "border-danger/40 bg-danger/[0.06]"
      }`}
    >
      <p id={`${baseId}-q`} className="font-bold leading-7">
        <span className="text-accent tabular-nums">{index + 1}. </span>
        <InlineCode text={question.q} />
      </p>
      <div role="radiogroup" aria-labelledby={`${baseId}-q`} className="mt-3 grid gap-2">
        {question.options.map((option, i) => {
          const selected = picked === i;
          const showCorrect = correct && i === question.answer;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={correct}
              onClick={() => {
                setPicked(i);
                recordAnswer(slug, index, total, i === question.answer);
              }}
              className={`rounded-lg border px-4 py-2.5 text-start leading-7 disabled:cursor-default ${
                showCorrect
                  ? "border-ok bg-ok/15 font-medium"
                  : selected
                    ? "border-danger/60 bg-danger/10"
                    : "border-line bg-bg hover:border-accent"
              }`}
            >
              <InlineCode text={option.text} />
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {picked !== null && (
          <p className="mt-3 leading-7">
            <span className={`font-bold ${correct ? "text-ok" : "text-danger"}`}>{correct ? t.correct : t.wrong}</span>
            <InlineCode text={question.options[picked].why} />
            {!correct && <span className="text-muted"> {t.tryAgain}</span>}
          </p>
        )}
      </div>
    </div>
  );
}
