"use client";

import { Check, Copy, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useUi } from "@/components/use-locale";

// navigator.clipboard only exists in secure contexts (https, localhost). Fall back to a hidden
// textarea + execCommand so copying still works on e.g. a LAN address over http.
async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

/** Copy-to-clipboard button with visible + announced feedback ("הועתק!"). Styled for dark terminal headers by default. */
export function CopyButton({
  text,
  getText,
  label,
  className = "text-term-ink hover:bg-white/10",
}: {
  text?: string;
  getText?: () => string;
  /** Accessible name for the idle state, e.g. "העתקת הפקודות". */
  label?: string;
  className?: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const t = useUi().copy;

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    const ok = await writeClipboard(getText ? getText() : (text ?? ""));
    setStatus(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 1800);
  }

  const visible = status === "copied" ? t.copied : status === "failed" ? t.failed : t.copy;

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={status === "idle" ? (label ?? t.aria) : visible}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 font-sans text-xs font-medium ${className}`}
    >
      {status === "copied" ? (
        <Check className="size-3.5 text-term-user" aria-hidden />
      ) : status === "failed" ? (
        <X className="size-3.5" aria-hidden />
      ) : (
        <Copy className="size-3.5" aria-hidden />
      )}
      <span aria-live="polite">{visible}</span>
    </button>
  );
}
