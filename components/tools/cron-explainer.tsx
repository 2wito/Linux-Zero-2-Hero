"use client";

import { useId, useState } from "react";
import { useLocale, useUi } from "@/components/use-locale";
import { explainCron, parseCron } from "@/lib/cron";

const EXAMPLES = ["0 2 * * *", "30 8 * * 0-4", "*/10 * * * *", "0 9 1 * *", "@reboot"];
const RANGES = ["0–59", "0–23", "1–31", "1–12", "0–7"];

/**
 * Type a crontab schedule and read it in plain language (chapter 19).
 *
 *   <CronExplainer initial="*\/15 9-17 * * 1-5" />
 */
export function CronExplainer({ initial = "*/15 9-17 * * 1-5" }: { initial?: string }) {
  const t = useUi().cron;
  const locale = useLocale();
  const id = useId();
  const [expr, setExpr] = useState(initial);
  const parsed = parseCron(expr);
  const explanation = explainCron(expr, locale);
  const tokens = expr.trim().startsWith("@") ? [] : expr.trim().split(/\s+/);
  const error = parsed.ok ? null : parsed.field === null ? t.invalid : t.invalidField(t.fields[parsed.field]);

  return (
    <section aria-labelledby={`${id}-title`} className="mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <p id={`${id}-title`} className="font-bold">
        {t.title}
      </p>
      <label className="mt-3 block">
        <span className="text-sm text-muted">{t.label}</span>
        <input
          dir="ltr"
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={!parsed.ok}
          aria-describedby={`${id}-result`}
          className={`mt-1 block w-full rounded-xl border bg-bg px-3 py-2 text-start font-mono text-lg ${parsed.ok ? "border-line" : "border-danger"}`}
        />
      </label>

      <div className="mt-4 overflow-x-auto">
        {/* LTR so each column sits in the same order as the fields in the line above. */}
        <table dir="ltr" className="w-full min-w-[17rem] border-collapse text-center text-sm">
          <thead>
            <tr>
              {t.fields.map((f, i) => (
                <th key={f} scope="col" className={`px-1 pb-1 font-medium sm:px-2 ${!parsed.ok && parsed.field === i ? "text-danger" : "text-muted"}`}>
                  {f}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {RANGES.map((r, i) => (
                <td key={r} className="px-1 align-top sm:px-2">
                  <span dir="ltr" className="block whitespace-nowrap font-mono text-base">
                    {tokens[i] ?? "–"}
                  </span>
                  <span dir="ltr" className="block text-xs text-muted">
                    {r}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div id={`${id}-result`} aria-live="polite" className="mt-4 rounded-xl border border-line bg-bg px-4 py-3">
        {explanation ? (
          <p>
            <span className="text-sm text-muted">{t.meaning}: </span>
            <span className="font-medium">{explanation}</span>
          </p>
        ) : (
          <p role="alert" className="text-danger">
            {error}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">{t.examples}:</span>
        {EXAMPLES.map((e) => (
          <button
            key={e}
            type="button"
            dir="ltr"
            onClick={() => setExpr(e)}
            className="rounded-full border border-line px-3 py-1 font-mono text-sm hover:border-accent hover:text-accent"
          >
            {e}
          </button>
        ))}
      </div>
    </section>
  );
}
