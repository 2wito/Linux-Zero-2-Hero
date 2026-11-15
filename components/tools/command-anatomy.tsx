"use client";

import { useId, useState } from "react";
import { InlineCode } from "@/components/mdx/inline-code";
import { useUi } from "@/components/use-locale";

type Role = "command" | "option" | "argument";

const ROLE_STYLE: Record<Role, { text: string; ring: string; chip: string }> = {
  command: { text: "text-term-accent", ring: "ring-term-accent", chip: "bg-accent text-accent-ink" },
  option: { text: "text-term-user", ring: "ring-term-user", chip: "bg-ok text-white dark:text-black" },
  argument: { text: "text-term-path", ring: "ring-term-path", chip: "bg-info text-white dark:text-black" },
};

/**
 * A command split into its parts (chapter 4). Each part is a button; choosing it explains its role.
 * The first part is the command, parts starting with "-" are options, the rest are arguments.
 *
 *   <CommandAnatomy parts={[["ls", "list: …"], ["-l", "long: …"], ["/home", "…"]]} />
 */
export function CommandAnatomy({ parts }: { parts: [string, string][] }) {
  const t = useUi().anatomy;
  const [selected, setSelected] = useState(0);
  const id = useId();
  const role = (i: number): Role => (i === 0 ? "command" : parts[i][0].startsWith("-") ? "option" : "argument");
  const current = role(selected);

  return (
    <section aria-labelledby={`${id}-title`} className="mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <p id={`${id}-title`} className="font-bold">
        {t.title}
      </p>
      <p className="mt-1 text-sm text-muted">{t.pick}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-term px-4 py-3 font-mono text-lg">
        <span className="select-none text-term-dim" aria-hidden>
          $
        </span>
        {parts.map(([text], i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected(i)}
            aria-pressed={selected === i}
            aria-label={`${text}: ${t.roles[role(i)]}`}
            className={`rounded-md px-1.5 py-0.5 ${ROLE_STYLE[role(i)].text} ${selected === i ? `bg-white/10 ring-2 ${ROLE_STYLE[role(i)].ring}` : "hover:bg-white/5"}`}
          >
            {text}
          </button>
        ))}
      </div>
      <div aria-live="polite" className="mt-4">
        <p className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${ROLE_STYLE[current].chip}`}>{t.roles[current]}</span>
          <code dir="ltr" className="rounded bg-surface-2 px-1.5 py-0.5 font-mono">
            {parts[selected][0]}
          </code>
          <span className="text-muted">{t.roleBody[current]}</span>
        </p>
        <p className="mt-2 leading-7">
          <InlineCode text={parts[selected][1]} />
        </p>
      </div>
    </section>
  );
}
