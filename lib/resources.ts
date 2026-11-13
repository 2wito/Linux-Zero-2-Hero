// Further resources (chapter 29), grouped by level. Every URL was checked to load (HTTP 200) on 2026-11-13.
// tests/resources.test.ts checks: https only, no duplicates, both languages filled.

export type ResourceLevel = "beginner" | "intermediate" | "advanced";
export type ResourceKind = "course" | "practice" | "docs" | "book" | "tool" | "community";

export type Resource = {
  url: string;
  title: string;
  level: ResourceLevel;
  kind: ResourceKind;
  /** The language of the site itself. */
  lang: "he" | "en";
  he: string;
  en: string;
};

export const resourceLevels: ResourceLevel[] = ["beginner", "intermediate", "advanced"];

export const resourceKindNames: Record<ResourceKind, { he: string; en: string }> = {
  course: { he: "קורס", en: "Course" },
  practice: { he: "תרגול", en: "Practice" },
  docs: { he: "תיעוד", en: "Docs" },
  book: { he: "ספר", en: "Book" },
  tool: { he: "כלי", en: "Tool" },
  community: { he: "קהילה", en: "Community" },
};

export const resourceLevelIntro: Record<ResourceLevel, { he: string; en: string }> = {
  beginner: { he: "לצד פרקים 1–8: עוד הסברים, עוד תרגול, ועזרה כשנתקעים.", en: "Alongside chapters 1–8: more explanations, more practice, and help when you're stuck." },
  intermediate: { he: "לצד פרקים 9–17: תיעוד רשמי וכלים שעוזרים להבין פקודות.", en: "Alongside chapters 9–17: official docs and tools that help you understand commands." },
  advanced: { he: "לצד פרקים 18–25 ואחריהם: סקריפטים, שירותים, Git, Docker וביצועים.", en: "Alongside chapters 18–25 and beyond: scripts, services, Git, Docker and performance." },
};

export const resources: Resource[] = [
  // Beginner
  {
    url: "https://ubuntu.com/tutorials/command-line-for-beginners",
    title: "The Linux command line for beginners",
    level: "beginner",
    kind: "course",
    lang: "en",
    he: "המדריך הרשמי של Ubuntu לטרמינל: קצר, מסודר, וטוב כחזרה על פרקים 4–6.",
    en: "Ubuntu's official terminal tutorial: short, well ordered, and a good review of chapters 4–6.",
  },
  {
    url: "https://learn.microsoft.com/en-us/windows/wsl/install",
    title: "Install WSL (Microsoft Learn)",
    level: "beginner",
    kind: "docs",
    lang: "en",
    he: "התיעוד הרשמי של Microsoft להתקנת WSL, אם משהו בפרק 3 לא עבד אצלכם.",
    en: "Microsoft's official WSL install guide, in case something in chapter 3 didn't work for you.",
  },
  {
    url: "https://explainshell.com/",
    title: "explainshell",
    level: "beginner",
    kind: "tool",
    lang: "en",
    he: "מדביקים פקודה, ומקבלים הסבר לכל חלק בה. מצוין לפקודות שמצאתם ברשת.",
    en: "Paste a command and get an explanation of every part. Great for commands you found online.",
  },
  {
    url: "https://tldr.sh/",
    title: "tldr pages",
    level: "beginner",
    kind: "tool",
    lang: "en",
    he: "דוגמאות קצרות ומעשיות לכל פקודה, גם בדפדפן. הכלי מפרק 8.",
    en: "Short, practical examples for every command, in the browser too. The tool from chapter 8.",
  },
  {
    url: "https://linuxcommand.org/tlcl.php",
    title: "The Linux Command Line (William Shotts)",
    level: "beginner",
    kind: "book",
    lang: "en",
    he: "ספר שלם על הטרמינל, מאפס ועד סקריפטים, להורדה חינם.",
    en: "A complete book on the terminal, from zero to scripts, free to download.",
  },
  {
    url: "https://overthewire.org/wargames/bandit/",
    title: "OverTheWire: Bandit",
    level: "beginner",
    kind: "practice",
    lang: "en",
    he: "משחק שמתחברים אליו ב-SSH ופותרים שלבים עם פקודות. מתחיל קל ומתקשה בהדרגה.",
    en: "A game you connect to over SSH and solve level by level with commands. Starts easy and ramps up.",
  },
  {
    url: "https://vim-adventures.com/",
    title: "Vim Adventures",
    level: "beginner",
    kind: "practice",
    lang: "en",
    he: "משחק דפדפן שמלמד את מקשי vim. השלבים הראשונים בחינם.",
    en: "A browser game that teaches vim's keys. The first levels are free.",
  },
  {
    url: "https://he.wikipedia.org/wiki/%D7%9C%D7%99%D7%A0%D7%95%D7%A7%D7%A1",
    title: "ויקיפדיה: לינוקס",
    level: "beginner",
    kind: "docs",
    lang: "he",
    he: "הערך העברי על לינוקס: היסטוריה, הפצות ומונחים, בעברית.",
    en: "The Hebrew Wikipedia article on Linux: history, distros and terms.",
  },
  {
    url: "https://www.linux.org.il/",
    title: "לינוקס בישראל",
    level: "beginner",
    kind: "community",
    lang: "he",
    he: "אתר הקהילה הישראלית של לינוקס, בעברית.",
    en: "The Israeli Linux community site, in Hebrew.",
  },
  {
    url: "https://www.hamakor.org.il/",
    title: "המקור (Hamakor)",
    level: "beginner",
    kind: "community",
    lang: "he",
    he: "העמותה הישראלית לקוד פתוח: אירועים, מפגשים וכנסים.",
    en: "The Israeli open source association: events, meetups and conferences.",
  },

  // Intermediate
  {
    url: "https://cmdchallenge.com/",
    title: "Command Challenge",
    level: "intermediate",
    kind: "practice",
    lang: "en",
    he: "אתגרים של שורה אחת בדפדפן: מוצאים, מסננים וסופרים עם צינורות.",
    en: "One-line challenges in the browser: find, filter and count with pipes.",
  },
  {
    url: "https://man7.org/linux/man-pages/",
    title: "Linux man pages (man7.org)",
    level: "intermediate",
    kind: "docs",
    lang: "en",
    he: "דפי ה-man בדפדפן, עם קישורים בין פקודות. נוח לקריאה ארוכה.",
    en: "The man pages in the browser, with links between commands. Comfortable for long reading.",
  },
  {
    url: "https://www.gnu.org/software/coreutils/manual/",
    title: "GNU Coreutils manual",
    level: "intermediate",
    kind: "docs",
    lang: "en",
    he: "התיעוד המלא של `ls`, `cp`, `sort`, `cut` וחבריהן.",
    en: "The full documentation for `ls`, `cp`, `sort`, `cut` and friends.",
  },
  {
    url: "https://wiki.archlinux.org/",
    title: "ArchWiki",
    level: "intermediate",
    kind: "docs",
    lang: "en",
    he: "אחד המקורות הטובים ללינוקס, גם למי שלא משתמש ב-Arch. רוב הדפים נכונים לכל הפצה.",
    en: "One of the best Linux references, even if you don't use Arch. Most pages apply to any distro.",
  },
  {
    url: "https://regex101.com/",
    title: "regex101",
    level: "intermediate",
    kind: "tool",
    lang: "en",
    he: "בודקים ביטוי רגולרי על טקסט לדוגמה, עם הסבר לכל חלק (פרק 13).",
    en: "Test a regular expression on sample text, with an explanation of each part (chapter 13).",
  },
  {
    url: "https://ss64.com/bash/",
    title: "SS64: Bash commands",
    level: "intermediate",
    kind: "docs",
    lang: "en",
    he: "רשימה מסודרת של פקודות Bash, עם הסבר ודוגמאות לכל אחת.",
    en: "A tidy A–Z of Bash commands, with an explanation and examples for each.",
  },
  {
    url: "https://github.com/jlevy/the-art-of-command-line",
    title: "The Art of Command Line",
    level: "intermediate",
    kind: "book",
    lang: "en",
    he: "עמוד אחד עם מאות טיפים לטרמינל, מסודרים לפי נושא.",
    en: "One page with hundreds of terminal tips, organized by topic.",
  },
  {
    url: "https://training.linuxfoundation.org/training/introduction-to-linux/",
    title: "Introduction to Linux (Linux Foundation)",
    level: "intermediate",
    kind: "course",
    lang: "en",
    he: "קורס מקוון וחינמי של ה-Linux Foundation, שמכסה את רוב החומר של המדריך הזה ועוד.",
    en: "A free online course from the Linux Foundation that covers most of this guide and more.",
  },

  // Advanced
  {
    url: "https://www.shellcheck.net/",
    title: "ShellCheck",
    level: "advanced",
    kind: "tool",
    lang: "en",
    he: "מדביקים סקריפט Bash ומקבלים רשימת באגים ומלכודות, עם הסבר לכל אחת.",
    en: "Paste a Bash script and get its bugs and pitfalls, each with an explanation.",
  },
  {
    url: "https://mywiki.wooledge.org/BashGuide",
    title: "BashGuide (Greg's Wiki)",
    level: "advanced",
    kind: "docs",
    lang: "en",
    he: "מדריך Bash מדויק במיוחד, עם דגש על הדרך הנכונה לכתוב סקריפטים.",
    en: "A very precise Bash guide that focuses on the right way to write scripts.",
  },
  {
    url: "https://www.gnu.org/software/bash/manual/",
    title: "GNU Bash manual",
    level: "advanced",
    kind: "docs",
    lang: "en",
    he: "התיעוד הרשמי של Bash: כל תחביר, משתנה ואפשרות.",
    en: "Bash's official documentation: every syntax, variable and option.",
  },
  {
    url: "https://crontab.guru/",
    title: "crontab.guru",
    level: "advanced",
    kind: "tool",
    lang: "en",
    he: "מקלידים ביטוי cron, ורואים במילים מתי הוא ירוץ (פרק 19).",
    en: "Type a cron expression and see in words when it runs (chapter 19).",
  },
  {
    url: "https://www.freedesktop.org/software/systemd/man/latest/",
    title: "systemd manual pages",
    level: "advanced",
    kind: "docs",
    lang: "en",
    he: "התיעוד הרשמי של systemd: units, timers, ו-journalctl.",
    en: "systemd's official docs: units, timers and journalctl.",
  },
  {
    url: "https://documentation.ubuntu.com/server/",
    title: "Ubuntu Server documentation",
    level: "advanced",
    kind: "docs",
    lang: "en",
    he: "המדריך הרשמי לניהול שרת Ubuntu: רשת, אבטחה, שירותים וגיבויים.",
    en: "The official guide to running an Ubuntu server: networking, security, services and backups.",
  },
  {
    url: "https://linuxupskillchallenge.org/",
    title: "Linux Upskill Challenge",
    level: "advanced",
    kind: "course",
    lang: "en",
    he: "חודש של משימה יומית על שרת אמיתי בענן. המשך טבעי לסוף המדריך.",
    en: "A month of daily tasks on a real cloud server. A natural next step after this guide.",
  },
  {
    url: "https://git-scm.com/book/en/v2",
    title: "Pro Git",
    level: "advanced",
    kind: "book",
    lang: "en",
    he: "הספר הרשמי של Git, חינם לקריאה ברשת. ממשיך מאיפה שפרק 23 עוצר.",
    en: "Git's official book, free to read online. Picks up where chapter 23 stops.",
  },
  {
    url: "https://learngitbranching.js.org/",
    title: "Learn Git Branching",
    level: "advanced",
    kind: "practice",
    lang: "en",
    he: "משחק ויזואלי שמלמד ענפים, merge ו-rebase, צעד אחר צעד.",
    en: "A visual game that teaches branches, merge and rebase step by step.",
  },
  {
    url: "https://docs.docker.com/get-started/",
    title: "Docker: Get started",
    level: "advanced",
    kind: "docs",
    lang: "en",
    he: "המדריך הרשמי של Docker: מקונטיינר ראשון ועד Compose.",
    en: "Docker's official guide: from a first container to Compose.",
  },
  {
    url: "https://www.brendangregg.com/linuxperf.html",
    title: "Linux Performance (Brendan Gregg)",
    level: "advanced",
    kind: "docs",
    lang: "en",
    he: "המפה המפורסמת של כלי הביצועים בלינוקס, עם הרצאות ומאמרים (פרק 25).",
    en: "The well-known map of Linux performance tools, with talks and articles (chapter 25).",
  },
  {
    url: "https://www.digitalocean.com/community/tutorials",
    title: "DigitalOcean tutorials",
    level: "advanced",
    kind: "docs",
    lang: "en",
    he: "אלפי מדריכים מעשיים להקמת שרתים ושירותים, צעד אחר צעד.",
    en: "Thousands of hands-on, step-by-step guides for setting up servers and services.",
  },
];
