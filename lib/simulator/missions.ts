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
} satisfies Record<string, Mission>;

export type MissionId = keyof typeof missions;
