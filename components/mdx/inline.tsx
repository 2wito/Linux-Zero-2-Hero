// Small inline MDX helpers. All of them are LTR and bidi-isolated so they sit correctly inside Hebrew sentences.

/**
 * A keyboard key, or a whole shortcut: <Kbd>Enter</Kbd> or <Kbd keys="Ctrl+Alt+T" />.
 * A shortcut stays in its typing order (Ctrl, then Alt, then T) even inside Hebrew text.
 */
export function Kbd({ keys, children }: { keys?: string; children?: React.ReactNode }) {
  const parts = keys ? keys.split("+").map((k) => k.trim()) : null;
  const key = (label: React.ReactNode, i = 0) => (
    <kbd
      key={i}
      className="inline-block min-w-[1.75em] rounded-md border border-line border-b-2 bg-surface px-1.5 py-px text-center font-mono text-[0.82em] leading-normal text-ink shadow-[inset_0_-1px_0_var(--line)]"
    >
      {label}
    </kbd>
  );
  return (
    <span dir="ltr" className="inline-flex max-w-full flex-wrap items-baseline gap-1 [unicode-bidi:isolate]">
      {parts
        ? parts.map((p, i) => (
            <span key={i} className="inline-flex items-baseline gap-1">
              {i > 0 && (
                <span aria-hidden className="text-muted">
                  +
                </span>
              )}
              {key(p, i)}
            </span>
          ))
        : key(children)}
    </span>
  );
}

/** An inline command to type in the terminal: <Cmd>sudo apt update</Cmd>. Shows a dim prompt that isn't selected when copying. */
export function Cmd({ children }: { children: React.ReactNode }) {
  return (
    <code
      dir="ltr"
      className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.88em] whitespace-nowrap [unicode-bidi:isolate]"
    >
      <span aria-hidden className="select-none text-muted">
        ${" "}
      </span>
      {children}
    </code>
  );
}

/** <En>Ubuntu 24.04</En>: isolates an English/LTR fragment in Hebrew prose when punctuation or numbers would otherwise jump. */
export function En({ children }: { children: React.ReactNode }) {
  return (
    <bdi dir="ltr" lang="en">
      {children}
    </bdi>
  );
}
