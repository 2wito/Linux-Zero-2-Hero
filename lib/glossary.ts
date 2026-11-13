// Glossary terms, added chapter by chapter as content is written. Rendered by the glossary page (chapter 27).
// `chapter` is the chapter that teaches the term; tests/glossary.test.ts checks it exists and ids are unique.

export const glossaryCategories = ["basics", "terminal", "files", "system", "network", "dev"] as const;
export type GlossaryCategory = (typeof glossaryCategories)[number];

/** The element id of a term on the glossary page (site search links straight to it). */
export const glossaryAnchor = (id: string) => `term-${id}`;

export type GlossaryTerm = {
  id: string;
  chapter: number;
  category: GlossaryCategory;
  he: { term: string; definition: string };
  en: { term: string; definition: string };
};

export const glossary: GlossaryTerm[] = [
  // Chapter 1
  {
    id: "operating-system",
    chapter: 1,
    category: "basics",
    he: { term: "מערכת הפעלה", definition: "התוכנה שמנהלת את המחשב: מחלקת זיכרון ומעבד בין התוכנות, ומתווכת בינן לבין החומרה. Windows, macOS ולינוקס הן מערכות הפעלה." },
    en: { term: "Operating system", definition: "The software that runs the computer: it shares memory and CPU between programs and sits between them and the hardware. Windows, macOS and Linux are operating systems." },
  },
  {
    id: "kernel",
    chapter: 1,
    category: "basics",
    he: { term: "ליבה (Kernel)", definition: "החלק הפנימי ביותר של מערכת ההפעלה, שמדבר ישירות עם החומרה. \"לינוקס\" במובן המדויק הוא שם הליבה." },
    en: { term: "Kernel", definition: "The innermost part of the operating system, which talks directly to the hardware. Strictly speaking, \"Linux\" is the name of the kernel." },
  },
  {
    id: "open-source",
    chapter: 1,
    category: "basics",
    he: { term: "קוד פתוח", definition: "תוכנה שקוד המקור שלה גלוי לכולם, ומותר לקרוא, לשנות ולהפיץ אותו לפי תנאי הרישיון." },
    en: { term: "Open source", definition: "Software whose source code is public and may be read, changed and shared under the terms of its license." },
  },
  // Chapter 2
  {
    id: "distribution",
    chapter: 2,
    category: "basics",
    he: { term: "הפצה (Distro)", definition: "מערכת הפעלה שלמה שבנויה סביב ליבת לינוקס: הליבה, כלים, מנהל חבילות, שולחן עבודה ותוכנות. למשל Ubuntu ו-Fedora." },
    en: { term: "Distribution (distro)", definition: "A complete operating system built around the Linux kernel: kernel, tools, package manager, desktop and apps. For example Ubuntu and Fedora." },
  },
  {
    id: "desktop-environment",
    chapter: 2,
    category: "basics",
    he: { term: "סביבת שולחן עבודה", definition: "הממשק הגרפי: חלונות, תפריטים ולוח משימות. הנפוצות הן GNOME ו-KDE Plasma." },
    en: { term: "Desktop environment", definition: "The graphical interface: windows, menus and taskbar. The most common are GNOME and KDE Plasma." },
  },
  {
    id: "lts",
    chapter: 2,
    category: "basics",
    he: { term: "LTS", definition: "Long-Term Support: גרסה שמקבלת עדכוני אבטחה במשך כמה שנים. מתאימה למי שרוצה יציבות." },
    en: { term: "LTS", definition: "Long-Term Support: a release that gets security updates for several years. Good for anyone who wants stability." },
  },
  {
    id: "rolling-release",
    chapter: 2,
    category: "basics",
    he: { term: "Rolling release", definition: "הפצה שמתעדכנת כל הזמן בלי \"גרסאות\" גדולות, כמו Arch. מקבלים את החדש ביותר, במחיר של קצת פחות יציבות." },
    en: { term: "Rolling release", definition: "A distro that updates continuously without big numbered releases, like Arch. You get the newest software, at the cost of a little stability." },
  },
  // Chapter 3
  {
    id: "wsl",
    chapter: 3,
    category: "system",
    he: { term: "WSL", definition: "Windows Subsystem for Linux: רכיב של Windows שמריץ לינוקס אמיתי בתוך Windows, בלי מכונה וירטואלית נפרדת ובלי לאתחל." },
    en: { term: "WSL", definition: "Windows Subsystem for Linux: a Windows feature that runs real Linux inside Windows, without a separate virtual machine or rebooting." },
  },
  {
    id: "virtual-machine",
    chapter: 3,
    category: "system",
    he: { term: "מכונה וירטואלית", definition: "מחשב מדומה שרץ כתוכנה בתוך המחשב שלכם. אפשר להתקין עליו מערכת הפעלה שלמה בלי לגעת במערכת האמיתית." },
    en: { term: "Virtual machine", definition: "A simulated computer that runs as a program on your computer. You can install a whole operating system on it without touching your real one." },
  },
  {
    id: "dual-boot",
    chapter: 3,
    category: "system",
    he: { term: "Dual Boot", definition: "שתי מערכות הפעלה מותקנות על אותו מחשב, ובכל הדלקה בוחרים לאיזו להיכנס." },
    en: { term: "Dual boot", definition: "Two operating systems installed on the same computer; you choose which one to start each time you turn it on." },
  },
  {
    id: "iso",
    chapter: 3,
    category: "system",
    he: { term: "קובץ ISO", definition: "קובץ שמכיל עותק מלא של דיסק התקנה. מורידים אותו מאתר ההפצה ומתקינים ממנו." },
    en: { term: "ISO file", definition: "A file holding a complete copy of an installation disc. You download it from the distro's site and install from it." },
  },
  // Chapter 4
  {
    id: "terminal",
    chapter: 4,
    category: "terminal",
    he: { term: "טרמינל", definition: "החלון שבו מקלידים פקודות ורואים את התשובות שלהן." },
    en: { term: "Terminal", definition: "The window where you type commands and see their answers." },
  },
  {
    id: "shell",
    chapter: 4,
    category: "terminal",
    he: { term: "מעטפת (Shell)", definition: "התוכנה שרצה בתוך הטרמינל, קוראת את הפקודות שלכם ומבצעת אותן. ברוב ההפצות זו Bash." },
    en: { term: "Shell", definition: "The program running inside the terminal that reads your commands and runs them. In most distros it's Bash." },
  },
  {
    id: "bash",
    chapter: 4,
    category: "terminal",
    he: { term: "Bash", definition: "המעטפת הנפוצה ביותר בלינוקס. גם שפה לכתיבת סקריפטים (פרק 18)." },
    en: { term: "Bash", definition: "The most common Linux shell. Also a language for writing scripts (chapter 18)." },
  },
  {
    id: "prompt",
    chapter: 4,
    category: "terminal",
    he: { term: "Prompt", definition: "השורה שמחכה לפקודה, למשל dana@ubuntu:~$. היא מראה מי אתם, על איזה מחשב ובאיזו תיקייה." },
    en: { term: "Prompt", definition: "The line waiting for a command, e.g. dana@ubuntu:~$. It shows who you are, which computer and which folder." },
  },
  {
    id: "option",
    chapter: 4,
    category: "terminal",
    he: { term: "אפשרות (Option / Flag)", definition: "תוספת שמשנה את התנהגות הפקודה, למשל -l או --all. מתחילה במקף." },
    en: { term: "Option (flag)", definition: "An addition that changes how a command behaves, like -l or --all. Starts with a dash." },
  },
  {
    id: "argument",
    chapter: 4,
    category: "terminal",
    he: { term: "ארגומנט", definition: "המידע שהפקודה עובדת עליו, למשל שם הקובץ או התיקייה." },
    en: { term: "Argument", definition: "What the command works on, such as a file or folder name." },
  },
  {
    id: "tab-completion",
    chapter: 4,
    category: "terminal",
    he: { term: "השלמה אוטומטית", definition: "לחיצה על Tab משלימה שם של פקודה, קובץ או תיקייה. חוסכת הקלדה ושגיאות." },
    en: { term: "Tab completion", definition: "Pressing Tab completes a command, file or folder name. Saves typing and typos." },
  },
  // Chapter 5
  {
    id: "filesystem",
    chapter: 5,
    category: "files",
    he: { term: "מערכת קבצים", definition: "הדרך שבה קבצים ותיקיות מאורגנים בדיסק. בלינוקס הכול יושב בעץ אחד שמתחיל ב-/." },
    en: { term: "Filesystem", definition: "How files and folders are organized on disk. In Linux everything sits in one tree that starts at /." },
  },
  {
    id: "directory",
    chapter: 5,
    category: "files",
    he: { term: "תיקייה (Directory)", definition: "מקום שמחזיק קבצים ותיקיות אחרות. בלינוקס אומרים directory, ב-Windows אומרים folder." },
    en: { term: "Directory", definition: "A place that holds files and other directories. Linux says directory; Windows says folder." },
  },
  {
    id: "root-directory",
    chapter: 5,
    category: "files",
    he: { term: "תיקיית השורש (/)", definition: "התיקייה העליונה ביותר. כל קובץ במערכת נמצא איפשהו מתחתיה." },
    en: { term: "Root directory (/)", definition: "The topmost directory. Every file on the system lives somewhere beneath it." },
  },
  {
    id: "home-directory",
    chapter: 5,
    category: "files",
    he: { term: "תיקיית הבית (~)", definition: "התיקייה הפרטית שלכם, למשל /home/dana. הסימן ~ הוא קיצור שלה." },
    en: { term: "Home directory (~)", definition: "Your personal directory, e.g. /home/dana. The ~ sign is a shortcut for it." },
  },
  {
    id: "working-directory",
    chapter: 5,
    category: "files",
    he: { term: "התיקייה הנוכחית", definition: "התיקייה שבה אתם \"עומדים\" עכשיו. pwd מציגה אותה." },
    en: { term: "Working directory", definition: "The directory you're \"standing in\" right now. pwd shows it." },
  },
  {
    id: "absolute-path",
    chapter: 5,
    category: "files",
    he: { term: "נתיב מלא (Absolute)", definition: "נתיב שמתחיל ב-/ ומוביל לאותו מקום לא משנה איפה אתם נמצאים." },
    en: { term: "Absolute path", definition: "A path that starts with / and leads to the same place no matter where you are." },
  },
  {
    id: "relative-path",
    chapter: 5,
    category: "files",
    he: { term: "נתיב יחסי (Relative)", definition: "נתיב שמתחיל מהתיקייה הנוכחית, למשל projects או ../photos." },
    en: { term: "Relative path", definition: "A path that starts from the current directory, like projects or ../photos." },
  },
  {
    id: "hidden-file",
    chapter: 5,
    category: "files",
    he: { term: "קובץ מוסתר", definition: "קובץ ששמו מתחיל בנקודה, כמו .bashrc. ls מציגה אותו רק עם -a." },
    en: { term: "Hidden file", definition: "A file whose name starts with a dot, like .bashrc. ls only shows it with -a." },
  },
  // Chapter 6
  {
    id: "wildcard",
    chapter: 6,
    category: "files",
    he: { term: "תו כללי (Wildcard)", definition: "תו שמייצג \"כל דבר\" בשם קובץ: * מתאים לכל רצף תווים, ? לתו אחד בדיוק. למשל *.jpg." },
    en: { term: "Wildcard", definition: "A character that stands for \"anything\" in a file name: * matches any run of characters, ? exactly one. For example *.jpg." },
  },
  // Chapter 7
  {
    id: "text-editor",
    chapter: 7,
    category: "terminal",
    he: { term: "עורך טקסט", definition: "תוכנה לעריכת קבצי טקסט. בטרמינל הנפוצים הם nano (פשוט) ו-vim (חזק)." },
    en: { term: "Text editor", definition: "A program for editing text files. In the terminal the common ones are nano (simple) and vim (powerful)." },
  },
  {
    id: "pager",
    chapter: 7,
    category: "terminal",
    he: { term: "Pager", definition: "תוכנה שמציגה טקסט ארוך עמוד אחרי עמוד, כמו less. יוצאים ממנה עם q." },
    en: { term: "Pager", definition: "A program that shows long text one screen at a time, like less. Quit with q." },
  },
  // Chapter 8
  {
    id: "man-page",
    chapter: 8,
    category: "terminal",
    he: { term: "דף man", definition: "המדריך הרשמי של פקודה, שמותקן במערכת. פותחים עם man ושם הפקודה." },
    en: { term: "Man page", definition: "A command's official manual, installed on the system. Open it with man and the command name." },
  },
  {
    id: "builtin",
    chapter: 8,
    category: "terminal",
    he: { term: "פקודה מובנית (Builtin)", definition: "פקודה שהמעטפת עצמה מבצעת ולא תוכנה נפרדת, כמו cd. type מגלה אם פקודה מובנית." },
    en: { term: "Builtin", definition: "A command the shell runs itself rather than a separate program, like cd. type tells you whether a command is a builtin." },
  },
  // Chapter 9
  {
    id: "permissions",
    chapter: 9,
    category: "files",
    he: { term: "הרשאות (rwx)", definition: "מי מורשה לקרוא (r), לכתוב (w) ולהריץ (x) קובץ: הבעלים, הקבוצה ושאר המשתמשים. משנים עם chmod." },
    en: { term: "Permissions (rwx)", definition: "Who may read (r), write (w) and execute (x) a file: the owner, the group and everyone else. Changed with chmod." },
  },
  {
    id: "group",
    chapter: 9,
    category: "system",
    he: { term: "קבוצה", definition: "אוסף משתמשים שמקבלים יחד את אותן הרשאות. id מציגה את הקבוצות שלכם." },
    en: { term: "Group", definition: "A set of users who share the same permissions. id lists your groups." },
  },
  {
    id: "root",
    chapter: 9,
    category: "system",
    he: { term: "root (משתמש העל)", definition: "המשתמש עם ההרשאות המלאות במערכת, עם uid 0. מותר לו הכול, ולכן מסוכן לעבוד איתו." },
    en: { term: "Root", definition: "The account with full control of the system (uid 0). It may do anything, which is why working as root is risky." },
  },
  {
    id: "sudo",
    chapter: 9,
    category: "system",
    he: { term: "sudo", definition: "מריצה פקודה אחת בהרשאות root, אחרי הקלדת הסיסמה שלכם. כל שימוש נרשם בלוג." },
    en: { term: "sudo", definition: "Runs a single command with root privileges after you type your own password. Every use is logged." },
  },
  // Chapter 10
  {
    id: "package",
    chapter: 10,
    category: "system",
    he: { term: "חבילה (Package)", definition: "תוכנה ארוזה בקובץ אחד, מוכנה להתקנה בעזרת מנהל החבילות." },
    en: { term: "Package", definition: "A program bundled into one file, ready to be installed by the package manager." },
  },
  {
    id: "package-manager",
    chapter: 10,
    category: "system",
    he: { term: "מנהל חבילות", definition: "הכלי שמחפש, מתקין, מעדכן ומסיר תוכנות: apt, dnf או pacman." },
    en: { term: "Package manager", definition: "The tool that searches for, installs, updates and removes software: apt, dnf or pacman." },
  },
  {
    id: "repository",
    chapter: 10,
    category: "system",
    he: { term: "מאגר חבילות (Repository)", definition: "שרת שמחזיק אלפי חבילות שההפצה בדקה, וממנו מנהל החבילות מוריד." },
    en: { term: "Package repository", definition: "A server holding thousands of packages vetted by the distribution, which the package manager downloads from." },
  },
  {
    id: "dependency",
    chapter: 10,
    category: "system",
    he: { term: "תלות (Dependency)", definition: "תוכנה או ספרייה שתוכנה אחרת צריכה כדי לעבוד. מנהל החבילות מתקין תלויות לבד." },
    en: { term: "Dependency", definition: "A program or library another program needs in order to run. The package manager installs dependencies automatically." },
  },
  // Chapter 11
  {
    id: "process",
    chapter: 11,
    category: "system",
    he: { term: "תהליך (Process)", definition: "תוכנה שרצה כרגע, עם זיכרון ומקום במעבד. לכל תהליך יש PID." },
    en: { term: "Process", definition: "A program that is currently running, with its own memory and CPU time. Every process has a PID." },
  },
  {
    id: "pid",
    chapter: 11,
    category: "system",
    he: { term: "PID", definition: "מספר הזיהוי הייחודי של תהליך. ps ו-pgrep מציגות אותו, ו-kill משתמשת בו." },
    en: { term: "PID", definition: "A process's unique ID number. ps and pgrep show it, and kill uses it." },
  },
  {
    id: "signal",
    chapter: 11,
    category: "system",
    he: { term: "סיגנל", definition: "הודעה שנשלחת לתהליך, למשל SIGTERM (בבקשה לסיים) או SIGKILL (עצירה מיידית). שולחים עם kill." },
    en: { term: "Signal", definition: "A message sent to a process, such as SIGTERM (please finish) or SIGKILL (stop now). Sent with kill." },
  },
  {
    id: "background-job",
    chapter: 11,
    category: "terminal",
    he: { term: "משימת רקע", definition: "פקודה שרצה בזמן שהטרמינל פנוי לפקודות אחרות. מפעילים עם & ומנהלים עם jobs, fg ו-bg." },
    en: { term: "Background job", definition: "A command that keeps running while the terminal stays free. Started with & and managed with jobs, fg and bg." },
  },
  // Chapter 12
  {
    id: "standard-streams",
    chapter: 12,
    category: "terminal",
    he: { term: "stdin, stdout ו-stderr", definition: "שלושת הערוצים של כל פקודה: קלט (0), פלט רגיל (1) ופלט שגיאות (2)." },
    en: { term: "stdin, stdout and stderr", definition: "The three streams every command has: input (0), normal output (1) and error output (2)." },
  },
  {
    id: "redirection",
    chapter: 12,
    category: "terminal",
    he: { term: "הפניה (Redirection)", definition: "שליחת פלט לקובץ או קלט מקובץ, עם > (דורס), >> (מוסיף), < ו-2>." },
    en: { term: "Redirection", definition: "Sending output to a file or reading input from one, with > (overwrite), >> (append), < and 2>." },
  },
  {
    id: "pipe",
    chapter: 12,
    category: "terminal",
    he: { term: "צינור (Pipe)", definition: "התו |, שמחבר את הפלט של פקודה אחת לקלט של הבאה." },
    en: { term: "Pipe", definition: "The | character, which feeds one command's output into the next command's input." },
  },
  // Chapter 13
  {
    id: "regex",
    chapter: 13,
    category: "terminal",
    he: { term: "ביטוי רגולרי (Regex)", definition: "תבנית לחיפוש טקסט, עם סימנים כמו ^ (תחילת שורה), $ (סוף שורה) ו-.* (כל דבר)." },
    en: { term: "Regular expression (regex)", definition: "A pattern for matching text, with symbols such as ^ (line start), $ (line end) and .* (anything)." },
  },
  {
    id: "csv",
    chapter: 13,
    category: "files",
    he: { term: "CSV", definition: "קובץ טקסט שבו כל שורה היא רשומה, והעמודות מופרדות בפסיקים." },
    en: { term: "CSV", definition: "A text file where each line is a record and the columns are separated by commas." },
  },
  // Chapter 14
  {
    id: "xargs",
    chapter: 14,
    category: "terminal",
    he: { term: "xargs", definition: "פקודה שהופכת שורות מ-stdin לארגומנטים של פקודה אחרת." },
    en: { term: "xargs", definition: "A command that turns lines from stdin into arguments for another command." },
  },
  // Chapter 15
  {
    id: "environment-variable",
    chapter: 15,
    category: "terminal",
    he: { term: "משתנה סביבה", definition: "משתנה שהמעטפת מעבירה לכל תוכנה שהיא מפעילה, כמו HOME ו-PATH. יוצרים עם export." },
    en: { term: "Environment variable", definition: "A variable the shell passes to every program it starts, such as HOME and PATH. Created with export." },
  },
  {
    id: "path-variable",
    chapter: 15,
    category: "terminal",
    he: { term: "PATH", definition: "משתנה סביבה עם רשימת התיקיות שבהן המעטפת מחפשת פקודות, מופרדות בנקודתיים." },
    en: { term: "PATH", definition: "An environment variable listing the directories where the shell looks for commands, separated by colons." },
  },
  {
    id: "alias",
    chapter: 15,
    category: "terminal",
    he: { term: "כינוי (alias)", definition: "שם קצר לפקודה ארוכה, למשל ll במקום ls -alF. נשמר לתמיד ב-~/.bashrc." },
    en: { term: "Alias", definition: "A short name for a longer command, such as ll for ls -alF. Saved permanently in ~/.bashrc." },
  },
  {
    id: "bashrc",
    chapter: 15,
    category: "terminal",
    he: { term: ".bashrc", definition: "קובץ ההגדרות שהמעטפת קוראת בכל פתיחה של טרמינל: כינויים, משתנים ו-prompt." },
    en: { term: ".bashrc", definition: "The settings file the shell reads every time a terminal opens: aliases, variables and the prompt." },
  },
  // Chapter 16
  {
    id: "ip-address",
    chapter: 16,
    category: "network",
    he: { term: "כתובת IP", definition: "הכתובת של מחשב ברשת, כמו 192.168.1.50. localhost (127.0.0.1) היא תמיד המחשב עצמו." },
    en: { term: "IP address", definition: "A computer's address on a network, such as 192.168.1.50. localhost (127.0.0.1) always means this computer." },
  },
  {
    id: "dns",
    chapter: 16,
    category: "network",
    he: { term: "DNS", definition: "\"ספר הטלפונים\" של האינטרנט: מתרגם שמות כמו kernel.org לכתובות IP." },
    en: { term: "DNS", definition: "The internet's phone book: it translates names such as kernel.org into IP addresses." },
  },
  {
    id: "port",
    chapter: 16,
    category: "network",
    he: { term: "פורט", definition: "מספר שמזהה שירות מסוים במחשב, כמו מספר דירה בבניין. אתרים ב-443, SSH ב-22." },
    en: { term: "Port", definition: "A number identifying a particular service on a computer, like a flat number in a building. Websites use 443, SSH uses 22." },
  },
  {
    id: "ssh",
    chapter: 16,
    category: "network",
    he: { term: "SSH", definition: "פרוטוקול לפתיחת טרמינל מוצפן במחשב מרוחק. scp מעתיקה קבצים דרכו." },
    en: { term: "SSH", definition: "A protocol for opening an encrypted terminal on a remote computer. scp copies files over it." },
  },
  // Chapter 17
  {
    id: "archive",
    chapter: 17,
    category: "files",
    he: { term: "ארכיון", definition: "קובץ אחד שמכיל הרבה קבצים ותיקיות, כמו קובץ tar." },
    en: { term: "Archive", definition: "A single file containing many files and folders, such as a tar file." },
  },
  {
    id: "compression",
    chapter: 17,
    category: "files",
    he: { term: "דחיסה", definition: "הקטנת קובץ בלי לאבד מידע, עם gzip, xz או zip." },
    en: { term: "Compression", definition: "Making a file smaller without losing data, with gzip, xz or zip." },
  },
  {
    id: "tarball",
    chapter: 17,
    category: "files",
    he: { term: "Tarball (tar.gz)", definition: "ארכיון tar שנדחס, בדרך כלל ב-gzip. יוצרים עם tar -czf ופותחים עם tar -xzf." },
    en: { term: "Tarball (tar.gz)", definition: "A tar archive that has been compressed, usually with gzip. Created with tar -czf and extracted with tar -xzf." },
  },
  // Chapter 18
  {
    id: "script",
    chapter: 18,
    category: "dev",
    he: { term: "סקריפט", definition: "קובץ טקסט עם רשימת פקודות שהמעטפת מריצה לפי הסדר." },
    en: { term: "Script", definition: "A text file with a list of commands that the shell runs in order." },
  },
  {
    id: "shebang",
    chapter: 18,
    category: "dev",
    he: { term: "Shebang", definition: "השורה הראשונה בסקריפט, למשל #!/bin/bash, שאומרת למערכת איזו תוכנה תריץ אותו." },
    en: { term: "Shebang", definition: "A script's first line, such as #!/bin/bash, telling the system which program should run it." },
  },
  {
    id: "exit-code",
    chapter: 18,
    category: "dev",
    he: { term: "קוד יציאה", definition: "המספר שפקודה מחזירה כשהיא מסתיימת: 0 להצלחה, וכל מספר אחר לכישלון. נשמר ב-$?." },
    en: { term: "Exit code", definition: "The number a command returns when it finishes: 0 for success, anything else for failure. Stored in $?." },
  },
  // Chapter 19
  {
    id: "cron",
    chapter: 19,
    category: "system",
    he: { term: "cron", definition: "שירות שמריץ פקודות בזמנים קבועים, לפי טבלה (crontab) של חמישה שדות זמן." },
    en: { term: "cron", definition: "A service that runs commands on a schedule, from a table (crontab) of five time fields." },
  },
  {
    id: "systemd",
    chapter: 19,
    category: "system",
    he: { term: "systemd", definition: "מנהל המערכת: התהליך הראשון (PID 1), שמפעיל, עוצר ומשגיח על שירותים. מנהלים אותו עם systemctl." },
    en: { term: "systemd", definition: "The system manager: the first process (PID 1), which starts, stops and watches services. Controlled with systemctl." },
  },
  {
    id: "service",
    chapter: 19,
    category: "system",
    he: { term: "שירות (Service)", definition: "תוכנה שרצה ברקע ומנוהלת על ידי systemd, כמו שרת אינטרנט. enable מפעילה אותה בכל הדלקה." },
    en: { term: "Service", definition: "A program that runs in the background under systemd, such as a web server. enable starts it at every boot." },
  },
  {
    id: "timer",
    chapter: 19,
    category: "system",
    he: { term: "Timer", definition: "יחידה של systemd שמפעילה שירות בזמנים קבועים, כמו cron, עם לוגים מסודרים." },
    en: { term: "Timer", definition: "A systemd unit that starts a service on a schedule, like cron, with proper logging." },
  },
  // Chapter 20
  {
    id: "log",
    chapter: 20,
    category: "system",
    he: { term: "לוג", definition: "יומן שבו תוכנות רושמות מה הן עושות, ובעיקר מה השתבש. נמצא ב-/var/log וב-journal." },
    en: { term: "Log", definition: "A record where programs write what they do, and above all what went wrong. Found in /var/log and the journal." },
  },
  {
    id: "journal",
    chapter: 20,
    category: "system",
    he: { term: "Journal", definition: "היומן המרכזי של systemd, שאוסף את ההודעות של כל השירותים. קוראים אותו עם journalctl." },
    en: { term: "Journal", definition: "systemd's central log, which collects messages from every service. Read it with journalctl." },
  },
  // Chapter 21
  {
    id: "partition",
    chapter: 21,
    category: "files",
    he: { term: "מחיצה (Partition)", definition: "חלק מדיסק שמתנהג כמו דיסק נפרד. lsblk מציגה את המחיצות." },
    en: { term: "Partition", definition: "A section of a disk that behaves like a separate disk. lsblk lists them." },
  },
  {
    id: "mount",
    chapter: 21,
    category: "files",
    he: { term: "עיגון (Mount)", definition: "חיבור של מחיצה או דיסק לנקודה בעץ התיקיות, כך שאפשר להגיע לתוכן שלהם." },
    en: { term: "Mount", definition: "Attaching a partition or disk to a point in the directory tree so its contents can be reached." },
  },
  {
    id: "swap",
    chapter: 21,
    category: "system",
    he: { term: "Swap", definition: "מקום בדיסק שהמערכת משתמשת בו כזיכרון נוסף כשה-RAM מתמלא. איטי בהרבה מ-RAM." },
    en: { term: "Swap", definition: "Disk space the system uses as extra memory when RAM fills up. Much slower than RAM." },
  },
  // Chapter 22
  {
    id: "least-privilege",
    chapter: 22,
    category: "system",
    he: { term: "הרשאה מינימלית", definition: "עיקרון אבטחה: לתת לכל משתמש ולכל תוכנה רק את ההרשאות שהם באמת צריכים." },
    en: { term: "Least privilege", definition: "A security principle: give every user and program only the permissions they actually need." },
  },
  {
    id: "firewall",
    chapter: 22,
    category: "network",
    he: { term: "חומת אש (Firewall)", definition: "מסנן שמחליט אילו חיבורי רשת מותר לקבל. ב-Ubuntu מנהלים אותו עם ufw." },
    en: { term: "Firewall", definition: "A filter that decides which network connections are allowed in. On Ubuntu it is managed with ufw." },
  },
  {
    id: "ssh-key",
    chapter: 22,
    category: "network",
    he: { term: "מפתח SSH", definition: "זוג קבצים להתחברות בלי סיסמה: מפתח פרטי שנשאר אצלכם, ומפתח ציבורי שמעתיקים לשרתים." },
    en: { term: "SSH key", definition: "A pair of files for passwordless login: a private key that stays with you and a public key you copy to servers." },
  },
  // Chapter 23
  {
    id: "git",
    chapter: 23,
    category: "dev",
    he: { term: "Git", definition: "מערכת לניהול גרסאות: שומרת היסטוריה של כל השינויים בתיקייה, ומאפשרת לחזור אחורה ולעבוד בענפים." },
    en: { term: "Git", definition: "A version control system: it keeps the history of every change in a folder and lets you go back and work in branches." },
  },
  {
    id: "commit",
    chapter: 23,
    category: "dev",
    he: { term: "Commit", definition: "\"צילום\" של מצב הקבצים במאגר Git, עם הודעה שמסבירה מה השתנה." },
    en: { term: "Commit", definition: "A snapshot of the files in a Git repository, with a message explaining what changed." },
  },
  {
    id: "branch",
    chapter: 23,
    category: "dev",
    he: { term: "ענף (Branch)", definition: "קו התפתחות נפרד במאגר Git, לניסויים ולתכונות חדשות. ממזגים חזרה עם merge." },
    en: { term: "Branch", definition: "A separate line of development in a Git repository, for experiments and new features. Merged back with merge." },
  },
  // Chapter 24
  {
    id: "container",
    chapter: 24,
    category: "dev",
    he: { term: "קונטיינר", definition: "תוכנה ארוזה עם כל התלויות שלה, שרצה מבודדת אבל חולקת את הליבה עם המחשב המארח." },
    en: { term: "Container", definition: "A program packaged with all its dependencies, running isolated while sharing the host's kernel." },
  },
  {
    id: "docker-image",
    chapter: 24,
    category: "dev",
    he: { term: "Image", definition: "תבנית לקריאה בלבד שממנה יוצרים קונטיינרים. בונים אותה עם Dockerfile." },
    en: { term: "Image", definition: "A read-only template that containers are created from. Built with a Dockerfile." },
  },
  {
    id: "volume",
    chapter: 24,
    category: "dev",
    he: { term: "Volume", definition: "אחסון שיושב מחוץ לקונטיינר ומעוגן לתוכו, כדי שהמידע ישרוד מחיקה של הקונטיינר." },
    en: { term: "Volume", definition: "Storage that lives outside a container and is mounted into it, so data survives when the container is removed." },
  },
  // Chapter 25
  {
    id: "load-average",
    chapter: 25,
    category: "system",
    he: { term: "Load average", definition: "ממוצע מספר התהליכים שרצים או מחכים למעבד, ב-1, 5 ו-15 הדקות האחרונות. משווים למספר הליבות." },
    en: { term: "Load average", definition: "The average number of processes running or waiting for the CPU over the last 1, 5 and 15 minutes. Compare it with the number of cores." },
  },
  {
    id: "oom-killer",
    chapter: 25,
    category: "system",
    he: { term: "OOM killer", definition: "מנגנון בליבה שעוצר בכוח תוכנה כשהזיכרון נגמר לגמרי, כדי להציל את שאר המערכת." },
    en: { term: "OOM killer", definition: "A kernel mechanism that forcibly stops a program when memory runs out completely, to save the rest of the system." },
  },
];
