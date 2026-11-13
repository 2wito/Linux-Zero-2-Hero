"use client";

import { Children, isValidElement, useId, type ReactElement } from "react";
import { useUi } from "@/components/use-locale";
import { useLocalStore } from "@/lib/local-store";

export const DISTRO_STORAGE_KEY = "distro";

/** Every distro/platform a tab can show. Labels are proper names, the same in both languages. */
export const distros = {
  ubuntu: { label: "Ubuntu / Debian", tool: "apt" },
  fedora: { label: "Fedora / RHEL", tool: "dnf" },
  arch: { label: "Arch", tool: "pacman" },
  wsl: { label: "WSL", tool: "Windows" },
  macos: { label: "macOS", tool: "Homebrew" },
} as const;

export type DistroId = keyof typeof distros;

type DistroProps = { id: DistroId; children: React.ReactNode };

/** One panel inside <DistroTabs>. */
export function Distro({ children }: DistroProps) {
  return <>{children}</>;
}

/** Index a tablist key moves to, or null. Arrows follow reading direction (in RTL, ArrowLeft is "next"). */
export function tabKeyTarget(key: string, active: number, count: number, rtl: boolean): number | null {
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  const step = key === "ArrowRight" ? 1 : key === "ArrowLeft" ? -1 : 0;
  if (!step) return null;
  return (active + (rtl ? -step : step) + count) % count;
}

/**
 * Commands that differ per distro. Children are <Distro id="..."> panels, shown as tabs in their order.
 * The reader's pick is remembered site-wide: choosing "Fedora" once switches every DistroTabs on every page.
 * A group that doesn't have the remembered distro shows its first tab (without forgetting the pick).
 */
export function DistroTabs({ children }: { children: React.ReactNode }) {
  const [saved, save] = useLocalStore(DISTRO_STORAGE_KEY);
  const baseId = useId();
  const t = useUi().distroTabs;

  const panels = Children.toArray(children).filter(
    (child): child is ReactElement<DistroProps> =>
      isValidElement<DistroProps>(child) && typeof child.props.id === "string" && child.props.id in distros,
  );
  const ids = panels.map((p) => p.props.id);
  const active = Math.max(0, ids.indexOf(saved as DistroId));

  function select(index: number) {
    save(ids[index]);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const next = tabKeyTarget(e.key, active, ids.length, rtl);
    if (next === null) return;
    e.preventDefault();
    select(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  }

  return (
    <div className="mt-6">
      <div
        role="tablist"
        aria-label={t.aria}
        onKeyDown={onKeyDown}
        className="flex flex-wrap gap-1 rounded-xl bg-surface-2 p-1"
      >
        {ids.map((id, i) => (
          <button
            key={id}
            id={`${baseId}-tab-${i}`}
            role="tab"
            type="button"
            aria-selected={i === active}
            aria-controls={`${baseId}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => select(i)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm whitespace-nowrap ${
              i === active ? "bg-surface font-medium text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            <span dir="ltr">{distros[id].label}</span>
          </button>
        ))}
      </div>
      {panels.map((panel, i) => (
        <div
          key={ids[i]}
          id={`${baseId}-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${i}`}
          hidden={i !== active}
          className="[&>*:first-child]:mt-3"
        >
          {panel}
        </div>
      ))}
    </div>
  );
}
