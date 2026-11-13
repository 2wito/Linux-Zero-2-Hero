import type { Locale } from "@/lib/i18n";

export type Level = "beginner" | "intermediate" | "advanced" | "extra";

export type ChapterText = { title: string; summary: string };

export type Chapter = {
  number: number;
  slug: string;
  level: Level;
  /** Estimated reading + practice time. */
  minutes: number;
  /** lucide-react icon name, mapped to a component in the UI. */
  icon: string;
  he: ChapterText;
  en: ChapterText;
};

export const levels: Level[] = ["beginner", "intermediate", "advanced", "extra"];

export const chapters: Chapter[] = [
  // Beginner
  {
    number: 1,
    slug: "01-what-is-linux",
    level: "beginner",
    minutes: 10,
    icon: "MonitorCog",
    he: { title: "מה זה לינוקס ולמה זה חשוב", summary: "מה זו מערכת הפעלה, מה זה Linux, ואיפה לינוקס כבר נמצא בחיים שלכם." },
    en: { title: "What Linux Is and Why It Matters", summary: "What an operating system is, what Linux is, and where Linux already runs in your life." },
  },
  {
    number: 2,
    slug: "02-distros",
    level: "beginner",
    minutes: 10,
    icon: "Layers",
    he: { title: "הפצות: איזה לינוקס לבחור", summary: "Ubuntu, Mint, Fedora, Debian ו-Arch: מה ההבדל ואיך בוחרים בלי לחץ." },
    en: { title: "Distros: Which Linux to Pick", summary: "Ubuntu, Mint, Fedora, Debian and Arch: how they differ and how to choose without stress." },
  },
  {
    number: 3,
    slug: "03-getting-linux",
    level: "beginner",
    minutes: 20,
    icon: "Download",
    he: { title: "איך משיגים לינוקס", summary: "WSL ב-Windows, מכונה וירטואלית, Dual Boot, שרת בענן, או הטרמינל של macOS." },
    en: { title: "Getting Linux", summary: "WSL on Windows, a virtual machine, dual boot, a cloud server, or the macOS terminal." },
  },
  {
    number: 4,
    slug: "04-first-terminal-steps",
    level: "beginner",
    minutes: 15,
    icon: "SquareTerminal",
    he: { title: "צעדים ראשונים בטרמינל", summary: "פותחים טרמינל, קוראים את ה-prompt, ומריצים את הפקודה הראשונה." },
    en: { title: "First Steps in the Terminal", summary: "Open a terminal, read the prompt, and run your first command." },
  },
  {
    number: 5,
    slug: "05-filesystem-navigation",
    level: "beginner",
    minutes: 20,
    icon: "FolderTree",
    he: { title: "ניווט במערכת הקבצים", summary: "pwd, ls ו-cd, נתיבים מלאים ויחסיים, ומפת התיקיות של לינוקס." },
    en: { title: "Navigating the Filesystem", summary: "pwd, ls and cd, absolute and relative paths, and the Linux directory map." },
  },
  {
    number: 6,
    slug: "06-files-and-directories",
    level: "beginner",
    minutes: 20,
    icon: "Files",
    he: { title: "עבודה עם קבצים ותיקיות", summary: "יוצרים, מעתיקים, מזיזים ומוחקים קבצים, ולומדים איך לא למחוק בטעות." },
    en: { title: "Files and Directories", summary: "Create, copy, move and delete files, and learn how not to delete by accident." },
  },
  {
    number: 7,
    slug: "07-viewing-editing",
    level: "beginner",
    minutes: 25,
    icon: "FilePen",
    he: { title: "צפייה ועריכה של קבצים", summary: "cat, less, head ו-tail, עריכה ב-nano, והישרדות בסיסית ב-vim." },
    en: { title: "Viewing and Editing Files", summary: "cat, less, head and tail, editing with nano, and basic vim survival." },
  },
  {
    number: 8,
    slug: "08-getting-help",
    level: "beginner",
    minutes: 10,
    icon: "LifeBuoy",
    he: { title: "איך מוצאים עזרה", summary: "man, --help ו-tldr, ואיך קוראים הודעת שגיאה בלי להיבהל." },
    en: { title: "Getting Help", summary: "man, --help and tldr, and how to read an error message without panicking." },
  },
  // Intermediate
  {
    number: 9,
    slug: "09-users-permissions",
    level: "intermediate",
    minutes: 25,
    icon: "KeyRound",
    he: { title: "משתמשים, קבוצות והרשאות", summary: "rwx, chmod ו-chown, קבוצות, sudo, ולמה root מסוכן." },
    en: { title: "Users, Groups and Permissions", summary: "rwx, chmod and chown, groups, sudo, and why root is dangerous." },
  },
  {
    number: 10,
    slug: "10-package-management",
    level: "intermediate",
    minutes: 20,
    icon: "Package",
    he: { title: "ניהול תוכנות וחבילות", summary: "apt, dnf ו-pacman: מתקינים, מעדכנים ומסירים תוכנות כמו בחנות אפליקציות." },
    en: { title: "Package Management", summary: "apt, dnf and pacman: install, update and remove software like an app store." },
  },
  {
    number: 11,
    slug: "11-processes-jobs",
    level: "intermediate",
    minutes: 20,
    icon: "Cpu",
    he: { title: "תהליכים ומשימות", summary: "ps, top ו-kill, סיגנלים, ומשימות ברקע עם &, fg ו-bg." },
    en: { title: "Processes and Jobs", summary: "ps, top and kill, signals, and background jobs with &, fg and bg." },
  },
  {
    number: 12,
    slug: "12-pipes-redirection",
    level: "intermediate",
    minutes: 20,
    icon: "Workflow",
    he: { title: "צינורות והפניות", summary: "מחברים פקודות עם | ושולחים פלט לקבצים עם > ו->>." },
    en: { title: "Pipes and Redirection", summary: "Chain commands with | and send output to files with > and >>." },
  },
  {
    number: 13,
    slug: "13-text-tools",
    level: "intermediate",
    minutes: 30,
    icon: "TextSearch",
    he: { title: "כלי טקסט: grep, sed, awk ועוד", summary: "מחפשים, ממיינים, חותכים ומחליפים טקסט ישר מהטרמינל." },
    en: { title: "Text Tools: grep, sed, awk and More", summary: "Search, sort, cut and replace text right from the terminal." },
  },
  {
    number: 14,
    slug: "14-finding-things",
    level: "intermediate",
    minutes: 15,
    icon: "Search",
    he: { title: "חיפוש קבצים ופקודות", summary: "find, locate, which ו-xargs: מוצאים כל קובץ לפי שם, גודל או תאריך." },
    en: { title: "Finding Things", summary: "find, locate, which and xargs: find any file by name, size or date." },
  },
  {
    number: 15,
    slug: "15-environment-shell",
    level: "intermediate",
    minutes: 20,
    icon: "Settings2",
    he: { title: "משתני סביבה והגדרות ה-Shell", summary: "PATH, export, .bashrc ו-alias: מתאימים את הטרמינל אליכם." },
    en: { title: "Environment and Shell Config", summary: "PATH, export, .bashrc and alias: make the terminal yours." },
  },
  {
    number: 16,
    slug: "16-networking-basics",
    level: "intermediate",
    minutes: 25,
    icon: "Network",
    he: { title: "רשתות בסיסיות", summary: "ip, ping, curl, פורטים, ו-ssh ו-scp לעבודה מול שרתים." },
    en: { title: "Networking Basics", summary: "ip, ping, curl, ports, and ssh and scp for working with servers." },
  },
  {
    number: 17,
    slug: "17-archives-compression",
    level: "intermediate",
    minutes: 15,
    icon: "Archive",
    he: { title: "דחיסה וארכיונים", summary: "tar, gzip ו-zip, ואיזה דגל לבחור בכל מצב." },
    en: { title: "Archives and Compression", summary: "tar, gzip and zip, and which flag to pick when." },
  },
  // Advanced
  {
    number: 18,
    slug: "18-bash-scripting",
    level: "advanced",
    minutes: 40,
    icon: "FileCode2",
    he: { title: "כתיבת סקריפטים ב-Bash", summary: "משתנים, תנאים, לולאות ופונקציות, עד סקריפט גיבוי אמיתי." },
    en: { title: "Bash Scripting", summary: "Variables, conditions, loops and functions, up to a real backup script." },
  },
  {
    number: 19,
    slug: "19-cron-systemd",
    level: "advanced",
    minutes: 30,
    icon: "Timer",
    he: { title: "אוטומציה: cron ו-systemd", summary: "מתזמנים משימות עם cron ומנהלים שירותים עם systemctl." },
    en: { title: "Automation: cron and systemd", summary: "Schedule tasks with cron and manage services with systemctl." },
  },
  {
    number: 20,
    slug: "20-logs",
    level: "advanced",
    minutes: 20,
    icon: "ScrollText",
    he: { title: "לוגים ו-journalctl", summary: "/var/log, journalctl ו-dmesg: איך מוצאים מה השתבש." },
    en: { title: "Logs and journalctl", summary: "/var/log, journalctl and dmesg: how to find what went wrong." },
  },
  {
    number: 21,
    slug: "21-disks-storage",
    level: "advanced",
    minutes: 25,
    icon: "HardDrive",
    he: { title: "דיסקים ואחסון", summary: "df, du ו-lsblk, חיבור כוננים עם mount, ומה זו מערכת קבצים." },
    en: { title: "Disks and Storage", summary: "df, du and lsblk, mounting drives, and what a filesystem is." },
  },
  {
    number: 22,
    slug: "22-security-basics",
    level: "advanced",
    minutes: 30,
    icon: "ShieldCheck",
    he: { title: "אבטחה בסיסית", summary: "עדכונים, ufw, מפתחות SSH, ועקרון ההרשאה המינימלית." },
    en: { title: "Security Basics", summary: "Updates, ufw, SSH keys, and the principle of least privilege." },
  },
  {
    number: 23,
    slug: "23-git-basics",
    level: "advanced",
    minutes: 30,
    icon: "GitBranch",
    he: { title: "Git על לינוקס", summary: "commit, branch ו-push: שומרים היסטוריה של העבודה ומעלים ל-GitHub." },
    en: { title: "Git on Linux", summary: "commit, branch and push: keep a history of your work and push it to GitHub." },
  },
  {
    number: 24,
    slug: "24-docker-intro",
    level: "advanced",
    minutes: 30,
    icon: "Container",
    he: { title: "מבוא ל-Docker", summary: "מה זה קונטיינר, איך מריצים אחד, ואיך כותבים Dockerfile ראשון." },
    en: { title: "Intro to Docker", summary: "What a container is, how to run one, and how to write your first Dockerfile." },
  },
  {
    number: 25,
    slug: "25-performance-troubleshooting",
    level: "advanced",
    minutes: 25,
    icon: "Gauge",
    he: { title: "ביצועים ופתרון תקלות", summary: "זיכרון, מעבד ודיסק, ושיטת עבודה מסודרת למצוא תקלות." },
    en: { title: "Performance and Troubleshooting", summary: "Memory, CPU and disk, and a step-by-step way to track down problems." },
  },
  // Extras (not counted in progress)
  {
    number: 26,
    slug: "26-cheat-sheet",
    level: "extra",
    minutes: 5,
    icon: "Table",
    he: { title: "דף פקודות מהיר", summary: "כל הפקודות מהמדריך במקום אחד, עם חיפוש והעתקה." },
    en: { title: "Cheat Sheet", summary: "Every command from the guide in one place, searchable and copyable." },
  },
  {
    number: 27,
    slug: "27-glossary",
    level: "extra",
    minutes: 5,
    icon: "BookMarked",
    he: { title: "מילון מונחים", summary: "כל המונחים הטכניים, בעברית פשוטה." },
    en: { title: "Glossary", summary: "Every technical term, in plain language." },
  },
  {
    number: 28,
    slug: "28-challenges",
    level: "extra",
    minutes: 30,
    icon: "Trophy",
    he: { title: "אתגרי תרגול", summary: "תרגילים לכל רמה, עם רמזים ופתרונות." },
    en: { title: "Practice Challenges", summary: "Exercises for every level, with hints and solutions." },
  },
  {
    number: 29,
    slug: "29-resources",
    level: "extra",
    minutes: 5,
    icon: "Library",
    he: { title: "מקורות להמשך", summary: "תיעוד, ספרים, אתרי תרגול וקהילות להמשך הדרך." },
    en: { title: "Further Resources", summary: "Docs, books, practice sites and communities for what comes next." },
  },
  {
    number: 30,
    slug: "30-finish",
    level: "extra",
    minutes: 5,
    icon: "PartyPopper",
    he: { title: "סיימתם! אודות ומשוב", summary: "מה הלאה, על הפרויקט, ואיך לשלוח משוב." },
    en: { title: "You Made It! About and Feedback", summary: "What's next, about the project, and how to send feedback." },
  },
];

export const chapterText = (chapter: Chapter, locale: Locale): ChapterText => chapter[locale];

export const findChapter = (slug: string) => chapters.find((c) => c.slug === slug);

/** Chapters that count toward course progress (the extras don't). */
export const trackedChapters = chapters.filter((c) => c.level !== "extra");

export type LevelStats = { level: Level; count: number; minutes: number; first: Chapter; last: Chapter };

/** Chapter count, total minutes and first/last chapter of a level, derived from the syllabus (never hard-coded in UI). */
export function levelStats(level: Level): LevelStats {
  const list = chapters.filter((c) => c.level === level);
  return {
    level,
    count: list.length,
    minutes: list.reduce((sum, c) => sum + c.minutes, 0),
    first: list[0],
    last: list[list.length - 1],
  };
}
