# תוכנית: Linux Hebrew 0 to Hero

> Status: **PLAN ONLY**, updated with the owner's answers (see §7). No code has been written.
> Reference project (read-only): `C:\Users\itay3\Desktop\claude-zero-2-hero`
> (the path in the brief, `cluade-projects\...`, doesn't exist; this is the one that matches.)

---

## 1. Goals and principles

- A free docs site that teaches Linux from "never opened a terminal" to shell scripting, services, security and Docker. **Hebrew is the primary language; an English version is available through a language switch** in the header (same pattern as the reference).
- **RTL first**: Hebrew pages render `<html lang="he" dir="rtl">` server-side; English pages render `<html lang="en" dir="ltr">` from a separate root layout. All UI text, nav, metadata, `aria-label`s and alt text exist in both languages (Hebrew is written first and is the source of truth).
- **Bidi discipline**: commands, paths, flags and code are always LTR and isolated:
  - Fenced code blocks and terminal windows: `dir="ltr"` containers (as in reference `code-block.tsx`).
  - Inline code: `<code dir="ltr">` with `unicode-bidi: isolate` so `ls -la` never flips punctuation around it.
  - English terms inside Hebrew prose (e.g. "Ubuntu", "WSL"): plain text works in most cases; an `<En>` (`<bdi>`) MDX helper exists for tricky cases (terms followed by punctuation or numbers).
  - Lines that mix Hebrew and code inside terminal output use `unicode-bidi: plaintext` (reference `.code-body [data-line]`).
- **Writing style** (same voice as the reference chapters): plural address ("פתחו", "הקלידו"), short paragraphs, one concept per section, an everyday analogy before every abstract idea (filesystem = ארון עם מגירות, permissions = מפתחות לחדרים, pipe = פס ייצור, process = עובד במשרד, package manager = חנות אפליקציות).
- **Safe to experiment**: every dangerous command (`rm -rf`, `chmod 777`, `dd`) gets a Warning callout; practice happens in the in-browser simulator first.
- Accessibility parity with the reference: skip link, focus-visible ring, `prefers-reduced-motion`, keyboard-operable tabs/quiz, `aria-live` feedback, font-size control, 4.5:1 text contrast in both themes.

---

## 2. Final syllabus

Default distro for examples: **Ubuntu** (with Fedora/Arch tabs where commands differ).
Slugs are English (shareable, URL-safe); titles are Hebrew. Numbers drive the sidebar and prev/next.

### שלב א׳: מתחילים (Beginner)

| # | Slug | Title (HE) | One-line goal |
|---|------|-----------|---------------|
| 1 | `01-what-is-linux` | מה זה לינוקס ולמה זה חשוב | להבין מה זו מערכת הפעלה, מה זה Linux/Kernel, ואיפה לינוקס כבר נמצא בחיים שלכם (טלפון, שרתים, ראוטר). |
| 2 | `02-distros` | הפצות: איזה לינוקס לבחור | להכיר הפצות (Ubuntu, Mint, Fedora, Debian, Arch) ולבחור אחת בלי לחץ. |
| 3 | `03-getting-linux` | איך משיגים לינוקס | להגיע לטרמינל עובד: WSL ב-Windows, מכונה וירטואלית, Dual Boot, שרת בענן, או הטרמינל של macOS כגשר. |
| 4 | `04-first-terminal-steps` | צעדים ראשונים בטרמינל | לפתוח טרמינל, לקרוא את ה-prompt, להריץ פקודה ראשונה ולהבין מבנה של פקודה (פקודה, אפשרויות, ארגומנטים). |
| 5 | `05-filesystem-navigation` | ניווט במערכת הקבצים | `pwd`, `ls`, `cd`, נתיב מלא מול יחסי, `~`, `.`, `..`, ומפת התיקיות (`/etc`, `/home`, `/var`...). |
| 6 | `06-files-and-directories` | עבודה עם קבצים ותיקיות | `mkdir`, `touch`, `cp`, `mv`, `rm`, תווים כלליים (`*`, `?`), ואיך לא למחוק בטעות. |
| 7 | `07-viewing-editing` | צפייה ועריכה של קבצים | `cat`, `less`, `head`, `tail -f`, עריכה ב-`nano`, והישרדות בסיסית ב-`vim` (כולל איך יוצאים). |
| 8 | `08-getting-help` | איך מוצאים עזרה | `man`, `--help`, `tldr`, `apropos`, `type`/`which`, ואיך לקרוא הודעת שגיאה. |

### שלב ב׳: ביניים (Intermediate)

| # | Slug | Title (HE) | One-line goal |
|---|------|-----------|---------------|
| 9 | `09-users-permissions` | משתמשים, קבוצות והרשאות | `rwx`, `chmod` (סמלי ומספרי), `chown`, קבוצות, `sudo` ולמה root מסוכן. |
| 10 | `10-package-management` | ניהול תוכנות וחבילות | `apt` / `dnf` / `pacman`, מאגרים, עדכונים, וגם Snap ו-Flatpak בקצרה. |
| 11 | `11-processes-jobs` | תהליכים ומשימות | `ps`, `top`/`htop`, `kill`, סיגנלים, `&`, `jobs`, `fg`/`bg`, `Ctrl+C` מול `Ctrl+Z`. |
| 12 | `12-pipes-redirection` | צינורות והפניות | `>`, `>>`, `<`, `2>`, `2>&1`, `|`, `tee`, ורעיון "כלים קטנים שמתחברים". |
| 13 | `13-text-tools` | כלי טקסט: grep, sed, awk ועוד | `grep`, `sort`, `uniq`, `cut`, `wc`, `tr`, ומבוא עדין ל-`sed` ו-`awk` (+ regex בסיסי). |
| 14 | `14-finding-things` | חיפוש קבצים ופקודות | `find` (שם, סוג, גודל, זמן), `locate`, `which`, `xargs`. |
| 15 | `15-environment-shell` | משתני סביבה והגדרות ה-Shell | `env`, `export`, `PATH`, `.bashrc`/`.profile`, `alias`, היסטוריה וקיצורי מקלדת. |
| 16 | `16-networking-basics` | רשתות בסיסיות | `ip a`, `ping`, `curl`/`wget`, DNS בקצרה, פורטים (`ss`), `ssh` ו-`scp`. |
| 17 | `17-archives-compression` | דחיסה וארכיונים | `tar` (c/x/t, z/J), `gzip`, `zip`/`unzip`, וטבלת "איזה דגל לבחור". |

> Change from the brief: "pipes, redirection and text tools" is split into ch. 12 and ch. 13; it's too much for one sitting for beginners.

### שלב ג׳: מתקדמים (Advanced)

| # | Slug | Title (HE) | One-line goal |
|---|------|-----------|---------------|
| 18 | `18-bash-scripting` | כתיבת סקריפטים ב-Bash | shebang, משתנים, קלט, `if`, לולאות, פונקציות, exit codes, `set -euo pipefail`, וסקריפט גיבוי אמיתי. |
| 19 | `19-cron-systemd` | אוטומציה: cron ו-systemd | `crontab`, תחביר cron, `systemctl` (start/enable/status), ויצירת service + timer פשוטים. |
| 20 | `20-logs` | לוגים ו-journalctl | `/var/log`, `journalctl` (`-u`, `-f`, `--since`), `dmesg`, ואיך מחפשים תקלה בלוג. |
| 21 | `21-disks-storage` | דיסקים ואחסון | `df -h`, `du -sh`, `lsblk`, `mount`/`umount`, `/etc/fstab` במבט ראשון, ומה זה מערכת קבצים. |
| 22 | `22-security-basics` | אבטחה בסיסית | `sudo` נכון, עדכונים, `ufw`, מפתחות SSH (`ssh-keygen`, `ssh-copy-id`), הקשחת SSH, עקרון ההרשאה המינימלית. |
| 23 | `23-git-basics` | Git על לינוקס | התקנה והגדרה, `init`/`clone`, `add`/`commit`/`log`, branches, ו-push ל-GitHub עם מפתח SSH. |
| 24 | `24-docker-intro` | מבוא ל-Docker | קונטיינר מול VM, `docker run`/`ps`/`images`/`logs`, Dockerfile ראשון, ו-volumes. |
| 25 | `25-performance-troubleshooting` | ביצועים ופתרון תקלות | `free`, `uptime`/load, `htop`, `iostat`/`vmstat`, ושיטת עבודה: "מה השתנה? מה הלוג אומר?". |

### נספחים (Extras, not counted in progress)

| # | Slug | Title (HE) | Purpose |
|---|------|-----------|---------|
| 26 | `26-cheat-sheet` | דף פקודות מהיר | Searchable, filterable command table (by chapter/category), copy per command, printable. |
| 27 | `27-glossary` | מילון מונחים | Searchable glossary, Hebrew + English term, linked to the chapter that teaches it. |
| 28 | `28-challenges` | אתגרי תרגול | Graded challenges per level with hints and hidden solutions; some runnable in the simulator. |
| 29 | `29-resources` | מקורות להמשך | Curated links (docs, books, practice sites, Hebrew communities), labelled by level. |
| 30 | `30-finish` | סיימתם! אודות ומשוב | Wrap-up, "what next", about the project, credits, feedback. |

**Chapter template** (every learning chapter 1–25):
1. Title + one-line "מה נלמד בפרק" + estimated time.
2. Analogy intro.
3. Concept sections (`##`), each: explanation → `<Terminal>` example with output → "נסו בעצמכם".
4. `<TerminalSimulator mission="...">` where the topic fits (chapters 4–7, 9, 12–14 at minimum).
5. "טעויות נפוצות" Warning/Tip callouts.
6. `<RecapCards>` summary.
7. `<MiniQuiz>` (3–5 questions, each wrong answer explains why).
8. Complete button + prev/next.

---

## 3. Route and folder structure

Two languages, same approach as the reference: **two root layouts in route groups** so `lang`/`dir` are correct in the server HTML. Hebrew lives at the root (`/`, `/docs/...`), English under `/en` (`/en`, `/en/docs/...`). Shared page logic sits in `components/locale-routes.tsx`, so each route file is a few lines (reference `app/(he)/docs/[slug]/page.tsx`).

```
Hebrew-Linux/
├─ app/
│  ├─ (he)/
│  │  ├─ layout.tsx            # RootShell locale="he" → <html lang="he" dir="rtl">
│  │  ├─ page.tsx              # Landing (he)
│  │  ├─ not-found.tsx         # 404 with a "command not found" terminal
│  │  ├─ [...missing]/page.tsx # catch-all → notFound() inside the right layout
│  │  └─ docs/
│  │     ├─ layout.tsx         # DocsChrome: sidebar + ProgressBar
│  │     ├─ page.tsx           # redirect → /docs/01-what-is-linux
│  │     └─ [slug]/page.tsx    # generateStaticParams, dynamicParams=false, generateMetadata
│  ├─ (en)/en/                 # mirror of (he) with locale="en" → <html lang="en" dir="ltr">
│  ├─ globals.css              # tokens + @theme inline + code/terminal styles
│  ├─ og/[locale]/route.tsx · og/[locale]/[slug]/route.tsx   # OG images per locale
│  ├─ search-index/[locale]/route.ts                         # static JSON index for Ctrl+K search
│  ├─ sitemap.ts (with hreflang alternates) · robots.ts · manifest.ts · icon.svg · apple-icon.tsx
├─ components/
│  ├─ site-header.tsx · docs-sidebar.tsx · chapter-page.tsx · landing.tsx
│  ├─ hero-terminal.tsx · terminal-window.tsx · TerminalSimulator.tsx
│  ├─ callout.tsx · copy-button.tsx · platform-tabs.tsx · theme-toggle.tsx · theme-provider.tsx
│  ├─ font-size-control.tsx · site-search.tsx · ProgressTracker.tsx · MiniQuiz.tsx
│  ├─ Glossary.tsx · CheatSheet.tsx · Challenge.tsx · FeedbackSection.tsx · json-ld.tsx
│  ├─ tools/  PermissionCalculator.tsx · CronExplainer.tsx · CommandAnatomy.tsx
│  └─ mdx/    code-block.tsx · tabs.tsx · recap-cards.tsx · checklist.tsx · en.tsx · kbd.tsx
├─ content/docs/              # Hebrew: 01-what-is-linux.mdx … 30-finish.mdx
├─ content/docs-en/           # English translations, same slugs
├─ lib/
│  ├─ i18n.ts                 # Locale type, dir(), docHref(), homeHref(), switchLocalePath(), bootScript
│  ├─ syllabus.ts             # chapters[]: number, slug, level, minutes, icon, he:{title,summary}, en:{title,summary}
│  ├─ content.ts              # locale → slug → () => import(".../<slug>.mdx")
│  ├─ ui.ts                   # all UI strings, { he: {...}, en: {...} } with a shared type
│  ├─ progress.ts             # localStorage progress + quiz results (ported)
│  ├─ glossary.ts · cheatsheet.ts · challenges.ts · resources.ts   # each entry carries he + en text
│  ├─ facts.ts                # versioned facts that can go stale (Ubuntu LTS, WSL commands, etc.)
│  ├─ seo.ts · og.tsx · search.ts
│  └─ simulator/  fs.ts (virtual FS) · parse.ts (tokenize, pipes, redirects) · commands.ts · missions.ts
├─ mdx-components.tsx
├─ public/                    # fonts for OG (Hebrew TTF), static images
├─ tests/                     # vitest: simulator, progress, tabs, syllabus/content consistency
├─ docs/PLAN.md
├─ next.config.ts · postcss.config.mjs · tsconfig.json · eslint.config.mjs · vitest.config.ts
└─ CLAUDE.md · README.md
```

URLs: `/`, `/docs/<slug>`, `/en`, `/en/docs/<slug>`, `/sitemap.xml`, `/robots.txt`. Landing anchors: `#syllabus`, `#audience`, `#about`.
The language switch keeps you on the same page (`/docs/05-...` ↔ `/en/docs/05-...`). Progress, tab choices and font size are shared across both languages (slugs are identical). An English chapter that isn't translated yet shows its title, summary and a "coming soon" note (reference behavior).

---

## 4. Design system

### 4.1 Fonts (identical to reference `components/root-shell.tsx`)

| Role | Font | CSS var | Tailwind |
|------|------|---------|----------|
| Body | IBM Plex Sans Hebrew 400/500/700 (`hebrew`, `latin`) | `--font-plex` | `font-sans` |
| Display (h1/h2, chapter numbers) | Secular One 400 | `--font-secular` | `font-display` |
| Code / terminal | IBM Plex Mono 400/500 | `--font-plex-mono` | `font-mono` |

Loaded with `next/font/google`. Base sizes from reference `mdx-components.tsx`: body `text-lg leading-8`, h1 `text-4xl sm:text-5xl`, h2 `text-2xl sm:text-3xl mt-14`.

### 4.2 Color tokens

Same token **names and roles** as reference `app/globals.css`, re-colored around an **amber** accent (the glow of an old amber-phosphor terminal). Surfaces shift from the reference's green-grey to a warm stone neutral so amber sits naturally. Because the accent is now amber, the reference's amber `--sun` role becomes a **green** secondary (`--ok`): success output, correct quiz answers, done checkmarks. Two new terminal tokens give realistic Bash prompts (`user@host` green, path blue).

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--bg` | `#f4f1ea` | `#12100c` | page background |
| `--surface` | `#ffffff` | `#1a1712` | cards, header menu |
| `--surface-2` | `#e9e3d6` | `#241f17` | hover, active sidebar item, inline code |
| `--ink` | `#2a2116` | `#efe8dc` | text |
| `--muted` | `#625646` | `#b3a690` | secondary text |
| `--line` | `#ddd4c3` | `#352e23` | borders |
| `--accent` | `#9c4a08` | `#f5b041` | links, buttons, progress, focus ring |
| `--accent-ink` | `#ffffff` | `#2a1700` | text on accent |
| `--ok` (replaces `--sun`) | `#286c40` | `#5fd68a` | tips, correct answers, done states, success output |
| `--term` | `#16120c` | `#0b0907` | terminal body |
| `--term-ink` | `#ece3d3` | `#ece3d3` | terminal text |
| `--term-dim` | `#9a8b74` | `#85775f` | terminal title bar text, comments |
| `--term-user` *(new)* | `#5fd68a` | `#5fd68a` | `user@ubuntu` in prompts |
| `--term-path` *(new)* | `#6cb6ff` | `#6cb6ff` | `~/projects` in prompts |
| `--term-accent` *(new)* | `#f5b041` | `#f5b041` | amber inside terminals (caret, `$`, highlights); terminals are dark in both themes, so they can't use the light-mode `--accent` |

| `--info` *(phase 5)* | `#1d5fa8` | `#7cb8f5` | `info` callout |
| `--danger` *(phase 5)* | `#b42318` | `#ff8a7a` | `danger` callout |

Callouts (phase 5): `info` = blue `--info` ("לידיעתכם"), `tip` = green `--ok` ("טיפ"), `warning` = amber `--accent` ("שימו לב"), `danger` = red `--danger` ("זהירות!"). Default titles come from `lib/ui.ts`; `title="..."` overrides. Quiz: correct = green, wrong = soft red with the explanation (amber is reserved for the accent so a wrong answer doesn't look "selected").
Exact hex values get a contrast check in phase 1 (target ≥ 4.5:1 for `ink`, `muted`, `accent` on `bg`/`surface`; ≥ 4.5:1 for terminal colors on `--term`). Enforced by `tests/contrast.test.ts` (every pair, both themes). Light-mode amber and green were darkened to `#9c4a08` / `#286c40` in phase 3 so they pass on `bg` and `surface-2` too.
Dark mode: `next-themes` with `attribute="class"`, `@custom-variant dark (&:where(.dark, .dark *))` as in the reference. Traffic lights stay `#ff5f57 / #febc2e / #28c840`.

### 4.3 Shape and spacing

- Big cards: `rounded-2xl border border-line bg-surface p-7`; inner cards/callouts/code: `rounded-xl`; pills/buttons: `rounded-full`.
- Content max width `max-w-6xl` page, ~`max-w-3xl` reading column; header `h-16 sticky bg-bg/85 backdrop-blur border-b`.
- Chapter grid on landing: `gap-px bg-line` "hairline grid" trick from reference `landing.tsx`.
- Logical properties only (`ps-`, `pe-`, `ms-`, `start-`, `end-`, `text-start`) so RTL is automatic.

### 4.4 Component list

| Component | Purpose | Modeled on (reference) |
|-----------|---------|------------------------|
| `RootShell` | html (lang/dir per locale)/fonts/theme/skip link/boot script | `components/root-shell.tsx` |
| `locale-routes.tsx`, `use-locale.ts` | shared route bodies + metadata per locale, locale hook | `components/locale-routes.tsx`, `use-locale.ts`, `lib/i18n.ts` |
| `SiteHeader` | logo (`SquareTerminal`), nav, search, **language switch (עברית / English)**, font size, theme; container-query collapse + mobile menu | `components/site-header.tsx` |
| `DocsSidebar` | numbered chapters grouped by level (3 headings + extras), active state, done checkmarks; `<details>` on mobile, sticky on `lg` | `components/docs-sidebar.tsx` |
| `ChapterPage` | chapter label, MDX content, CompleteButton, prev/next (RTL arrows) | `components/chapter-page.tsx` |
| `Landing` | hero, features, syllabus grid, audience, about, CTA, footer | `components/landing.tsx` |
| `HeroTerminal` | animated typed Linux session | `components/hero-terminal.tsx` |
| `TerminalWindow` (`<Terminal>` in MDX) | static macOS-style window: commands + output, copy commands only | `hero-terminal.tsx` frame + `mdx/code-block.tsx` copy |
| `CodeBlock` | fenced code (rehype-pretty-code), title bar label, copy | `components/mdx/code-block.tsx` + `mdx-components.tsx` `CodeFigure` |
| `CopyButton` | clipboard + fallback + "הועתק!" feedback, `aria-live` | `components/copy-button.tsx` |
| `Callout` | `note`/`info`/`tip`/`warning` | `components/callout.tsx` |
| `Tabs`/`Tab` + `PlatformTabs` | synced, remembered tab groups (`distro`, `platform`) | `components/mdx/tabs.tsx`, `components/os-tabs.tsx` |
| `ProgressBar`, `CompleteButton`, `useProgress` | localStorage progress, per-level counts | `components/ProgressTracker.tsx`, `lib/progress.ts` |
| `MiniQuiz` | instant feedback, retry, first-try score | `components/MiniQuiz.tsx` |
| `Glossary` | search + category filter | `components/Glossary.tsx` |
| `FontSizeControl`, `ThemeToggle` | a11y controls | `components/font-size-control.tsx`, `theme-toggle.tsx` |
| `SiteSearch` | Ctrl+K search over chapter headings | `components/site-search.tsx`, `lib/search.ts` |
| `RecapCards`, `Checklist` | chapter summary, setup checklists | `components/mdx/recap-cards.tsx`, `checklist.tsx` |
| `FeedbackSection`, `AboutSection` | final page + landing: author **Itay Twito / איתי טויטו**, feedback via a `mailto:` button (pre-filled subject per page, e.g. "משוב על פרק 5") | `components/FeedbackSurvey.tsx` (layout only, no form backend), `AboutSection.tsx` |
| `JsonLd` | structured data | `components/json-ld.tsx` |
| **New:** `CheatSheet`, `Challenge`, `CommandAnatomy`, `PermissionCalculator`, `CronExplainer`, `En`, `Kbd` | see §5 | styling from `Glossary.tsx` / `callout.tsx` |

Not ported: `PromptBuilder`, `PromptHub`, `TokenCalculator`, `ClaudeConfigGenerator`, library filter, `official-facts` check script (replaced by a simpler `lib/facts.ts`).

MDX pipeline (same as reference `next.config.ts`): `@next/mdx` with plugins referenced **by name** (Turbopack-serializable): `remark-gfm`, `rehype-slug`, `rehype-pretty-code` (`theme: "github-dark"`, `keepBackground: false`), shiki.

---

## 5. Interactive components

### 5.1 `HeroTerminal` (landing)
Typed demo of a beginner's first minute:
`whoami` → `pwd` → `ls` → `cd projects` → `cat welcome.txt` (Hebrew output: "ברוכים הבאים ללינוקס!") → `echo "שלום עולם"`.
Bash-style prompt `you@ubuntu:~$` using `--term-user`/`--term-path`. Replay button, `prefers-reduced-motion` shows final state, `aria-label` describes the demo in Hebrew.

### 5.2 `<Terminal>` (static window for chapters)
```mdx
<Terminal title="~/projects">
$ ls -l
-rw-r--r-- 1 dana dana 120 Nov 11 10:00 notes.txt
$ cat notes.txt
</Terminal>
```
Lines starting with `$ ` (or `# ` for root) render as prompt + command; everything else is output (dim). Copy button copies **only the commands**, never output. Optional `prompt="dana@ubuntu"` prop.

### 5.3 `TerminalSimulator` (practice shell, fully client-side, no real execution)
- **Virtual filesystem** (`lib/simulator/fs.ts`): in-memory tree seeded per mission, with owners/permissions, reset button.
- **Parser** (`parse.ts`): quotes, `~`, `.`/`..`, globs (`*`), pipes `|`, redirects `>`, `>>`, `2>`; `&&`.
- **Commands** (`commands.ts`), realistic output and real error messages (`No such file or directory`) plus a Hebrew hint line:
  `pwd ls(-l -a -h) cd mkdir(-p) touch cat echo cp(-r) mv rm(-r, refuses "-rf /" with a teaching message) head tail wc grep(-i -n -v) sort uniq cut chmod(octal+symbolic) chown(simulated) whoami id clear history help man(short Hebrew summary) tree date uname which`.
- **Missions** (`missions.ts`): `<TerminalSimulator mission="create-project-folder" />` shows a Hebrew task list ("צרו תיקייה בשם projects", "העבירו לתוכה את notes.txt") with live checkmarks via FS-state predicates; completing a mission records it in progress.
- History with ↑/↓, Tab completion for file names, suggestion chips (from reference), `role="log" aria-live="polite"`.
- Unit-tested heavily (it's the riskiest piece).

### 5.4 Distro / platform tabs
- `<Tabs groupId="distro" items={["Ubuntu / Debian", "Fedora", "Arch"]}>` for package commands (ch. 10, and anywhere `apt` appears).
- `<Tabs groupId="platform" items={["Windows (WSL)", "macOS", "Linux"]}>` for ch. 3 and setup steps; first visit auto-detects OS (reference `detectOs`).
- Choice is synced across all tab groups on the page and remembered (localStorage); arrow keys follow RTL direction.
- `PlatformTabs` on the landing page: "how to get a terminal" in one command per platform (`wsl --install`, open Terminal, `Ctrl+Alt+T`).

### 5.5 `MiniQuiz`
Ported: options with per-answer `why`, wrong answer → soft red + explanation + retry, right → green (`--ok`) and locks. First-try score saved; answering all correctly auto-completes the chapter.

### 5.6 Progress
- `ProgressBar` at top of every docs page: overall "X מתוך 25 פרקים" + three small segments (מתחילים / ביניים / מתקדמים).
- Sidebar checkmarks, landing syllabus cards show done state, CompleteButton with quiz score, reset with confirm.
- Storage key `linux-progress:v1`, all wrapped in try/catch, works with storage blocked.

### 5.7 Smaller tools (chapter-specific)
- `CommandAnatomy` (ch. 4): hover/tap each part of `ls -la /home` → "פקודה / אפשרויות / ארגומנט".
- `PermissionCalculator` (ch. 9): 3×3 checkboxes ↔ `755` ↔ `rwxr-xr-x` ↔ ready `chmod` command, copyable.
- `CronExplainer` (ch. 19): type `*/15 9-17 * * 1-5` → Hebrew explanation ("כל 15 דקות, בין 9:00 ל-17:00, בימים א׳–ה׳").
- `CheatSheet` (ch. 26): filter by level/category + search, copy per row, print stylesheet.
- `Challenge` (ch. 28): task, `<details>` hint, `<details>` solution, optional "open in simulator" with a seeded mission.

---

## 6. Build order (phases)

Each phase ends with `npm run lint && npm test && npm run build` green and a short visual check in the browser (light + dark, desktop + 375px mobile, RTL).

### Phase 1: Scaffold
- `create-next-app` (latest stable Next.js, App Router, TS, Tailwind v4, ESLint, Turbopack), then add `@next/mdx @mdx-js/loader @types/mdx remark-gfm rehype-slug rehype-pretty-code shiki lucide-react next-themes vitest`.
- `next.config.ts` MDX setup, `mdx-components.tsx` skeleton, `globals.css` amber tokens (both themes) + contrast check, fonts, `(he)` and `(en)` root layouts via `RootShell`, ThemeProvider, boot script for font scale.
- `lib/i18n.ts`, `lib/syllabus.ts` with all 30 chapters (he + en titles/summaries), `lib/content.ts`, `lib/ui.ts` (he + en), `/docs/[slug]` and `/en/docs/[slug]` rendering a placeholder for chapters without MDX yet.
- `.gitignore`, `CLAUDE.md`, README. **No `git init`**: the owner sets up git and sends the repo later.

### Phase 2: Components (design system)
- Header, sidebar (grouped by level), docs layout, ChapterPage + prev/next, ThemeToggle, FontSizeControl.
- CodeBlock + CopyButton, Callout, `<Terminal>`, Tabs/PlatformTabs, RecapCards, Checklist, `En`, `Kbd`, base `MiniQuiz` and `ProgressTracker` ported (they are small and content needs them).
- **Every MDX component name used by content is registered in this phase** (simple versions are fine) so content in phase 4 always compiles.
- `/docs/playground` (noindex, removed before deploy) renders every component in forced-light and forced-dark scopes.

### Phase 3: Landing
- Hero (title, CTA, HeroTerminal), "למה לינוקס" feature cards, "איך מתחילים" PlatformTabs card, syllabus grid by level, audience cards (מתחילים מאפס / מפתחים / סקרנים), about, closing CTA, footer, 404 page.

### Phase 4: Content (largest phase, written in batches, one review by the owner at the end)
- 4a Beginner ch. 1–8 · 4b Intermediate ch. 9–17 · 4c Advanced ch. 18–25 · 4d Extras ch. 26–30 + glossary/cheatsheet/challenges data (Hebrew).
- 4e English: translate all 30 chapters into `content/docs-en/` and fill the `en` side of glossary/cheatsheet/challenges. A consistency test fails the build if a Hebrew chapter has no English file or the quiz question counts differ.
- Every command in every chapter is checked on a real Ubuntu shell (WSL) before it's published; version-sensitive facts go in `lib/facts.ts` with a "last checked" date.
- Quizzes are written with the chapter (data inside MDX).

### Phase 5: Interactivity
- TerminalSimulator (fs, parser, commands, missions) + tests; wire missions into chapters 4–7, 9, 12–14.
- Progress per level, mission completion, landing done-state.
- PermissionCalculator, CronExplainer, CommandAnatomy, CheatSheet filters, Challenge component, Glossary search, SiteSearch (Ctrl+K) + search index.
- Accessibility pass: keyboard-only walkthrough, screen reader labels, reduced motion, 200% font scale.

### Phase 6: SEO and deploy
- `generateMetadata` per chapter and locale (title/description, canonical, `alternates.languages` he ↔ en + `x-default` → Hebrew, `og:locale` he_IL / en_US), OG images per locale (Hebrew font embedded; RTL text handled as in reference `lib/og.tsx`), `sitemap.ts` with hreflang, `robots.ts`, `manifest.ts`, icons, JSON-LD (`Course` on landing, `TechArticle` + `BreadcrumbList` per chapter, author Itay Twito).
- Lighthouse pass (performance, a11y, SEO ≥ 95), remove `/docs/playground` and `content/playground.mdx`.
- No analytics in v1 (not needed for a free guide; Vercel Web Analytics can be added later in one line if wanted).
- Once the owner has set up the git repo: link Vercel project, preview deploy → check → production deploy (only after the owner's OK).

---

## 7. Decisions (answered by the owner)

| # | Topic | Decision |
|---|-------|----------|
| 1 | Site name | **Linux Hebrew 0 to Hero**. Header shows "Linux Hebrew" + "0 to Hero"; Hebrew hero headline "לינוקס בעברית, מ-0 ל-Hero". Domain: `*.vercel.app` for now. |
| 2 | Accent | **Amber** (§4.2), green as the secondary. |
| 3 | Languages | **Hebrew primary + English version with a language switch** (§3, phase 4e). |
| 4 | Feedback / About | **`mailto:` email link**; author credited as **Itay Twito (איתי טויטו)**, B.Sc. Computer Science student at HIT (Holon Institute of Technology) / סטודנט לתואר ראשון במדעי המחשב ב-HIT (מכון טכנולוגי חולון). |
| 5 | Syllabus | Not answered; proceeding with §2 as written (25 chapters + 5 extras, Ubuntu default). Easy to change before phase 4. |
| 6 | Site search | **Yes**, Ctrl+K, per locale. |
| 7 | Analytics | Only if needed → **none in v1**. |
| 8 | Git | **Owner sets up git and sends the repo later**; no `git init` by me. |
| 9 | Content review | **One review at the end** of phase 4. |

### Still open (needed before phase 3/4, not before phase 1)

- **Feedback email address**: owner will send it later. Until then the address lives in one constant (`lib/site.ts`, `FEEDBACK_EMAIL`) with a placeholder; while it's still the placeholder, the feedback button is hidden (`hasFeedbackEmail()`).
- ~~Hebrew spelling of the name~~: confirmed **איתי טויטו**.
- Content license for the repo (e.g. CC BY-SA 4.0 for text, MIT for code), or none. Not needed until deploy.
