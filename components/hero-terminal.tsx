"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { TerminalFrame } from "@/components/terminal-frame";
import { useUi } from "@/components/use-locale";
import { finalCwd, heroScript, type HeroLine } from "@/lib/hero-script";

const TYPE_MS = 55;
const AFTER_TYPED_MS = 350;
const OUTPUT_MS = 280;
const START_MS = 600;
const USER = "you@linux";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(reducedMotionQuery);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Landing-page terminal that types out real commands. Every line is always rendered (not-yet-typed lines are
 * invisible), so the window has its final height from the first paint and nothing below it jumps.
 * With prefers-reduced-motion, the finished session is shown at once.
 */
export function HeroTerminal() {
  const t = useUi().home.terminal;
  const script = heroScript(t.welcome);
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  );
  // Lines fully shown, and characters typed of the line after them.
  const [shown, setShown] = useState(0);
  const [chars, setChars] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let line = 0;
    let char = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (line >= script.length) return;
      const current = script[line];
      if (current.kind === "cmd" && char < current.text.length) {
        char += 1;
        setChars(char);
        timer = setTimeout(tick, TYPE_MS);
        return;
      }
      line += 1;
      char = 0;
      setShown(line);
      setChars(0);
      timer = setTimeout(tick, current.kind === "cmd" ? AFTER_TYPED_MS : OUTPUT_MS);
    };
    timer = setTimeout(tick, START_MS);
    return () => clearTimeout(timer);
    // script is rebuilt each render but only changes with the locale's welcome text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, reduced, t.welcome]);

  const visible = reduced ? script.length : shown;
  const finished = visible >= script.length;

  function replay() {
    setShown(0);
    setChars(0);
    setRun((r) => r + 1);
  }

  return (
    <TerminalFrame
      title={`${USER}: ~`}
      className="w-full"
      action={
        !reduced && (
          <button
            type="button"
            onClick={replay}
            disabled={!finished}
            aria-label={t.replay}
            title={t.replay}
            className="rounded p-1.5 text-term-dim hover:text-term-ink disabled:invisible"
          >
            <RotateCcw className="size-3.5" aria-hidden />
          </button>
        )
      }
    >
      {/* The animation is decorative for screen readers; the label describes it once instead of announcing every keystroke. */}
      <div
        role="img"
        aria-label={t.aria}
        dir="ltr"
        className="overflow-x-auto px-4 py-4 text-start font-mono text-[12.5px] leading-7 sm:px-5 sm:text-sm"
      >
        <div aria-hidden>
          {script.map((line, i) => (
            <Line key={i} line={line} state={i < visible ? "done" : i === visible ? "typing" : "hidden"} chars={chars} />
          ))}
          <p className={finished ? "" : "invisible"}>
            <Prompt cwd={finalCwd(script)} />
            <span className="cursor-blink ms-0.5 inline-block h-[1.1em] w-2 translate-y-[3px] bg-term-accent" />
          </p>
        </div>
      </div>
    </TerminalFrame>
  );
}

function Prompt({ cwd }: { cwd: string }) {
  return (
    <span className="select-none">
      <span className="text-term-user">{USER}</span>
      <span>:</span>
      <span className="text-term-path">{cwd}</span>
      <span className="text-term-accent">$</span>{" "}
    </span>
  );
}

function Line({ line, state, chars }: { line: HeroLine; state: "done" | "typing" | "hidden"; chars: number }) {
  if (line.kind === "out") {
    return (
      <p className={`whitespace-pre text-term-ink/80 ${state === "done" ? "" : "invisible"}`}>
        <span dir="auto">{line.text}</span>
      </p>
    );
  }
  const typing = state === "typing";
  return (
    // A command line is visible while it's being typed; before that it only holds its space.
    <p className={`whitespace-pre ${state === "hidden" ? "invisible" : ""}`}>
      <Prompt cwd={line.cwd} />
      {typing ? line.text.slice(0, chars) : line.text}
      {typing && <span className="cursor-blink ms-0.5 inline-block h-[1.1em] w-2 translate-y-[3px] bg-term-accent" />}
    </p>
  );
}
