"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useId, useRef, useState } from "react";
import { Languages, Menu, SquareTerminal, X } from "lucide-react";
import { docHref, homeHref, switchLocalePath, type Locale } from "@/lib/i18n";
import { chapters } from "@/lib/syllabus";
import { FontSizeControl } from "./font-size-control";
import { SiteSearch } from "./site-search";
import { ThemeToggle } from "./theme-toggle";
import { useDismiss } from "./use-dismiss";
import { useLocale, useUi } from "./use-locale";

type NavLink = { href: string; label: string };

const slugOf = (n: number) => chapters.find((c) => c.number === n)!.slug;

function navLinks(locale: Locale, t: ReturnType<typeof useUi>["nav"]): NavLink[] {
  return [
    { href: `${homeHref(locale)}#syllabus`, label: t.syllabus },
    { href: docHref(locale, chapters[0].slug), label: t.guide },
    { href: docHref(locale, slugOf(26)), label: t.cheatSheet },
    { href: docHref(locale, slugOf(27)), label: t.glossary },
    { href: `${homeHref(locale)}#about`, label: t.about },
  ];
}

/** The page links that the header hides on narrow screens, as a small menu. */
function MobileMenu({ links, pathname }: { links: NavLink[]; pathname: string }) {
  const t = useUi().menu;
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, ref, buttonRef);

  return (
    <div ref={ref} className="@min-[60rem]:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? t.close : t.open}
        onClick={() => setOpen((o) => !o)}
        className="grid size-10 place-items-center rounded-full border border-line text-ink hover:bg-surface-2"
      >
        {open ? <X className="size-[18px]" aria-hidden /> : <Menu className="size-[18px]" aria-hidden />}
      </button>
      {open && (
        <ul id={menuId} className="absolute inset-x-4 top-[calc(100%+0.5rem)] z-50 rounded-xl sm:inset-x-6 border border-line bg-surface p-1.5 shadow-lg">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-start hover:bg-surface-2 aria-[current=page]:font-medium aria-[current=page]:text-accent"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const locale = useLocale();
  const t = useUi();
  const other: Locale = locale === "he" ? "en" : "he";
  const links = navLinks(locale, t.nav);

  return (
    <header className="@container sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur print:hidden">
      {/* Breakpoints are container queries in rem, so items collapse earlier when the text size is enlarged. */}
      <div className="relative mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <Link href={homeHref(locale)} aria-label={`${t.brand.name} ${t.brand.suffix}, ${t.nav.home}`} className="flex items-center gap-2 font-display text-lg">
          <SquareTerminal className="size-6 shrink-0 text-accent" aria-hidden />
          <span dir="ltr" className="hidden whitespace-nowrap @min-[26rem]:inline">
            {t.brand.name} <span className="hidden text-accent @min-[40rem]:inline">{t.brand.suffix}</span>
          </span>
        </Link>

        <nav aria-label={t.nav.aria} className="ms-auto hidden items-center gap-1 text-sm @min-[60rem]:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className="rounded-full px-3 py-2 text-muted hover:text-ink aria-[current=page]:font-medium aria-[current=page]:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1.5 @min-[60rem]:ms-2 sm:gap-2">
          <SiteSearch />
          <MobileMenu links={links} pathname={pathname} />
          <Link
            href={switchLocalePath(pathname, other)}
            hrefLang={other}
            lang={other}
            aria-label={t.language.aria}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-line px-3 text-sm font-medium hover:bg-surface-2"
          >
            <Languages className="hidden size-4 @min-[40rem]:block" aria-hidden />
            {t.language.label}
          </Link>
          <FontSizeControl />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
