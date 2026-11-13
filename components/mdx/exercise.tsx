"use client";

import { ChevronDown, Dumbbell } from "lucide-react";
import { useUi } from "@/components/use-locale";

/**
 * A hands-on exercise with a collapsible solution:
 *
 *   <Exercise title="יוצרים תיקיית פרויקט">
 *   משימה...
 *   <Solution>
 *   פתרון...
 *   </Solution>
 *   </Exercise>
 */
export function Exercise({ title, children }: { title: string; children: React.ReactNode }) {
  const t = useUi().exercise;
  return (
    <section aria-label={`${t.label}: ${title}`} className="mt-8 rounded-2xl border border-accent/40 bg-accent/[0.05] p-5 sm:p-6">
      <p className="flex items-center gap-2 text-sm font-bold text-accent">
        <Dumbbell className="size-4" aria-hidden />
        {t.label}
      </p>
      <p className="mt-1 text-xl font-bold">{title}</p>
      <div className="[&>*:first-child]:mt-3 [&_li]:text-base [&_p]:text-base [&_p]:leading-7">{children}</div>
    </section>
  );
}

/** The hidden answer inside <Exercise>. A native <details>, so it works with keyboard and screen readers. */
export function Solution({ children }: { children: React.ReactNode }) {
  const t = useUi().exercise;
  return (
    <details className="group mt-5 rounded-xl border border-line bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 font-medium hover:bg-surface-2/60 [&::-webkit-details-marker]:hidden">
        {t.solution}
        <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="border-t border-line px-4 pb-4 [&>*:first-child]:mt-3">{children}</div>
    </details>
  );
}
