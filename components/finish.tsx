"use client";

import { Mail, MessageSquarePlus } from "lucide-react";
import { LandingProgress } from "@/components/progress-tracker";
import { useUi } from "@/components/use-locale";
import { countDone, useProgress } from "@/lib/progress";
import { FEEDBACK_EMAIL, hasFeedbackEmail, NEW_ISSUE_URL, REPO_URL } from "@/lib/site";

/** Chapter 30: the reader's course progress, or a nudge to mark chapters when nothing is marked yet. */
export function FinishProgress() {
  const t = useUi().finish;
  const { progress, ready } = useProgress();
  if (!ready) return null;
  if (countDone(progress).done > 0) return <LandingProgress />;
  return (
    <section aria-label={t.progressTitle} className="mt-8 rounded-2xl border border-dashed border-line p-5 text-muted sm:p-6">
      {t.progressEmpty}
    </section>
  );
}

/** Chapter 30: how to send feedback. Email only once the owner has set the address; GitHub issues always. */
export function Feedback() {
  const ui = useUi();
  const t = ui.finish;
  const button = "inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-medium";
  const external = ui.resources.external;

  return (
    <section aria-labelledby="feedback-title" className="mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <p id="feedback-title" className="text-lg font-bold">
        {t.feedbackTitle}
      </p>
      <p className="mt-2 leading-7 text-muted">{t.feedbackBody}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {hasFeedbackEmail() && (
          <a href={`mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(ui.brand.name + " " + ui.brand.suffix)}`} className={`${button} bg-accent text-accent-ink`}>
            <Mail className="size-4" aria-hidden />
            {t.feedbackEmail}
          </a>
        )}
        <a href={NEW_ISSUE_URL} target="_blank" rel="noopener noreferrer" className={`${button} border border-accent text-accent hover:bg-accent/10`}>
          <MessageSquarePlus className="size-4" aria-hidden />
          {t.feedbackIssue}
          <span className="sr-only">{external}</span>
        </a>
      </div>
      <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm text-accent underline underline-offset-4">
        {t.sourceCode}
        <span className="sr-only">{external}</span>
      </a>
    </section>
  );
}
