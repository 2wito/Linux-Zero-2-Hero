"use client";

import { Check } from "lucide-react";
import { useId } from "react";
import { InlineCode } from "@/components/mdx/inline-code";
import { useUi } from "@/components/use-locale";
import { useLocalStore } from "@/lib/local-store";

const STORAGE_PREFIX = "checklist:";

/** The saved ticked/unticked state per item; anything malformed (e.g. after the item list changed length) resets to all unticked. */
export function parseChecked(raw: string | null, count: number): boolean[] {
  try {
    const saved = JSON.parse(raw ?? "null");
    if (Array.isArray(saved) && saved.length === count && saved.every((v) => typeof v === "boolean")) return saved;
  } catch {}
  return Array(count).fill(false);
}

/**
 * Tickable checklist, remembered per `id` in this browser (e.g. "setup-wsl").
 * Items are plain strings; `backticks` render as inline code.
 */
export function Checklist({ id, title, items }: { id: string; title?: string; items: string[] }) {
  const [raw, save] = useLocalStore(STORAGE_PREFIX + id);
  const done = parseChecked(raw, items.length);
  const baseId = useId();
  const t = useUi().checklist;

  function toggle(index: number) {
    save(JSON.stringify(done.map((v, i) => (i === index ? !v : v))));
  }

  const count = done.filter(Boolean).length;
  const complete = count === items.length;
  const heading = title ?? t.title;

  return (
    <section
      aria-labelledby={`${baseId}-title`}
      className={`mt-6 rounded-xl border p-4 sm:p-5 ${complete ? "border-ok/50 bg-ok/[0.07]" : "border-line bg-surface"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p id={`${baseId}-title`} className="font-bold">
          {heading}
        </p>
        <p className={`text-sm tabular-nums ${complete ? "font-medium text-ok" : "text-muted"}`} aria-live="polite">
          {complete ? t.done : t.progress(count, items.length)}
        </p>
      </div>
      <ul className="mt-3 space-y-1">
        {items.map((item, i) => {
          const inputId = `${baseId}-${i}`;
          return (
            <li key={i}>
              <label htmlFor={inputId} className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-surface-2/70">
                <input id={inputId} type="checkbox" checked={done[i]} onChange={() => toggle(i)} className="peer sr-only" />
                <span
                  aria-hidden
                  className={`mt-1 grid size-5 shrink-0 place-items-center rounded-md border peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
                    done[i] ? "border-ok bg-ok text-surface" : "border-line bg-bg"
                  }`}
                >
                  {done[i] && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <span className={`min-w-0 leading-7 [overflow-wrap:anywhere] ${done[i] ? "text-muted line-through decoration-muted/60" : ""}`}>
                  <InlineCode text={item} />
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
