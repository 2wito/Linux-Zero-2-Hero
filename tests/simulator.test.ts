import { describe, expect, it } from "vitest";
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

describe("missions", () => {
  it("every mission has tasks, chips and both languages", () => {
    for (const m of Object.values(missions)) {
      expect(m.tasks.length).toBeGreaterThan(0);
      expect(m.chips.length).toBeGreaterThan(0);
      for (const t of m.tasks) expect(t.he && t.en).toBeTruthy();
    }
  });

  it("tasks start unchecked and can all be completed", () => {
    const solutions: Record<keyof typeof missions, string[]> = {
      "first-commands": ["whoami", "echo hi", "WHOAMI", "history"],
      navigate: ["cd projects", "cd /etc", "cd", "ls -a"],
      "files-dirs": ["mkdir -p blog/posts", "touch blog/posts/hello.md", "cp -r blog blog-backup", "mv Downloads/report.pdf Documents/", "rm Downloads/old-notes.txt"],
      "read-files": ["cat shopping.txt", "head -n 3 shopping.txt", "tail -n 2 shopping.txt", 'echo "honey" >> shopping.txt'],
    };
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
