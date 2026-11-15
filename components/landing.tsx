import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  Clock,
  Code,
  Mail,
  MessageSquarePlus,
  Server,
  Sparkles,
  Unlock,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { ChapterIcon } from "@/components/chapter-icon";
import { HeroTerminal } from "@/components/hero-terminal";
import { DoneMark, LandingProgress } from "@/components/progress-tracker";
import { SiteFooter } from "@/components/site-footer";
import { docHref, type Locale } from "@/lib/i18n";
import { AUTHOR, FEEDBACK_EMAIL, hasFeedbackEmail, NEW_ISSUE_URL } from "@/lib/site";
import { chapters, chapterText, levels, levelStats, type Chapter, type Level } from "@/lib/syllabus";
import { ui, type Ui } from "@/lib/ui";

type Section = { t: Ui; locale: Locale; Forward: LucideIcon };

/**
 * Home page, modeled on the reference landing. Sections alternate between the page background and the
 * surface band so neighbors never share a background: hero, why Linux (band), levels, syllabus (band), about.
 */
export function Landing({ locale }: { locale: Locale }) {
  const t = ui[locale];
  // Forward follows reading direction: in Hebrew, "next" points left.
  const Forward = locale === "en" ? ArrowRight : ArrowLeft;
  const props = { t, locale, Forward };

  return (
    <>
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero {...props} />
        <WhyLinux {...props} />
        <Audience {...props} />
        <Syllabus {...props} />
        <About {...props} />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}

const sectionTitle = "font-display text-3xl leading-tight sm:text-4xl";
const sectionBody = "mt-4 max-w-2xl text-lg leading-8 text-muted";
const container = "mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20";
const band = "border-y border-line bg-surface";

function Hero({ t, locale, Forward }: Section) {
  const h = t.home;
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-24 lg:pb-24">
      <div className="min-w-0">
        <h1 className="font-display text-[2.6rem] leading-[1.08] tracking-tight text-balance min-[400px]:text-5xl sm:text-6xl lg:text-7xl">
          {h.headline[0]} <span className="block whitespace-nowrap text-accent">{h.headline[1]}</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-muted">{h.body}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href={docHref(locale, chapters[0].slug)}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-base font-medium text-accent-ink hover:opacity-90"
          >
            {h.start}
            <Forward className="size-4" aria-hidden />
          </Link>
          <a href="#syllabus" className="rounded-full px-5 py-3.5 font-medium text-ink hover:bg-surface-2">
            {h.all}
          </a>
        </div>
        <p className="mt-7 text-sm text-muted">{h.meta(chapters.length)}</p>
      </div>
      <div className="min-w-0">
        <HeroTerminal />
      </div>
    </section>
  );
}

const reasonIcons: Record<string, LucideIcon> = { Server, Code, Briefcase, Unlock, Wrench, Sparkles };

function WhyLinux({ t }: Section) {
  const w = t.home.why;
  return (
    <section id="why" aria-labelledby="why-title" className={`scroll-mt-20 ${band}`}>
      <div className={container}>
        <h2 id="why-title" className={sectionTitle}>
          {w.title}
        </h2>
        <p className={sectionBody}>{w.body}</p>

        <ul className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {w.reasons.map((reason) => {
            const Icon = reasonIcons[reason.icon] ?? Sparkles;
            return (
              <li key={reason.title} className="rounded-2xl border border-line bg-bg p-6 sm:p-7">
                <Icon className="size-7 text-accent" aria-hidden />
                <h3 className="mt-4 text-xl font-bold">{reason.title}</h3>
                <p className="mt-3 leading-7 text-muted">{reason.body}</p>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 rounded-2xl border border-line bg-bg p-5 sm:p-6">
          <h3 className="font-bold">{w.everywhereTitle}</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {w.everywhere.map((place) => (
              <li key={place} className="rounded-full border border-line bg-surface px-3 py-1 text-sm">
                {place}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const learningLevels = levels.filter((l): l is Exclude<Level, "extra"> => l !== "extra");

function Audience({ t, locale, Forward }: Section) {
  const a = t.home.audience;
  return (
    <section id="audience" aria-labelledby="audience-title" className="scroll-mt-20">
      <div className={container}>
        <h2 id="audience-title" className={sectionTitle}>
          {a.title}
        </h2>
        <p className={sectionBody}>{a.body}</p>

        <ol className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-3">
          {learningLevels.map((level, i) => {
            const stats = levelStats(level);
            const copy = a.levels[level];
            return (
              <li key={level} className="flex flex-col rounded-2xl border border-line bg-surface p-6 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="flex items-center gap-3 text-xl font-bold">
                    <span aria-hidden className="flex items-end gap-0.5">
                      {[0, 1, 2].map((bar) => (
                        <span
                          key={bar}
                          className={`w-1.5 rounded-sm ${bar <= i ? "bg-accent" : "bg-line"}`}
                          style={{ height: `${0.6 + bar * 0.35}rem` }}
                        />
                      ))}
                    </span>
                    {copy.name}
                  </h3>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent tabular-nums">
                    {a.chapters(stats.count)}
                  </span>
                </div>
                <p className="mt-4 font-medium leading-7">{copy.who}</p>
                <p className="mt-2 flex-1 leading-7 text-muted">{copy.learn}</p>
                <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                  <span>{a.range(stats.first.number, stats.last.number)}</span>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" aria-hidden />
                    {a.hours(stats.minutes)}
                  </span>
                </p>
                <Link
                  href={docHref(locale, stats.first.slug)}
                  className="mt-5 inline-flex items-center gap-1.5 self-start font-medium text-accent hover:underline"
                >
                  {a.startAt(stats.first.number)}
                  <Forward className="size-4" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function Syllabus({ t, locale }: Section) {
  const s = t.home.syllabus;
  return (
    <section id="syllabus" aria-labelledby="syllabus-title" className={`scroll-mt-20 ${band}`}>
      <div className={container}>
        <h2 id="syllabus-title" className={sectionTitle}>
          {s.title(chapters.length)}
        </h2>
        <p className={sectionBody}>{s.body}</p>
        <LandingProgress />
        {levels.map((level) => {
          const stats = levelStats(level);
          return (
            <div key={level} className="mt-10">
              <h3 className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-lg font-bold">{t.levels[level]}</span>
                <span className="text-sm text-muted">
                  {level === "extra" ? s.extrasMeta(stats.count) : s.levelMeta(stats.count, t.home.audience.hours(stats.minutes))}
                </span>
              </h3>
              <ChapterGrid items={chapters.filter((c) => c.level === level)} locale={locale} t={t} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ChapterGrid({ items, locale, t }: { items: Chapter[]; locale: Locale; t: Ui }) {
  return (
    <ol className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
      {items.map((chapter) => {
        const text = chapterText(chapter, locale);
        return (
          <li key={chapter.slug} className="bg-bg">
            <Link href={docHref(locale, chapter.slug)} className="group flex h-full gap-4 p-5 hover:bg-surface-2/60">
              <ChapterIcon name={chapter.icon} className="mt-0.5 size-6 shrink-0 text-accent" />
              <span className="min-w-0">
                <span className="flex flex-wrap gap-x-2 text-sm text-muted tabular-nums">
                  <span>
                    {t.chapter.label} {chapter.number}
                  </span>
                  <span aria-hidden>·</span>
                  <span>{t.chapter.minutes(chapter.minutes)}</span>
                </span>
                <span className="mt-0.5 flex items-start gap-2 font-bold leading-snug group-hover:text-accent">
                  <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{text.title}</span>
                  <DoneMark slug={chapter.slug} className="mt-0.5 size-[18px]" />
                </span>
                <span className="mt-1.5 block text-sm leading-6 text-muted">{text.summary}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

function About({ t, locale, Forward }: Section) {
  const a = t.home.about;
  const author = AUTHOR[locale];
  const finish = chapters[chapters.length - 1];
  // Initials from the first letter of each name part (e.g. "איתי טויטו" → "אט").
  const initials = author.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-20">
      <div className={`${container} grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16`}>
        <div>
          <h2 id="about-title" className={sectionTitle}>
            {a.title}
          </h2>
          <p className="mt-4 text-lg leading-8">{a.lead}</p>
          <ul className="mt-6 space-y-3">
            {a.points.map((point) => (
              <li key={point} className="flex gap-3 leading-7">
                <Check className="mt-1.5 size-4 shrink-0 text-ok" strokeWidth={3} aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <Link
            href={docHref(locale, finish.slug)}
            className="mt-6 inline-flex items-center gap-1.5 font-medium text-accent hover:underline"
          >
            {a.more}
            <Forward className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="space-y-5">
          <figure className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5">
            <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full bg-accent font-display text-xl text-accent-ink">
              {initials}
            </span>
            <figcaption className="min-w-0">
              <span className="block text-sm text-muted">{a.authorLabel}</span>
              <span className="block text-lg font-bold">{author.name}</span>
              <span className="mt-0.5 block text-sm leading-6 text-muted">{author.bio}</span>
            </figcaption>
          </figure>

          <div className="rounded-2xl border border-line bg-surface p-5">
            <p className="font-bold">{a.feedbackTitle}</p>
            <p className="mt-1.5 leading-7 text-muted">{a.feedbackBody}</p>
            {hasFeedbackEmail() ? (
              <a
                href={`mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(t.brand.name + " " + t.brand.suffix)}`}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent px-5 py-2.5 font-medium text-accent hover:bg-accent/10"
              >
                <Mail className="size-4" aria-hidden />
                {a.feedbackCta}
              </a>
            ) : (
              <a
                href={NEW_ISSUE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent px-5 py-2.5 font-medium text-accent hover:bg-accent/10"
              >
                <MessageSquarePlus className="size-4" aria-hidden />
                {a.feedbackIssue}
                <span className="sr-only">{t.resources.external}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
