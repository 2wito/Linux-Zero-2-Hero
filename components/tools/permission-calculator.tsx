"use client";

import { useId, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { useUi } from "@/components/use-locale";
import { permString } from "@/lib/simulator/text";

const WHO = ["u", "g", "o"] as const;
const PERMS = ["r", "w", "x"] as const;
const BIT = { r: 4, w: 2, x: 1 } as const;
const SHIFT = { u: 6, g: 3, o: 0 } as const;
const PRESETS = ["644", "600", "755", "700"];

const octal = (mode: number) => mode.toString(8).padStart(3, "0");

/**
 * chmod calculator (chapter 9): checkboxes ↔ numeric (755) ↔ symbolic (rwxr-xr-x) ↔ a ready chmod command.
 *
 *   <PermissionCalculator initial="644" file="notes.txt" />
 */
export function PermissionCalculator({ initial = "644", file = "file.txt" }: { initial?: string; file?: string }) {
  const t = useUi().permCalc;
  const id = useId();
  const [mode, setMode] = useState(() => (/^[0-7]{3}$/.test(initial) ? parseInt(initial, 8) : 0o644));
  const [text, setText] = useState(octal(mode));
  const valid = /^[0-7]{3}$/.test(text);

  const update = (next: number) => {
    setMode(next);
    setText(octal(next));
  };
  const onText = (value: string) => {
    setText(value);
    if (/^[0-7]{3}$/.test(value)) setMode(parseInt(value, 8));
  };
  const command = `chmod ${octal(mode)} ${file}`;

  return (
    <section aria-labelledby={`${id}-title`} className="mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <p id={`${id}-title`} className="font-bold">
        {t.title}
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[16rem] border-collapse text-center text-sm" aria-label={t.grid}>
          <thead>
            <tr>
              <th scope="col" />
              {PERMS.map((p) => (
                <th key={p} scope="col" className="px-2 pb-2 font-medium text-muted">
                  {t.perms[p]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WHO.map((w) => (
              <tr key={w} className="border-t border-line">
                <th scope="row" className="py-2 pe-3 text-start font-medium">
                  {t.who[w]}
                </th>
                {PERMS.map((p) => {
                  const bit = BIT[p] << SHIFT[w];
                  return (
                    <td key={p} className="py-2">
                      <input
                        type="checkbox"
                        checked={(mode & bit) !== 0}
                        onChange={(e) => update(e.target.checked ? mode | bit : mode & ~bit)}
                        aria-label={t.toggle(t.who[w], t.perms[p])}
                        className="size-5 cursor-pointer accent-[var(--accent)]"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-muted">{t.numeric}</span>
          <input
            dir="ltr"
            value={text}
            onChange={(e) => onText(e.target.value.trim())}
            inputMode="numeric"
            maxLength={3}
            aria-invalid={!valid}
            aria-describedby={valid ? undefined : `${id}-err`}
            className={`mt-1 block w-full rounded-xl border bg-bg px-3 py-2 font-mono text-lg ${valid ? "border-line" : "border-danger"}`}
          />
          {!valid && (
            <span id={`${id}-err`} role="alert" className="mt-1 block text-sm text-danger">
              {t.invalid}
            </span>
          )}
        </label>
        <div>
          <span className="text-sm text-muted">{t.symbolic}</span>
          <p dir="ltr" aria-live="polite" className="mt-1 rounded-xl border border-line bg-bg px-3 py-2 text-start font-mono text-lg">
            -{permString(mode)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <span className="text-sm text-muted">{t.command}</span>
        <div className="mt-1 flex items-center justify-between gap-3 rounded-xl bg-term py-2 ps-4 pe-2 text-term-ink">
          <code dir="ltr" className="font-mono">
            <span className="select-none text-term-accent">$ </span>
            {command}
          </code>
          <CopyButton text={command} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">{t.presets}:</span>
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => update(parseInt(p, 8))}
            aria-pressed={octal(mode) === p}
            className={`rounded-full border px-3 py-1 font-mono text-sm ${octal(mode) === p ? "border-accent bg-accent/10 text-accent" : "border-line hover:border-accent"}`}
          >
            {p}
          </button>
        ))}
      </div>
    </section>
  );
}
