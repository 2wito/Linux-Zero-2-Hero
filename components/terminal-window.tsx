"use client";

import { CopyButton } from "@/components/copy-button";
import { TerminalFrame } from "@/components/terminal-frame";
import { useUi } from "@/components/use-locale";
import { commandsText, parseTerminal } from "@/lib/terminal";

/** Keeps an empty output line one line tall. */
const NBSP = String.fromCharCode(160);

/**
 * macOS-style terminal window for chapters. Pass the session as a template literal so MDX keeps it verbatim:
 *
 *   <TerminalWindow title="~/projects">{`
 *   $ ls
 *   notes.txt  photos
 *   `}</TerminalWindow>
 *
 * Lines starting with "$ " are commands (prompt in amber); everything else is output.
 * `user="dana@ubuntu"` shows a full Bash prompt (dana@ubuntu:~/projects$). `copy={false}` hides the copy button.
 */
export function TerminalWindow({
  title = "~",
  user,
  prompt = "$",
  copy = true,
  children,
}: {
  title?: string;
  user?: string;
  prompt?: string;
  copy?: boolean;
  children: string;
}) {
  const t = useUi();
  if (typeof children !== "string") {
    throw new Error('<TerminalWindow> expects its content as a template literal: <TerminalWindow>{`$ ls`}</TerminalWindow>');
  }
  const lines = parseTerminal(children, prompt);
  const commands = commandsText(lines);

  return (
    <TerminalFrame
      role="group"
      aria-label={t.code.terminalAria(title)}
      title={title}
      action={copy && commands ? <CopyButton text={commands} label={t.copy.ariaCommands} /> : null}
      className="mt-5"
    >
      <div dir="ltr" className="overflow-x-auto px-4 py-3.5 text-start font-mono text-[13px] leading-6 sm:text-sm">
        {lines.map((line, i) =>
          line.kind === "cmd" ? (
            <p key={i} className="whitespace-pre">
              <span className="select-none">
                {user && (
                  <>
                    <span className="text-term-user">{user}</span>
                    <span className="text-term-ink">:</span>
                    <span className="text-term-path">{title}</span>
                  </>
                )}
                <span className="text-term-accent">{prompt}</span>{" "}
              </span>
              {line.text}
            </p>
          ) : (
            <p key={i} className="whitespace-pre-wrap text-term-ink/80">
              {/* dir="auto" isolates Hebrew output so its punctuation lands right, while the line keeps the alignment of the LTR box. */}
              <span dir="auto">{line.text || NBSP}</span>
            </p>
          ),
        )}
      </div>
    </TerminalFrame>
  );
}
