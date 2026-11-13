"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useLocale, useUi } from "@/components/use-locale";
import type { Locale } from "@/lib/i18n";
import { searchEntries, searchIndexHref, type SearchEntry } from "@/lib/search";

// One fetch per language per visit; the index is a static file built with the site.
const indexCache: Partial<Record<Locale, Promise<SearchEntry[]>>> = {};

function loadIndex(locale: Locale) {
  indexCache[locale] ??= fetch(searchIndexHref(locale))
    .then((r) => (r.ok ? (r.json() as Promise<SearchEntry[]>) : []))
    .catch(() => {
      delete indexCache[locale];
      return [];
    });
  return indexCache[locale];
}

/** Header search button and dialog (Ctrl/Cmd+K) over chapters, their headings, glossary terms and cheat sheet commands. */
export function SiteSearch() {
  const locale = useLocale();
  const t = useUi().search;
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [index, setIndex] = useState<{ locale: Locale; entries: SearchEntry[] } | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const baseId = useId();
  const listId = `${baseId}-list`;

  const entries = index?.locale === locale ? index.entries : null;
  const results = entries ? searchEntries(entries, query) : [];
  const q = query.trim();

  function open() {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    inputRef.current?.focus();
    loadIndex(locale).then((list) => setIndex({ locale, entries: list }));
  }

  const onShortcut = useEffectEvent((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      open();
    }
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => onShortcut(e);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function close() {
    dialogRef.current?.close();
  }

  // The dialog's own close event (Esc, a result, the X button) resets the search for next time.
  function onClosed() {
    setQuery("");
    setActive(0);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!results.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = (active + (e.key === "ArrowDown" ? 1 : -1) + results.length) % results.length;
      setActive(next);
      document.getElementById(`${baseId}-opt-${next}`)?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      close();
      router.push(results[active].href);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label={t.button}
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        title={`${t.button} (Ctrl+K)`}
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-line px-3 text-sm text-muted hover:bg-surface-2 hover:text-ink"
      >
        <Search className="size-4" aria-hidden />
        <span className="hidden @min-[48rem]:inline">{t.label}</span>
        <kbd dir="ltr" className="hidden rounded border border-line px-1.5 font-mono text-[11px] @min-[48rem]:inline">
          {t.shortcut}
        </kbd>
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`${baseId}-label`}
        onClose={onClosed}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto mt-[10vh] w-[calc(100%-2rem)] max-w-xl rounded-2xl border border-line bg-surface p-0 text-ink shadow-lg backdrop:bg-black/50"
      >
        <div className="flex max-h-[75vh] flex-col">
          <div className="flex items-center gap-2 border-b border-line p-3 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:-outline-offset-2 has-[input:focus-visible]:outline-accent">
            <label id={`${baseId}-label`} htmlFor={`${baseId}-input`} className="sr-only">
              {t.label}
            </label>
            <Search className="size-4 shrink-0 text-muted" aria-hidden />
            <input
              ref={inputRef}
              id={`${baseId}-input`}
              type="search"
              dir="auto"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={results.length ? `${baseId}-opt-${active}` : undefined}
              autoComplete="off"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder={t.placeholder}
              className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-muted"
            />
            <button
              type="button"
              onClick={close}
              aria-label={t.close}
              className="grid size-9 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <p role="status" aria-live="polite" className="px-4 pt-3 text-sm text-muted">
            {!entries ? t.loading : !q ? t.hint : results.length ? t.count(results.length) : t.empty(q)}
          </p>
          <ul id={listId} role="listbox" aria-label={t.label} className="overflow-y-auto overscroll-contain p-2">
            {results.map((entry, i) => (
              <li key={`${entry.kind}-${entry.href}-${entry.title}`} id={`${baseId}-opt-${i}`} role="option" aria-selected={i === active}>
                <Link
                  href={entry.href}
                  tabIndex={-1}
                  onClick={close}
                  onMouseMove={() => setActive(i)}
                  className={`block rounded-xl px-3 py-2.5 ${i === active ? "bg-surface-2" : ""}`}
                >
                  <span className="flex items-baseline gap-2">
                    <span className="shrink-0 rounded-full border border-line px-2 text-xs text-muted">{t.kinds[entry.kind]}</span>
                    <span dir="auto" className={`min-w-0 font-medium ${entry.kind === "command" ? "font-mono text-[0.95em]" : ""}`}>
                      {entry.title}
                    </span>
                  </span>
                  <span dir="auto" className="mt-0.5 line-clamp-1 block text-sm text-muted">
                    {entry.text}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
