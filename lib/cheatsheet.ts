// The cheat sheet (chapter 26): the commands taught in chapters 4–25, grouped by topic.
// `chapter` is the chapter that teaches the command; tests/cheatsheet.test.ts checks it exists and that
// every topic has commands. Commands are syntax examples (no output), so they don't need a captured run.

export const cheatTopics = [
  "terminal",
  "navigation",
  "files",
  "viewing",
  "permissions",
  "packages",
  "processes",
  "redirection",
  "text",
  "finding",
  "environment",
  "network",
  "archives",
  "scripting",
  "services",
  "disks",
  "security",
  "git",
  "docker",
] as const;

export type CheatTopic = (typeof cheatTopics)[number];

export const cheatTopicNames: Record<CheatTopic, { he: string; en: string }> = {
  terminal: { he: "טרמינל ועזרה", en: "Terminal and help" },
  navigation: { he: "ניווט", en: "Navigation" },
  files: { he: "קבצים ותיקיות", en: "Files and directories" },
  viewing: { he: "קריאה ועריכה", en: "Viewing and editing" },
  permissions: { he: "משתמשים והרשאות", en: "Users and permissions" },
  packages: { he: "התקנת תוכנות", en: "Packages" },
  processes: { he: "תהליכים וביצועים", en: "Processes and performance" },
  redirection: { he: "הפניות וצינורות", en: "Redirection and pipes" },
  text: { he: "כלי טקסט", en: "Text tools" },
  finding: { he: "חיפוש קבצים", en: "Finding files" },
  environment: { he: "משתנים ו-Shell", en: "Environment and shell" },
  network: { he: "רשת", en: "Networking" },
  archives: { he: "ארכיונים ודחיסה", en: "Archives and compression" },
  scripting: { he: "סקריפטים", en: "Scripting" },
  services: { he: "שירותים, תזמון ולוגים", en: "Services, scheduling and logs" },
  disks: { he: "דיסקים", en: "Disks" },
  security: { he: "אבטחה", en: "Security" },
  git: { he: "Git", en: "Git" },
  docker: { he: "Docker", en: "Docker" },
};

/** The element id of a topic section on the cheat sheet page (site search links to it). */
export const cheatAnchor = (topic: CheatTopic) => `topic-${topic}`;

export type CheatEntry = { cmd: string; topic: CheatTopic; chapter: number; he: string; en: string };

const e = (topic: CheatTopic, chapter: number, cmd: string, he: string, en: string): CheatEntry => ({ cmd, topic, chapter, he, en });

export const cheatSheet: CheatEntry[] = [
  // Terminal and help
  e("terminal", 4, "whoami", "מי המשתמש המחובר", "Show the current user"),
  e("terminal", 4, 'echo "Hello"', "מדפיסה טקסט למסך", "Print text"),
  e("terminal", 4, "clear", "מנקה את המסך (או Ctrl+L)", "Clear the screen (or Ctrl+L)"),
  e("terminal", 4, "history", "הפקודות שהרצתם לאחרונה", "List recent commands"),
  e("terminal", 8, "ls --help", "עזרה מהירה על פקודה", "Quick help for a command"),
  e("terminal", 8, "man ls", "המדריך המלא של פקודה (q ליציאה)", "A command's full manual (q quits)"),
  e("terminal", 8, "man -k copy", "חיפוש פקודה לפי נושא (כמו apropos)", "Find commands by topic (like apropos)"),
  e("terminal", 8, "whatis ls", "תיאור של שורה אחת", "One-line description"),
  e("terminal", 8, "tldr tar", "דוגמאות מוכנות לפקודה", "Ready-made examples"),
  e("terminal", 8, "type cd", "מה זו הפקודה: תוכנה, builtin או alias", "What a command is: program, builtin or alias"),

  // Navigation
  e("navigation", 5, "pwd", "איפה אני עכשיו", "Print the current directory"),
  e("navigation", 5, "ls", "מה יש בתיקייה", "List a directory"),
  e("navigation", 5, "ls -la", "כל הקבצים, כולל מוסתרים, עם פרטים", "All files, hidden too, with details"),
  e("navigation", 5, "cd projects", "כניסה לתיקייה", "Enter a directory"),
  e("navigation", 5, "cd ..", "תיקייה אחת למעלה", "Go up one directory"),
  e("navigation", 5, "cd ~", "חזרה לתיקיית הבית (גם cd לבד)", "Go home (plain cd too)"),
  e("navigation", 5, "cd -", "חזרה לתיקייה הקודמת", "Back to the previous directory"),
  e("navigation", 5, "cd /etc", "מעבר בנתיב מלא", "Go by absolute path"),

  // Files and directories
  e("files", 6, "mkdir notes", "יצירת תיקייה", "Create a directory"),
  e("files", 6, "mkdir -p a/b/c", "יצירת כל הנתיב בבת אחת", "Create the whole path at once"),
  e("files", 6, "touch file.txt", "יצירת קובץ ריק", "Create an empty file"),
  e("files", 6, "cp a.txt b.txt", "העתקת קובץ", "Copy a file"),
  e("files", 6, "cp -r dir/ backup/", "העתקת תיקייה עם כל התוכן", "Copy a directory with its contents"),
  e("files", 6, "mv old.txt new.txt", "שינוי שם", "Rename"),
  e("files", 6, "mv file.txt docs/", "העברה לתיקייה אחרת", "Move into another directory"),
  e("files", 6, "rm file.txt", "מחיקת קובץ (בלי סל מחזור!)", "Delete a file (no recycle bin!)"),
  e("files", 6, "rm -i *.txt", "מחיקה עם שאלת אישור לכל קובץ", "Delete, asking before each file"),
  e("files", 6, "rm -r dir/", "מחיקת תיקייה עם כל התוכן. בזהירות", "Delete a directory and everything in it. Careful"),
  e("files", 6, "rmdir empty/", "מחיקת תיקייה ריקה", "Remove an empty directory"),
  e("files", 6, "ls *.txt", "תו כללי: כל הקבצים שנגמרים ב-.txt", "Wildcard: every file ending in .txt"),

  // Viewing and editing
  e("viewing", 7, "cat file.txt", "הצגת קובץ שלם", "Print a whole file"),
  e("viewing", 7, "less big.log", "דפדוף בקובץ ארוך (q ליציאה, / לחיפוש)", "Page through a long file (q quits, / searches)"),
  e("viewing", 7, "head -n 5 file.txt", "5 השורות הראשונות", "First 5 lines"),
  e("viewing", 7, "tail -n 5 file.txt", "5 השורות האחרונות", "Last 5 lines"),
  e("viewing", 7, "tail -f app.log", "מעקב אחרי קובץ בזמן אמת (Ctrl+C לעצירה)", "Follow a file live (Ctrl+C stops)"),
  e("viewing", 7, "nano file.txt", "עריכה. Ctrl+O שומר, Ctrl+X יוצא", "Edit. Ctrl+O saves, Ctrl+X exits"),
  e("viewing", 7, "vim file.txt", "עריכה ב-vim. i לכתיבה, Esc ואז :wq לשמירה ויציאה", "Edit in vim. i to type, Esc then :wq to save and quit"),

  // Users and permissions
  e("permissions", 9, "id", "המשתמש והקבוצות שלכם", "Your user and groups"),
  e("permissions", 9, "groups", "הקבוצות שאתם חברים בהן", "Groups you belong to"),
  e("permissions", 9, "ls -l file.txt", "ההרשאות והבעלים של קובץ", "A file's permissions and owner"),
  e("permissions", 9, "chmod +x script.sh", "הרשאת הרצה", "Make executable"),
  e("permissions", 9, "chmod g-w,o-r notes.txt", "שינוי הרשאות בצורה סמלית", "Change permissions symbolically"),
  e("permissions", 9, "chmod 755 script.sh", "rwxr-xr-x בצורה מספרית", "rwxr-xr-x in numeric form"),
  e("permissions", 9, "chmod 600 secret.txt", "רק הבעלים קורא וכותב", "Only the owner reads and writes"),
  e("permissions", 9, "sudo chown dana:dana file.txt", "שינוי בעלים וקבוצה", "Change owner and group"),
  e("permissions", 9, "umask", "ברירת המחדל להרשאות של קבצים חדשים", "Default permissions for new files"),
  e("permissions", 9, "sudo command", "הרצת פקודה אחת כ-root", "Run one command as root"),

  // Packages
  e("packages", 10, "sudo apt update", "רענון רשימת החבילות", "Refresh the package lists"),
  e("packages", 10, "sudo apt upgrade", "התקנת עדכונים", "Install updates"),
  e("packages", 10, "apt search cowsay", "חיפוש חבילה", "Search for a package"),
  e("packages", 10, "apt show cowsay", "פרטים על חבילה", "Package details"),
  e("packages", 10, "sudo apt install cowsay", "התקנה", "Install"),
  e("packages", 10, "sudo apt remove cowsay", "הסרה", "Remove"),
  e("packages", 10, "sudo apt autoremove", "הסרת תלויות שאף אחד לא צריך", "Remove unneeded dependencies"),
  e("packages", 10, "apt list --installed", "מה מותקן", "List installed packages"),
  e("packages", 10, "sudo dnf install cowsay", "התקנה ב-Fedora", "Install on Fedora"),
  e("packages", 10, "sudo pacman -S cowsay", "התקנה ב-Arch", "Install on Arch"),
  e("packages", 10, "sudo pacman -Syu", "עדכון מלא ב-Arch", "Full upgrade on Arch"),
  e("packages", 10, "sudo snap install tldr", "התקנת Snap", "Install a snap"),

  // Processes and performance
  e("processes", 11, "ps", "התהליכים בטרמינל הזה", "Processes in this terminal"),
  e("processes", 11, "ps aux", "כל התהליכים במערכת", "Every process on the system"),
  e("processes", 11, "top", "מוניטור חי (q ליציאה)", "Live monitor (q quits)"),
  e("processes", 11, "htop", "מוניטור חי ונוח יותר", "A friendlier live monitor"),
  e("processes", 11, "pgrep -a sleep", "חיפוש תהליך לפי שם", "Find a process by name"),
  e("processes", 11, "kill 1234", "בקשה מנומסת מתהליך להיסגר (SIGTERM)", "Politely ask a process to stop (SIGTERM)"),
  e("processes", 11, "kill -9 1234", "סגירה בכוח (SIGKILL), רק כשאין ברירה", "Force kill (SIGKILL), last resort"),
  e("processes", 11, "pkill sleep", "סגירת תהליכים לפי שם", "Kill processes by name"),
  e("processes", 11, "sleep 100 &", "הרצה ברקע", "Run in the background"),
  e("processes", 11, "jobs", "העבודות של הטרמינל הזה", "This terminal's jobs"),
  e("processes", 11, "fg %1", "החזרת עבודה לחזית", "Bring a job to the foreground"),
  e("processes", 11, "bg %1", "המשך עבודה עצורה ברקע (אחרי Ctrl+Z)", "Resume a stopped job in the background (after Ctrl+Z)"),
  e("processes", 25, "free -h", "כמה זיכרון בשימוש", "Memory usage"),
  e("processes", 25, "uptime", "כמה זמן המערכת דולקת, ו-load average", "Uptime and load average"),
  e("processes", 25, "nproc", "כמה ליבות מעבד יש", "Number of CPU cores"),
  e("processes", 25, "ps aux --sort=-%cpu | head -5", "מי אוכל הכי הרבה מעבד", "Top CPU users"),
  e("processes", 25, "vmstat 1 5", "תמונת מצב: מעבד, זיכרון, דיסק", "Snapshot: CPU, memory, disk"),
  e("processes", 25, "iostat -x 1 3", "עומס על הדיסקים (חבילת sysstat)", "Disk load (sysstat package)"),

  // Redirection and pipes
  e("redirection", 12, "ls > list.txt", "שמירת הפלט בקובץ (דורס!)", "Save output to a file (overwrites!)"),
  e("redirection", 12, 'echo "more" >> list.txt', "הוספה לסוף הקובץ", "Append to the file"),
  e("redirection", 12, "sort < names.txt", "קלט מקובץ", "Read input from a file"),
  e("redirection", 12, "cmd 2> errors.txt", "שמירת השגיאות בלבד", "Save only the errors"),
  e("redirection", 12, "cmd > all.txt 2>&1", "פלט ושגיאות לאותו קובץ", "Output and errors to one file"),
  e("redirection", 12, "cmd 2>/dev/null", "השתקת שגיאות", "Silence errors"),
  e("redirection", 12, "ls | wc -l", "צינור: הפלט של אחת הוא הקלט של הבאה", "Pipe: one command's output into the next"),
  e("redirection", 12, "ls | tee list.txt", "גם למסך וגם לקובץ", "To the screen and a file"),

  // Text tools
  e("text", 13, "grep error app.log", "שורות שמכילות מילה", "Lines containing a word"),
  e("text", 13, "grep -i error app.log", "בלי הבדל בין אותיות גדולות לקטנות", "Ignore case"),
  e("text", 13, 'grep -rn "TODO" .', "חיפוש בכל התיקייה, עם מספרי שורות", "Search a whole directory, with line numbers"),
  e("text", 13, "grep -v debug app.log", "השורות שלא מכילות", "Lines that don't match"),
  e("text", 13, 'grep "^2026" app.log', "ביטוי רגולרי: שורות שמתחילות ב-2026", "Regular expression: lines starting with 2026"),
  e("text", 13, "wc -l file.txt", "ספירת שורות", "Count lines"),
  e("text", 13, "cut -d, -f2 data.csv", "עמודה 2 בקובץ מופרד בפסיקים", "Column 2 of a comma-separated file"),
  e("text", 13, "sort -rn numbers.txt", "מיון מספרי, מהגדול לקטן", "Numeric sort, largest first"),
  e("text", 13, "sort | uniq -c", "ספירת כפילויות", "Count duplicates"),
  e("text", 13, "tr a-z A-Z", "החלפת תווים (כאן: לאותיות גדולות)", "Translate characters (here: to uppercase)"),
  e("text", 13, "sed 's/old/new/g' file.txt", "חיפוש והחלפה בפלט", "Find and replace in the output"),
  e("text", 13, "sed -i 's/old/new/g' file.txt", "חיפוש והחלפה בתוך הקובץ עצמו", "Find and replace in the file itself"),
  e("text", 13, "awk '{print $1}' file.txt", "העמודה הראשונה", "The first column"),
  e("text", 13, "awk -F: '{print $1}' /etc/passwd", "עמודה לפי מפריד אחר", "A column with another separator"),

  // Finding files
  e("finding", 14, 'find ~ -name "*.txt"', "קבצים לפי שם", "Files by name"),
  e("finding", 14, 'find ~ -iname "*.TXT"', "לפי שם, בלי הבדל אותיות", "By name, ignoring case"),
  e("finding", 14, "find ~ -type d -name projects", "רק תיקיות", "Directories only"),
  e("finding", 14, "find / -size +100M 2>/dev/null", "קבצים גדולים מ-100MB", "Files over 100MB"),
  e("finding", 14, "find ~ -mtime -1 -type f", "קבצים ששונו ביממה האחרונה", "Files changed in the last day"),
  e("finding", 14, 'find . -name "*.tmp" -delete', "מחיקת מה שנמצא. בדקו קודם בלי -delete", "Delete what's found. Check without -delete first"),
  e("finding", 14, "find . -size +1M -exec ls -lh {} \\;", "הרצת פקודה על כל מה שנמצא", "Run a command on everything found"),
  e("finding", 14, "locate os-release", "חיפוש מהיר במאגר (sudo updatedb מרענן)", "Fast lookup in a database (sudo updatedb refreshes)"),
  e("finding", 14, "which python3", "איפה נמצאת תוכנה", "Where a program lives"),
  e("finding", 14, 'find . -name "*.py" | xargs wc -l', "מרשימת קבצים לארגומנטים של פקודה", "Turn a list of files into a command's arguments"),

  // Environment and shell
  e("environment", 15, "echo $HOME", "קריאת משתנה", "Read a variable"),
  e("environment", 15, "env", "כל משתני הסביבה", "Every environment variable"),
  e("environment", 15, 'CITY="Haifa"', "יצירת משתנה (בלי רווחים סביב =)", "Create a variable (no spaces around =)"),
  e("environment", 15, "export CITY", "העברת המשתנה לתוכנות שהטרמינל מריץ", "Pass the variable to programs the shell runs"),
  e("environment", 15, "unset CITY", "מחיקת משתנה", "Delete a variable"),
  e("environment", 15, "echo $PATH", "התיקיות שבהן מחפשים פקודות", "Where the shell looks for commands"),
  e("environment", 15, 'export PATH="$PATH:$HOME/tools"', "הוספת תיקייה ל-PATH", "Add a directory to PATH"),
  e("environment", 15, "alias ll='ls -la'", "קיצור דרך לפקודה", "A shortcut for a command"),
  e("environment", 15, "source ~/.bashrc", "טעינה מחדש של ההגדרות", "Reload your settings"),
  e("environment", 15, "!!", "הפקודה האחרונה שוב (למשל sudo !!)", "The last command again (e.g. sudo !!)"),

  // Networking
  e("network", 16, "ip -br a", "הכתובות של המחשב", "This machine's addresses"),
  e("network", 16, "ping -c 4 kernel.org", "יש חיבור? 4 בדיקות", "Is it reachable? 4 tries"),
  e("network", 16, "getent hosts kernel.org", "שאילתת DNS: איזו כתובת מאחורי השם", "DNS lookup: the address behind a name"),
  e("network", 16, "curl https://example.com", "הורדת דף והצגתו", "Fetch a page and print it"),
  e("network", 16, "curl -I https://example.com", "רק הכותרות של התשובה", "Response headers only"),
  e("network", 16, "wget https://example.com/file.zip", "הורדת קובץ", "Download a file"),
  e("network", 16, "ss -tln", "אילו פורטים מאזינים", "Which ports are listening"),
  e("network", 16, "ssh dana@192.168.1.50", "טרמינל במחשב אחר", "A terminal on another machine"),
  e("network", 16, "scp file.txt dana@192.168.1.50:~/", "העתקת קובץ לשרת", "Copy a file to a server"),
  e("network", 16, "scp -r site/ dana@192.168.1.50:~/", "העתקת תיקייה לשרת", "Copy a directory to a server"),

  // Archives and compression
  e("archives", 17, "tar -czf backup.tar.gz dir/", "אריזה ודחיסה (gzip)", "Pack and compress (gzip)"),
  e("archives", 17, "tar -cJf backup.tar.xz dir/", "אריזה ודחיסה חזקה יותר (xz)", "Pack with stronger compression (xz)"),
  e("archives", 17, "tar -tzf backup.tar.gz", "מה יש בארכיון", "List an archive"),
  e("archives", 17, "tar -xzf backup.tar.gz", "פתיחה בתיקייה הנוכחית", "Extract here"),
  e("archives", 17, "tar -xzf backup.tar.gz -C restore/", "פתיחה לתיקייה אחרת", "Extract into another directory"),
  e("archives", 17, "gzip big.log", "דחיסת קובץ בודד (מחליפה אותו ב-.gz)", "Compress one file (replaces it with .gz)"),
  e("archives", 17, "gunzip big.log.gz", "פתיחת קובץ .gz", "Decompress a .gz file"),
  e("archives", 17, "zip -r site.zip site/", "יצירת zip", "Create a zip"),
  e("archives", 17, "unzip site.zip", "פתיחת zip", "Extract a zip"),

  // Scripting
  e("scripting", 18, "#!/bin/bash", "השורה הראשונה בסקריפט (shebang)", "A script's first line (shebang)"),
  e("scripting", 18, "./script.sh", "הרצת סקריפט (אחרי chmod +x)", "Run a script (after chmod +x)"),
  e("scripting", 18, 'read -p "Name: " name', "קלט מהמשתמש", "Read user input"),
  e("scripting", 18, '"$1"', "הארגומנט הראשון לסקריפט", "The script's first argument"),
  e("scripting", 18, 'if [ -f "$file" ]; then ... fi', "תנאי: האם הקובץ קיים", "Condition: does the file exist"),
  e("scripting", 18, "for f in *.txt; do ... done", "לולאה על קבצים", "Loop over files"),
  e("scripting", 18, "echo $?", "קוד היציאה של הפקודה האחרונה (0 = הצלחה)", "Last command's exit code (0 = success)"),
  e("scripting", 18, "mkdir logs && cd logs", "הפקודה השנייה רק אם הראשונה הצליחה", "Run the second only if the first succeeded"),
  e("scripting", 18, "set -euo pipefail", "עצירה בשגיאה הראשונה", "Stop at the first error"),

  // Services, scheduling and logs
  e("services", 19, "crontab -e", "עריכת המשימות המתוזמנות", "Edit your scheduled jobs"),
  e("services", 19, "crontab -l", "הצגת המשימות המתוזמנות", "List your scheduled jobs"),
  e("services", 19, "*/15 * * * * /path/to/script.sh", "שורת cron: כל 15 דקות", "A cron line: every 15 minutes"),
  e("services", 19, "systemctl status ssh", "מצב של שירות", "A service's status"),
  e("services", 19, "sudo systemctl restart ssh", "הפעלה מחדש של שירות", "Restart a service"),
  e("services", 19, "sudo systemctl enable --now myapp", "הפעלה עכשיו ובכל הדלקה", "Start now and at every boot"),
  e("services", 19, "sudo systemctl daemon-reload", "טעינת קבצי unit אחרי שינוי", "Reload unit files after a change"),
  e("services", 19, "systemctl --user list-timers", "ה-timers שלכם ומתי ירוצו", "Your timers and when they run"),
  e("services", 19, 'systemd-analyze calendar "Mon *-*-* 09:00"', "בדיקת ביטוי זמן של timer", "Check a timer's time expression"),
  e("services", 20, "journalctl -u ssh --since today", "הלוג של שירות, מהיום", "A service's log, since today"),
  e("services", 20, "journalctl -p err -b", "רק שגיאות, מאז ההדלקה", "Errors only, since boot"),
  e("services", 20, "journalctl -f", "מעקב אחרי היומן בזמן אמת", "Follow the journal live"),
  e("services", 20, "sudo dmesg", "הודעות הליבה", "Kernel messages"),
  e("services", 20, 'logger "test message"', "כתיבת שורה ליומן המערכת", "Write a line to the system log"),

  // Disks
  e("disks", 21, "df -h", "כמה מקום פנוי בכל דיסק", "Free space on each disk"),
  e("disks", 21, "du -sh ~/Downloads", "כמה מקום תופסת תיקייה", "How much space a directory takes"),
  e("disks", 21, "du -sh * | sort -rh | head", "מה תופס הכי הרבה מקום", "What takes the most space"),
  e("disks", 21, "lsblk", "אילו דיסקים ומחיצות יש", "List disks and partitions"),
  e("disks", 21, "sudo mount /dev/sdb1 /mnt/usb", "עיגון מחיצה לתיקייה", "Mount a partition on a directory"),
  e("disks", 21, "sudo umount /mnt/usb", "ניתוק בבטחה, לפני שמוציאים את הדיסק", "Unmount safely before unplugging"),

  // Security
  e("security", 22, "sudo ufw allow OpenSSH", "פתיחת SSH בחומת האש (לפני שמפעילים!)", "Allow SSH through the firewall (before enabling!)"),
  e("security", 22, "sudo ufw enable", "הפעלת חומת האש", "Turn the firewall on"),
  e("security", 22, "sudo ufw status verbose", "מצב חומת האש", "Firewall status"),
  e("security", 22, 'ssh-keygen -t ed25519 -C "dana@laptop"', "יצירת זוג מפתחות SSH", "Create an SSH key pair"),
  e("security", 22, "ssh-copy-id dana@192.168.1.50", "העתקת המפתח הציבורי לשרת", "Copy your public key to a server"),
  e("security", 22, "sudo lastb", "ניסיונות התחברות שנכשלו", "Failed login attempts"),

  // Git
  e("git", 23, 'git config --global user.name "Dana"', "הגדרת שם (פעם אחת)", "Set your name (once)"),
  e("git", 23, "git init", "מאגר חדש בתיקייה", "New repository here"),
  e("git", 23, "git clone https://github.com/user/repo.git", "העתקת מאגר קיים", "Copy an existing repository"),
  e("git", 23, "git status", "מה השתנה ומה מוכן לשמירה", "What changed and what's staged"),
  e("git", 23, "git add .", "הוספת השינויים לשמירה הבאה", "Stage changes"),
  e("git", 23, 'git commit -m "Describe the change"', "שמירת נקודה בהיסטוריה", "Save a snapshot"),
  e("git", 23, "git log --oneline", "ההיסטוריה בקצרה", "Short history"),
  e("git", 23, "git diff", "השינויים שעוד לא נשמרו", "Unsaved changes"),
  e("git", 23, "git switch -c feature", "ענף חדש ומעבר אליו", "Create a branch and switch to it"),
  e("git", 23, "git merge feature", "מיזוג ענף לענף הנוכחי", "Merge a branch into the current one"),
  e("git", 23, "git restore file.txt", "ביטול שינויים בקובץ", "Discard changes to a file"),
  e("git", 23, "git push -u origin main", "העלאה ל-GitHub בפעם הראשונה", "First push to GitHub"),
  e("git", 23, "git pull", "הורדת שינויים מהשרת", "Get changes from the server"),

  // Docker
  e("docker", 24, "docker run hello-world", "הקונטיינר הראשון", "Your first container"),
  e("docker", 24, "docker run -d --name web -p 8080:80 nginx", "שרת ברקע, על פורט 8080", "A server in the background, on port 8080"),
  e("docker", 24, "docker ps", "קונטיינרים שרצים", "Running containers"),
  e("docker", 24, "docker ps -a", "כל הקונטיינרים, גם עצורים", "All containers, stopped too"),
  e("docker", 24, "docker logs -f web", "הלוג של קונטיינר", "A container's log"),
  e("docker", 24, "docker exec -it web bash", "טרמינל בתוך קונטיינר", "A shell inside a container"),
  e("docker", 24, "docker stop web", "עצירה", "Stop"),
  e("docker", 24, "docker rm web", "מחיקת קונטיינר", "Remove a container"),
  e("docker", 24, "docker images", "ה-images שהורדתם", "Downloaded images"),
  e("docker", 24, "docker build -t my-site .", "בניית image מ-Dockerfile", "Build an image from a Dockerfile"),
  e("docker", 24, "docker volume create pgdata", "volume: מידע ששורד מחיקה של קונטיינר", "A volume: data that outlives the container"),
  e("docker", 24, "docker system df", "כמה מקום Docker תופס", "How much space Docker uses"),
];
