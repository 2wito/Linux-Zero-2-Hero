// Practice challenges (chapter 28), four per level. Every solution was run on Ubuntu 24.04 (WSL) on 2026-11-13;
// the beginner ones also run in the terminal simulator (missions "challenge-*" in lib/simulator/missions.ts).
// Strings support `backticks` and **bold** (rendered by InlineCode). tests/reference-pages.test.ts checks the shape.

import type { MissionId } from "@/lib/simulator/missions";

export type ChallengeLevel = "beginner" | "intermediate" | "advanced";
type Text = { he: string; en: string };

export type Challenge = {
  id: string;
  level: ChallengeLevel;
  /** The learning chapters this challenge practices. */
  chapters: number[];
  title: Text;
  task: Text;
  hint: Text;
  solution: {
    /** A file to write (a script, crontab lines), shown as a code block. */
    file?: { name: string; code: string };
    /** Commands to type, one per line, each starting with "$ " (TerminalWindow format). */
    commands?: string;
    explain: Text;
  };
  /** A simulator mission for practicing this challenge safely in the browser. */
  mission?: MissionId;
};

export const challengeLevels: ChallengeLevel[] = ["beginner", "intermediate", "advanced"];

export const challengeLevelIntro: Record<ChallengeLevel, Text> = {
  beginner: {
    he: "ניווט, קבצים וקריאה (פרקים 4–8). את שלושת הראשונים אפשר לפתור כאן בסימולטור, בלי שום סיכון.",
    en: "Navigation, files and reading (chapters 4–8). The first three can be solved right here in the simulator, with zero risk.",
  },
  intermediate: {
    he: "הרשאות, צינורות, חיפוש וארכיונים (פרקים 9–17). פתרו אותם בטרמינל אמיתי.",
    en: "Permissions, pipes, searching and archives (chapters 9–17). Solve them in a real terminal.",
  },
  advanced: {
    he: "סקריפטים, תזמון, תהליכים ו-Git (פרקים 18–25). כאן כבר בונים כלים קטנים.",
    en: "Scripts, scheduling, processes and Git (chapters 18–25). Here you start building small tools.",
  },
};

export const challenges: Challenge[] = [
  // Beginner
  {
    id: "treasure",
    level: "beginner",
    chapters: [5],
    title: { he: "ציד אוצרות", en: "Treasure hunt" },
    task: {
      he: "בתיקיית הבית מוסתרת תיקייה עם מפה. מצאו אותה, קראו את המפה, ועקבו אחריה עד האוצר.",
      en: "A directory with a map is hidden in your home directory. Find it, read the map, and follow it to the treasure.",
    },
    hint: {
      he: "`ls` רגילה לא מציגה קבצים ותיקיות ששמם מתחיל בנקודה. איזו אפשרות של `ls` מציגה **הכול**?",
      en: "A plain `ls` doesn't show files and directories whose names start with a dot. Which `ls` option shows **all** of them?",
    },
    solution: {
      commands: "$ ls -a\n$ ls .cave\n$ cat .cave/map.txt\n$ ls -a Documents\n$ cat Documents/.chest.txt",
      explain: {
        he: "שמות שמתחילים בנקודה מוסתרים, ו-`-a` (all) מציגה גם אותם. המפה אמרה שגם האוצר מתחיל בנקודה, אז שוב `ls -a`, הפעם על `Documents`.",
        en: "Names that start with a dot are hidden, and `-a` (all) shows them too. The map said the treasure starts with a dot as well, so `ls -a` again, this time on `Documents`.",
      },
    },
    mission: "challenge-treasure",
  },
  {
    id: "organize",
    level: "beginner",
    chapters: [6],
    title: { he: "מסדרים את ההורדות", en: "Tidy up Downloads" },
    task: {
      he: "בתיקייה `Downloads` יש שלוש תמונות מהים, חשבונית וקובץ זמני. צרו `Pictures/beach` והעבירו אליה את כל התמונות **בפקודה אחת**. את החשבונית העבירו ל-`Documents`, ואת הקובץ הזמני מחקו.",
      en: "`Downloads` holds three beach photos, an invoice and a temporary file. Create `Pictures/beach` and move all the photos into it **in one command**. Move the invoice to `Documents`, and delete the temporary file.",
    },
    hint: {
      he: "`mkdir -p` יוצרת כמה רמות של תיקיות בבת אחת. וכדי לתפוס את כל קבצי ה-`.jpg` בלי להקליד כל שם, השתמשו בכוכבית.",
      en: "`mkdir -p` creates several levels of directories at once. To catch every `.jpg` without typing each name, use an asterisk.",
    },
    solution: {
      commands: "$ mkdir -p Pictures/beach\n$ mv Downloads/*.jpg Pictures/beach/\n$ mv Downloads/invoice.pdf Documents/\n$ rm Downloads/setup.tmp\n$ ls Downloads",
      explain: {
        he: "`-p` יוצרת גם את `Pictures` וגם את `beach`. ה-shell מחליף את `*.jpg` בכל הקבצים שנגמרים ב-`.jpg`, כך ש-`mv` מקבלת את שלושתם. בסוף `ls Downloads` לא מדפיסה כלום: התיקייה ריקה.",
        en: "`-p` creates both `Pictures` and `beach`. The shell replaces `*.jpg` with every file ending in `.jpg`, so `mv` gets all three. At the end `ls Downloads` prints nothing: the directory is empty.",
      },
    },
    mission: "challenge-organize",
  },
  {
    id: "shopping",
    level: "beginner",
    chapters: [6, 7],
    title: { he: "גיבוי לפני עריכה", en: "Back up before you edit" },
    task: {
      he: "לפני שנוגעים ברשימת הקניות `shopping.txt`, גבו אותה ל-`shopping.bak`. אחר כך הוסיפו לסוף הרשימה שני מוצרים בלי לפתוח עורך, הציגו רק את 3 השורות האחרונות, ובדקו אם `coffee` ברשימה.",
      en: "Before touching the shopping list `shopping.txt`, back it up to `shopping.bak`. Then add two items to the end without opening an editor, show only the last 3 lines, and check whether `coffee` is on the list.",
    },
    hint: {
      he: "`echo` עם `>>` מוסיפה שורה לסוף קובץ. זהירות: `>` אחד מוחק את כל מה שהיה בקובץ.",
      en: "`echo` with `>>` appends a line to a file. Careful: a single `>` wipes out everything that was in the file.",
    },
    solution: {
      commands: '$ cp shopping.txt shopping.bak\n$ echo "honey" >> shopping.txt\n$ echo "dates" >> shopping.txt\n$ tail -n 3 shopping.txt\n$ grep coffee shopping.txt',
      explain: {
        he: "קודם גיבוי, ורק אחר כך שינוי. `>>` מוסיפה לסוף הקובץ. עם `>` אחד, הייתם מוחקים את הרשימה ומשאירים בה רק את השורה החדשה, ובדיוק בשביל זה עשינו גיבוי.",
        en: "Back up first, change second. `>>` appends to the end of the file. With a single `>` you would have erased the list and kept only the new line, which is exactly why we made a backup.",
      },
    },
    mission: "challenge-shopping",
  },
  {
    id: "man-sort",
    level: "beginner",
    chapters: [8],
    title: { he: "תמצאו לבד", en: "Look it up yourself" },
    task: {
      he: "ל-`ls` יש אפשרות שממיינת קבצים לפי גודל, מהגדול לקטן. מצאו אותה בתוך `man ls`, בלי לחפש באינטרנט. אחר כך הציגו את `/var/log` ממוינת לפי גודל, ברשימה מפורטת עם גדלים קריאים (כמו `4.0K`).",
      en: "`ls` has an option that sorts files by size, largest first. Find it inside `man ls`, without searching the web. Then list `/var/log` sorted by size, in long format with readable sizes (like `4.0K`).",
    },
    hint: {
      he: "בתוך `man`, הקלידו `/` ואחריו מילה, למשל `/size`, ולחצו Enter. `n` קופצת לתוצאה הבאה, ו-`q` יוצאת.",
      en: "Inside `man`, type `/` followed by a word, for example `/size`, and press Enter. `n` jumps to the next match, and `q` quits.",
    },
    solution: {
      commands: "$ man ls\n$ ls -lhS /var/log",
      explain: {
        he: "החיפוש `/size` מגיע לשורה `-S  sort by file size, largest first`. `-l` רשימה מפורטת, `-h` גדלים קריאים, ו-`-S` מיון לפי גודל, ואפשר לחבר את שלושתן ל-`-lhS`. רוצים מהקטן לגדול? הוסיפו `-r` (reverse), שגם היא מופיעה ב-`man ls`.",
        en: "Searching `/size` lands on the line `-S  sort by file size, largest first`. `-l` is long format, `-h` readable sizes and `-S` sorts by size; the three combine into `-lhS`. Want smallest first? Add `-r` (reverse), which is also in `man ls`.",
      },
    },
  },

  // Intermediate
  {
    id: "permission",
    level: "intermediate",
    chapters: [9],
    title: { he: "הסקריפט שלא רוצה לרוץ", en: "The script that won't run" },
    task: {
      he: "צרו קובץ `hello.sh` עם שורה אחת: `echo \"Hello from my script\"`. נסו להריץ אותו עם `./hello.sh`. זה ייכשל. גלו למה, תקנו, והריצו שוב.",
      en: "Create a file `hello.sh` with one line: `echo \"Hello from my script\"`. Try to run it with `./hello.sh`. It will fail. Find out why, fix it, and run it again.",
    },
    hint: {
      he: "הסתכלו על ההרשאות בפלט של `ls -l hello.sh`. איזו אות חסרה שם?",
      en: "Look at the permissions in the output of `ls -l hello.sh`. Which letter is missing?",
    },
    solution: {
      commands: "$ echo 'echo \"Hello from my script\"' > hello.sh\n$ ./hello.sh\n$ ls -l hello.sh\n$ chmod u+x hello.sh\n$ ./hello.sh",
      explain: {
        he: "קובץ חדש נוצר בלי הרשאת הרצה (`-rw-r--r--`), ולכן `./hello.sh` נכשלת עם `Permission denied`. `chmod u+x` נותנת לבעלים (`u`) הרשאת הרצה (`x`), ועכשיו `ls -l` מראה `-rwxr--r--` והסקריפט רץ.",
        en: "A new file is created without execute permission (`-rw-r--r--`), so `./hello.sh` fails with `Permission denied`. `chmod u+x` gives the owner (`u`) execute permission (`x`); now `ls -l` shows `-rwxr--r--` and the script runs.",
      },
    },
  },
  {
    id: "shells",
    level: "intermediate",
    chapters: [12, 13],
    title: { he: "מי משתמש באיזה shell?", en: "Who uses which shell?" },
    task: {
      he: "בקובץ `/etc/passwd` יש שורה לכל משתמש במערכת, והשדה האחרון בה הוא ה-shell שלו. (1) כמה משתמשים עובדים עם `/bin/bash`? (2) הציגו כל shell עם מספר המשתמשים שלו, מהנפוץ לנדיר.",
      en: "`/etc/passwd` has one line per user on the system, and its last field is that user's shell. (1) How many users have `/bin/bash`? (2) Show every shell with its number of users, most common first.",
    },
    hint: {
      he: "השדות מופרדים בנקודתיים (`:`), וה-shell הוא השדה השביעי. זכרו את השרשרת `sort | uniq -c | sort -rn` מפרק 13.",
      en: "Fields are separated by colons (`:`), and the shell is field seven. Remember the `sort | uniq -c | sort -rn` chain from chapter 13.",
    },
    solution: {
      commands: "$ grep -c '/bin/bash$' /etc/passwd\n$ cut -d: -f7 /etc/passwd | sort | uniq -c | sort -rn",
      explain: {
        he: "`grep -c` סופרת שורות מתאימות, ו-`$` בסוף התבנית אומר \"בסוף השורה\". `cut -d: -f7` שולפת רק את ה-shell, `sort` מצמידה כפילויות, `uniq -c` סופרת אותן, ו-`sort -rn` מסדרת מהגדול לקטן. ברוב המערכות תראו הרבה `/usr/sbin/nologin`: משתמשי מערכת שלא אמורים להתחבר בכלל.",
        en: "`grep -c` counts matching lines, and the `$` at the end of the pattern means \"at the end of the line\". `cut -d: -f7` pulls out just the shell, `sort` puts duplicates side by side, `uniq -c` counts them and `sort -rn` orders them from largest to smallest. On most systems you'll see lots of `/usr/sbin/nologin`: system users that are never supposed to log in.",
      },
    },
  },
  {
    id: "recent-txt",
    level: "intermediate",
    chapters: [14],
    title: { he: "מה כתבתי השבוע?", en: "What did I write this week?" },
    task: {
      he: "מצאו את כל קבצי ה-`.txt` בתיקיית הבית ששונו בשבוע האחרון, והציגו כמה שורות יש בכל אחד. שימו לב: בחלק מהשמות עלולים להיות רווחים.",
      en: "Find every `.txt` file in your home directory that changed in the last week, and show how many lines each one has. Watch out: some names may contain spaces.",
    },
    hint: {
      he: "`-mtime -7` מוצאת קבצים ששונו בשבוע האחרון. כדי להעביר את הרשימה ל-`wc -l` בבטחה גם כשיש רווחים, השתמשו בזוג `-print0` ו-`xargs -0`.",
      en: "`-mtime -7` finds files changed in the last week. To pass the list to `wc -l` safely even with spaces in names, use the `-print0` and `xargs -0` pair.",
    },
    solution: {
      commands: '$ find ~ -type f -name "*.txt" -mtime -7\n$ find ~ -type f -name "*.txt" -mtime -7 -print0 | xargs -0 wc -l',
      explain: {
        he: "`-mtime -7` פירושו \"שונה לפני פחות מ-7 ימים\". `-print0` מפרידה בין השמות בתו מיוחד במקום ברווח, ו-`xargs -0` יודעת לקרוא אותם כך. בלי הזוג הזה, קובץ בשם `my notes.txt` היה נשבר לשני שמות. בסוף `wc -l` מוסיפה שורת `total` עם הסכום.",
        en: "`-mtime -7` means \"changed less than 7 days ago\". `-print0` separates names with a special character instead of a space, and `xargs -0` knows how to read them that way. Without the pair, a file called `my notes.txt` would split into two names. At the end `wc -l` adds a `total` line with the sum.",
      },
    },
  },
  {
    id: "dated-backup",
    level: "intermediate",
    chapters: [17],
    title: { he: "גיבוי עם תאריך", en: "A dated backup" },
    task: {
      he: "ארזו תיקייה (למשל `notes`) לארכיון דחוס ששמו כולל את התאריך של היום, כמו `backup-2026-11-13.tar.gz`. הציגו את התוכן שלו בלי לחלץ, ואז חלצו אותו לתיקיית בדיקה חדשה `restore-test`, כדי לוודא שהגיבוי באמת עובד.",
      en: "Pack a directory (say `notes`) into a compressed archive whose name includes today's date, like `backup-2026-11-13.tar.gz`. List its contents without extracting, then extract it into a new test directory `restore-test` to make sure the backup really works.",
    },
    hint: {
      he: "`c` יוצרת, `t` מציגה, `x` מחלצת, `z` ל-gzip ו-`f` לשם הקובץ. `-C` מחלצת לתיקייה אחרת. את התאריך אפשר להקליד ביד, או לתת ל-`$(date +%F)` לכתוב אותו.",
      en: "`c` creates, `t` lists, `x` extracts, `z` is gzip and `f` names the file. `-C` extracts into another directory. You can type the date by hand, or let `$(date +%F)` write it.",
    },
    solution: {
      commands:
        "$ tar -czf backup-$(date +%F).tar.gz notes\n$ tar -tzf backup-$(date +%F).tar.gz\n$ mkdir restore-test\n$ tar -xzf backup-$(date +%F).tar.gz -C restore-test\n$ ls restore-test/notes",
      explain: {
        he: "`$(date +%F)` מוחלפת בתאריך של היום בפורמט `2026-11-13` (פרק 18). חילוץ לתיקייה נפרדת הוא הדרך הבטוחה לבדוק גיבוי: `tar -x` מחליפה בשקט קבצים קיימים באותו שם, אז לא מחלצים מעל המקור.",
        en: "`$(date +%F)` is replaced with today's date in `2026-11-13` format (chapter 18). Extracting into a separate directory is the safe way to test a backup: `tar -x` silently overwrites files with the same name, so never extract on top of the original.",
      },
    },
  },

  // Advanced
  {
    id: "log-report",
    level: "advanced",
    chapters: [18],
    title: { he: "דוח לוג", en: "Log report" },
    task: {
      he: "כתבו סקריפט `report.sh` שמקבל קובץ לוג כארגומנט, ומדפיס כמה שורות יש בו מכל רמה: `INFO`, `WARN` ו-`ERROR`. אם לא קיבל קובץ, או שהקובץ לא קיים, הוא מדפיס הודעת שימוש ויוצא עם קוד `1`. התחילו אותו ב-`set -euo pipefail`.",
      en: "Write a script `report.sh` that takes a log file as an argument and prints how many lines it has at each level: `INFO`, `WARN` and `ERROR`. If it gets no file, or the file doesn't exist, it prints a usage message and exits with code `1`. Start it with `set -euo pipefail`.",
    },
    hint: {
      he: "בדקו את הסקריפט על לוג שאין בו אף שורת `WARN`. כש-`grep -c` לא מוצאת כלום, היא מדפיסה `0` **ויוצאת עם קוד 1**. מה `set -e` עושה עם זה?",
      en: "Test the script on a log with no `WARN` lines at all. When `grep -c` finds nothing it prints `0` **and exits with code 1**. What does `set -e` do with that?",
    },
    solution: {
      file: {
        name: "report.sh",
        code: '#!/bin/bash\nset -euo pipefail\n\nlog="${1:-}"\n\nif [ -z "$log" ] || [ ! -f "$log" ]; then\n    echo "Usage: $0 <logfile>" >&2\n    exit 1\nfi\n\nfor level in INFO WARN ERROR; do\n    count=$(grep -c "$level" "$log" || true)\n    echo "$level: $count"\ndone',
      },
      commands: "$ chmod +x report.sh\n$ ./report.sh app.log",
      explain: {
        he: "הלולאה עוברת על שלוש הרמות. `|| true` היא המפתח: בלעדיה, על לוג בלי `WARN` הסקריפט מדפיס את `INFO` ונעצר בשקט עם קוד 1 (בדקנו). `>&2` שולחת את הודעת השימוש לערוץ השגיאות, ו-`${1:-}` מונעת מ-`set -u` לעצור כשאין ארגומנט בכלל.",
        en: "The loop goes over the three levels. `|| true` is the key: without it, on a log with no `WARN` the script prints `INFO` and then quietly stops with code 1 (we checked). `>&2` sends the usage message to the error stream, and `${1:-}` keeps `set -u` from stopping when there's no argument at all.",
      },
    },
  },
  {
    id: "cron-lines",
    level: "advanced",
    chapters: [19],
    title: { he: "מתזמנים גיבוי", en: "Schedule a backup" },
    task: {
      he: "יש לכם סקריפט גיבוי ב-`/home/dana/bin/backup.sh`. כתבו שלוש שורות crontab שמריצות אותו: (1) כל יום ב-02:30 בלילה. (2) כל יום שני ב-09:00. (3) כל 15 דקות, רק בימים ראשון עד חמישי.",
      en: "You have a backup script at `/home/dana/bin/backup.sh`. Write three crontab lines that run it: (1) every day at 02:30 at night. (2) every Monday at 09:00. (3) every 15 minutes, Sunday to Thursday only.",
    },
    hint: {
      he: "סדר השדות: דקה, שעה, יום בחודש, חודש, יום בשבוע. ראשון הוא `0` ושני הוא `1`. טווח כותבים עם מקף, ו-`*/15` אומר \"כל 15\".",
      en: "Field order: minute, hour, day of month, month, day of week. Sunday is `0` and Monday is `1`. A range takes a hyphen, and `*/15` means \"every 15\".",
    },
    solution: {
      file: {
        name: "crontab -e",
        code: "30 2 * * * /home/dana/bin/backup.sh\n0 9 * * 1 /home/dana/bin/backup.sh\n*/15 * * * 0-4 /home/dana/bin/backup.sh",
      },
      explain: {
        he: "הדקה באה **לפני** השעה, אז 02:30 היא `30 2`. נתיב מלא לסקריפט חשוב, כי cron רץ עם `PATH` מצומצם (פרק 19). מכניסים את השורות עם `crontab -e`, ובודקים עם `crontab -l`. לפני ששומרים, כדאי לבדוק כל שורה ב-crontab.guru.",
        en: "The minute comes **before** the hour, so 02:30 is `30 2`. A full path to the script matters, because cron runs with a minimal `PATH` (chapter 19). Add the lines with `crontab -e` and check them with `crontab -l`. Before saving, it's worth checking each line on crontab.guru.",
      },
    },
  },
  {
    id: "memory-hogs",
    level: "advanced",
    chapters: [11, 13, 25],
    title: { he: "מי אוכל את הזיכרון?", en: "Who's eating the memory?" },
    task: {
      he: "המחשב איטי, וחושדים שתהליך כלשהו אוכל זיכרון. הציגו את 5 התהליכים שצורכים הכי הרבה זיכרון. אחר כך הציגו עבורם רק שלוש עמודות: מספר התהליך (PID), אחוז הזיכרון ושם הפקודה.",
      en: "The machine is slow and you suspect some process is eating memory. Show the 5 processes using the most memory. Then show just three columns for them: the process ID (PID), the memory percentage and the command name.",
    },
    hint: {
      he: "`ps aux` יודעת למיין עם `--sort`, ו-`-` לפני שם העמודה הופך את הסדר. השורה הראשונה בפלט היא כותרת, אז צריך 6 שורות. לשליפת עמודות: `awk` מפרק 13.",
      en: "`ps aux` can sort with `--sort`, and a `-` before the column name reverses the order. The first output line is a header, so you need 6 lines. To pull out columns: `awk` from chapter 13.",
    },
    solution: {
      commands: "$ ps aux --sort=-%mem | head -n 6\n$ ps aux --sort=-%mem | head -n 6 | awk '{print $2, $4, $11}'",
      explain: {
        he: "`--sort=-%mem` ממיינת לפי זיכרון, מהגבוה לנמוך. `head -n 6` משאירה את הכותרת ועוד 5 תהליכים. ב-`ps aux` העמודה השנייה היא `PID`, הרביעית `%MEM` והאחת-עשרה `COMMAND`, ו-`awk` מדפיסה רק אותן. מצאתם אשם? `kill` עם ה-PID שלו (פרק 11).",
        en: "`--sort=-%mem` sorts by memory, highest first. `head -n 6` keeps the header plus 5 processes. In `ps aux` column two is `PID`, column four `%MEM` and column eleven `COMMAND`, and `awk` prints only those. Found the culprit? `kill` its PID (chapter 11).",
      },
    },
  },
  {
    id: "git-unstage",
    level: "advanced",
    chapters: [23],
    title: { he: "חילוץ ב-Git", en: "Git rescue" },
    task: {
      he: "במאגר Git יצרתם קובץ `secrets.txt` עם סיסמה, והרצתם `git add .` לפני ה-commit. אופס: הקובץ באזור ההכנה. הוציאו אותו משם **בלי למחוק אותו**, ודאגו ש-Git תתעלם ממנו מעכשיו.",
      en: "In a Git repository you created `secrets.txt` with a password and ran `git add .` before committing. Oops: the file is in the staging area. Take it out **without deleting it**, and make sure Git ignores it from now on.",
    },
    hint: {
      he: "`git status` עצמה מציעה איך מוציאים קובץ מאזור ההכנה. ולקבצים שלא רוצים לשמור לעולם יש קובץ מיוחד (פרק 23).",
      en: "`git status` itself suggests how to take a file out of the staging area. And there's a special file for things you never want to save (chapter 23).",
    },
    solution: {
      commands: '$ git status --short\n$ git restore --staged secrets.txt\n$ echo "secrets.txt" >> .gitignore\n$ git status --short',
      explain: {
        he: "`git restore --staged` מוציאה את הקובץ מאזור ההכנה, אבל הקובץ והתוכן שלו נשארים בתיקייה. אחרי ההוספה ל-`.gitignore`, `git status` כבר לא מציגה את `secrets.txt` בכלל, ורק `.gitignore` החדש מופיע. ואם כבר עשיתם commit עם סיסמה? החליפו את הסיסמה: מה שנכנס להיסטוריה של Git קשה מאוד למחוק באמת.",
        en: "`git restore --staged` takes the file out of the staging area, but the file and its contents stay in the directory. After adding it to `.gitignore`, `git status` no longer shows `secrets.txt` at all; only the new `.gitignore` appears. Already committed a password? Change the password: whatever enters Git history is very hard to truly erase.",
      },
    },
  },
];
