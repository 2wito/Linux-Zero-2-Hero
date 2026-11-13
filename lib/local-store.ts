"use client";

import { useCallback, useSyncExternalStore } from "react";

// A tiny localStorage-backed store for per-reader preferences (chosen distro, checklist ticks).
// Every access is wrapped in try/catch: storage can be blocked (private mode, disabled site data),
// and the UI must still work, just without remembering.

const EVENT = "local-store-change";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocalStore(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
  // Notify this tab (the native "storage" event only fires in other tabs).
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
}

function subscribe(key: string, onChange: () => void) {
  const onLocal = (e: Event) => {
    if ((e as CustomEvent<string>).detail === key) onChange();
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === key || e.key === null) onChange();
  };
  window.addEventListener(EVENT, onLocal);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onLocal);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * The raw stored string for `key` (null when missing, blocked, or during server render), kept in sync
 * across every component on the page and across browser tabs.
 */
export function useLocalStore(key: string): [string | null, (value: string | null) => void] {
  const value = useSyncExternalStore(
    useCallback((onChange) => subscribe(key, onChange), [key]),
    () => read(key),
    () => null,
  );
  const set = useCallback((next: string | null) => writeLocalStore(key, next), [key]);
  return [value, set];
}
