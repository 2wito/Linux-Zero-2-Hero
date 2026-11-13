"use client";

import { Check, Circle, Lightbulb, RotateCcw } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { TerminalFrame } from "@/components/terminal-frame";
import { useLocale, useUi } from "@/components/use-locale";
import { dir as dirOf } from "@/lib/i18n";
import { HOST, USER } from "@/lib/simulator/fs";
import { recordMission, useProgress } from "@/lib/progress";
import { missions, type MissionId } from "@/lib/simulator/missions";
import { columns, Shell, type OutLine } from "@/lib/simulator/shell";

type Entry = { id: number } & ({ kind: "cmd"; path: string; text: string } | { kind: "line"; line: OutLine } | { kind: "welcome" });

const DEFAULT_CHIPS = ["pwd", "ls", "ls -l", "help"];

/** Terminal-colored inline markup for hint text: `backticks` become code. */
function HintText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((part, i) =>
        part.length > 2 && part.startsWith("`") && part.endsWith("`") ? (
          <code key={i} dir="ltr" className="font-mono text-term-ink [unicode-bidi:isolate]">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

function Prompt({ path }: { path: string }) {
  return (
    <span className="select-none">
      <span className="text-term-user">
        {USER}@{HOST}
      </span>
      <span className="text-term-ink">:</span>
      <span className="text-term-path">{path}</span>
      <span className="text-term-accent">$</span>{" "}
    </span>
  );
}

/**
 * A safe practice shell: a fake Bash over an in-memory filesystem (lib/simulator). Nothing runs on a real machine.
 * `mission` picks a starting filesystem, suggestion chips and a task list with live checkmarks.
 *
 *   <TerminalSimulator mission="navigate" />
 */
export function TerminalSimulator({ mission }: { mission?: MissionId }) {
  const t = useUi().simulator;
  const progressT = useUi().progress;
  const { progress, ready } = useProgress();
  const locale = useLocale();
  const m = mission ? missions[mission] : null;
  const make = () => new Shell({ home: m?.home });

  const [shell, setShell] = useState(make);
  const [entries, setEntries] = useState<Entry[]>([{ id: 0, kind: "welcome" }]);
  const [input, setInput] = useState("");
  const [cols, setCols] = useState(80);
  const [histIndex, setHistIndex] = useState<number | null>(null);
  const [done, setDone] = useState<boolean[]>(() => m?.tasks.map(() => false) ?? []);
  const nextId = useRef(1);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const inputId = useId();
  const tasksId = useId();

  // ls lays names out in columns: tell the shell how many characters fit in the window.
  useLayoutEffect(() => {
    const log = logRef.current;
    const probe = measureRef.current;
    if (!log || !probe) return;
    const update = () => {
      const charWidth = probe.getBoundingClientRect().width / 10 || 8;
      const style = getComputedStyle(log);
      const inner = log.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      setCols(Math.max(20, Math.floor(inner / charWidth)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(log);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [entries]);

  const add = (items: Entry[], replace = false) => setEntries((prev) => (replace ? items : [...prev, ...items]));
  const id = () => nextId.current++;

  function run(line: string) {
    const path = shell.prompt;
    const result = shell.run(line, cols);
    const echoed: Entry = { id: id(), kind: "cmd", path, text: line };
    const out: Entry[] = result.lines.map((l) => ({ id: id(), kind: "line", line: l }));
    // `clear` wipes the screen; anything printed after it in the same line stays.
    add(result.clear ? out : [echoed, ...out], result.clear);
    if (m && mission) {
      const next = m.tasks.map((task, i) => done[i] || task.done(shell));
      setDone(next);
      // A finished mission is saved to course progress (shown as "completed before" on the next visit).
      if (next.every(Boolean) && !done.every(Boolean)) recordMission(mission);
    }
    setInput("");
    setHistIndex(null);
  }

  function reset() {
    setShell(make());
    setEntries([{ id: id(), kind: "welcome" }]);
    setDone(m?.tasks.map(() => false) ?? []);
    setInput("");
    setHistIndex(null);
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const history = shell.history;
    if (e.key === "Enter") {
      e.preventDefault();
      run(input);
    } else if (e.key === "ArrowUp" && history.length) {
      e.preventDefault();
      const i = histIndex === null ? history.length - 1 : Math.max(0, histIndex - 1);
      setHistIndex(i);
      setInput(history[i]);
    } else if (e.key === "ArrowDown" && histIndex !== null) {
      e.preventDefault();
      const i = histIndex + 1;
      setHistIndex(i >= history.length ? null : i);
      setInput(i >= history.length ? "" : history[i]);
    } else if (e.key === "Tab" && input.trim() && !e.shiftKey) {
      // Tab completes only while typing, so keyboard users can still Tab out of an empty prompt.
      e.preventDefault();
      const { line, options } = shell.complete(input);
      if (options.length) {
        add([
          { id: id(), kind: "cmd", path: shell.prompt, text: input },
          { id: id(), kind: "line", line: { kind: "out", text: columns(options, cols).trimEnd() } },
        ]);
      }
      setInput(line);
    } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      add([], true);
    } else if (e.ctrlKey && e.key.toLowerCase() === "c" && !window.getSelection()?.toString()) {
      // Ctrl+C cancels the line, like Bash (unless text is selected: then the browser copies it).
      e.preventDefault();
      add([{ id: id(), kind: "cmd", path: shell.prompt, text: input + "^C" }]);
      setInput("");
      setHistIndex(null);
    }
  }

  const completed = done.filter(Boolean).length;
  const allDone = m !== null && completed === m.tasks.length;
  const doneBefore = ready && !!mission && !allDone && progress.missions.includes(mission);

  return (
    <section aria-label={t.aria} className="mt-6">
      {m && (
        <div className="rounded-t-2xl border border-b-0 border-line bg-surface px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <h3 id={tasksId} className="m-0 text-base font-bold">
              {t.mission}
            </h3>
            <span className="text-sm text-muted">{t.progress(completed, m.tasks.length)}</span>
          </div>
          <ul aria-labelledby={tasksId} className="mt-2 space-y-1.5">
            {m.tasks.map((task, i) => (
              <li key={i} className={`flex items-start gap-2 text-[15px] leading-6 ${done[i] ? "text-muted" : ""}`}>
                {done[i] ? (
                  <Check aria-hidden className="mt-1 size-4 shrink-0 text-ok" />
                ) : (
                  <Circle aria-hidden className="mt-1 size-4 shrink-0 text-muted" />
                )}
                <span>
                  <span className="sr-only">{done[i] ? "✓ " : ""}</span>
                  <HintTextPlain text={task[locale]} />
                </span>
              </li>
            ))}
          </ul>
          <p aria-live="polite" className="text-sm font-bold text-ok empty:hidden">
            {allDone ? t.missionDone : ""}
          </p>
          {doneBefore && <p className="mt-1 text-sm text-muted">{progressT.missionBefore}</p>}
        </div>
      )}
      <TerminalFrame
        title={`${USER}@${HOST}: ${shell.prompt}`}
        className={m ? "rounded-t-none" : ""}
        action={
          <button
            type="button"
            onClick={reset}
            aria-label={t.reset}
            title={t.reset}
            className="grid size-7 place-items-center rounded-md text-term-dim hover:bg-white/10 hover:text-term-ink focus-visible:outline-2 focus-visible:outline-term-accent"
          >
            <RotateCcw aria-hidden className="size-4" />
          </button>
        }
      >
        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-label={t.log}
          dir="ltr"
          onMouseUp={() => {
            if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true });
          }}
          className="relative h-72 overflow-y-auto px-4 pt-3 pb-1 text-start font-mono text-[13px] leading-6 sm:text-sm"
        >
          <span ref={measureRef} aria-hidden className="pointer-events-none invisible absolute whitespace-pre">
            0000000000
          </span>
          {entries.map((e) => {
            if (e.kind === "welcome") {
              return (
                <p key={e.id} dir={dirOf(locale)} className="mb-1 font-sans text-term-dim">
                  <HintText text={t.welcome} />
                </p>
              );
            }
            if (e.kind === "cmd") {
              return (
                <p key={e.id} className="whitespace-pre-wrap break-all">
                  <Prompt path={e.path} />
                  {e.text}
                </p>
              );
            }
            return <OutputLine key={e.id} line={e.line} />;
          })}
        </div>
        {/* Focus shows as a lit-up prompt row (the input itself has no ring, like a real terminal). */}
        <div
          dir="ltr"
          className="flex items-center border-t border-white/10 px-4 py-2 font-mono text-[13px] focus-within:bg-white/[0.06] focus-within:shadow-[inset_3px_0_0_var(--color-term-accent)] sm:text-sm"
        >
          <label htmlFor={inputId} className="shrink-0">
            <Prompt path={shell.prompt} />
            <span className="sr-only">{t.input}</span>
          </label>
          <input
            ref={inputRef}
            id={inputId}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setHistIndex(null);
            }}
            onKeyDown={onKeyDown}
            dir="ltr"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            className="min-w-0 flex-1 bg-transparent text-base text-term-ink caret-term-accent outline-none focus-visible:outline-none sm:text-sm"
          />
        </div>
      </TerminalFrame>
      <div role="group" aria-label={t.chips} className="mt-3 flex flex-wrap gap-2">
        {(m?.chips ?? DEFAULT_CHIPS).map((chip) => (
          <button
            key={chip}
            type="button"
            dir="ltr"
            onClick={() => run(chip)}
            className="rounded-full border border-line bg-surface px-3 py-1 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
          >
            {chip}
          </button>
        ))}
      </div>
    </section>
  );
}

/** Task text outside the terminal: `backticks` become regular inline code. */
function HintTextPlain({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((part, i) =>
        part.length > 2 && part.startsWith("`") && part.endsWith("`") ? (
          <code key={i} dir="ltr" className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.88em] [unicode-bidi:isolate]">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

function OutputLine({ line }: { line: OutLine }) {
  const t = useUi().simulator;
  const locale = useLocale();
  if ("text" in line) {
    return (
      <p className="whitespace-pre-wrap break-all text-term-ink/85">
        {/* dir="auto" isolates Hebrew output (echo "שלום") inside the LTR terminal. */}
        <span dir="auto">{line.text || " "}</span>
      </p>
    );
  }
  if (line.kind === "help") {
    return (
      <div dir={dirOf(locale)} className="my-1 font-sans">
        <p className="text-term-ink">{t.help.title}</p>
        <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-4">
          {t.help.commands.map(([cmd, desc]) => (
            <div key={cmd} className="contents">
              <dt dir="ltr" className="text-start font-mono text-term-accent">
                {cmd}
              </dt>
              <dd className="text-term-ink/85">{desc}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-1 text-term-dim">
          <HintText text={t.help.footer} />
        </p>
      </div>
    );
  }
  const render = t.hints[line.hint.key] as (a: string) => string;
  return (
    <p dir={dirOf(locale)} className="my-1 flex items-start gap-2 rounded-md bg-white/5 px-2 py-1 font-sans text-term-accent">
      <Lightbulb aria-hidden className="mt-1 size-3.5 shrink-0" />
      <span>
        <span className="sr-only">{t.hint}: </span>
        <HintText text={render(line.hint.arg)} />
      </span>
    </p>
  );
}
