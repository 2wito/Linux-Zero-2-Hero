// Practice missions for the terminal simulator: a starting filesystem, suggestion chips and a task list
// whose checkmarks come from the shell's real state (files that exist, directories visited, commands run).

import { defaultHome, HOME, type Tree } from "@/lib/simulator/fs";
import type { Shell } from "@/lib/simulator/shell";

export type Task = { he: string; en: string; done: (sh: Shell) => boolean };
export type Mission = { home: Tree; chips: string[]; tasks: Task[] };

/** True when a command `name` ran successfully and `test` accepts its arguments. */
const ran = (sh: Shell, name: string, test: (args: string[]) => boolean = () => true) =>
  sh.log.some((e) => e.name === name && e.code === 0 && test(e.args));

const isFile = (sh: Shell, path: string) => sh.fs.get(path)?.type === "file";
const isDir = (sh: Shell, path: string) => sh.fs.get(path)?.type === "dir";
const hasFlag = (args: string[], flag: string) => args.some((a) => /^-[a-zA-Z]+$/.test(a) && a.includes(flag));

const shopping = ["milk", "eggs", "bread", "cheese", "tomatoes", "cucumbers", "apples", "rice", "pasta", "olive oil", "coffee", "chocolate"];

export const missions = {
  // Chapter 4: first commands.
  "first-commands": {
    home: defaultHome,
    chips: ["whoami", "pwd", 'echo "שלום, לינוקס!"', "history", "clear", "help"],
    tasks: [
      { he: "בדקו מי אתם עם `whoami`", en: "Check who you are with `whoami`", done: (sh) => ran(sh, "whoami") },
      { he: "הדפיסו משפט משלכם עם `echo`", en: "Print a sentence of your own with `echo`", done: (sh) => ran(sh, "echo", (a) => a.length > 0) },
      { he: "הקלידו `WHOAMI` באותיות גדולות, וראו מה קורה", en: "Type `WHOAMI` in capitals and see what happens", done: (sh) => sh.log.some((e) => e.name === "WHOAMI") },
      { he: "הציגו את כל מה שהרצתם עם `history`", en: "Show everything you ran with `history`", done: (sh) => ran(sh, "history") },
    ],
  },
  // Chapter 5: moving around.
  navigate: {
    home: defaultHome,
    chips: ["pwd", "ls", "ls -a", "cd projects", "cd ..", "cd /etc", "cd ~", "ls -l"],
    tasks: [
      { he: "היכנסו לתיקייה `projects`", en: "Go into the `projects` directory", done: (sh) => sh.visited.has(`${HOME}/projects`) },
      { he: "קפצו לתיקייה `/etc` עם נתיב מלא", en: "Jump to `/etc` with an absolute path", done: (sh) => sh.visited.has("/etc") },
      { he: "חזרו הביתה (רמז: `cd` לבד או `cd ~`)", en: "Go back home (hint: `cd` alone or `cd ~`)", done: (sh) => sh.visited.has("/etc") && sh.cwd === HOME },
      { he: "גלו את הקבצים המוסתרים בבית עם `ls -a`", en: "Reveal the hidden files at home with `ls -a`", done: (sh) => ran(sh, "ls", (a) => hasFlag(a, "a")) },
    ],
  },
  // Chapter 6: creating, copying, moving and deleting.
  "files-dirs": {
    home: { ...defaultHome, Downloads: { "photo1.jpg": "", "photo2.jpg": "", "report.pdf": "", "old-notes.txt": "old\n" } },
    chips: ["mkdir -p blog/posts", "touch blog/posts/hello.md", "cp -r blog blog-backup", "ls Downloads", "mv Downloads/report.pdf Documents/", "rm Downloads/old-notes.txt", "ls blog-backup"],
    tasks: [
      { he: "צרו את התיקיות `blog/posts` בפקודה אחת", en: "Create `blog/posts` in one command", done: (sh) => isDir(sh, `${HOME}/blog/posts`) },
      { he: "צרו קובץ ריק `blog/posts/hello.md`", en: "Create an empty file `blog/posts/hello.md`", done: (sh) => isFile(sh, `${HOME}/blog/posts/hello.md`) },
      { he: "גבו את כל `blog` לתיקייה `blog-backup`", en: "Back up all of `blog` to `blog-backup`", done: (sh) => isFile(sh, `${HOME}/blog-backup/posts/hello.md`) },
      { he: "העבירו את `report.pdf` מ-`Downloads` ל-`Documents`", en: "Move `report.pdf` from `Downloads` to `Documents`", done: (sh) => isFile(sh, `${HOME}/Documents/report.pdf`) && !sh.fs.get(`${HOME}/Downloads/report.pdf`) },
      { he: "מחקו את `Downloads/old-notes.txt`", en: "Delete `Downloads/old-notes.txt`", done: (sh) => !sh.fs.get(`${HOME}/Downloads/old-notes.txt`) },
    ],
  },
  // Chapter 7: reading files (and adding a line without an editor).
  "read-files": {
    home: { ...defaultHome, "shopping.txt": shopping.join("\n") + "\n" },
    chips: ["cat shopping.txt", "cat -n shopping.txt", "head -n 3 shopping.txt", "tail -n 2 shopping.txt", 'echo "honey" >> shopping.txt', "grep oil shopping.txt"],
    tasks: [
      { he: "הציגו את כל `shopping.txt` עם `cat`", en: "Show all of `shopping.txt` with `cat`", done: (sh) => ran(sh, "cat", (a) => a.some((x) => x.endsWith("shopping.txt"))) },
      { he: "הציגו רק את 3 השורות הראשונות", en: "Show only the first 3 lines", done: (sh) => ran(sh, "head", (a) => a.join(" ").includes("3")) },
      { he: "הציגו רק את 2 השורות האחרונות", en: "Show only the last 2 lines", done: (sh) => ran(sh, "tail", (a) => a.join(" ").includes("2")) },
      {
        he: "הוסיפו מוצר לסוף הרשימה עם `echo` ו-`>>`",
        en: "Add an item to the end of the list with `echo` and `>>`",
        done: (sh) => {
          const node = sh.fs.get(`${HOME}/shopping.txt`);
          return node?.type === "file" && node.content.startsWith(shopping.join("\n")) && node.content.split("\n").filter(Boolean).length > shopping.length;
        },
      },
    ],
  },
  // Chapter 9: permissions.
  permissions: {
    home: { ...defaultHome, "hello.sh": '#!/bin/bash\necho "Hello from my script"\n', "secret.txt": "my password is 1234\n" },
    chips: ["id", "ls -l", "./hello.sh", "ls -l secret.txt"],
    tasks: [
      { he: "בדקו לאילו קבוצות אתם שייכים עם `id`", en: "Check which groups you belong to with `id`", done: (sh) => ran(sh, "id") },
      { he: "נסו להריץ את `./hello.sh`, וקראו למה זה נכשל", en: "Try running `./hello.sh`, and read why it fails", done: (sh) => sh.log.some((e) => e.name === "./hello.sh") },
      {
        he: "תנו ל-`hello.sh` הרשאת הרצה, והריצו אותו בהצלחה",
        en: "Give `hello.sh` execute permission, and run it successfully",
        done: (sh) => ran(sh, "./hello.sh"),
      },
      {
        he: "הפכו את `secret.txt` לפרטי: רק אתם קוראים וכותבים (`600`)",
        en: "Make `secret.txt` private: only you can read and write it (`600`)",
        done: (sh) => (sh.fs.get(`${HOME}/secret.txt`)?.mode ?? 0) === 0o600,
      },
    ],
  },
  // Chapter 12: pipes and redirection.
  pipes: {
    home: { ...defaultHome, "shopping.txt": "bread\neggs\ncheese\nmilk\n" },
    chips: ["ls", "cat shopping.txt", "ls nosuch", "cat files.txt"],
    tasks: [
      {
        he: "שמרו את רשימת הקבצים בקובץ `files.txt` עם `>`",
        en: "Save the list of files to `files.txt` with `>`",
        done: (sh) => {
          const node = sh.fs.get(`${HOME}/files.txt`);
          return node?.type === "file" && node.content.length > 0;
        },
      },
      {
        he: "הוסיפו שורה לסוף `files.txt` עם `>>`",
        en: "Append a line to the end of `files.txt` with `>>`",
        done: (sh) => sh.log.some((e) => e.code === 0 && />>\s*files\.txt/.test(e.line)),
      },
      {
        he: "ספרו את השורות ב-`files.txt` בלי שהשם יודפס (רמז: `<`)",
        en: "Count the lines in `files.txt` without its name being printed (hint: `<`)",
        done: (sh) => sh.log.some((e) => e.name === "wc" && e.code === 0 && /<\s*files\.txt/.test(e.line)),
      },
      { he: "חברו שתי פקודות עם צינור `|`", en: "Connect two commands with a pipe `|`", done: (sh) => sh.log.some((e) => e.code === 0 && /\|/.test(e.line.replace(/\|\|/g, ""))) },
      {
        he: "הריצו `ls nosuch` כך שהשגיאה תיבלע ב-`/dev/null`",
        en: "Run `ls nosuch` so the error is swallowed by `/dev/null`",
        done: (sh) => sh.log.some((e) => e.name === "ls" && /2>\s*\/dev\/null/.test(e.line)),
      },
    ],
  },
  // Chapter 13: text tools.
  "text-tools": {
    home: {
      ...defaultHome,
      "server.log": [
        "2026-11-10 08:01 INFO web1 started",
        "2026-11-10 08:05 WARN web2 disk 85% full",
        "2026-11-10 08:07 ERROR db1 connection refused",
        "2026-11-10 08:09 INFO web1 GET /home 200",
        "2026-11-10 08:10 ERROR web2 timeout",
        "2026-11-10 08:12 INFO web2 GET /about 200",
        "2026-11-10 08:15 error db1 connection refused",
        "2026-11-10 08:20 INFO web1 GET /home 200",
        "",
      ].join("\n"),
      "scores.csv": "name,city,score\ndana,haifa,92\nyossi,tel-aviv,78\nnoa,haifa,85\navi,jerusalem,64\nmaya,tel-aviv,97\n",
    },
    chips: ["cat server.log", "cat scores.csv", "wc -l server.log", "head -n 3 scores.csv"],
    tasks: [
      {
        he: "מצאו את כל השגיאות בלוג, גם `ERROR` וגם `error`",
        en: "Find every error in the log, both `ERROR` and `error`",
        done: (sh) => ran(sh, "grep", (a) => hasFlag(a, "i") && a.some((x) => /^error$/i.test(x))),
      },
      {
        he: "ספרו כמה שורות `INFO` יש בלוג",
        en: "Count how many `INFO` lines the log has",
        done: (sh) => ran(sh, "grep", (a) => hasFlag(a, "c") && a.includes("INFO")) || sh.log.some((e) => e.code === 0 && /grep.*INFO.*\|\s*wc -l/.test(e.line)),
      },
      {
        he: "הציגו רק את עמודת השמות מ-`scores.csv`",
        en: "Show only the names column of `scores.csv`",
        done: (sh) => ran(sh, "cut", (a) => /-f\s*1\b/.test(a.join(" ")) && /-d\s*,/.test(a.join(" "))),
      },
      {
        he: "ספרו כמה תלמידים יש מכל עיר (רמז: `cut`, `sort` ו-`uniq -c`)",
        en: "Count how many students come from each city (hint: `cut`, `sort` and `uniq -c`)",
        done: (sh) => sh.log.some((e) => e.name === "uniq" && e.code === 0 && /cut.*\|.*sort.*\|\s*uniq -c/.test(e.line)),
      },
    ],
  },
  // Chapter 14: finding files.
  "find-files": {
    home: {
      ...defaultHome,
      project: {
        docs: { "README.md": "# My project\n", "todo.txt": "write tests\nfix the todo list\n" },
        old: { "debug.log": "debug line\n", "app.log": "app started\n", "notes.txt": "old notes\n" },
        src: { "main.py": 'print("hello")\n', "utils.py": "def helper(): pass\n" },
      },
    },
    chips: ["find project", "ls project", "ls project/old", "pwd"],
    tasks: [
      {
        he: "מצאו את כל קבצי ה-Python (`.py`) בפרויקט",
        en: "Find every Python file (`.py`) in the project",
        done: (sh) => ran(sh, "find", (a) => a.includes("-name") && a.some((x) => /\*\.py$/.test(x))),
      },
      { he: "מצאו את `readme` בלי הבדל בין אותיות גדולות לקטנות", en: "Find `readme` regardless of upper or lower case", done: (sh) => ran(sh, "find", (a) => a.includes("-iname")) },
      { he: "הציגו רק את התיקיות", en: "Show only the directories", done: (sh) => ran(sh, "find", (a) => a.join(" ").includes("-type d")) },
      {
        he: "מחקו את כל קבצי ה-`.log` בפקודת `find` אחת",
        en: "Delete all the `.log` files with one `find` command",
        done: (sh) => ran(sh, "find", (a) => a.includes("-delete")) && !sh.fs.get(`${HOME}/project/old/debug.log`) && !sh.fs.get(`${HOME}/project/old/app.log`),
      },
      { he: "גלו איפה נמצאת הפקודה `ls`", en: "Find out where the `ls` command lives", done: (sh) => ran(sh, "which", (a) => a.includes("ls")) },
    ],
  },
  // Chapter 28 (practice challenges), beginner level.
  "challenge-treasure": {
    home: {
      ...defaultHome,
      ".cave": { "map.txt": "The treasure is hidden in Documents.\nIts name starts with a dot.\n" },
      Documents: { ".chest.txt": "You found the treasure! Well done.\n" },
    },
    chips: ["ls", "pwd", "ls Documents", "cd ~"],
    tasks: [
      { he: "גלו את התיקייה המוסתרת בבית", en: "Reveal the hidden directory at home", done: (sh) => ran(sh, "ls", (a) => hasFlag(a, "a")) },
      { he: "קראו את המפה שבתוכה", en: "Read the map inside it", done: (sh) => ran(sh, "cat", (a) => a.some((x) => x.endsWith("map.txt"))) },
      { he: "מצאו את האוצר וקראו אותו", en: "Find the treasure and read it", done: (sh) => ran(sh, "cat", (a) => a.some((x) => x.endsWith(".chest.txt"))) },
    ],
  },
  "challenge-organize": {
    home: { ...defaultHome, Downloads: { "beach1.jpg": "", "beach2.jpg": "", "beach3.jpg": "", "invoice.pdf": "", "setup.tmp": "" } },
    chips: ["ls Downloads", "ls Documents", "ls Pictures/beach", "pwd"],
    tasks: [
      { he: "צרו את `Pictures/beach` בפקודה אחת", en: "Create `Pictures/beach` in one command", done: (sh) => isDir(sh, `${HOME}/Pictures/beach`) },
      {
        he: "העבירו את שלוש התמונות ל-`Pictures/beach` בפקודה אחת",
        en: "Move all three photos to `Pictures/beach` in one command",
        done: (sh) =>
          ran(sh, "mv", (a) => a.filter((x) => x.endsWith(".jpg")).length >= 3) &&
          [1, 2, 3].every((n) => isFile(sh, `${HOME}/Pictures/beach/beach${n}.jpg`)),
      },
      { he: "העבירו את `invoice.pdf` ל-`Documents`", en: "Move `invoice.pdf` to `Documents`", done: (sh) => isFile(sh, `${HOME}/Documents/invoice.pdf`) },
      { he: "מחקו את `setup.tmp`", en: "Delete `setup.tmp`", done: (sh) => !sh.fs.get(`${HOME}/Downloads/setup.tmp`) },
    ],
  },
  "challenge-shopping": {
    home: { ...defaultHome, "shopping.txt": shopping.join("\n") + "\n" },
    chips: ["cat shopping.txt", "cat -n shopping.txt", "ls", "cat shopping.bak"],
    tasks: [
      {
        he: "גבו את הרשימה ל-`shopping.bak`, **לפני** שמשנים אותה",
        en: "Back up the list to `shopping.bak` **before** changing it",
        done: (sh) => {
          const node = sh.fs.get(`${HOME}/shopping.bak`);
          return node?.type === "file" && node.content === shopping.join("\n") + "\n";
        },
      },
      {
        he: "הוסיפו שני מוצרים לסוף הרשימה",
        en: "Add two items to the end of the list",
        done: (sh) => {
          const node = sh.fs.get(`${HOME}/shopping.txt`);
          return node?.type === "file" && node.content.startsWith(shopping.join("\n")) && node.content.split("\n").filter(Boolean).length >= shopping.length + 2;
        },
      },
      { he: "הציגו רק את 3 השורות האחרונות", en: "Show only the last 3 lines", done: (sh) => ran(sh, "tail", (a) => a.join(" ").includes("3")) },
      { he: "בדקו עם `grep` אם `coffee` ברשימה", en: "Check with `grep` whether `coffee` is on the list", done: (sh) => ran(sh, "grep", (a) => a.includes("coffee")) },
    ],
  },
} satisfies Record<string, Mission>;

export type MissionId = keyof typeof missions;
