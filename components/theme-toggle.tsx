"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { useUi } from "@/components/use-locale";

const subscribe = () => () => {};

/** Light/dark switch. Renders a neutral placeholder until mounted, since the server can't know the theme. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const t = useUi().theme;
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t.toLight : t.toDark}
      title={isDark ? t.toLight : t.toDark}
      className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-ink hover:bg-surface-2"
    >
      {mounted ? (
        isDark ? <Sun className="size-[18px]" aria-hidden /> : <Moon className="size-[18px]" aria-hidden />
      ) : (
        <span className="size-[18px]" />
      )}
    </button>
  );
}
