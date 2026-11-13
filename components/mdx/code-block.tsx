"use client";

import { useRef } from "react";
import { CopyButton } from "@/components/copy-button";
import { useUi } from "@/components/use-locale";

const shellLanguages = new Set(["bash", "sh", "shell", "zsh", "console"]);
const plainLanguages = new Set(["text", "plaintext", "txt"]);

/** Fenced code block: dark LTR box with a title bar (title or language) and a copy button. */
export function CodeBlock({
  title,
  language,
  children,
}: {
  title?: React.ReactNode;
  language?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const t = useUi().code;
  const label =
    title ??
    (!language || plainLanguages.has(language) ? "" : shellLanguages.has(language) ? t.terminal : language.toUpperCase());

  return (
    <div className="mt-5 overflow-hidden rounded-xl bg-term text-term-ink ring-1 ring-black/5 dark:ring-white/10">
      <div dir="ltr" className="flex items-center justify-between gap-3 border-b border-white/10 py-1.5 ps-4 pe-2">
        <span dir="auto" className="truncate text-xs text-term-dim">
          {label}
        </span>
        <CopyButton getText={() => ref.current?.innerText.trim() ?? ""} />
      </div>
      <div ref={ref} dir="ltr" className="code-body overflow-x-auto text-start">
        {children}
      </div>
    </div>
  );
}
