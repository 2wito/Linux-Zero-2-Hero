// The simulated shell: runs parsed command lines against the virtual filesystem.
// Error messages are copied from real Bash 5.2 / GNU coreutils 9.4 on Ubuntu 24.04 (LANG=C.UTF-8),
// and each common mistake also gets a hint key, rendered as a friendly Hebrew/English line by the UI.

import {
  basename,
  can,
  defaultHome,
  displayPath,
  HOME,
  HOST,
  resolvePath,
  USER,
  VirtualFs,
  type DirNode,
  type FsError,
  type FsNode,
  type Tree,
} from "@/lib/simulator/fs";
import { globToRegExp, hasGlobChars, parse, unescapeGlob, type ParseError, type Word } from "@/lib/simulator/parse";
import {
  applyMode,
  cutLine,
  formatDate,
  parseCutList,
  parseSortKey,
  permString,
  sortLines,
  uniqLines,
  wcCounts,
  wcWidth,
} from "@/lib/simulator/text";

export type HintKey =
  | "notFound"
  | "notDir"
  | "isDirRead"
  | "isDirWrite"
  | "rmDir"
  | "rmdirNotEmpty"
  | "cpDir"
  | "exists"
  | "noParent"
  | "missingOperand"
  | "missingDest"
  | "commandNotFound"
  | "uppercase"
  | "hebrewLayout"
  | "invalidOption"
  | "unsupportedOption"
  | "notInSimulator"
  | "noSudo"
  | "permission"
  | "rmRoot"
  | "rmDot"
  | "quote"
  | "incomplete"
  | "syntax"
  | "background"
  | "sameFile"
  | "intoItself"
  | "catWaits"
  | "grepWaits"
  | "grepUsage"
  | "tooManyArgs"
  | "helpFlag"
  | "badNumber"
  | "notExecutable"
  | "notPermitted"
  | "badMode"
  | "manPage"
  | "cutList"
  | "findQuote";

export type Hint = { key: HintKey; arg: string };
export type OutLine =
  | { kind: "out" | "err"; text: string }
  | { kind: "hint"; hint: Hint }
  | { kind: "help" };

export type RunResult = { lines: OutLine[]; clear: boolean; code: number };
export type LogEntry = { line: string; name: string; args: string[]; code: number };

/** Commands the simulator implements, for `help`, Tab completion and hints. */
export const COMMANDS = [
  "bash",
  "cat",
  "cd",
  "chmod",
  "chown",
  "clear",
  "cp",
  "cut",
  "date",
  "echo",
  "find",
  "grep",
  "head",
  "help",
  "history",
  "id",
  "ls",
  "man",
  "mkdir",
  "mv",
  "pwd",
  "rm",
  "rmdir",
  "sort",
  "tail",
  "touch",
  "uname",
  "uniq",
  "wc",
  "which",
  "whoami",
] as const;

/** Shell builtins: no file in /usr/bin and no man page of their own. */
const BUILTINS = new Set(["cd", "help", "history"]);

/** Real commands people may try that the simulator doesn't have: answered with a hint, not a fake error. */
const KNOWN_ELSEWHERE = new Set([
  "apt", "awk", "df", "du", "free", "git", "less", "ln", "more", "nano", "ping", "ps", "sed", "sh", "ssh", "tar",
  "top", "tr", "tree", "vi", "vim", "wget", "curl", "file", "xargs", "exit", "kill", "jobs", "type", "env", "export",
]);

/** `whatis` lines for `man` (Ubuntu 24.04): section and one-line description. */
const MAN_PAGES: Record<string, [string, string]> = {
  bash: ["1", "GNU Bourne-Again SHell"],
  cat: ["1", "concatenate files and print on the standard output"],
  chmod: ["1", "change file mode bits"],
  chown: ["1", "change file owner and group"],
  clear: ["1", "clear the terminal screen"],
  cp: ["1", "copy files and directories"],
  cut: ["1", "remove sections from each line of files"],
  date: ["1", "print or set the system date and time"],
  echo: ["1", "display a line of text"],
  find: ["1", "search for files in a directory hierarchy"],
  grep: ["1", "print lines that match patterns"],
  head: ["1", "output the first part of files"],
  history: ["3readline", "GNU History Library"],
  id: ["1", "print real and effective user and group IDs"],
  ls: ["1", "list directory contents"],
  man: ["1", "an interface to the system reference manuals"],
  mkdir: ["1", "make directories"],
  mv: ["1", "move (rename) files"],
  pwd: ["1", "print name of current/working directory"],
  rm: ["1", "remove files or directories"],
  rmdir: ["1", "remove empty directories"],
  sort: ["1", "sort lines of text files"],
  tail: ["1", "output the last part of files"],
  touch: ["1", "change file timestamps"],
  uname: ["1", "print system information"],
  uniq: ["1", "report or omit repeated lines"],
  wc: ["1", "print newline, word, and byte counts for each file"],
  which: ["1", "locate a command"],
  whoami: ["1", "print effective user name"],
};

/** The simulated user's groups, as `id` prints them on a fresh Ubuntu install. */
const GROUPS: [number, string][] = [
  [1000, USER],
  [4, "adm"],
  [24, "cdrom"],
  [27, "sudo"],
  [30, "dip"],
  [46, "plugdev"],
  [100, "users"],
];
const OTHER_GROUPS = new Set(["root", "nogroup", "daemon", "bin", "sys", "tty", "disk", "www-data", "shadow", "docker"]);
const KERNEL_RELEASE = "6.8.0-48-generic";

// Standard Israeli keyboard layout: the Hebrew letter on each Latin key, so "ךד" (typed with the layout on Hebrew) reads as "ls".
const HEBREW_KEYS: Record<string, string> = {
  "/": "q", "'": "w", ק: "e", ר: "r", א: "t", ט: "y", ו: "u", ן: "i", ם: "o", פ: "p",
  ש: "a", ד: "s", ג: "d", כ: "f", ע: "g", י: "h", ח: "j", ל: "k", ך: "l", ף: ";",
  ז: "z", ס: "x", ב: "c", ה: "v", נ: "b", מ: "n", צ: "m", ת: ",", ץ: ".",
};

export function fromHebrewLayout(text: string): string {
  return [...text].map((c) => HEBREW_KEYS[c] ?? c).join("");
}

// Every short option the real GNU tools accept (coreutils 9.4, grep 3.11). Ones the simulator doesn't implement
// get an "unsupportedOption" hint; anything else is a real "invalid option" error.
const REAL_FLAGS: Record<string, string> = {
  ls: "aAbBcCdDfFgGhHiIklLmnNopqQrRsStTuUvwxXZ1",
  mkdir: "pvmZ",
  touch: "acdfhmrt",
  cat: "AbeEnstTuv",
  rm: "fiIrRdv",
  rmdir: "pv",
  cp: "aAbdfHilLnpPrRsStTuvxZ",
  mv: "bfinStTuvZ",
  grep: "ABCDEFGHILPTUVZabcdefhilmnoqRrsuvwxyz",
  head: "cnqvz",
  tail: "cfFnqsvz",
  pwd: "LP",
  history: "acdnprsw",
  wc: "clmwL",
  sort: "bcCdfghikmMnoRrsStTuVz",
  uniq: "cdDfiszuw",
  cut: "bcdfnsz",
  chmod: "cfvR",
  chown: "cfhvRHLP",
  id: "agGnruzZ",
  uname: "asnrvmpio",
  which: "as",
  date: "dfIRrsu",
};

/** Commands whose usage errors exit with 2 instead of 1. */
const USAGE_EXIT_2 = new Set(["ls", "grep", "sort"]);

const FS_MESSAGE: Record<FsError, string> = {
  ENOENT: "No such file or directory",
  ENOTDIR: "Not a directory",
  EACCES: "Permission denied",
};

class Exit extends Error {
  constructor(readonly code: number) {
    super("exit");
  }
}

type Ctx = {
  args: string[];
  stdin: string | null;
  /** stdin is a regular file (`< file`), not a pipe: wc sizes its columns differently. */
  stdinFile: boolean;
  tty: boolean;
  out: (text: string) => void;
  err: (text: string) => void;
  hint: (key: HintKey, arg?: string) => void;
};

type Opts = { flags: Set<string>; values: Map<string, string>; operands: string[] };

export type ShellOptions = { home?: Tree; cwd?: string; now?: () => number; columns?: number };

export class Shell {
  fs: VirtualFs;
  cwd: string;
  oldpwd: string | null = null;
  history: string[] = [];
  log: LogEntry[] = [];
  /** Every directory the user has stood in (for missions). */
  visited = new Set<string>();
  columns: number;
  private lastCode = 0;
  /** How many scripts deep we are (a script that runs itself stops here instead of looping forever). */
  private scriptDepth = 0;

  constructor(opts: ShellOptions = {}) {
    this.fs = new VirtualFs(opts.home ?? defaultHome, opts.now);
    this.cwd = opts.cwd ?? HOME;
    this.columns = opts.columns ?? 80;
    this.visited.add(this.cwd);
  }

  get prompt(): string {
    return displayPath(this.cwd);
  }

  private env(): Record<string, string> {
    return { HOME, USER, LOGNAME: USER, PWD: this.cwd, OLDPWD: this.oldpwd ?? "", SHELL: "/bin/bash", "?": String(this.lastCode) };
  }

  /** Runs one command line typed at the prompt. `columns` is the screen width in characters (for ls). */
  run(line: string, columns?: number): RunResult {
    if (columns) this.columns = columns;
    const lines: OutLine[] = [];
    let clear = false;
    if (line.trim()) this.history.push(line);

    const parsed = parse(line, this.env());
    if (!parsed.ok) {
      this.lastCode = 2;
      return { lines: parseErrorLines(parsed.error), clear, code: 2 };
    }

    const hints = new Set<string>();
    const pushHint = (key: HintKey, arg = "") => {
      const id = key + "\0" + arg;
      if (hints.has(id)) return;
      hints.add(id);
      lines.push({ kind: "hint", hint: { key, arg } });
    };
    // Screen output: plain lines, then hints after them (so the real output stays readable).
    const screen: OutLine[] = [];
    const toScreen = (kind: "out" | "err", text: string) => {
      for (const l of splitLines(text)) screen.push({ kind, text: l });
    };

    let code = 0;
    for (const item of parsed.list) {
      if (item.connector === "&&" && code !== 0) continue;
      if (item.connector === "||" && code === 0) continue;
      let stdin: string | null = null;
      item.pipeline.forEach((cmd, idx) => {
        const last = idx === item.pipeline.length - 1;
        const result = this.runSimple(cmd, stdin, last, toScreen, pushHint);
        if (result.clear) {
          clear = true;
          screen.length = 0;
        }
        if (result.help) screen.push({ kind: "help" });
        stdin = result.stdout ?? "";
        code = result.code;
      });
      this.lastCode = code;
    }
    return { lines: [...screen, ...lines], clear, code };
  }

  private runSimple(
    cmd: { words: Word[]; redirects: { op: string; target: Word }[] },
    stdin: string | null,
    last: boolean,
    toScreen: (kind: "out" | "err", text: string) => void,
    hint: (key: HintKey, arg?: string) => void,
  ): { stdout: string | null; code: number; clear?: boolean; help?: boolean } {
    const argv = cmd.words.flatMap((w) => this.expand(w));
    let stdout = "";
    let stdoutFile: { dir: DirNode; name: string; append: boolean } | null = null;
    let stdoutNull = false;
    let stderrFile: { dir: DirNode; name: string; append: boolean } | null = null;
    let stderrNull = false;
    let stderr = "";
    let stdinFile = false;

    // Redirects are set up before the command runs; a failing redirect stops the command (exit 1).
    for (const r of cmd.redirects) {
      const target = this.expand(r.target);
      if (target.length !== 1) {
        toScreen("err", `bash: ${r.target.value}: ambiguous redirect`);
        return { stdout: null, code: 1 };
      }
      const path = target[0];
      const abs = resolvePath(this.cwd, path);
      if (r.op === "<") {
        const read = this.readFile(path, (msg) => toScreen("err", `bash: ${path}: ${msg}`), hint);
        if (read === null) return { stdout: null, code: 1 };
        stdin = read;
        stdinFile = true;
        continue;
      }
      if (abs === "/dev/null") {
        if (r.op.startsWith("2")) stderrNull = true;
        else stdoutNull = true;
        continue;
      }
      const opened = this.openForWrite(abs, path, (msg) => toScreen("err", `bash: ${path}: ${msg}`), hint);
      if (!opened) return { stdout: null, code: 1 };
      const append = r.op.endsWith(">>");
      // Like Bash, ">" empties the file right away, before the command reads anything.
      if (!append) this.fs.writeFile(opened.dir, opened.name, "");
      else if (!opened.dir.children.has(opened.name)) this.fs.writeFile(opened.dir, opened.name, "");
      if (r.op.startsWith("2")) stderrFile = { ...opened, append: true };
      else stdoutFile = { ...opened, append: true };
    }

    const name = argv[0];
    if (name === undefined) return { stdout: last ? null : "", code: 0 };
    const tty = last && !stdoutFile && !stdoutNull;
    const ctx: Ctx = {
      args: argv.slice(1),
      stdin,
      stdinFile,
      tty,
      out: (text) => {
        stdout += text;
      },
      err: (text) => {
        stderr += text + "\n";
      },
      hint: (key, arg) => hint(key, arg),
    };

    let code: number;
    let clear = false;
    let help = false;
    try {
      if (name === "clear") {
        clear = tty;
        code = 0;
      } else if (name === "help") {
        help = tty;
        code = 0;
      } else {
        code = this.exec(name, ctx);
      }
    } catch (e) {
      if (!(e instanceof Exit)) throw e;
      code = e.code;
    }
    this.log.push({ line: this.history[this.history.length - 1] ?? "", name, args: ctx.args, code });

    // stderr goes to the screen (or its redirect) right away; stdout to the file, the pipe or the screen.
    if (stderr) {
      if (stderrFile) this.fs.writeFile(stderrFile.dir, stderrFile.name, stderr, true);
      else if (!stderrNull) toScreen("err", stderr);
    }
    if (stdoutFile) {
      this.fs.writeFile(stdoutFile.dir, stdoutFile.name, stdout, true);
      return { stdout: last ? null : "", code, clear, help };
    }
    if (stdoutNull) return { stdout: last ? null : "", code, clear, help };
    if (last) {
      if (stdout) toScreen("out", stdout);
      return { stdout: null, code, clear, help };
    }
    return { stdout, code, clear, help };
  }

  private exec(name: string, ctx: Ctx): number {
    switch (name) {
      case "pwd":
        return this.pwd(ctx);
      case "cd":
        return this.cd(ctx);
      case "ls":
        return this.ls(ctx);
      case "mkdir":
        return this.mkdir(ctx);
      case "touch":
        return this.touch(ctx);
      case "cat":
        return this.cat(ctx);
      case "echo":
        return this.echo(ctx);
      case "rm":
        return this.rm(ctx);
      case "rmdir":
        return this.rmdir(ctx);
      case "cp":
        return this.cpMv(ctx, "cp");
      case "mv":
        return this.cpMv(ctx, "mv");
      case "grep":
        return this.grep(ctx);
      case "head":
      case "tail":
        return this.headTail(ctx, name);
      case "whoami":
        this.options(ctx, "whoami", "");
        ctx.out(USER + "\n");
        return 0;
      case "history":
        this.options(ctx, "history", "");
        ctx.out(this.history.map((l, i) => `${String(i + 1).padStart(5)}  ${l}\n`).join(""));
        return 0;
      case "wc":
        return this.wc(ctx);
      case "sort":
        return this.sort(ctx);
      case "uniq":
        return this.uniq(ctx);
      case "cut":
        return this.cut(ctx);
      case "chmod":
        return this.chmod(ctx);
      case "chown":
        return this.chown(ctx);
      case "id":
        return this.id(ctx);
      case "uname":
        return this.uname(ctx);
      case "which":
        return this.which(ctx);
      case "date":
        return this.date(ctx);
      case "man":
        return this.man(ctx);
      case "find":
        return this.find(ctx);
      case "bash":
        if (!ctx.args.length) {
          ctx.hint("notInSimulator", "bash");
          return 0;
        }
        if (ctx.args[0].startsWith("-")) {
          ctx.hint("unsupportedOption", `bash ${ctx.args[0]}`);
          return 1;
        }
        return this.runScript(ctx.args[0], ctx, true);
    }
    if (name.includes("/")) return this.runScript(name, ctx, false);
    if (name === "sudo") {
      ctx.hint("noSudo");
      return 1;
    }
    if (KNOWN_ELSEWHERE.has(name)) {
      // A real command the simulator doesn't have: say so instead of faking "command not found".
      ctx.hint("notInSimulator", name);
      return 127;
    }
    ctx.err(`bash: ${name}: command not found`);
    const lower = name.toLowerCase();
    const latin = fromHebrewLayout(name);
    if (latin !== name && (isCommand(latin) || KNOWN_ELSEWHERE.has(latin))) {
      const line = this.history[this.history.length - 1] ?? name;
      ctx.hint("hebrewLayout", fromHebrewLayout(line));
    } else if (lower !== name && isCommand(lower)) ctx.hint("uppercase", lower);
    else ctx.hint("commandNotFound", name);
    return 127;
  }

  // ---------- helpers ----------

  /** Expands a word: globs are matched against the virtual filesystem, like Bash (no match = left as typed). */
  expand(word: Word): string[] {
    if (!word.glob) return [word.value];
    const absolute = word.glob.startsWith("/");
    const segments = word.glob.split("/").filter((s, i) => s !== "" || i === 0);
    let paths = [absolute ? "" : null] as (string | null)[];
    for (const seg of absolute ? segments.slice(1) : segments) {
      const next: (string | null)[] = [];
      for (const base of paths) {
        const dirAbs = base === null ? this.cwd : base === "" ? "/" : resolvePath(this.cwd, base);
        if (!hasGlobChars(seg)) {
          const lit = unescapeGlob(seg);
          next.push(base === null ? lit : `${base}/${lit}`);
          continue;
        }
        const d = this.fs.get(dirAbs);
        if (!d || d.type !== "dir" || !can(d, "r")) continue;
        const re = globToRegExp(seg);
        const showHidden = unescapeGlob(seg).startsWith(".");
        for (const n of VirtualFs.names(d)) {
          if (n.startsWith(".") && !showHidden) continue;
          if (re.test(n)) next.push(base === null ? n : `${base}/${n}`);
        }
      }
      paths = next;
      if (paths.length === 0) break;
    }
    const found = paths.filter((p): p is string => p !== null && this.fs.get(resolvePath(this.cwd, p)) !== undefined);
    return found.length ? found : [word.value];
  }

  /** Short-option parser shared by the commands: -la, -n 3, -n3, "--" ends options. */
  private options(ctx: Ctx, cmd: string, allowed: string, opts: { withValue?: string; numeric?: boolean } = {}): Opts {
    const flags = new Set<string>();
    const values = new Map<string, string>();
    const operands: string[] = [];
    const args = ctx.args;
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === "--") {
        operands.push(...args.slice(i + 1));
        break;
      }
      if (a === "--help" || a === "--version") {
        ctx.hint("helpFlag", cmd);
        throw new Exit(0);
      }
      if (a.startsWith("--")) {
        ctx.err(`${cmd}: unrecognized option '${a}'`);
        ctx.err(`Try '${cmd} --help' for more information.`);
        ctx.hint("invalidOption", a);
        throw new Exit(USAGE_EXIT_2.has(cmd) ? 2 : 1);
      }
      if (!a.startsWith("-") || a === "-") {
        operands.push(a);
        continue;
      }
      if (opts.numeric && /^-\d+$/.test(a)) {
        values.set("n", a.slice(1));
        continue;
      }
      for (let j = 1; j < a.length; j++) {
        const f = a[j];
        if (opts.withValue?.includes(f)) {
          const rest = a.slice(j + 1);
          const value = rest || args[++i];
          if (value === undefined) {
            ctx.err(`${cmd}: option requires an argument -- '${f}'`);
            ctx.err(`Try '${cmd} --help' for more information.`);
            throw new Exit(USAGE_EXIT_2.has(cmd) ? 2 : 1);
          }
          values.set(f, value);
          break;
        }
        if (!allowed.includes(f) && REAL_FLAGS[cmd]?.includes(f)) {
          // A real option the simulator doesn't implement: say so honestly instead of "invalid option".
          ctx.hint("unsupportedOption", `${cmd} -${f}`);
          throw new Exit(1);
        }
        if (!allowed.includes(f)) {
          ctx.err(`${cmd}: invalid option -- '${f}'`);
          ctx.err(`Try '${cmd} --help' for more information.`);
          ctx.hint("invalidOption", `-${f}`);
          throw new Exit(USAGE_EXIT_2.has(cmd) ? 2 : 1);
        }
        flags.add(f);
      }
    }
    return { flags, values, operands };
  }

  private missing(ctx: Ctx, cmd: string, message = "missing operand"): never {
    ctx.err(`${cmd}: ${message}`);
    ctx.err(`Try '${cmd} --help' for more information.`);
    ctx.hint("missingOperand", cmd);
    throw new Exit(1);
  }

  /** Hint for a filesystem error on `path`. */
  private fsHint(ctx: Ctx, error: FsError, path: string) {
    if (error === "ENOENT") ctx.hint("notFound", path);
    else if (error === "EACCES") ctx.hint("permission", path);
    else ctx.hint("notDir", path);
  }

  /** Reads a file's content, reporting errors through `fail` (which gets the message text). */
  private readFile(path: string, fail: (msg: string) => void, hint: (key: HintKey, arg?: string) => void): string | null {
    const found = this.fs.lookup(resolvePath(this.cwd, path));
    if (found.error) {
      fail(FS_MESSAGE[found.error]);
      if (found.error === "ENOENT") hint("notFound", path);
      else if (found.error === "EACCES") hint("permission", path);
      return null;
    }
    if (found.node.type === "dir") {
      fail("Is a directory");
      hint("isDirRead", path);
      return null;
    }
    if (!can(found.node, "r")) {
      fail("Permission denied");
      hint("permission", path);
      return null;
    }
    return found.node.content;
  }

  /** Checks that a file can be created or overwritten at `abs`. */
  private openForWrite(
    abs: string,
    path: string,
    fail: (msg: string) => void,
    hint: (key: HintKey, arg?: string) => void,
  ): { dir: DirNode; name: string } | null {
    const existing = this.fs.lookup(abs);
    if (existing.node?.type === "dir") {
      fail("Is a directory");
      hint("isDirWrite", path);
      return null;
    }
    const parent = this.fs.parent(abs);
    if (parent.error) {
      fail(FS_MESSAGE[parent.error]);
      if (parent.error === "ENOENT") hint("notFound", path);
      else if (parent.error === "EACCES") hint("permission", path);
      return null;
    }
    const writable = existing.node ? can(existing.node, "w") : can(parent.dir, "w");
    if (!writable) {
      fail("Permission denied");
      hint("permission", path);
      return null;
    }
    return { dir: parent.dir, name: parent.name };
  }

  private cdTo(abs: string) {
    if (abs !== this.cwd) this.oldpwd = this.cwd;
    this.cwd = abs;
    this.visited.add(abs);
  }

  // ---------- commands ----------

  private pwd(ctx: Ctx): number {
    this.options(ctx, "pwd", "LP");
    ctx.out(this.cwd + "\n");
    return 0;
  }

  private cd(ctx: Ctx): number {
    const args = ctx.args.filter((a) => a !== "--");
    if (args.length > 1) {
      ctx.err("bash: cd: too many arguments");
      ctx.hint("tooManyArgs");
      return 1;
    }
    const target = args[0];
    if (target === "") return 0;
    if (target === undefined) {
      this.cdTo(HOME);
      return 0;
    }
    if (target === "-") {
      if (!this.oldpwd) {
        ctx.err("bash: cd: OLDPWD not set");
        return 1;
      }
      const back = this.oldpwd;
      this.cdTo(back);
      ctx.out(back + "\n");
      return 0;
    }
    if (target.startsWith("-") && target.length > 1) {
      ctx.err(`bash: cd: ${target.slice(0, 2)}: invalid option`);
      ctx.err("cd: usage: cd [-L|[-P [-e]] [-@]] [dir]");
      ctx.hint("invalidOption", target.slice(0, 2));
      return 2;
    }
    const abs = resolvePath(this.cwd, target);
    const found = this.fs.lookup(abs);
    const error = found.error ?? (found.node.type !== "dir" ? "ENOTDIR" : !can(found.node, "x") ? "EACCES" : null);
    if (error) {
      ctx.err(`bash: cd: ${target}: ${FS_MESSAGE[error]}`);
      this.fsHint(ctx, error, target);
      return 1;
    }
    this.cdTo(abs);
    return 0;
  }

  private ls(ctx: Ctx): number {
    const { flags, operands } = this.options(ctx, "ls", "alh1AdF");
    const all = flags.has("a");
    const almost = flags.has("A");
    const long = flags.has("l");
    const human = flags.has("h");
    const one = flags.has("1") || !ctx.tty;
    const dirOnly = flags.has("d");
    const classify = flags.has("F");
    const targets = operands.length ? operands : ["."];
    let code = 0;

    const files: { name: string; node: FsNode }[] = [];
    const dirs: { name: string; node: DirNode }[] = [];
    for (const t of targets) {
      const found = this.fs.lookup(resolvePath(this.cwd, t));
      if (found.error) {
        ctx.err(`ls: cannot access '${t}': ${FS_MESSAGE[found.error]}`);
        this.fsHint(ctx, found.error, t);
        code = 2;
      } else if (found.node.type === "dir" && !dirOnly) dirs.push({ name: t, node: found.node });
      else files.push({ name: t, node: found.node });
    }
    files.sort((a, b) => cmp(a.name, b.name));
    dirs.sort((a, b) => cmp(a.name, b.name));

    const blocks: string[] = [];
    const quote = ctx.tty;
    if (files.length) blocks.push(this.renderEntries(files, { long, human, one, classify, quote, total: false }));
    const headers = targets.length > 1;
    for (const d of dirs) {
      if (!can(d.node, "r") || !can(d.node, "x")) {
        ctx.err(`ls: cannot open directory '${d.name}': Permission denied`);
        ctx.hint("permission", d.name);
        code = 2;
        continue;
      }
      const entries: { name: string; node: FsNode }[] = [];
      if (all) {
        entries.push({ name: ".", node: d.node });
        const abs = resolvePath(this.cwd, d.name);
        entries.push({ name: "..", node: this.fs.get(resolvePath(abs, "..")) ?? d.node });
      }
      for (const n of VirtualFs.names(d.node)) {
        if (n.startsWith(".") && !all && !almost) continue;
        entries.push({ name: n, node: d.node.children.get(n)! });
      }
      const body = this.renderEntries(entries, { long, human, one, classify, quote, total: true });
      blocks.push(headers ? `${quoteName(d.name, ctx.tty)}:\n${body}` : body);
    }
    ctx.out(blocks.filter((b) => b !== "").join("\n"));
    return code;
  }

  private renderEntries(
    entries: { name: string; node: FsNode }[],
    o: { long: boolean; human: boolean; one: boolean; classify: boolean; quote: boolean; total: boolean },
  ): string {
    const label = (e: { name: string; node: FsNode }) =>
      quoteName(e.name, o.quote) + (o.classify && e.node.type === "dir" ? "/" : "");
    if (o.long) {
      const rows = entries.map((e) => ({
        mode: modeString(e.node),
        links: String(e.node.type === "dir" ? 2 + [...e.node.children.values()].filter((c) => c.type === "dir").length : 1),
        owner: e.node.owner,
        group: e.node.group ?? e.node.owner,
        size: o.human ? humanSize(sizeOf(e.node)) : String(sizeOf(e.node)),
        date: lsDate(this.fs.timeOf(e.node), this.fs.now()),
        name: label(e),
      }));
      const w = (k: "links" | "owner" | "size") => Math.max(0, ...rows.map((r) => r[k].length));
      const [lw, ow, sw] = [w("links"), w("owner"), w("size")];
      const gw = Math.max(0, ...rows.map((r) => r.group.length));
      const lines = rows.map(
        (r) => `${r.mode} ${r.links.padStart(lw)} ${r.owner.padEnd(ow)} ${r.group.padEnd(gw)} ${r.size.padStart(sw)} ${r.date} ${r.name}`,
      );
      if (o.total) {
        const kb = entries.reduce((sum, e) => sum + blocksOf(e.node), 0);
        lines.unshift(`total ${o.human ? humanSize(kb * 1024) : kb}`);
      }
      return lines.join("\n") + (lines.length ? "\n" : "");
    }
    const names = entries.map(label);
    if (names.length === 0) return "";
    if (o.one) return names.join("\n") + "\n";
    return columns(names, this.columns);
  }

  private mkdir(ctx: Ctx): number {
    const { flags, operands } = this.options(ctx, "mkdir", "pv", { withValue: "m" });
    if (!operands.length) this.missing(ctx, "mkdir");
    let code = 0;
    for (const path of operands) {
      const abs = resolvePath(this.cwd, path);
      const fail = (msg: string) => {
        ctx.err(`mkdir: cannot create directory ‘${path}’: ${msg}`);
        code = 1;
      };
      if (flags.has("p")) {
        let cur = "/";
        for (const seg of abs.split("/").filter(Boolean)) {
          const next = resolvePath(cur, seg);
          const found = this.fs.lookup(next);
          if (found.node?.type === "dir") {
            cur = next;
            continue;
          }
          if (found.node) {
            fail(next === abs ? "File exists" : "Not a directory");
            ctx.hint(next === abs ? "exists" : "notDir", path);
            break;
          }
          const parent = this.fs.get(cur);
          if (!parent || parent.type !== "dir" || !can(parent, "w")) {
            fail("Permission denied");
            ctx.hint("permission", path);
            break;
          }
          this.fs.mkdir(parent, seg);
          if (flags.has("v")) ctx.out(`mkdir: created directory '${next === abs ? path : displayRel(path, abs, next)}'\n`);
          cur = next;
        }
        continue;
      }
      if (this.fs.get(abs)) {
        fail("File exists");
        ctx.hint("exists", path);
        continue;
      }
      const parent = this.fs.parent(abs);
      if (parent.error) {
        fail(FS_MESSAGE[parent.error]);
        if (parent.error === "ENOENT") ctx.hint("noParent", path);
        else this.fsHint(ctx, parent.error, path);
        continue;
      }
      if (!can(parent.dir, "w")) {
        fail("Permission denied");
        ctx.hint("permission", path);
        continue;
      }
      this.fs.mkdir(parent.dir, parent.name);
      if (flags.has("v")) ctx.out(`mkdir: created directory '${path}'\n`);
    }
    return code;
  }

  private touch(ctx: Ctx): number {
    const { operands } = this.options(ctx, "touch", "acm");
    if (!operands.length) this.missing(ctx, "touch", "missing file operand");
    let code = 0;
    for (const path of operands) {
      const abs = resolvePath(this.cwd, path);
      const found = this.fs.lookup(abs);
      if (found.node) {
        if (!can(found.node, "w")) {
          ctx.err(`touch: cannot touch '${path}': Permission denied`);
          ctx.hint("permission", path);
          code = 1;
          continue;
        }
        found.node.mtime = this.fs.now();
        continue;
      }
      const opened = this.openForWrite(abs, path, (msg) => ctx.err(`touch: cannot touch '${path}': ${msg}`), ctx.hint);
      if (!opened) {
        code = 1;
        continue;
      }
      this.fs.writeFile(opened.dir, opened.name, "");
    }
    return code;
  }

  private cat(ctx: Ctx): number {
    const { flags, operands } = this.options(ctx, "cat", "n");
    if (!operands.length) {
      if (ctx.stdin === null) {
        ctx.hint("catWaits");
        return 0;
      }
      ctx.out(flags.has("n") ? numberLines(ctx.stdin) : ctx.stdin);
      return 0;
    }
    let code = 0;
    let text = "";
    for (const path of operands) {
      const content = this.readFile(path, (msg) => ctx.err(`cat: ${path}: ${msg}`), ctx.hint);
      if (content === null) code = 1;
      else text += content;
    }
    ctx.out(flags.has("n") ? numberLines(text) : text);
    return code;
  }

  private echo(ctx: Ctx): number {
    let args = ctx.args;
    let newline = true;
    let escapes = false;
    while (args.length && /^-[neE]+$/.test(args[0])) {
      if (args[0].includes("n")) newline = false;
      if (args[0].includes("e")) escapes = true;
      if (args[0].includes("E")) escapes = false;
      args = args.slice(1);
    }
    let text = args.join(" ");
    if (escapes) text = text.replace(/\\([nt\\])/g, (_, c: string) => (c === "n" ? "\n" : c === "t" ? "\t" : "\\"));
    ctx.out(text + (newline ? "\n" : ""));
    return 0;
  }

  private rm(ctx: Ctx): number {
    const { flags, operands } = this.options(ctx, "rm", "rRfvd");
    const recursive = flags.has("r") || flags.has("R");
    const force = flags.has("f");
    if (!operands.length) {
      if (force) return 0;
      this.missing(ctx, "rm");
    }
    let code = 0;
    for (const path of operands) {
      const abs = resolvePath(this.cwd, path);
      const fail = (msg: string) => {
        ctx.err(`rm: cannot remove '${path}': ${msg}`);
        code = 1;
      };
      if (recursive && abs === "/") {
        ctx.err("rm: it is dangerous to operate recursively on '/'");
        ctx.err("rm: use --no-preserve-root to override this failsafe");
        ctx.hint("rmRoot");
        code = 1;
        continue;
      }
      const last = basename(path);
      if (recursive && (last === "." || last === "..")) {
        ctx.err(`rm: refusing to remove '.' or '..' directory: skipping '${path}'`);
        ctx.hint("rmDot");
        code = 1;
        continue;
      }
      const found = this.fs.lookup(abs);
      if (found.error) {
        if (force && found.error === "ENOENT") continue;
        fail(FS_MESSAGE[found.error]);
        this.fsHint(ctx, found.error, path);
        continue;
      }
      if (found.node.type === "dir" && !recursive) {
        if (flags.has("d") && found.node.children.size === 0) {
          // rm -d removes an empty directory, like rmdir.
        } else {
          fail("Is a directory");
          ctx.hint("rmDir", path);
          continue;
        }
      }
      const parent = this.fs.parent(abs);
      if (parent.error || !can(parent.dir, "w")) {
        fail("Permission denied");
        ctx.hint("permission", path);
        continue;
      }
      this.fs.remove(parent.dir, parent.name);
      if (flags.has("v")) ctx.out(found.node.type === "dir" ? `removed directory '${path}'\n` : `removed '${path}'\n`);
    }
    return code;
  }

  private rmdir(ctx: Ctx): number {
    const { operands } = this.options(ctx, "rmdir", "");
    if (!operands.length) this.missing(ctx, "rmdir");
    let code = 0;
    for (const path of operands) {
      const abs = resolvePath(this.cwd, path);
      const fail = (msg: string) => {
        ctx.err(`rmdir: failed to remove '${path}': ${msg}`);
        code = 1;
      };
      const last = basename(path);
      if (last === "." || last === "..") {
        fail("Invalid argument");
        ctx.hint("rmDot");
        continue;
      }
      const found = this.fs.lookup(abs);
      if (found.error) {
        fail(FS_MESSAGE[found.error]);
        this.fsHint(ctx, found.error, path);
        continue;
      }
      if (found.node.type !== "dir") {
        fail("Not a directory");
        ctx.hint("notDir", path);
        continue;
      }
      if (found.node.children.size > 0) {
        fail("Directory not empty");
        ctx.hint("rmdirNotEmpty", path);
        continue;
      }
      const parent = this.fs.parent(abs);
      if (parent.error || !can(parent.dir, "w")) {
        fail("Permission denied");
        ctx.hint("permission", path);
        continue;
      }
      this.fs.remove(parent.dir, parent.name);
    }
    return code;
  }

  private cpMv(ctx: Ctx, cmd: "cp" | "mv"): number {
    const { flags, operands } = this.options(ctx, cmd, cmd === "cp" ? "rRvnf" : "vnf");
    const recursive = cmd === "mv" || flags.has("r") || flags.has("R");
    if (operands.length === 0) this.missing(ctx, cmd, "missing file operand");
    if (operands.length === 1) {
      ctx.err(`${cmd}: missing destination file operand after '${operands[0]}'`);
      ctx.err(`Try '${cmd} --help' for more information.`);
      ctx.hint("missingDest", cmd);
      return 1;
    }
    const sources = operands.slice(0, -1);
    const dest = operands[operands.length - 1];
    const destAbs = resolvePath(this.cwd, dest);
    const destNode = this.fs.get(destAbs);
    const intoDir = destNode?.type === "dir";
    if (sources.length > 1 && !intoDir) {
      ctx.err(`${cmd}: target '${dest}': ${destNode ? "Not a directory" : "No such file or directory"}`);
      ctx.hint(destNode ? "notDir" : "notFound", dest);
      return 1;
    }

    let code = 0;
    for (const src of sources) {
      const srcAbs = resolvePath(this.cwd, src);
      const found = this.fs.lookup(srcAbs);
      if (found.error) {
        ctx.err(`${cmd}: cannot stat '${src}': ${FS_MESSAGE[found.error]}`);
        this.fsHint(ctx, found.error, src);
        code = 1;
        continue;
      }
      const node = found.node;
      if (node.type === "dir" && !recursive) {
        ctx.err(`cp: -r not specified; omitting directory '${src}'`);
        ctx.hint("cpDir", src);
        code = 1;
        continue;
      }
      const targetShown = intoDir ? `${dest.replace(/\/+$/, "")}/${basename(src)}` : dest;
      const targetAbs = intoDir ? resolvePath(destAbs, basename(srcAbs)) : destAbs;
      if (targetAbs === srcAbs) {
        ctx.err(`${cmd}: '${src}' and '${targetShown}' are the same file`);
        ctx.hint("sameFile");
        code = 1;
        continue;
      }
      if (node.type === "dir" && (targetAbs + "/").startsWith(srcAbs + "/")) {
        ctx.err(
          cmd === "cp"
            ? `cp: cannot copy a directory, '${src}', into itself, '${targetShown}'`
            : `mv: cannot move '${src}' to a subdirectory of itself, '${targetShown}'`,
        );
        ctx.hint("intoItself");
        code = 1;
        continue;
      }
      const existing = this.fs.get(targetAbs);
      if (existing && flags.has("n")) continue;
      if (node.type === "dir" && existing && existing.type !== "dir") {
        ctx.err(`${cmd}: cannot overwrite non-directory '${targetShown}' with directory '${src}'`);
        code = 1;
        continue;
      }
      if (node.type === "file" && existing?.type === "dir") {
        ctx.err(`${cmd}: cannot overwrite directory '${targetShown}' with non-directory`);
        code = 1;
        continue;
      }
      if (cmd === "mv" && existing?.type === "dir" && existing.children.size > 0) {
        ctx.err(`mv: cannot overwrite '${targetShown}': Directory not empty`);
        code = 1;
        continue;
      }
      const parent = this.fs.parent(targetAbs);
      const srcParent = this.fs.parent(srcAbs);
      const kind = node.type === "dir" ? "directory" : "regular file";
      if (parent.error) {
        ctx.err(
          cmd === "cp"
            ? `cp: cannot create ${kind} '${targetShown}': ${FS_MESSAGE[parent.error]}`
            : `mv: cannot move '${src}' to '${targetShown}': ${FS_MESSAGE[parent.error]}`,
        );
        this.fsHint(ctx, parent.error, targetShown);
        code = 1;
        continue;
      }
      if (!can(parent.dir, "w") || (cmd === "mv" && (srcParent.error || !can(srcParent.dir, "w")))) {
        ctx.err(
          cmd === "cp"
            ? `cp: cannot create ${kind} '${targetShown}': Permission denied`
            : `mv: cannot move '${src}' to '${targetShown}': Permission denied`,
        );
        ctx.hint("permission", targetShown);
        code = 1;
        continue;
      }
      if (node.type === "file" && !can(node, "r") && cmd === "cp") {
        ctx.err(`cp: cannot open '${src}' for reading: Permission denied`);
        ctx.hint("permission", src);
        code = 1;
        continue;
      }
      if (cmd === "cp") {
        if (node.type === "dir" && existing?.type === "dir") mergeInto(this.fs, existing, node);
        else if (node.type === "file" && existing?.type === "file") this.fs.writeFile(parent.dir, parent.name, node.content);
        else {
          parent.dir.children.set(parent.name, this.fs.clone(node));
          parent.dir.mtime = this.fs.now();
        }
      } else {
        if (srcParent.error) continue;
        this.fs.remove(srcParent.dir, srcParent.name);
        parent.dir.children.set(parent.name, node);
        parent.dir.mtime = this.fs.now();
        // Moving the directory you're in keeps you inside it, at its new path.
        if ((this.cwd + "/").startsWith(srcAbs + "/")) this.cwd = targetAbs + this.cwd.slice(srcAbs.length);
      }
      if (flags.has("v")) ctx.out(cmd === "cp" ? `'${src}' -> '${targetShown}'\n` : `renamed '${src}' -> '${targetShown}'\n`);
    }
    return code;
  }

  private grep(ctx: Ctx): number {
    const { flags, operands } = this.options(ctx, "grep", "invcwHhEFl");
    if (!operands.length) {
      ctx.err("Usage: grep [OPTION]... PATTERNS [FILE]...");
      ctx.err("Try 'grep --help' for more information.");
      ctx.hint("grepUsage");
      return 2;
    }
    const [pattern, ...files] = operands;
    let re: RegExp;
    try {
      let src = flags.has("F") ? escapeRegExp(pattern) : flags.has("E") ? pattern : breToJs(pattern);
      if (flags.has("w")) src = `(?<![A-Za-z0-9_])(?:${src})(?![A-Za-z0-9_])`;
      re = new RegExp(src, flags.has("i") ? "i" : "");
    } catch {
      ctx.err(pattern.includes("[") ? "grep: Unmatched [, [^, [:, [., or [=" : "grep: Unmatched ( or \\(");
      return 2;
    }
    if (!files.length && ctx.stdin === null) {
      ctx.hint("grepWaits", pattern);
      return 1;
    }
    const sources: { name: string; text: string | null }[] = files.length
      ? files.map((f) => ({ name: f, text: this.readFile(f, (msg) => ctx.err(`grep: ${f}: ${msg}`), ctx.hint) }))
      : [{ name: "(standard input)", text: ctx.stdin }];
    const prefix = flags.has("H") || (files.length > 1 && !flags.has("h"));
    let matched = false;
    let error = false;
    for (const s of sources) {
      if (s.text === null) {
        error = true;
        continue;
      }
      let count = 0;
      splitLines(s.text).forEach((line, i) => {
        if (re.test(line) === flags.has("v")) return;
        count++;
        if (flags.has("c") || flags.has("l")) return;
        ctx.out(`${prefix ? s.name + ":" : ""}${flags.has("n") ? `${i + 1}:` : ""}${line}\n`);
      });
      if (flags.has("c")) ctx.out(`${prefix ? s.name + ":" : ""}${count}\n`);
      if (flags.has("l") && count) ctx.out(s.name + "\n");
      if (count) matched = true;
    }
    return error ? 2 : matched ? 0 : 1;
  }

  private headTail(ctx: Ctx, cmd: "head" | "tail"): number {
    const { values, operands } = this.options(ctx, cmd, "qv", { withValue: "n", numeric: true });
    const raw = values.get("n") ?? "10";
    if (!/^[+-]?\d+$/.test(raw)) {
      ctx.err(`${cmd}: invalid number of lines: ‘${raw}’`);
      ctx.hint("badNumber", raw);
      return 1;
    }
    const n = Math.abs(parseInt(raw, 10));
    // `tail -n +2` starts at line 2; `head -n -2` drops the last 2 lines (GNU).
    const fromStart = cmd === "tail" && raw.startsWith("+");
    const allBut = cmd === "head" && raw.startsWith("-");
    const pick = (text: string) => {
      const lines = splitLines(text);
      const chosen =
        cmd === "head"
          ? allBut
            ? lines.slice(0, Math.max(0, lines.length - n))
            : lines.slice(0, n)
          : fromStart
            ? lines.slice(Math.max(0, n - 1))
            : n === 0
              ? []
              : lines.slice(-n);
      return chosen.map((l) => l + "\n").join("");
    };
    if (!operands.length) {
      if (ctx.stdin === null) {
        ctx.hint("catWaits");
        return 0;
      }
      ctx.out(pick(ctx.stdin));
      return 0;
    }
    let code = 0;
    const parts: string[] = [];
    for (const path of operands) {
      const content = this.readFile(
        path,
        (msg) =>
          ctx.err(msg === "Is a directory" ? `${cmd}: error reading '${path}': ${msg}` : `${cmd}: cannot open '${path}' for reading: ${msg}`),
        ctx.hint,
      );
      if (content === null) {
        code = 1;
        continue;
      }
      parts.push(operands.length > 1 ? `==> ${path} <==\n${pick(content)}` : pick(content));
    }
    ctx.out(parts.join("\n"));
    return code;
  }

  // ---------- text tools: wc, sort, uniq, cut ----------

  /** Reads every operand (or stdin) as text. `onError` prints the command's own message; returns null on the first failure if `stopOnError`. */
  private readInputs(
    ctx: Ctx,
    operands: string[],
    onError: (path: string, msg: string) => void,
  ): { texts: string[]; failed: boolean } | null {
    if (!operands.length) {
      if (ctx.stdin === null) {
        ctx.hint("catWaits");
        return null;
      }
      return { texts: [ctx.stdin], failed: false };
    }
    const texts: string[] = [];
    let failed = false;
    for (const path of operands) {
      const content = this.readFile(path, (msg) => onError(path, msg), ctx.hint);
      if (content === null) failed = true;
      else texts.push(content);
    }
    return { texts, failed };
  }

  private wc(ctx: Ctx): number {
    const { flags, operands } = this.options(ctx, "wc", "lwmc");
    const show = { l: flags.has("l"), w: flags.has("w"), m: flags.has("m"), c: flags.has("c") };
    if (!show.l && !show.w && !show.m && !show.c) show.l = show.w = show.c = true;
    const fields = [show.l, show.w, show.m, show.c].filter(Boolean).length;
    type Input = { name: string | null; counts: ReturnType<typeof wcCounts> | null; regular: boolean; size: number; failed: boolean };
    const inputs: Input[] = [];
    let code = 0;
    if (!operands.length) {
      if (ctx.stdin === null) {
        ctx.hint("catWaits");
        return 0;
      }
      const c = wcCounts(ctx.stdin);
      inputs.push({ name: null, counts: c, regular: ctx.stdinFile, size: c.bytes, failed: false });
    }
    for (const path of operands) {
      const found = this.fs.lookup(resolvePath(this.cwd, path));
      const error = found.error ?? (found.node.type === "file" && !can(found.node, "r") ? "EACCES" : null);
      if (error) {
        ctx.err(`wc: ${path}: ${FS_MESSAGE[error]}`);
        this.fsHint(ctx, error, path);
        inputs.push({ name: path, counts: null, regular: false, size: 0, failed: true });
        code = 1;
      } else if (found.node!.type === "dir") {
        ctx.err(`wc: ${path}: Is a directory`);
        ctx.hint("isDirRead", path);
        inputs.push({ name: path, counts: { lines: 0, words: 0, chars: 0, bytes: 0 }, regular: false, size: 0, failed: false });
        code = 1;
      } else {
        const c = wcCounts((found.node as { content: string }).content);
        inputs.push({ name: path, counts: c, regular: true, size: c.bytes, failed: false });
      }
    }
    const width = wcWidth(inputs, fields);
    const total = { lines: 0, words: 0, chars: 0, bytes: 0 };
    const row = (c: typeof total, name: string | null) =>
      [show.l ? c.lines : null, show.w ? c.words : null, show.m ? c.chars : null, show.c ? c.bytes : null]
        .filter((v): v is number => v !== null)
        .map((v) => String(v).padStart(width))
        .join(" ") + (name === null ? "" : ` ${name}`);
    let out = "";
    for (const i of inputs) {
      if (!i.counts) continue;
      out += row(i.counts, i.name) + "\n";
      total.lines += i.counts.lines;
      total.words += i.counts.words;
      total.chars += i.counts.chars;
      total.bytes += i.counts.bytes;
    }
    if (inputs.length > 1) out += row(total, "total") + "\n";
    ctx.out(out);
    return code;
  }

  private sort(ctx: Ctx): number {
    const { flags, values, operands } = this.options(ctx, "sort", "nrufh", { withValue: "tk" });
    const key = values.get("k");
    if (key !== undefined && !parseSortKey(key)) {
      ctx.err(`sort: invalid number at field start: invalid count at start of ‘${key}’`);
      ctx.hint("invalidOption", `-k ${key}`);
      return 2;
    }
    let failure = false;
    const read = this.readInputs(ctx, operands, (path, msg) => {
      if (failure) return;
      failure = true;
      ctx.err(msg === "Is a directory" ? `sort: read failed: ${path}: ${msg}` : `sort: cannot read: ${path}: ${msg}`);
    });
    if (!read) return 0;
    if (read.failed) return 2;
    const lines = read.texts.flatMap((t) => splitLines(t));
    const sorted = sortLines(lines, {
      numeric: flags.has("n"),
      human: flags.has("h"),
      reverse: flags.has("r"),
      unique: flags.has("u"),
      fold: flags.has("f"),
      sep: values.get("t"),
      key,
    });
    ctx.out(sorted.map((l) => l + "\n").join(""));
    return 0;
  }

  private uniq(ctx: Ctx): number {
    const { flags, operands } = this.options(ctx, "uniq", "cdui");
    const [input, output] = operands;
    let failed = false;
    const read = this.readInputs(ctx, input === undefined ? [] : [input], (path, msg) => {
      failed = true;
      ctx.err(msg === "Is a directory" ? `uniq: error reading '${path}': ${msg}` : `uniq: ${path}: ${msg}`);
    });
    if (!read) return 0;
    if (failed) return 1;
    const text =
      uniqLines(splitLines(read.texts[0] ?? ""), { count: flags.has("c"), repeated: flags.has("d"), unique: flags.has("u"), ignoreCase: flags.has("i") })
        .map((l) => l + "\n")
        .join("");
    if (output === undefined) {
      ctx.out(text);
      return 0;
    }
    const abs = resolvePath(this.cwd, output);
    const opened = this.openForWrite(abs, output, (msg) => ctx.err(`uniq: ${output}: ${msg}`), ctx.hint);
    if (!opened) return 1;
    this.fs.writeFile(opened.dir, opened.name, text);
    return 0;
  }

  private cut(ctx: Ctx): number {
    const { flags, values, operands } = this.options(ctx, "cut", "s", { withValue: "dfcb" });
    const usage = (msg: string, hint?: () => void): number => {
      ctx.err(`cut: ${msg}`);
      ctx.err("Try 'cut --help' for more information.");
      hint?.();
      return 1;
    };
    const lists = (["f", "c", "b"] as const).filter((f) => values.has(f));
    if (lists.length > 1) return usage("only one list may be specified");
    if (!lists.length) return usage("you must specify a list of bytes, characters, or fields", () => ctx.hint("cutList"));
    const mode = lists[0] === "f" ? "fields" : "chars";
    const delim = values.get("d") ?? "\t";
    if ([...delim].length !== 1) return usage("the delimiter must be a single character");
    const ranges = parseCutList(values.get(lists[0])!, mode);
    if ("error" in ranges) return usage(ranges.error, () => ctx.hint("cutList"));
    let code = 0;
    const read = this.readInputs(ctx, operands, (path, msg) => {
      code = 1;
      ctx.err(`cut: ${path}: ${msg}`);
    });
    if (!read) return 0;
    const out = read.texts
      .flatMap((t) => splitLines(t))
      .map((l) => cutLine(l, ranges, mode, delim, flags.has("s")))
      .filter((l): l is string => l !== null);
    ctx.out(out.map((l) => l + "\n").join(""));
    return code;
  }

  // ---------- permissions: chmod, chown, id ----------

  private chmod(ctx: Ctx): number {
    let recursive = false;
    let mode: string | undefined;
    const files: string[] = [];
    for (const a of ctx.args) {
      if (mode === undefined && /^-[rwxXst]+$/.test(a)) {
        mode = a; // "-x" is a mode (remove x), not an option
        continue;
      }
      if (a === "--help" || a === "--version") {
        ctx.hint("helpFlag", "chmod");
        return 0;
      }
      if (a.startsWith("-") && a.length > 1) {
        for (const f of a.slice(1)) {
          if (f === "R") recursive = true;
          else if (REAL_FLAGS.chmod.includes(f)) {
            ctx.hint("unsupportedOption", `chmod -${f}`);
            return 1;
          } else {
            ctx.err(`chmod: invalid option -- '${f}'`);
            ctx.err("Try 'chmod --help' for more information.");
            ctx.hint("invalidOption", `-${f}`);
            return 1;
          }
        }
        continue;
      }
      if (mode === undefined) mode = a;
      else files.push(a);
    }
    if (mode === undefined) this.missing(ctx, "chmod");
    if (!files.length) this.missing(ctx, "chmod", `missing operand after ‘${mode}’`);
    if (applyMode(mode, 0o644, false) === null) {
      ctx.err(`chmod: invalid mode: ‘${mode}’`);
      ctx.err("Try 'chmod --help' for more information.");
      ctx.hint("badMode", mode);
      return 1;
    }
    let code = 0;
    const apply = (path: string, node: FsNode) => {
      if (node.owner !== USER) {
        ctx.err(`chmod: changing permissions of '${path}': Operation not permitted`);
        ctx.hint("notPermitted", path);
        code = 1;
        return;
      }
      node.mode = applyMode(mode!, node.mode, node.type === "dir")!;
      if (recursive && node.type === "dir") {
        for (const n of VirtualFs.names(node)) apply(`${path.replace(/\/+$/, "")}/${n}`, node.children.get(n)!);
      }
    };
    for (const path of files) {
      const found = this.fs.lookup(resolvePath(this.cwd, path));
      if (found.error) {
        ctx.err(`chmod: cannot access '${path}': ${FS_MESSAGE[found.error]}`);
        this.fsHint(ctx, found.error, path);
        code = 1;
        continue;
      }
      apply(path, found.node);
    }
    return code;
  }

  private chown(ctx: Ctx): number {
    const { flags, operands } = this.options(ctx, "chown", "R");
    const [spec, ...files] = operands;
    if (spec === undefined) this.missing(ctx, "chown");
    if (!files.length) this.missing(ctx, "chown", `missing operand after ‘${spec}’`);
    const [user, group = ""] = spec.split(":");
    if (user !== "" && user !== USER && user !== "root") {
      ctx.err(`chown: invalid user: ‘${spec}’`);
      return 1;
    }
    const member = GROUPS.some(([, g]) => g === group);
    if (group !== "" && !member && !OTHER_GROUPS.has(group)) {
      ctx.err(`chown: invalid group: ‘${spec}’`);
      return 1;
    }
    let code = 0;
    const apply = (path: string, node: FsNode) => {
      // Only root may give a file away; an owner may only switch to a group they belong to.
      if (node.owner !== USER || (user !== "" && user !== USER) || (group !== "" && !member)) {
        ctx.err(`chown: changing ownership of '${path}': Operation not permitted`);
        ctx.hint("notPermitted", path);
        code = 1;
        return;
      }
      if (group) node.group = group === USER ? undefined : group;
      if (flags.has("R") && node.type === "dir") {
        for (const n of VirtualFs.names(node)) apply(`${path.replace(/\/+$/, "")}/${n}`, node.children.get(n)!);
      }
    };
    for (const path of files) {
      const found = this.fs.lookup(resolvePath(this.cwd, path));
      if (found.error) {
        ctx.err(`chown: cannot access '${path}': ${FS_MESSAGE[found.error]}`);
        this.fsHint(ctx, found.error, path);
        code = 1;
        continue;
      }
      apply(path, found.node);
    }
    return code;
  }

  private id(ctx: Ctx): number {
    const { flags, operands } = this.options(ctx, "id", "ugGn");
    const who = operands[0] ?? USER;
    if (who !== USER && who !== "root") {
      ctx.err(`id: ‘${who}’: no such user`);
      return 1;
    }
    const groups: [number, string][] = who === "root" ? [[0, "root"]] : GROUPS;
    const uid = who === "root" ? 0 : 1000;
    const names = flags.has("n");
    if (flags.has("u")) ctx.out(`${names ? who : uid}\n`);
    else if (flags.has("g")) ctx.out(`${names ? groups[0][1] : groups[0][0]}\n`);
    else if (flags.has("G")) ctx.out(groups.map(([n, g]) => (names ? g : n)).join(" ") + "\n");
    else ctx.out(`uid=${uid}(${who}) gid=${groups[0][0]}(${groups[0][1]}) groups=${groups.map(([n, g]) => `${n}(${g})`).join(",")}\n`);
    return 0;
  }

  // ---------- system info: uname, which, date, man ----------

  private uname(ctx: Ctx): number {
    const { flags } = this.options(ctx, "uname", "snrm");
    const parts: string[] = [];
    if (flags.has("s") || flags.size === 0) parts.push("Linux");
    if (flags.has("n")) parts.push(HOST);
    if (flags.has("r")) parts.push(KERNEL_RELEASE);
    if (flags.has("m")) parts.push("x86_64");
    ctx.out(parts.join(" ") + "\n");
    return 0;
  }

  private which(ctx: Ctx): number {
    const { operands } = this.options(ctx, "which", "a");
    let code = operands.length ? 0 : 1;
    for (const name of operands) {
      if (isCommand(name) && !BUILTINS.has(name)) ctx.out(`/usr/bin/${name}\n`);
      else code = 1;
    }
    return code;
  }

  private date(ctx: Ctx): number {
    const { operands } = this.options(ctx, "date", "u");
    const format = operands.find((a) => a.startsWith("+"));
    const bad = operands.find((a) => !a.startsWith("+"));
    if (bad !== undefined) {
      ctx.err(`date: invalid date ‘${bad}’`);
      return 1;
    }
    ctx.out(formatDate(this.fs.now(), format?.slice(1)) + "\n");
    return 0;
  }

  private man(ctx: Ctx): number {
    const names = ctx.args.filter((a) => !a.startsWith("-"));
    if (!names.length) {
      ctx.err("What manual page do you want?");
      ctx.err("For example, try 'man man'.");
      return 1;
    }
    let code = 0;
    for (const name of names) {
      const page = MAN_PAGES[name];
      if (!page) {
        ctx.err(`No manual entry for ${name}`);
        code = 16;
        continue;
      }
      ctx.out(`${`${name} (${page[0]})`.padEnd(20)} - ${page[1]}\n`);
      ctx.hint("manPage", name);
    }
    return code;
  }

  // ---------- find ----------

  private find(ctx: Ctx): number {
    const args = ctx.args;
    const isExpr = (a: string) => a.startsWith("-") || a === "!" || a === "(" || a === ")";
    let i = 0;
    const starts: string[] = [];
    while (i < args.length && !isExpr(args[i])) starts.push(args[i++]);
    if (!starts.length) starts.push(".");

    type Test = { kind: string; arg: string; not: boolean };
    const groups: Test[][] = [[]];
    let maxdepth = Infinity;
    let mindepth = 0;
    let hasAction = false;
    let deletes = false;
    let not = false;
    const withArg = new Set(["-name", "-iname", "-type", "-maxdepth", "-mindepth", "-size", "-mtime"]);
    const unsupported = new Set([
      "-exec", "-execdir", "-ok", "-ls", "-printf", "-fprint", "-newer", "-perm", "-user", "-group", "-path", "-ipath",
      "-regex", "-iregex", "-links", "-depth", "-prune", "-quit", "-readable", "-writable", "-executable", "-print0",
      "-amin", "-mmin", "-cmin", "-atime", "-ctime", "-newermt", "-samefile", "-follow", "-xdev", "-mount",
    ]);
    let previous = "";
    while (i < args.length) {
      const a = args[i++];
      if (a === "!" || a === "-not") {
        not = !not;
        continue;
      }
      if (a === "-o" || a === "-or") {
        groups.push([]);
        continue;
      }
      if (a === "-a" || a === "-and") continue;
      if (a === "(" || a === ")" || unsupported.has(a)) {
        ctx.hint("unsupportedOption", `find ${a}`);
        return 1;
      }
      if (!isExpr(a)) {
        ctx.err(`find: paths must precede expression: \`${a}'`);
        if (previous === "-name" || previous === "-iname") {
          ctx.err(`find: possible unquoted pattern after predicate \`${previous}'?`);
          ctx.hint("findQuote", previous);
        }
        return 1;
      }
      previous = a;
      if (withArg.has(a)) {
        const v = args[i++];
        if (v === undefined) {
          ctx.err(`find: missing argument to \`${a}'`);
          return 1;
        }
        if (a === "-maxdepth" || a === "-mindepth") {
          if (!/^\d+$/.test(v)) {
            ctx.err(`find: Expected a positive decimal integer argument to ${a}, but got ‘${v}’`);
            return 1;
          }
          if (a === "-maxdepth") maxdepth = Number(v);
          else mindepth = Number(v);
          continue;
        }
        if (a === "-type" && !/^[fdlbcps]$/.test(v)) {
          ctx.err(`find: Unknown argument to -type: ${v}`);
          return 1;
        }
        if (a === "-size" && !/^[+-]?\d+[bcwkMG]?$/.test(v)) {
          const unit = v.replace(/^[+-]?\d+/, "")[0] ?? v;
          ctx.err(`find: invalid -size type \`${unit}'`);
          return 1;
        }
        if (a === "-mtime" && !/^[+-]?\d+$/.test(v)) {
          ctx.err(`find: invalid argument \`${v}' to \`-mtime'`);
          return 1;
        }
        groups[groups.length - 1].push({ kind: a, arg: v, not });
      } else if (a === "-empty" || a === "-print" || a === "-delete") {
        if (a !== "-empty") hasAction = true;
        if (a === "-delete") deletes = true;
        groups[groups.length - 1].push({ kind: a, arg: "", not });
      } else {
        ctx.err(`find: unknown predicate \`${a}'`);
        return 1;
      }
      not = false;
    }

    let code = 0;
    const now = this.fs.now();
    const test = (t: Test, node: FsNode, name: string): boolean => {
      let r: boolean;
      switch (t.kind) {
        case "-name":
          r = globToRegExp(t.arg).test(name);
          break;
        case "-iname":
          r = new RegExp(globToRegExp(t.arg).source, "i").test(name);
          break;
        case "-type":
          r = t.arg === "f" ? node.type === "file" : t.arg === "d" ? node.type === "dir" : false;
          break;
        case "-empty":
          r = node.type === "file" ? node.content === "" : node.children.size === 0;
          break;
        case "-size": {
          const m = t.arg.match(/^([+-]?)(\d+)([bcwkMG]?)$/)!;
          const unit = { "": 512, b: 512, c: 1, w: 2, k: 1024, M: 1024 ** 2, G: 1024 ** 3 }[m[3]]!;
          const bytes = node.type === "dir" ? 4096 : new TextEncoder().encode(node.content).length;
          const n = Math.ceil(bytes / unit);
          r = m[1] === "+" ? n > Number(m[2]) : m[1] === "-" ? n < Number(m[2]) : n === Number(m[2]);
          break;
        }
        case "-mtime": {
          const m = t.arg.match(/^([+-]?)(\d+)$/)!;
          const days = Math.floor((now - this.fs.timeOf(node)) / 86_400_000);
          r = m[1] === "+" ? days > Number(m[2]) : m[1] === "-" ? days < Number(m[2]) : days === Number(m[2]);
          break;
        }
        default:
          r = true;
      }
      return t.not ? !r : r;
    };
    const remove = (display: string, abs: string, node: FsNode) => {
      if (display === "." || abs === "/") return;
      const parent = this.fs.parent(abs);
      if (parent.error || !can(parent.dir, "w") || !can(parent.dir, "x")) {
        ctx.err(`find: cannot delete ‘${display}’: Permission denied`);
        code = 1;
      } else if (node.type === "dir" && node.children.size) {
        ctx.err(`find: cannot delete ‘${display}’: Directory not empty`);
        code = 1;
      } else this.fs.remove(parent.dir, parent.name);
    };
    const evaluate = (display: string, abs: string, node: FsNode) => {
      const name = display === "/" ? "/" : basename(display) || display;
      for (const group of groups) {
        let ok = true;
        for (const t of group) {
          if (t.kind === "-print") ctx.out(display + "\n");
          else if (t.kind === "-delete") remove(display, abs, node);
          else if (!test(t, node, name)) {
            ok = false;
            break;
          }
        }
        if (ok) {
          if (!hasAction) ctx.out(display + "\n");
          return;
        }
      }
    };
    const visit = (display: string, abs: string, node: FsNode, depth: number) => {
      if (!deletes && depth >= mindepth) evaluate(display, abs, node);
      if (node.type === "dir" && depth < maxdepth) {
        if (!can(node, "r") || !can(node, "x")) {
          ctx.err(`find: ‘${display}’: Permission denied`);
          ctx.hint("permission", display);
          code = 1;
        } else {
          for (const n of VirtualFs.names(node)) {
            const child = node.children.get(n);
            if (!child) continue;
            visit(display.endsWith("/") ? display + n : `${display}/${n}`, abs === "/" ? `/${n}` : `${abs}/${n}`, child, depth + 1);
          }
        }
      }
      // -delete implies a depth-first walk: a directory is handled after its contents.
      if (deletes && depth >= mindepth) evaluate(display, abs, node);
    };
    for (const start of starts) {
      const abs = resolvePath(this.cwd, start);
      const found = this.fs.lookup(abs);
      if (found.error) {
        ctx.err(`find: ‘${start}’: ${FS_MESSAGE[found.error]}`);
        this.fsHint(ctx, found.error, start);
        code = 1;
        continue;
      }
      visit(start, abs, found.node, 0);
    }
    return code;
  }

  // ---------- scripts: ./script.sh and bash script.sh ----------

  private runScript(path: string, ctx: Ctx, viaBash: boolean): number {
    const found = this.fs.lookup(resolvePath(this.cwd, path));
    const fail = (msg: string, code: number): number => {
      ctx.err(`bash: ${path}: ${msg}`);
      return code;
    };
    if (found.error) {
      fail(FS_MESSAGE[found.error], found.error === "EACCES" ? 126 : 127);
      this.fsHint(ctx, found.error, path);
      return found.error === "EACCES" ? 126 : 127;
    }
    if (found.node.type === "dir") {
      if (viaBash) ctx.err(`${path}: ${path}: Is a directory`);
      else fail("Is a directory", 126);
      ctx.hint("isDirRead", path);
      return 126;
    }
    if (!can(found.node, "r") || (!viaBash && !can(found.node, "x"))) {
      fail("Permission denied", 126);
      if (!viaBash && can(found.node, "r")) ctx.hint("notExecutable", path);
      else ctx.hint("permission", path);
      return 126;
    }
    if (this.scriptDepth >= 8) return 1;
    this.scriptDepth++;
    let code = 0;
    const toCtx = (kind: "out" | "err", text: string) => {
      if (kind === "out") ctx.out(text.endsWith("\n") ? text : text + "\n");
      else for (const l of splitLines(text)) ctx.err(l);
    };
    try {
      for (const raw of splitLines(found.node.content)) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;
        const exit = line.match(/^exit(?:\s+(\d+))?$/);
        if (exit) return exit[1] ? Number(exit[1]) : code;
        const parsed = parse(line, this.env());
        if (!parsed.ok) {
          code = 2;
          continue;
        }
        for (const item of parsed.list) {
          if (item.connector === "&&" && code !== 0) continue;
          if (item.connector === "||" && code === 0) continue;
          let stdin: string | null = null;
          item.pipeline.forEach((cmd, idx) => {
            const result = this.runSimple(cmd, stdin, idx === item.pipeline.length - 1, toCtx, ctx.hint);
            stdin = result.stdout ?? "";
            code = result.code;
          });
          this.lastCode = code;
        }
      }
      return code;
    } finally {
      this.scriptDepth--;
    }
  }

  // ---------- Tab completion ----------

  /** Completes the last word of `line`. Returns the new line and, when ambiguous, the candidates to show. */
  complete(line: string): { line: string; options: string[] } {
    const m = line.match(/^(.*?)([^\s|;&<>]*)$/)!;
    const before = m[1];
    const word = m[2];
    const isCommand = !before.trim() || /[|;&]\s*$/.test(before);
    let candidates: string[];
    let prefix = "";
    let partial = word;
    if (isCommand && !word.includes("/")) {
      candidates = COMMANDS.filter((c) => c.startsWith(word)).map((c) => c + " ");
    } else {
      const slash = word.lastIndexOf("/");
      prefix = slash >= 0 ? word.slice(0, slash + 1) : "";
      partial = word.slice(slash + 1);
      const dirPath = prefix.startsWith("~") ? HOME + prefix.slice(1) : prefix || ".";
      const d = this.fs.get(resolvePath(this.cwd, dirPath));
      candidates =
        d?.type === "dir" && can(d, "r")
          ? VirtualFs.names(d)
              .filter((n) => n.startsWith(partial) && (partial.startsWith(".") || !n.startsWith(".")))
              .map((n) => escapeForShell(n) + (d.children.get(n)!.type === "dir" ? "/" : " "))
          : [];
      partial = escapeForShell(partial);
    }
    if (candidates.length === 0) return { line, options: [] };
    if (candidates.length === 1) return { line: before + prefix + candidates[0], options: [] };
    const common = commonPrefix(candidates);
    if (common.length > partial.length) return { line: before + prefix + common, options: [] };
    return { line, options: candidates.map((c) => c.trimEnd()) };
  }
}

// ---------- pure helpers (exported for tests) ----------

function isCommand(name: string): boolean {
  return (COMMANDS as readonly string[]).includes(name);
}

function cmp(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function splitLines(text: string): string[] {
  if (text === "") return [];
  const lines = text.split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  return lines;
}

function numberLines(text: string): string {
  return splitLines(text)
    .map((l, i) => `${String(i + 1).padStart(6)}\t${l}\n`)
    .join("");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** GNU basic regex → JS: in BRE, + ? | ( ) { } are literal unless escaped. */
export function breToJs(pattern: string): string {
  let out = "";
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === "\\" && i + 1 < pattern.length) {
      const n = pattern[++i];
      out += "+?|(){}".includes(n) ? n : "\\" + n;
    } else if ("+?|(){}".includes(c)) out += "\\" + c;
    else out += c;
  }
  return out;
}

function escapeForShell(name: string): string {
  return name.replace(/([\s'"\\$&|;<>()*?[\]])/g, "\\$1");
}

function commonPrefix(items: string[]): string {
  let p = items[0];
  for (const s of items) while (!s.startsWith(p)) p = p.slice(0, -1);
  return p;
}

/** ls shows names that need quoting (spaces, quotes...) in single quotes. */
export function quoteName(name: string, enabled: boolean): string {
  if (!enabled || !/[\s'"\\$&|;<>()*?[\]!#`{}]/.test(name)) return name;
  if (!name.includes("'")) return `'${name}'`;
  return `"${name}"`;
}

export function modeString(node: FsNode): string {
  return (node.type === "dir" ? "d" : "-") + permString(node.mode);
}

function sizeOf(node: FsNode): number {
  return node.type === "dir" ? 4096 : new TextEncoder().encode(node.content).length;
}

/** Disk usage in 1K blocks, as `ls -l` counts it for "total" (4K filesystem blocks). */
function blocksOf(node: FsNode): number {
  return Math.ceil(sizeOf(node) / 4096) * 4;
}

/** GNU `-h` sizes: rounded up, one decimal below 10 (4.0K, 12K, 1.5M). */
export function humanSize(bytes: number): string {
  if (bytes < 1024) return String(bytes);
  const units = ["K", "M", "G", "T"];
  let v = bytes / 1024;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u++;
  }
  if (v < 10) {
    const r = Math.ceil(v * 10) / 10;
    if (r < 10) return r.toFixed(1) + units[u];
    v = r;
  }
  return Math.ceil(v) + units[u];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** `ls -l` dates: "Nov 11 21:34" for recent files, "Mar 25  2026" for older than ~6 months. */
export function lsDate(time: number, now: number): string {
  const d = new Date(time);
  const day = String(d.getDate()).padStart(2);
  const recent = now - time < 182.5 * 24 * 3600 * 1000 && time <= now + 60_000;
  const tail = recent ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : ` ${d.getFullYear()}`;
  return `${MONTHS[d.getMonth()]} ${day} ${tail}`;
}

/** GNU `ls -C` layout: fill columns top to bottom, as many columns as fit in `width` (checked against real ls -w). */
export function columns(names: string[], width: number): string {
  const n = names.length;
  for (let cols = n; cols >= 1; cols--) {
    const rows = Math.ceil(n / cols);
    if (Math.ceil(n / rows) !== cols && cols > 1) continue; // that column count can't actually be filled
    const widths: number[] = [];
    for (let c = 0; c < cols; c++) {
      const col = names.slice(c * rows, (c + 1) * rows);
      widths.push(Math.max(...col.map((s) => [...s].length)));
    }
    const total = widths.reduce((a, b) => a + b, 0) + 2 * (cols - 1);
    if (total >= width && cols > 1) continue; // GNU needs the row to be shorter than the width
    const lines: string[] = [];
    for (let r = 0; r < rows; r++) {
      let line = "";
      for (let c = 0; c < cols; c++) {
        const s = names[c * rows + r];
        if (s === undefined) continue;
        const lastInRow = c === cols - 1 || names[(c + 1) * rows + r] === undefined;
        line += lastInRow ? s : s + " ".repeat(widths[c] - [...s].length + 2);
      }
      lines.push(line);
    }
    return lines.join("\n") + "\n";
  }
  return names.join("\n") + "\n";
}

function displayRel(path: string, abs: string, next: string): string {
  // For mkdir -pv: show each created level relative to what the user typed.
  const extra = abs.slice(next.length).split("/").filter(Boolean).length;
  return path.replace(/\/+$/, "").split("/").slice(0, path.split("/").filter(Boolean).length - extra).join("/");
}

function mergeInto(fs: VirtualFs, target: DirNode, source: DirNode) {
  for (const [name, child] of source.children) {
    const existing = target.children.get(name);
    if (child.type === "dir" && existing?.type === "dir") mergeInto(fs, existing, child);
    else target.children.set(name, fs.clone(child));
  }
  target.mtime = fs.now();
}

function parseErrorLines(error: ParseError): OutLine[] {
  switch (error.kind) {
    case "syntax":
      return [
        { kind: "err", text: `bash: syntax error near unexpected token \`${error.token}'` },
        { kind: "hint", hint: { key: "syntax", arg: error.token } },
      ];
    case "quote":
      return [{ kind: "hint", hint: { key: "quote", arg: "" } }];
    case "incomplete":
      return [{ kind: "hint", hint: { key: "incomplete", arg: "" } }];
    case "background":
      return [{ kind: "hint", hint: { key: "background", arg: "" } }];
  }
}
