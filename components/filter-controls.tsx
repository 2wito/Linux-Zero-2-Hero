"use client";

import { useId } from "react";
import { Search } from "lucide-react";

/** Lowercased, trimmed query words. An entry matches when every word appears in one of its texts. */
export function matchesQuery(query: string, texts: string[]) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const all = texts.join(" ").toLowerCase();
  return words.every((w) => all.includes(w));
}

/** Search box shared by the glossary and the cheat sheet. */
export function SearchField({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}) {
  const id = useId();
  return (
    <div className="relative print:hidden">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted" aria-hidden />
      <input
        id={id}
        type="search"
        dir="auto"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-surface py-3 ps-10 pe-4 text-base placeholder:text-muted"
      />
    </div>
  );
}

/** A row of toggle chips ("All" plus one per category); exactly one is pressed. */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
  allLabel,
}: {
  options: { id: T; label: string }[];
  value: T | "all";
  onChange: (value: T | "all") => void;
  label: string;
  allLabel: string;
}) {
  const items: { id: T | "all"; label: string }[] = [{ id: "all", label: allLabel }, ...options];
  return (
    <div role="group" aria-label={label} className="mt-3 flex flex-wrap gap-2 print:hidden">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={value === item.id}
          onClick={() => onChange(item.id)}
          className={`rounded-full border px-3.5 py-1.5 text-sm ${
            value === item.id ? "border-accent bg-accent font-medium text-accent-ink" : "border-line text-muted hover:border-accent hover:text-ink"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
