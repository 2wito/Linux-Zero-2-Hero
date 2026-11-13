"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/** Light/dark via a class on <html>. next-themes injects an inline script that sets the class before paint (no flash). */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
