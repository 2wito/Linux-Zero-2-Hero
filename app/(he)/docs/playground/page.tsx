import type { Metadata } from "next";
import Playground from "@/content/playground.mdx";

// Every MDX component, rendered twice: once in a forced-light scope and once in a forced-dark scope (.light/.dark
// classes in globals.css), so both themes can be checked side by side. Dev-only; removed before deploy (docs/PLAN.md, phase 6).
export const metadata: Metadata = { title: "מגרש משחקים לרכיבים", robots: { index: false, follow: false } };

const themes = [
  { id: "light", label: "מצב בהיר" },
  { id: "dark", label: "מצב כהה" },
] as const;

export default function PlaygroundPage() {
  return (
    <>
      <h1 className="font-display text-4xl leading-tight sm:text-5xl">מגרש משחקים לרכיבים</h1>
      <p className="mt-5 text-lg leading-8 text-muted">
        כל רכיבי התוכן של המדריך, פעם במצב בהיר ופעם במצב כהה. העמוד הזה לבדיקה בלבד ולא מופיע במדריך.
      </p>
      {themes.map((theme) => (
        <section
          key={theme.id}
          aria-labelledby={`theme-${theme.id}`}
          className={`${theme.id} mt-10 rounded-2xl border border-line bg-bg p-5 text-ink sm:p-8`}
        >
          <p id={`theme-${theme.id}`} className="inline-block rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-ink">
            {theme.label}
          </p>
          <Playground />
        </section>
      ))}
    </>
  );
}
