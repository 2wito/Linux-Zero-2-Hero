import { describe, expect, it } from "vitest";
import { challenges } from "@/lib/challenges";
import { resolvePath, displayPath } from "@/lib/simulator/fs";
import { missions } from "@/lib/simulator/missions";
import { globToRegExp, parse, tokenize, type Token } from "@/lib/simulator/parse";
import { breToJs, columns, fromHebrewLayout, humanSize, Shell, type OutLine } from "@/lib/simulator/shell";
import { ui } from "@/lib/ui";

const NOW = new Date(2026, 10, 11, 21, 34).getTime();
const words = (tokens: Token[]) => tokens.map((t) => (t.kind === "word" ? t.word.value : `<${t.op}>`));
const lex = (line: string, env: Record<string, string> = {}) => {
  const r = tokenize(line, env);
  if ("error" in r) throw new Error(r.error.kind);
  return words(r.tokens);
};

/** Runs lines in a fresh shell and returns the screen text of the last one ("hint:key" for hints). */
function sh(...lines: string[]) {
  const shell = new Shell({ now: () => NOW });
  let last: OutLine[] = [];
  let code = 0;
  for (const l of lines) ({ lines: last, code } = shell.run(l));
  const text = last.map((l) => (l.kind === "hint" ? `hint:${l.hint.key}` : l.kind === "help" ? "help" : l.text));
  return { shell, text, out: text.filter((t) => !t.startsWith("hint:")).join("\n"), code };
}

describe("tokenize", () => {
  it("splits on whitespace and keeps quoted text together", () => {
    expect(lex(`echo  "a   b" 'c d'  e`)).toEqual(["echo", "a   b", "c d", "e"]);
  });

  it("joins adjacent quoted and unquoted parts into one word", () => {
    expect(lex(`echo pre"mid"'end'`)).toEqual(["echo", "premidend"]);
  });

  it("handles backslash escapes outside and inside double quotes", () => {
    expect(lex(String.raw`echo my\ file "say \"hi\"" 'no \n here'`)).toEqual(["echo", "my file", 'say "hi"', "no \\n here"]);
  });

  it("expands $VAR and ${VAR} except in single quotes", () => {
    const env = { HOME: "/home/dana", USER: "dana" };
    expect(lex(`echo $USER "\${HOME}/x" '$USER' $NOPE end`, env)).toEqual(["echo", "dana", "/home/dana/x", "$USER", "end"]);
  });

  it("expands ~ only at the start of an unquoted word", () => {
    const env = { HOME: "/home/dana" };
    expect(lex(`cd ~ ~/docs "~" a~`, env)).toEqual(["cd", "/home/dana", "/home/dana/docs", "~", "a~"]);
  });

  it("recognizes operators with or without spaces", () => {
    expect(lex("ls|grep x>out.txt&&cat out.txt;pwd")).toEqual(["ls", "<|>", "grep", "x", "<>>", "out.txt", "<&&>", "cat", "out.txt", "<;>", "pwd"]);
    expect(lex("a >> b 2> c 2>> d < e || f")).toEqual(["a", "<>>>", "b", "<2>>", "c", "<2>>>", "d", "<<>", "e", "<||>", "f"]);
  });

  it("treats 2> as a redirect only at the start of a word", () => {
    expect(lex("echo file2>x")).toEqual(["echo", "file2", "<>>", "x"]);
  });

  it("marks unquoted glob characters, and escapes quoted ones", () => {
    const r = tokenize(`ls *.txt "*.md" a\\*b`);
    if ("error" in r) throw new Error();
    const globs = r.tokens.map((t) => (t.kind === "word" ? t.word.glob : null));
    expect(globs).toEqual([null, "*.txt", null, null]);
  });

  it("ignores comments", () => {
    expect(lex("ls # list files")).toEqual(["ls"]);
  });

  it("reports unterminated quotes", () => {
    expect(tokenize(`echo "abc`)).toEqual({ error: { kind: "quote" } });
    expect(tokenize(`echo 'abc`)).toEqual({ error: { kind: "quote" } });
  });
});

describe("parse", () => {
  it("builds pipelines, redirects and && / || / ; lists", () => {
    const r = parse("cat a.txt | grep x > out.txt && echo ok; pwd");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.list.map((i) => i.connector)).toEqual([null, "&&", ";"]);
    const [first] = r.list;
    expect(first.pipeline.map((c) => c.words.map((w) => w.value))).toEqual([["cat", "a.txt"], ["grep", "x"]]);
    expect(first.pipeline[1].redirects).toEqual([{ op: ">", target: { value: "out.txt", glob: null } }]);
  });

  it("allows an empty line and a trailing ;", () => {
    expect(parse("")).toEqual({ ok: true, list: [] });
    expect(parse("ls;").ok).toBe(true);
  });

  it("reports Bash's syntax errors", () => {
    expect(parse("| ls")).toEqual({ ok: false, error: { kind: "syntax", token: "|" } });
    expect(parse("ls >")).toEqual({ ok: false, error: { kind: "syntax", token: "newline" } });
    expect(parse("ls > | x")).toEqual({ ok: false, error: { kind: "syntax", token: "|" } });
    expect(parse("ls && && pwd")).toEqual({ ok: false, error: { kind: "syntax", token: "&&" } });
  });

  it("reports a line that ends waiting for more (| or &&)", () => {
    expect(parse("ls |")).toEqual({ ok: false, error: { kind: "incomplete" } });
    expect(parse("ls &&")).toEqual({ ok: false, error: { kind: "incomplete" } });
  });

  it("rejects background jobs", () => {
    expect(parse("sleep 5 &")).toEqual({ ok: false, error: { kind: "background" } });
  });
});

describe("helpers", () => {
  it("resolves paths", () => {
    expect(resolvePath("/home/dana", "../x/./y//z/..")).toBe("/home/x/y");
    expect(resolvePath("/home/dana", "/")).toBe("/");
    expect(resolvePath("/", "..")).toBe("/");
    expect(displayPath("/home/dana/projects")).toBe("~/projects");
    expect(displayPath("/home/danaX")).toBe("/home/danaX");
  });

  it("converts globs to regular expressions", () => {
    expect(globToRegExp("*.txt").test("notes.txt")).toBe(true);
    expect(globToRegExp("*.txt").test("notes.md")).toBe(false);
    expect(globToRegExp("photo?.jpg").test("photo1.jpg")).toBe(true);
    expect(globToRegExp("[ab]*").test("banana")).toBe(true);
    expect(globToRegExp("[!ab]*").test("banana")).toBe(false);
    expect(globToRegExp("a\\*b").test("a*b")).toBe(true);
    expect(globToRegExp("a\\*b").test("axb")).toBe(false);
  });

  it("translates basic regex to JavaScript", () => {
    expect(breToJs("a+b")).toBe("a\\+b");
    expect(breToJs("a\\+b")).toBe("a+b");
    expect(breToJs("^err.*(x)$")).toBe("^err.*\\(x\\)$");
  });

  it("formats sizes like ls -h", () => {
    expect([0, 120, 1023, 1024, 4096, 8192, 10_240, 12_345, 1_572_864].map(humanSize)).toEqual([
      "0", "120", "1023", "1.0K", "4.0K", "8.0K", "10K", "13K", "1.5M",
    ]);
  });

  it("lays names out in columns like ls -C", () => {
    expect(columns(["Desktop", "Documents", "Downloads", "notes.txt", "projects"], 80)).toBe(
      "Desktop  Documents  Downloads  notes.txt  projects\n",
    );
    // Same results as `ls -C -w 17` / `-w 18` on Ubuntu 24.04.
    expect(columns(["aaaa", "bb", "cccc", "d", "eeeee"], 17)).toBe("aaaa  d\nbb    eeeee\ncccc\n");
    expect(columns(["aaaa", "bb", "cccc", "d", "eeeee"], 18)).toBe("aaaa  cccc  eeeee\nbb    d\n");
    expect(columns(["one", "two"], 3)).toBe("one\ntwo\n");
  });

  it("reads text typed with the keyboard on Hebrew", () => {
    expect(fromHebrewLayout("ךד")).toBe("ls");
    expect(fromHebrewLayout("פ'ג")).toBe("pwd");
    expect(fromHebrewLayout("בג")).toBe("cd");
  });
});

describe("shell: navigation", () => {
  it("starts at home and moves with cd", () => {
    expect(sh("pwd").out).toBe("/home/dana");
    expect(sh("cd projects", "pwd").out).toBe("/home/dana/projects");
    expect(sh("cd /etc", "cd ..", "pwd").out).toBe("/");
    expect(sh("cd /etc", "cd", "pwd").out).toBe("/home/dana");
    expect(sh("cd /etc", "cd ~", "pwd").out).toBe("/home/dana");
  });

  it("cd - goes back and prints where it went", () => {
    const r = sh("cd /tmp", "cd /etc", "cd -");
    expect(r.out).toBe("/tmp");
    expect(r.shell.cwd).toBe("/tmp");
  });

  it("prints Bash's real cd errors, with hints", () => {
    expect(sh("cd nope").text).toEqual(["bash: cd: nope: No such file or directory", "hint:notFound"]);
    expect(sh("cd notes.txt").text).toEqual(["bash: cd: notes.txt: Not a directory", "hint:notDir"]);
    expect(sh("cd /root").text).toEqual(["bash: cd: /root: Permission denied", "hint:permission"]);
    expect(sh("cd a b").text).toEqual(["bash: cd: too many arguments", "hint:tooManyArgs"]);
  });

  it("lists files, hidden files and long format", () => {
    expect(sh("ls").out).toBe("Desktop  Documents  Downloads  notes.txt  projects");
    expect(sh("ls -a").out).toContain(".bashrc");
    expect(sh("ls -a").out.startsWith(".  ")).toBe(true);
    const long = sh("ls -l").text;
    expect(long[0]).toBe("total 20");
    expect(long).toContain("drwxr-xr-x 2 dana dana 4096 Nov 11 21:34 Desktop");
    expect(long.find((l) => l.endsWith("notes.txt"))).toMatch(/^-rw-r--r-- 1 dana dana {2,}\d+ Nov 11 21:34 notes\.txt$/);
    expect(sh("ls -lh").text[0]).toBe("total 20K");
  });

  it("shows several operands with headers, files first", () => {
    expect(sh("mkdir d", "touch d/x", "ls notes.txt d").out).toBe("notes.txt\n\nd:\nx");
  });

  it("quotes names with spaces on screen, not in a pipe", () => {
    expect(sh('mkdir "my files"', "ls").out).toBe("Desktop  Documents  Downloads  'my files'  notes.txt  projects");
    expect(sh('mkdir "my files"', "ls | grep my").out).toBe("my files");
  });

  it("prints real ls errors", () => {
    expect(sh("ls nope").text).toEqual(["ls: cannot access 'nope': No such file or directory", "hint:notFound"]);
    expect(sh("ls -z").text).toEqual(["ls: invalid option -- 'z'", "Try 'ls --help' for more information.", "hint:invalidOption"]);
    // -R is a real ls option the simulator doesn't implement: a hint, not a fake "invalid option".
    expect(sh("ls -R").text).toEqual(["hint:unsupportedOption"]);
    expect(sh("rm -i notes.txt").text).toEqual(["hint:unsupportedOption"]);
    expect(sh("rm -i notes.txt").shell.fs.get("/home/dana/notes.txt")).toBeDefined();
    expect(sh("ls /root").text).toEqual(["ls: cannot open directory '/root': Permission denied", "hint:permission"]);
    expect(sh("ls nope").code).toBe(2);
  });
});

describe("shell: files and directories", () => {
  it("creates directories and files", () => {
    const { shell } = sh("mkdir -p blog/posts", "touch blog/posts/hello.md");
    expect(shell.fs.get("/home/dana/blog/posts/hello.md")?.type).toBe("file");
  });

  it("prints real mkdir errors (with GNU's curly quotes)", () => {
    expect(sh("mkdir projects").text).toEqual(["mkdir: cannot create directory ‘projects’: File exists", "hint:exists"]);
    expect(sh("mkdir x/y").text).toEqual(["mkdir: cannot create directory ‘x/y’: No such file or directory", "hint:noParent"]);
    expect(sh("mkdir").text).toEqual(["mkdir: missing operand", "Try 'mkdir --help' for more information.", "hint:missingOperand"]);
    expect(sh("mkdir -p projects").text).toEqual([]);
  });

  it("refuses to write outside home", () => {
    expect(sh("touch /etc/x").text).toEqual(["touch: cannot touch '/etc/x': Permission denied", "hint:permission"]);
    expect(sh("rm /etc/hostname").text).toEqual(["rm: cannot remove '/etc/hostname': Permission denied", "hint:permission"]);
    expect(sh("touch nodir/x").text).toEqual(["touch: cannot touch 'nodir/x': No such file or directory", "hint:notFound"]);
  });

  it("copies files and directories", () => {
    const { shell } = sh("cp notes.txt backup.txt", "mkdir -p a/b", "cp -r a c", "cp notes.txt projects");
    expect(shell.fs.get("/home/dana/backup.txt")?.type).toBe("file");
    expect(shell.fs.get("/home/dana/c/b")?.type).toBe("dir");
    expect(shell.fs.get("/home/dana/projects/notes.txt")?.type).toBe("file");
  });

  it("prints real cp errors", () => {
    expect(sh("cp projects x").text).toEqual(["cp: -r not specified; omitting directory 'projects'", "hint:cpDir"]);
    expect(sh("cp nope x").text).toEqual(["cp: cannot stat 'nope': No such file or directory", "hint:notFound"]);
    expect(sh("cp notes.txt").text).toEqual([
      "cp: missing destination file operand after 'notes.txt'",
      "Try 'cp --help' for more information.",
      "hint:missingDest",
    ]);
    expect(sh("cp notes.txt notes.txt").text).toEqual(["cp: 'notes.txt' and 'notes.txt' are the same file", "hint:sameFile"]);
    expect(sh("mkdir -p d/sub", "cp -r d d/sub").text).toEqual(["cp: cannot copy a directory, 'd', into itself, 'd/sub/d'", "hint:intoItself"]);
  });

  it("moves and renames, and keeps you inside a moved directory", () => {
    const { shell } = sh("mv notes.txt n.txt", "mv n.txt Documents", "cd projects", "mv ~/projects ~/work");
    expect(shell.fs.get("/home/dana/Documents/n.txt")?.type).toBe("file");
    expect(shell.fs.get("/home/dana/notes.txt")).toBeUndefined();
    expect(shell.cwd).toBe("/home/dana/work");
  });

  it("prints real mv errors", () => {
    expect(sh("mv nope x").text).toEqual(["mv: cannot stat 'nope': No such file or directory", "hint:notFound"]);
    expect(sh("mkdir -p d/sub", "mv d d/sub").text).toEqual(["mv: cannot move 'd' to a subdirectory of itself, 'd/sub/d'", "hint:intoItself"]);
  });

  it("removes files, and directories only with -r", () => {
    expect(sh("rm projects").text).toEqual(["rm: cannot remove 'projects': Is a directory", "hint:rmDir"]);
    expect(sh("rm -r projects").shell.fs.get("/home/dana/projects")).toBeUndefined();
    expect(sh("rm nope").text).toEqual(["rm: cannot remove 'nope': No such file or directory", "hint:notFound"]);
    expect(sh("rm -f nope").text).toEqual([]);
    expect(sh("rmdir projects").shell.fs.get("/home/dana/projects")).toBeUndefined();
    expect(sh("mkdir -p d/e", "rmdir d").text).toEqual(["rmdir: failed to remove 'd': Directory not empty", "hint:rmdirNotEmpty"]);
  });

  it("refuses rm -rf / with GNU's failsafe message and a hint", () => {
    const r = sh("rm -rf /");
    expect(r.text).toEqual([
      "rm: it is dangerous to operate recursively on '/'",
      "rm: use --no-preserve-root to override this failsafe",
      "hint:rmRoot",
    ]);
    expect(r.shell.fs.get("/home/dana/notes.txt")).toBeDefined();
    expect(sh("rm -r .").text).toEqual(["rm: refusing to remove '.' or '..' directory: skipping '.'", "hint:rmDot"]);
  });

  it("expands globs against the virtual filesystem", () => {
    expect(sh("touch a.txt b.txt c.md", "echo *.txt").out).toBe("a.txt b.txt notes.txt");
    expect(sh("echo *.nothing").out).toBe("*.nothing");
    expect(sh("echo '*.txt'").out).toBe("*.txt");
    expect(sh("rm *.txt", "ls").out).toBe("Desktop  Documents  Downloads  projects");
    expect(sh("echo /etc/host*").out).toBe("/etc/hostname");
  });
});

describe("shell: text, pipes and redirects", () => {
  it("echo, cat and redirects", () => {
    expect(sh('echo "שלום, לינוקס!"').out).toBe("שלום, לינוקס!");
    expect(sh("echo hi > a.txt", "echo there >> a.txt", "cat a.txt").out).toBe("hi\nthere");
    expect(sh("echo -n x > a", "cat -n a").out).toBe("     1\tx");
    expect(sh("cat projects").text).toEqual(["cat: projects: Is a directory", "hint:isDirRead"]);
    expect(sh("cat nope").text).toEqual(["cat: nope: No such file or directory", "hint:notFound"]);
    expect(sh("echo a > projects").text).toEqual(["bash: projects: Is a directory", "hint:isDirWrite"]);
  });

  it("> empties the file before the command runs (sort f > f trap)", () => {
    expect(sh("echo data > f", "cat f > f", "cat f").out).toBe("");
  });

  it("pipes output between commands", () => {
    expect(sh("cat notes.txt | grep -c ls").out).toBe("1");
    expect(sh("ls | head -n 2").out).toBe("Desktop\nDocuments");
  });

  it("grep with -i -n -v -c and real errors", () => {
    expect(sh("grep -n cd notes.txt").out).toBe("4:- cd moves between directories");
    expect(sh("grep -i LINUX notes.txt").out).toBe("Linux notes");
    expect(sh("grep nothing-here notes.txt").code).toBe(1);
    expect(sh("grep x nope").text).toEqual(["grep: nope: No such file or directory", "hint:notFound"]);
    expect(sh("grep").text).toEqual(["Usage: grep [OPTION]... PATTERNS [FILE]...", "Try 'grep --help' for more information.", "hint:grepUsage"]);
    expect(sh("touch e", "grep -c ls notes.txt e").out).toBe("notes.txt:1\ne:0");
  });

  it("head and tail", () => {
    expect(sh("head -n 1 notes.txt").out).toBe("Linux notes");
    expect(sh("tail -1 notes.txt").out).toBe("- cd moves between directories");
    expect(sh("head -n x notes.txt").text).toEqual(["head: invalid number of lines: ‘x’", "hint:badNumber"]);
    expect(sh("head nope").text).toEqual(["head: cannot open 'nope' for reading: No such file or directory", "hint:notFound"]);
    // tail -n +N starts at line N; head -n -N drops the last N lines.
    expect(sh("tail -n +3 notes.txt").out).toBe("- ls lists files\n- cd moves between directories");
    expect(sh("head -n -3 notes.txt").out).toBe("Linux notes");
    // Chapter 13's pipeline, with its real output.
    expect(
      sh(
        'echo -e "name,city,score\\ndana,haifa,92\\nyossi,tel-aviv,78\\nnoa,haifa,85\\navi,jerusalem,64\\nmaya,tel-aviv,97" > scores.csv',
        "cut -d, -f2 scores.csv | tail -n +2 | sort | uniq -c | sort -rn",
      ).out,
    ).toBe("      2 tel-aviv\n      2 haifa\n      1 jerusalem");
  });

  it("&& runs only after success, || only after failure", () => {
    expect(sh("cd nope && echo yes").out).toBe("bash: cd: nope: No such file or directory");
    expect(sh("cd nope || echo fallback").out).toBe("bash: cd: nope: No such file or directory\nfallback");
    expect(sh("cd /etc; pwd").out).toBe("/etc");
    expect(sh("cd nope", "echo $?").out).toBe("1");
  });

  it("2> sends errors to a file or /dev/null", () => {
    expect(sh("ls nope 2> /dev/null").text).toEqual(["hint:notFound"]);
    expect(sh("ls nope 2> err.txt", "cat err.txt").out).toBe("ls: cannot access 'nope': No such file or directory");
  });
});

describe("shell: mistakes beginners make", () => {
  it("unknown commands", () => {
    expect(sh("foo").text).toEqual(["bash: foo: command not found", "hint:commandNotFound"]);
    expect(sh("foo").code).toBe(127);
  });

  it("capital letters", () => {
    const r = sh("LS");
    expect(r.text).toEqual(["bash: LS: command not found", "hint:uppercase"]);
  });

  it("keyboard left on Hebrew", () => {
    const r = sh("ךד -ך");
    expect(r.text).toEqual(["bash: ךד: command not found", "hint:hebrewLayout"]);
    const hint = r.shell.run("ךד -ך").lines.find((l) => l.kind === "hint");
    expect(hint?.kind === "hint" && hint.hint.arg).toBe("ls -l");
  });

  it("real commands that aren't in the simulator get a hint, not a fake error", () => {
    expect(sh("nano notes.txt").text).toEqual(["hint:notInSimulator"]);
    expect(sh("sudo rm -rf /").text).toEqual(["hint:noSudo"]);
  });

  it("syntax problems", () => {
    expect(sh("ls >").text).toEqual(["bash: syntax error near unexpected token `newline'", "hint:syntax"]);
    expect(sh('echo "abc').text).toEqual(["hint:quote"]);
    expect(sh("ls |").text).toEqual(["hint:incomplete"]);
  });

  it("clear and help", () => {
    expect(sh("ls", "clear").shell.run("clear").clear).toBe(true);
    expect(sh("help").text).toEqual(["help"]);
  });

  it("history numbers lines like Bash", () => {
    expect(sh("whoami", "history").out).toBe("    1  whoami\n    2  history");
  });
});

describe("Tab completion", () => {
  const shell = new Shell();
  it("completes commands and unique names", () => {
    expect(shell.complete("whoa").line).toBe("whoami ");
    expect(shell.complete("cd proj").line).toBe("cd projects/");
    expect(shell.complete("cat no").line).toBe("cat notes.txt ");
  });

  it("extends a common prefix, then lists the options", () => {
    expect(shell.complete("cd D")).toEqual({ line: "cd D", options: ["Desktop/", "Documents/", "Downloads/"] });
    expect(shell.complete("cd Do")).toEqual({ line: "cd Do", options: ["Documents/", "Downloads/"] });
    expect(shell.complete("cd Dow").line).toBe("cd Downloads/");
  });

  it("escapes spaces in completed names", () => {
    const s = new Shell({ home: { "my files": {} } });
    expect(s.complete("cd my").line).toBe("cd my\\ files/");
  });
});

/** The solution commands of every chapter 28 challenge that has a simulator mission, keyed by mission id. */
function challengeSolutions() {
  const out: Record<string, string[]> = {};
  for (const c of challenges) {
    if (!c.mission) continue;
    out[c.mission] = (c.solution.commands ?? "").split("\n").map((l) => l.replace(/^\$ /, ""));
  }
  return out;
}

describe("missions", () => {
  it("every mission has tasks, chips and both languages", () => {
    for (const m of Object.values(missions)) {
      expect(m.tasks.length).toBeGreaterThan(0);
      expect(m.chips.length).toBeGreaterThan(0);
      for (const t of m.tasks) expect(t.he && t.en).toBeTruthy();
    }
  });

  it("tasks start unchecked and can all be completed", () => {
    const solutions = {
      "first-commands": ["whoami", "echo hi", "WHOAMI", "history"],
      navigate: ["cd projects", "cd /etc", "cd", "ls -a"],
      "files-dirs": ["mkdir -p blog/posts", "touch blog/posts/hello.md", "cp -r blog blog-backup", "mv Downloads/report.pdf Documents/", "rm Downloads/old-notes.txt"],
      "read-files": ["cat shopping.txt", "head -n 3 shopping.txt", "tail -n 2 shopping.txt", 'echo "honey" >> shopping.txt'],
      permissions: ["id", "./hello.sh", "chmod u+x hello.sh", "./hello.sh", "chmod 600 secret.txt"],
      pipes: ["ls > files.txt", 'echo "extra" >> files.txt', "wc -l < files.txt", "cat shopping.txt | sort", "ls nosuch 2>/dev/null"],
      "text-tools": [
        "grep -i error server.log",
        "grep -c INFO server.log",
        "cut -d, -f1 scores.csv",
        "cut -d, -f2 scores.csv | tail -n +2 | sort | uniq -c",
      ],
      "find-files": ['find project -name "*.py"', 'find project -iname "readme*"', "find project -type d", 'find project -name "*.log" -delete', "which ls"],
      // Challenge missions are solved with the exact commands chapter 28 shows as the solution.
      ...challengeSolutions(),
    } as Record<keyof typeof missions, string[]>;
    for (const [id, m] of Object.entries(missions)) {
      const shell = new Shell({ home: m.home });
      expect(m.tasks.map((t) => t.done(shell))).toEqual(m.tasks.map(() => false));
      for (const line of solutions[id as keyof typeof missions]) shell.run(line);
      expect(m.tasks.map((t) => t.done(shell)), id).toEqual(m.tasks.map(() => true));
    }
  });

  it("every chip runs without a 'command not found'", () => {
    for (const m of Object.values(missions)) {
      const shell = new Shell({ home: m.home });
      for (const chip of m.chips) {
        const { lines } = shell.run(chip);
        expect(lines.some((l) => l.kind === "err" && l.text.includes("command not found")), chip).toBe(false);
      }
    }
  });
});

describe("hint texts", () => {
  it("exist in both languages for every hint the shell can give", () => {
    expect(Object.keys(ui.he.simulator.hints).sort()).toEqual(Object.keys(ui.en.simulator.hints).sort());
    expect(ui.he.simulator.hints.notFound("x.txt")).toContain("`x.txt`");
  });
});

// Expected output below was captured from real runs on Ubuntu 24.04 (coreutils 9.4, findutils 4.9, LANG=C.UTF-8).
const LIST = 'echo -e "milk\\neggs\\nbread\\nmilk" > list.txt';
const CSV = 'echo -e "name,city,score\\ndana,haifa,92\\nyossi,tel-aviv,78\\nnoa,haifa,85" > s.csv';

describe("shell: wc, sort, uniq, cut", () => {
  it("wc columns follow GNU's width rules", () => {
    expect(sh(LIST, "wc list.txt").out).toBe(" 4  4 21 list.txt");
    expect(sh(LIST, "wc -l list.txt").out).toBe("4 list.txt");
    expect(sh(LIST, "wc -c list.txt").out).toBe("21 list.txt");
    expect(sh(LIST, CSV, "wc list.txt s.csv").out).toBe(" 4  4 21 list.txt\n 4  4 61 s.csv\n 8  8 82 total");
    expect(sh(LIST, "wc -l < list.txt").out).toBe("4");
    expect(sh(LIST, "cat list.txt | wc").out).toBe("      4       4      21");
    expect(sh(LIST, "cat list.txt | wc -l -w").out).toBe("      4       4");
    expect(sh("wc nosuch").text).toEqual(["wc: nosuch: No such file or directory", "hint:notFound"]);
    expect(sh("wc projects").text).toEqual(["wc: projects: Is a directory", "      0       0       0 projects", "hint:isDirRead"]);
    expect(sh('echo "שלום" | wc -m -c').out).toBe("      5       9");
  });

  it("sort: byte order, -n, -r, -u, -t/-k, -h, -f", () => {
    expect(sh(LIST, "sort list.txt").out).toBe("bread\neggs\nmilk\nmilk");
    expect(sh(LIST, "sort -r list.txt").out).toBe("milk\nmilk\neggs\nbread");
    expect(sh(LIST, "sort -u list.txt").out).toBe("bread\neggs\nmilk");
    expect(sh('echo -e "10\\n9\\n100" | sort').out).toBe("10\n100\n9");
    expect(sh('echo -e "10\\n9\\n100" | sort -n').out).toBe("9\n10\n100");
    expect(sh(CSV, "sort -t, -k3 -n s.csv").out).toBe("name,city,score\nyossi,tel-aviv,78\nnoa,haifa,85\ndana,haifa,92");
    expect(sh('echo -e "4.0K\\n51M\\n580K" | sort -rh').out).toBe("51M\n580K\n4.0K");
    expect(sh('echo -e "b\\nB\\na" | sort').out).toBe("B\na\nb");
    expect(sh('echo -e "b\\nB\\na" | sort -f').out).toBe("a\nB\nb");
    expect(sh("sort nosuch").text).toEqual(["sort: cannot read: nosuch: No such file or directory", "hint:notFound"]);
    expect(sh("sort projects").text).toEqual(["sort: read failed: projects: Is a directory", "hint:isDirRead"]);
    expect(sh("sort nosuch").code).toBe(2);
    expect(sh("sort -k x notes.txt").text[0]).toBe("sort: invalid number at field start: invalid count at start of ‘x’");
  });

  it("uniq merges neighbors; -c -d -u -i", () => {
    expect(sh(LIST, "uniq list.txt").out).toBe("milk\neggs\nbread\nmilk");
    expect(sh(LIST, "sort list.txt | uniq -c").out).toBe("      1 bread\n      1 eggs\n      2 milk");
    expect(sh(LIST, "sort list.txt | uniq -d").out).toBe("milk");
    expect(sh(LIST, "sort list.txt | uniq -u").out).toBe("bread\neggs");
    expect(sh('echo -e "x\\nx\\nX" | uniq -ci').out).toBe("      3 x");
    expect(sh("uniq projects").text).toEqual(["uniq: error reading 'projects': Is a directory", "hint:isDirRead"]);
  });

  it("cut fields and characters, with GNU's errors", () => {
    expect(sh(CSV, "cut -d, -f1 s.csv").out).toBe("name\ndana\nyossi\nnoa");
    expect(sh(CSV, "cut -d, -f1,3 s.csv").out).toBe("name,score\ndana,92\nyossi,78\nnoa,85");
    expect(sh(CSV, "cut -d, -f2-3 s.csv").out).toBe("city,score\nhaifa,92\ntel-aviv,78\nhaifa,85");
    expect(sh(LIST, "cut -c1-3 list.txt").out).toBe("mil\negg\nbre\nmil");
    expect(sh('echo -e "a,b\\nnodelim" | cut -d, -f2').out).toBe("b\nnodelim");
    expect(sh(CSV, "cut s.csv").text).toEqual([
      "cut: you must specify a list of bytes, characters, or fields",
      "Try 'cut --help' for more information.",
      "hint:cutList",
    ]);
    expect(sh(CSV, "cut -d, -f0 s.csv").text[0]).toBe("cut: fields are numbered from 1");
    expect(sh(CSV, "cut -f a s.csv").text[0]).toBe("cut: invalid field value ‘a’");
    expect(sh(CSV, "cut -f 3-1 s.csv").text[0]).toBe("cut: invalid decreasing range");
    expect(sh(CSV, "cut -d ab -f1 s.csv").text[0]).toBe("cut: the delimiter must be a single character");
    expect(sh(CSV, "cut -d, -f1 -c1 s.csv").text[0]).toBe("cut: only one list may be specified");
  });
});

describe("shell: permissions and scripts", () => {
  const ll = (path: string, ...before: string[]) => sh(...before, `ls -l ${path}`).out.split(" ")[0];

  it("chmod numeric and symbolic", () => {
    expect(ll("notes.txt", "chmod u+x notes.txt")).toBe("-rwxr--r--");
    expect(ll("notes.txt", "chmod 600 notes.txt")).toBe("-rw-------");
    expect(ll("notes.txt", "chmod 600 notes.txt", "chmod go+r,u-w notes.txt")).toBe("-r--r--r--");
    expect(ll("notes.txt", "chmod a=rw notes.txt")).toBe("-rw-rw-rw-");
    expect(ll("notes.txt", "chmod g=u notes.txt")).toBe("-rw-rw-r--");
    expect(ll("notes.txt", "chmod u=rwx,go= notes.txt")).toBe("-rwx------");
    expect(ll("notes.txt", "chmod 7 notes.txt")).toBe("-------rwx");
    expect(ll("notes.txt", "chmod 7755 notes.txt")).toBe("-rwsr-sr-t");
    expect(ll("notes.txt", "chmod +w notes.txt", "chmod g+w notes.txt")).toBe("-rw-rw-r--");
    expect(ll("notes.txt", "chmod -x notes.txt")).toBe("-rw-r--r--");
    expect(sh("chmod a-x,u+X projects", "ls -ld projects").out.split(" ")[0]).toBe("drwxr--r--");
    expect(sh("ls -ld /tmp").out.split(" ")[0]).toBe("drwxrwxrwt");
  });

  it("chmod errors", () => {
    expect(sh("chmod").text).toEqual(["chmod: missing operand", "Try 'chmod --help' for more information.", "hint:missingOperand"]);
    expect(sh("chmod 755").text.slice(0, 2)).toEqual(["chmod: missing operand after ‘755’", "Try 'chmod --help' for more information."]);
    expect(sh("chmod 755 nosuch").text).toEqual(["chmod: cannot access 'nosuch': No such file or directory", "hint:notFound"]);
    expect(sh("chmod abc notes.txt").text).toEqual(["chmod: invalid mode: ‘abc’", "Try 'chmod --help' for more information.", "hint:badMode"]);
    expect(sh("chmod 12345 notes.txt").text[0]).toBe("chmod: invalid mode: ‘12345’");
    expect(sh("chmod 644 /etc/hostname").text).toEqual(["chmod: changing permissions of '/etc/hostname': Operation not permitted", "hint:notPermitted"]);
    expect(sh("chmod -z notes.txt").text[0]).toBe("chmod: invalid option -- 'z'");
  });

  it("chown and id", () => {
    expect(sh("chown root notes.txt").text).toEqual(["chown: changing ownership of 'notes.txt': Operation not permitted", "hint:notPermitted"]);
    expect(sh("chown dana notes.txt").code).toBe(0);
    expect(sh("chown bob notes.txt").out).toBe("chown: invalid user: ‘bob’");
    expect(sh("chown dana:bob notes.txt").out).toBe("chown: invalid group: ‘dana:bob’");
    expect(sh("chown :bob notes.txt").out).toBe("chown: invalid group: ‘:bob’");
    expect(sh("chown dana:nogroup notes.txt").text[0]).toBe("chown: changing ownership of 'notes.txt': Operation not permitted");
    expect(sh("chown :adm notes.txt", "ls -l notes.txt").out).toMatch(/^-rw-r--r-- 1 dana adm /);
    expect(sh("id").out).toBe("uid=1000(dana) gid=1000(dana) groups=1000(dana),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),100(users)");
    expect(sh("id -un").out).toBe("dana");
    expect(sh("id -G").out).toBe("1000 4 24 27 30 46 100");
    expect(sh("id root").out).toBe("uid=0(root) gid=0(root) groups=0(root)");
    expect(sh("id bob").out).toBe("id: ‘bob’: no such user");
  });

  it("runs scripts: ./ needs x, bash doesn't", () => {
    const script = 'echo "echo Hello from my script" > hello.sh';
    expect(sh(script, "./hello.sh").text).toEqual(["bash: ./hello.sh: Permission denied", "hint:notExecutable"]);
    expect(sh(script, "./hello.sh").code).toBe(126);
    expect(sh(script, "chmod u+x hello.sh", "./hello.sh").out).toBe("Hello from my script");
    expect(sh(script, "bash hello.sh").out).toBe("Hello from my script");
    expect(sh(script, "chmod u+x hello.sh", "./hello.sh | wc -w").out).toBe("4");
    expect(sh("./nosuch.sh").text[0]).toBe("bash: ./nosuch.sh: No such file or directory");
    expect(sh("./nosuch.sh").code).toBe(127);
    expect(sh("bash nosuch.sh").text[0]).toBe("bash: nosuch.sh: No such file or directory");
    expect(sh("./projects").text[0]).toBe("bash: ./projects: Is a directory");
    expect(sh("bash projects").text[0]).toBe("projects: projects: Is a directory");
    expect(sh('echo "./loop.sh" > loop.sh', "chmod +x loop.sh", "./loop.sh").code).toBe(1);
  });
});

describe("shell: find, which, man, date, uname", () => {
  const PROJECT = [
    "mkdir -p project/src project/docs project/old",
    "echo a > project/src/main.py",
    "echo b > project/docs/README.md",
    "echo c > project/old/app.log",
    "touch project/old/debug.log",
  ];

  it("find by name, type, depth, size and time", () => {
    expect(sh(...PROJECT, 'find project -name "*.py"').out).toBe("project/src/main.py");
    expect(sh(...PROJECT, 'find project -iname "readme*"').out).toBe("project/docs/README.md");
    expect(sh(...PROJECT, "find project -maxdepth 1").out).toBe("project\nproject/docs\nproject/old\nproject/src");
    expect(sh(...PROJECT, "find project -type d").out).toBe("project\nproject/docs\nproject/old\nproject/src");
    expect(sh(...PROJECT, "find project -size +1k").out).toBe("project\nproject/docs\nproject/old\nproject/src");
    expect(sh(...PROJECT, "find project -size -1k").out).toBe("project/old/debug.log");
    expect(sh(...PROJECT, "find project -type f -empty").out).toBe("project/old/debug.log");
    expect(sh(...PROJECT, "find project -mtime +30").out).toBe("");
    expect(sh(...PROJECT, 'find project -name "*.log" -o -name "*.md"').out).toBe(
      "project/docs/README.md\nproject/old/app.log\nproject/old/debug.log",
    );
    expect(sh(...PROJECT, "cd project", "find -name main.py").out).toBe("./src/main.py");
  });

  it("find -delete works depth-first", () => {
    expect(sh(...PROJECT, 'find project -name "*.log" -delete', "find project").out).toBe(
      "project\nproject/docs\nproject/docs/README.md\nproject/old\nproject/src\nproject/src/main.py",
    );
    expect(sh(...PROJECT, "find project/old -delete", "ls project").out).toBe("docs  src");
  });

  it("find errors", () => {
    expect(sh("find nosuch").text).toEqual(["find: ‘nosuch’: No such file or directory", "hint:notFound"]);
    expect(sh("find . -foo").out).toBe("find: unknown predicate `-foo'");
    expect(sh("find . -name").out).toBe("find: missing argument to `-name'");
    expect(sh("find . -type x").out).toBe("find: Unknown argument to -type: x");
    expect(sh("find . -maxdepth x").out).toBe("find: Expected a positive decimal integer argument to -maxdepth, but got ‘x’");
    expect(sh("find . -size 1x").out).toBe("find: invalid -size type `x'");
    expect(sh("find . -mtime x").out).toBe("find: invalid argument `x' to `-mtime'");
    expect(sh("touch a.txt b.txt", "find . -name *.txt").text).toEqual([
      "find: paths must precede expression: `b.txt'",
      "find: possible unquoted pattern after predicate `-name'?",
      "hint:findQuote",
    ]);
    expect(sh("find /root").text).toEqual(["find: ‘/root’: Permission denied", "/root", "hint:permission"]);
  });

  it("which, man, date and uname", () => {
    expect(sh("which ls cat").out).toBe("/usr/bin/ls\n/usr/bin/cat");
    expect(sh("which cd").out).toBe("");
    expect(sh("which cd").code).toBe(1);
    expect(sh("man ls").text).toEqual(["ls (1)               - list directory contents", "hint:manPage"]);
    expect(sh("man cd").out).toBe("No manual entry for cd");
    expect(sh("man cd").code).toBe(16);
    expect(sh("man").out).toBe("What manual page do you want?\nFor example, try 'man man'.");
    expect(sh("date +%F").out).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(sh("date").out).toMatch(/^[A-Z][a-z]{2} [A-Z][a-z]{2} [ \d]\d \d\d:\d\d:\d\d UTC \d{4}$/);
    expect(sh("date foo").out).toBe("date: invalid date ‘foo’");
    expect(sh("uname").out).toBe("Linux");
    expect(sh("uname -sr").out).toBe("Linux 6.8.0-48-generic");
    expect(sh("uname -x").text[0]).toBe("uname: invalid option -- 'x'");
  });
});
