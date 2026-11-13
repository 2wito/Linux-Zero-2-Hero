"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check } from "lucide-react";
import { FONT_SCALE_KEY, fontScales } from "@/lib/i18n";
import { useDismiss } from "@/components/use-dismiss";
import { useUi } from "@/components/use-locale";

/** Sets the root font size and remembers it (the default size is stored as "nothing"). */
function applyScale(value: string) {
  document.documentElement.style.fontSize = value === fontScales[0] ? "" : value;
  try {
    if (value === fontScales[0]) localStorage.removeItem(FONT_SCALE_KEY);
    else localStorage.setItem(FONT_SCALE_KEY, value);
  } catch {}
}

/** Text-size picker. Scales the root font size, so every rem-based size on the site grows with it.
 *  The saved size is applied before paint by bootScript (lib/i18n.ts). */
export function FontSizeControl() {
  const t = useUi().fontSize;
  const [scale, setScale] = useState<string>(fontScales[0]);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, ref, buttonRef);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FONT_SCALE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from storage after mount
      if (saved && (fontScales as readonly string[]).includes(saved)) setScale(saved);
    } catch {}
  }, []);

  function choose(value: string) {
    setScale(value);
    applyScale(value);
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t.button}
        title={t.button}
        onClick={() => setOpen((o) => !o)}
        className="grid h-10 min-w-10 shrink-0 place-items-center rounded-full border border-line px-2 font-bold text-ink hover:bg-surface-2"
      >
        <span aria-hidden className="leading-none" dir="ltr">
          <span className="text-xs">A</span>
          <span className="text-base">A</span>
        </span>
      </button>
      {open && (
        <div
          id={menuId}
          role="radiogroup"
          aria-label={t.button}
          className="absolute end-0 top-12 z-50 w-48 rounded-xl border border-line bg-surface p-1.5 shadow-lg"
        >
          {fontScales.map((value, i) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={scale === value}
              onClick={() => choose(value)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start hover:bg-surface-2"
            >
              <span className="grid size-4 place-items-center text-accent">
                {scale === value && <Check className="size-4" aria-hidden />}
              </span>
              <span className="flex-1">{t.options[i]}</span>
              <span aria-hidden className="text-muted" style={{ fontSize: `${0.75 * (1 + i * 0.19)}rem` }}>
                א
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
