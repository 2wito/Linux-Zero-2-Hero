import Link from "next/link";
import { SquareTerminal } from "lucide-react";
import { docHref, homeHref, switchLocalePath, type Locale } from "@/lib/i18n";
import { AUTHOR, FEEDBACK_EMAIL, hasFeedbackEmail } from "@/lib/site";
import { chapters, chapterText, levels, levelStats } from "@/lib/syllabus";
import { ui } from "@/lib/ui";

const linkClass = "text-muted hover:text-ink hover:underline underline-offset-4";

/** Site footer: brand + tagline, three link columns (guide by level, resources, project), credit line. */
export function SiteFooter({ locale }: { locale: Locale }) {
  const t = ui[locale];
  const f = t.home.footer;
  const home = homeHref(locale);
  const other: Locale = locale === "he" ? "en" : "he";
  const extras = chapters.filter((c) => c.level === "extra" && c.number !== chapters.length);

  const columns = [
    {
      title: f.guide,
      links: levels
        .filter((l) => l !== "extra")
        .map((level) => ({ href: docHref(locale, levelStats(level).first.slug), label: t.levels[level] })),
    },
    {
      title: f.resources,
      links: extras.map((c) => ({ href: docHref(locale, c.slug), label: chapterText(c, locale).title })),
    },
    {
      title: f.project,
      links: [
        { href: `${home}#about`, label: f.about },
        ...(hasFeedbackEmail() ? [{ href: `mailto:${FEEDBACK_EMAIL}`, label: f.feedback }] : []),
        { href: switchLocalePath(home, other), label: t.language.label, lang: other },
      ],
    },
  ];

  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href={home} className="inline-flex items-center gap-2 font-display text-lg">
            <SquareTerminal className="size-6 text-accent" aria-hidden />
            <span dir="ltr">
              {t.brand.name} <span className="text-accent">{t.brand.suffix}</span>
            </span>
          </Link>
          <p className="mt-3 max-w-xs leading-7 text-muted">{f.tagline}</p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-sm font-bold">{column.title}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} lang={"lang" in link ? link.lang : undefined} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-muted sm:flex-row sm:justify-between sm:px-6">
          <p>{f.madeBy(AUTHOR[locale].name)}</p>
          <p>{f.free}</p>
        </div>
      </div>
    </footer>
  );
}
