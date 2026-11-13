@AGENTS.md

# Linux Hebrew 0 to Hero

A free documentation site that teaches Linux from absolute zero to advanced (terminal, files, permissions, text tools, scripting, systemd, security, Git, Docker). Audience: friends, family and the Hebrew-speaking community. Not commercial.

- Full plan, syllabus, design tokens and build phases: `docs/PLAN.md` (source of truth; follow it).
- Design reference (READ-ONLY, never edit): `C:\Users\itay3\Desktop\claude-zero-2-hero`.
- Author: Itay Twito / איתי טויטו. Site constants (name, author, feedback email) live in `lib/site.ts`.

## Stack

- Next.js 16 (App Router, Turbopack, `cacheComponents` on) + TypeScript + React 19.
- Tailwind CSS v4 (CSS-first config in `app/globals.css`, loaded via `@tailwindcss/turbopack`).
- MDX via `@next/mdx` with `remark-gfm`, `rehype-slug`, `rehype-pretty-code` + shiki. Plugins are referenced **by string name** in `next.config.ts` (Turbopack requirement).
- `lucide-react` icons, `next-themes` (class-based dark mode), Vitest. Deploy target: Vercel.
- Next 16 differs from older versions: read `node_modules/next/dist/docs/` before using an API you're unsure of. Notably, `dynamicParams` is not allowed with Cache Components (call `notFound()` instead) and `generateStaticParams` must return at least one param.

## Structure

- `app/(he)/...` → Hebrew at `/` and `/docs/<slug>`; `app/(en)/en/...` → English at `/en/...`. Two root layouts (via `components/root-shell.tsx`) so `lang`/`dir` are correct in server HTML.
- Route files are thin; shared logic is in `components/locale-routes.tsx`.
- `lib/syllabus.ts`: all 30 chapters (number, slug, level, minutes, icon, `he`/`en` title + summary). Add chapters here first.
- `lib/content.ts`: slug → MDX import per locale. A chapter not in the map renders a placeholder.
- `content/docs/*.mdx` (Hebrew), `content/docs-en/*.mdx` (English), same slugs.
- `lib/ui.ts`: every UI string, `{ he, en }` with one shared type. No hard-coded UI text in components.

## Hebrew / RTL rules

1. Hebrew is the primary language and the source of truth; English mirrors it.
2. All user-facing text (UI, nav, metadata, `aria-label`, alt text) exists in both languages via `lib/ui.ts` or the syllabus.
3. Use logical Tailwind utilities only: `ms-/me-`, `ps-/pe-`, `start-/end-`, `text-start/text-end`, `border-s/e`. Never `ml-/mr-/pl-/pr-/left-/right-/text-left/text-right` for layout (exception: inside forced-LTR code/terminal boxes).
4. Commands, paths, flags and code are always LTR: fenced blocks and terminals get `dir="ltr"`; inline `code` gets `dir="ltr"` + `unicode-bidi: isolate` (handled in `mdx-components.tsx` / `globals.css`).
5. Mixed Hebrew/code lines in terminal output use `unicode-bidi: plaintext`.
6. Directional icons follow reading direction (in Hebrew, "next" points left).
7. Writing style: plural address ("פתחו", "הקלידו"), short paragraphs, one concept at a time, an everyday analogy before each abstract idea. Technical terms stay in English.
8. Accessibility: keyboard-operable everything, visible focus ring, `aria-live` for feedback, respect `prefers-reduced-motion`, text contrast ≥ 4.5:1 in both themes.

## Design tokens

Amber accent + green `--ok` secondary on warm stone surfaces; tokens in `app/globals.css` (`bg, surface, surface-2, ink, muted, line, accent, accent-ink, ok, term, term-ink, term-dim, term-user, term-path, term-accent`). Use the Tailwind names (`bg-surface`, `text-muted`, `bg-term`...), not raw hex.
Inside terminal/code boxes (always dark) use `text-term-accent`, never `text-accent`. `tests/contrast.test.ts` enforces 4.5:1 for every pair in both themes; run it after changing any color.
Fonts: IBM Plex Sans Hebrew (`font-sans`), Secular One (`font-display`), IBM Plex Mono (`font-mono`).

## Writing chapters (MDX components)

- `<TerminalWindow title="~/projects" user="dana@ubuntu" copy={false}>{\`...\`}</TerminalWindow>`: content MUST be a template literal (MDX would otherwise reformat it as Markdown). Lines starting with `$ ` are commands; everything else is output. Copy copies commands only. `user` and `copy` are optional.
- Fenced code: ` ```bash title="backup.sh" ` gets a title bar + copy button (shell languages are labeled "טרמינל"). Use `text` for plain output.
- `<Callout type="info|tip|warning|danger" title="...">`: title optional (Hebrew/English default per page).
- Inline code is automatically LTR + isolated; no wrapper needed. `<Cmd>sudo apt update</Cmd>` = a command to type (dim `@AGENTS.md

# Linux Hebrew 0 to Hero

A free documentation site that teaches Linux from absolute zero to advanced (terminal, files, permissions, text tools, scripting, systemd, security, Git, Docker). Audience: friends, family and the Hebrew-speaking community. Not commercial.

- Full plan, syllabus, design tokens and build phases: `docs/PLAN.md` (source of truth; follow it).
- Design reference (READ-ONLY, never edit): `C:\Users\itay3\Desktop\claude-zero-2-hero`.
- Author: Itay Twito / איתי טויטו. Site constants (name, author, feedback email) live in `lib/site.ts`.

## Stack

- Next.js 16 (App Router, Turbopack, `cacheComponents` on) + TypeScript + React 19.
- Tailwind CSS v4 (CSS-first config in `app/globals.css`, loaded via `@tailwindcss/turbopack`).
- MDX via `@next/mdx` with `remark-gfm`, `rehype-slug`, `rehype-pretty-code` + shiki. Plugins are referenced **by string name** in `next.config.ts` (Turbopack requirement).
- `lucide-react` icons, `next-themes` (class-based dark mode), Vitest. Deploy target: Vercel.
- Next 16 differs from older versions: read `node_modules/next/dist/docs/` before using an API you're unsure of. Notably, `dynamicParams` is not allowed with Cache Components (call `notFound()` instead) and `generateStaticParams` must return at least one param.

## Structure

- `app/(he)/...` → Hebrew at `/` and `/docs/<slug>`; `app/(en)/en/...` → English at `/en/...`. Two root layouts (via `components/root-shell.tsx`) so `lang`/`dir` are correct in server HTML.
- Route files are thin; shared logic is in `components/locale-routes.tsx`.
- `lib/syllabus.ts`: all 30 chapters (number, slug, level, minutes, icon, `he`/`en` title + summary). Add chapters here first.
- `lib/content.ts`: slug → MDX import per locale. A chapter not in the map renders a placeholder.
- `content/docs/*.mdx` (Hebrew), `content/docs-en/*.mdx` (English), same slugs.
- `lib/ui.ts`: every UI string, `{ he, en }` with one shared type. No hard-coded UI text in components.

## Hebrew / RTL rules

1. Hebrew is the primary language and the source of truth; English mirrors it.
2. All user-facing text (UI, nav, metadata, `aria-label`, alt text) exists in both languages via `lib/ui.ts` or the syllabus.
3. Use logical Tailwind utilities only: `ms-/me-`, `ps-/pe-`, `start-/end-`, `text-start/text-end`, `border-s/e`. Never `ml-/mr-/pl-/pr-/left-/right-/text-left/text-right` for layout (exception: inside forced-LTR code/terminal boxes).
4. Commands, paths, flags and code are always LTR: fenced blocks and terminals get `dir="ltr"`; inline `code` gets `dir="ltr"` + `unicode-bidi: isolate` (handled in `mdx-components.tsx` / `globals.css`).
5. Mixed Hebrew/code lines in terminal output use `unicode-bidi: plaintext`.
6. Directional icons follow reading direction (in Hebrew, "next" points left).
7. Writing style: plural address ("פתחו", "הקלידו"), short paragraphs, one concept at a time, an everyday analogy before each abstract idea. Technical terms stay in English.
8. Accessibility: keyboard-operable everything, visible focus ring, `aria-live` for feedback, respect `prefers-reduced-motion`, text contrast ≥ 4.5:1 in both themes.

## Design tokens

Amber accent + green `--ok` secondary on warm stone surfaces; tokens in `app/globals.css` (`bg, surface, surface-2, ink, muted, line, accent, accent-ink, ok, term, term-ink, term-dim, term-user, term-path, term-accent`). Use the Tailwind names (`bg-surface`, `text-muted`, `bg-term`...), not raw hex.
Inside terminal/code boxes (always dark) use `text-term-accent`, never `text-accent`. `tests/contrast.test.ts` enforces 4.5:1 for every pair in both themes; run it after changing any color.
Fonts: IBM Plex Sans Hebrew (`font-sans`), Secular One (`font-display`), IBM Plex Mono (`font-mono`).

## Writing chapters (MDX components)

- `<TerminalWindow title="~/projects" user="dana@ubuntu" copy={false}>{\`...\`}</TerminalWindow>`: content MUST be a template literal (MDX would otherwise reformat it as Markdown). Lines starting with `$ ` are commands; everything else is output. Copy copies commands only. `user` and `copy` are optional.
- Fenced code: ` ```bash title="backup.sh" ` gets a title bar + copy button (shell languages are labeled "טרמינל"). Use `text` for plain output.
- `<Callout type="info|tip|warning|danger" title="...">`: title optional (Hebrew/English default per page).
 prompt).
- `<Kbd>Enter</Kbd>` or `<Kbd keys="Ctrl+Alt+T" />` (shortcut keeps typing order in Hebrew text). `<En>Ubuntu 24.04</En>` isolates an LTR fragment.
- `<DistroTabs><Distro id="ubuntu|fedora|arch|wsl|macos">…</Distro></DistroTabs>`: the reader's pick is remembered site-wide (`lib/local-store.ts`).
- `<Steps>` + `### heading` per step. `<Checklist id="unique-id" title="…" items={["… `cmd` …"]} />` (remembered per id). `<RecapCards title="…" items={[{ title, body }]} />`. String props support `backticks`.
- `<TerminalSimulator mission="navigate" />`: safe practice shell (fake Bash over an in-memory FS, `lib/simulator/`: `fs.ts`, `parse.ts`, `shell.ts`, `missions.ts`). `mission` is optional (seed files, chips, task list). Error text is copied from real Ubuntu 24.04 runs; every mistake also gets a hint key whose he/en text lives in `lib/ui.ts` → `simulator.hints`. A real command or option the simulator lacks gets a "not in the simulator" hint, never a fake error. Tests: `tests/simulator.test.ts`.
- Progress: `lib/progress.ts` (key `linux-progress:v1`, via `useLocalStore`, pure `with*` helpers tested in `tests/progress.test.ts`) + `components/progress-tracker.tsx` (`ProgressBar` in DocsChrome, `CompleteButton` on learning chapters, `DoneMark` in sidebar/landing, `LandingProgress`). Quizzes record answers (all right = chapter done); finished simulator missions are recorded too. Extras (26–30) never count.
- Reference pages are data-driven: `<CheatSheet />` (ch. 26, `lib/cheatsheet.ts`, printable), `<Glossary />` (ch. 27, `lib/glossary.ts`), `<Resources />` (ch. 29, `lib/resources.ts`; check a new URL loads before adding it), `<Challenges />` (ch. 28, `lib/challenges.ts`: 4 per level, solutions run on WSL; beginner ones use `challenge-*` simulator missions, and `tests/simulator.test.ts` runs each published solution against its mission). Ch. 30 uses `<FinishProgress />` and `<Feedback />` (`components/finish.tsx`; GitHub issues via `REPO_URL` in `lib/site.ts`, email only once `FEEDBACK_EMAIL` is set). Cheat sheet commands must match how their chapter teaches them.
- English (`content/docs-en/`) mirrors every Hebrew chapter; `tests/chapter-structure.test.ts` checks the English template ("What you'll learn", "## Summary", "## Quick quiz"), identical quiz answers and the same count of terminals, code blocks, callouts, exercises and sections. Change a Hebrew chapter → change its English file in the same edit. Terminal output stays as captured; if translated input changes the output (e.g. sorting words), re-run it in WSL.
- Site search (Ctrl+K, `components/site-search.tsx`): `lib/search.ts` (matching, client) + `lib/search-index.ts` (build-time index of chapters, h2/h3 headings with rehype-slug ids, glossary terms, cheat sheet commands) served by `app/search-index/[locale]/route.ts` as static JSON (keep it `●` in the build output: the `"use cache"` wrapper is what makes it static).
- SEO: `lib/seo.ts` (per-page title/description/canonical/hreflang/OG/Twitter + JSON-LD: `WebSite`+`Course` on the landing page, `TechArticle`+`BreadcrumbList` per chapter, rendered by `components/json-ld.tsx`), strings in `lib/ui.ts` → `meta`. Social cards: `lib/og.tsx` via `app/og/[locale]` and `app/og/[locale]/[slug]` (Hebrew lines are reversed for the renderer; fonts are fetched from Google Fonts at build time, so the build needs network). Icons: `app/icon.svg`, `app/apple-icon.tsx`, `app/icons/[file]` (`lib/brand-icon.tsx`). `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`. Image/data route handlers wrap their work in a `"use cache"` function so they prerender (●) under Cache Components.
- `SITE_URL` (`lib/site.ts`): `NEXT_PUBLIC_SITE_URL`, else Vercel’s production URL, else localhost. Set `NEXT_PUBLIC_SITE_URL` when there is a custom domain.
- After changing a component, check it on a chapter that uses it in both themes (the `/docs/playground` page was removed before deploy).
- Per-reader preferences go through `useLocalStore` (`lib/local-store.ts`), never raw `localStorage` in components.
- Never put invisible characters (RLM/LRM marks, bidi overrides, zero-width chars, NBSP) in source; `tests/invisible-chars.test.ts` fails on them. Use `<En>`, `dir="auto"`, inline code or a named constant (e.g. `String.fromCharCode(160)`) instead.
- Landing page: `components/landing.tsx` (copy in `lib/ui.ts` → `home`). Level counts/times come from `levelStats()` in `lib/syllabus.ts`; never hard-code them. The hero demo script is `lib/hero-script.ts`.

## Chapter content rules

- Template (enforced by `tests/chapter-structure.test.ts`): `# title` → `<Callout type="info" title="מה נלמד בפרק">` → concept sections (analogy first, then the command) → 1–2 `<Exercise title="…">…<Solution>…</Solution></Exercise>` → `## סיכום` + `<RecapCards>` → `## בוחן קצר` + `<MiniQuiz>` with exactly 3 questions.
- Quiz/recap/checklist strings support `backticks` and **bold**. Quiz `why` texts must not start with "נכון." (the component already prints "נכון!").
- **Every command output shown must come from a real run**, never typed from memory. WSL with Ubuntu 24.04 is available on this machine: run the chapter's command sequence in a `mktemp -d` sandbox (no sudo, no installs) and paste the transcript. Terminal lists are shown in `ls` column layout (`COLUMNS=80 ls -C | expand`).
- Use `<DistroTabs>` whenever install/package commands differ (Ubuntu `apt`, Fedora `dnf`, Arch `pacman`).
- New terms go in `lib/glossary.ts` (he + en, with the chapter that teaches them).
- Before anything destructive (`rm -rf`, `chmod 777`, `dd`, `mkfs`, `sudo`, `> file`, `-delete`, `prune`), add a `<Callout type="warning">` (or `danger`) right before it.
- Interactive output (job control, `read`, prompts, `apt` progress lines) must be captured in a real TTY (`script -qc` driving `bash -i`); non-TTY runs print different text (e.g. apt's "stable CLI interface" warning).
- Commands that need sudo, installs or a service not available locally are shown in a fenced block **without** output, never with invented output. Chapter 24 (Docker) is entirely in this state until real `docker` runs are captured.
- Verified gotcha: on Ubuntu 24.04 the apt `tealdeer` (1.6.1) can't download tldr pages (its archive URL now serves HTML). Recommend `sudo snap install tldr` on Ubuntu, `tealdeer` + `tldr --update` on Fedora/Arch.

## Commands

- `npm run dev`, `npm run build`, `npm run lint`, `npm test`, `npm run ci` (lint + test + build).

## Working rules

- Work phase by phase per `docs/PLAN.md`; stop and wait for approval at the end of each phase.
- Git: repo is https://github.com/2wito/Linux-Zero-2-Hero (branch `main`). Commit or push only when the owner asks. Vercel deploys every push to `main` to https://linux-zero-2-hero.vercel.app.
- Never read `node_modules/` (except `node_modules/next/dist/docs/`), `.next/`, `out/`, logs or `.env*`.
- Edit files with targeted changes; don't rewrite a whole file to change part of it.
