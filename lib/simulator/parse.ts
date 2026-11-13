// Command-line parser for the terminal simulator: a small, honest subset of Bash syntax.
// Supports quotes ('...' and "..."), backslash escapes, $VARS, ~, globs (* ? [...]), pipes |,
// redirects > >> 2> 2>> <, and the lists && || ;. Anything else is reported, not guessed.

export type Word = {
  /** The word after quote removal and expansion. */
  value: string;
  /** Glob pattern (quoted special characters escaped with "\"), or null when nothing to expand. */
  glob: string | null;
};

export type Operator = "|" | "||" | "&&" | ";" | "&" | ">" | ">>" | "2>" | "2>>" | "<";
export type Token = { kind: "word"; word: Word } | { kind: "op"; op: Operator };

export type RedirectOp = ">" | ">>" | "2>" | "2>>" | "<";
export type Redirect = { op: RedirectOp; target: Word };
export type SimpleCommand = { words: Word[]; redirects: Redirect[] };
export type Pipeline = SimpleCommand[];
/** `connector` joins this pipeline to the previous one (null for the first). */
export type ListItem = { connector: "&&" | "||" | ";" | null; pipeline: Pipeline };

export type ParseError =
  | { kind: "quote" } // unterminated quote: real Bash would wait for more input
  | { kind: "incomplete" } // ends with | && || : real Bash would wait for more input
  | { kind: "syntax"; token: string } // bash: syntax error near unexpected token `X'
  | { kind: "background" }; // & is not supported in the simulator

export type ParseResult = { ok: true; list: ListItem[] } | { ok: false; error: ParseError };

const GLOB_CHARS = new Set(["*", "?", "["]);
const NAME = /^[A-Za-z_][A-Za-z0-9_]*/;

/** Splits a command line into words and operators. `env` supplies $VARS; `home` is used for ~. */
export function tokenize(line: string, env: Record<string, string> = {}): { tokens: Token[] } | { error: ParseError } {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    const c = line[i];
    if (c === " " || c === "\t") {
      i++;
      continue;
    }
    if (c === "#") break; // a comment runs to the end of the line

    const op = readOperator(line, i);
    if (op) {
      tokens.push({ kind: "op", op });
      i += op.length;
      continue;
    }

    // A word: runs until unquoted whitespace or an operator character.
    let value = "";
    let glob = "";
    let hasGlob = false;
    let quoted = false;
    const start = i;
    const literal = (s: string) => {
      value += s;
      glob += s.replace(/[*?[\]\\]/g, "\\$&");
    };

    while (i < line.length) {
      const ch = line[i];
      if (ch === " " || ch === "\t" || "|&;<>".includes(ch)) break;
      if (ch === "'") {
        const end = line.indexOf("'", i + 1);
        if (end === -1) return { error: { kind: "quote" } };
        literal(line.slice(i + 1, end));
        quoted = true;
        i = end + 1;
      } else if (ch === '"') {
        i++;
        let closed = false;
        while (i < line.length) {
          const d = line[i];
          if (d === '"') {
            closed = true;
            i++;
            break;
          }
          if (d === "\\" && i + 1 < line.length && '"\\$`'.includes(line[i + 1])) {
            literal(line[i + 1]);
            i += 2;
          } else if (d === "$") {
            const [text, used] = expandVar(line, i, env);
            literal(text);
            i += used;
          } else {
            literal(d);
            i++;
          }
        }
        if (!closed) return { error: { kind: "quote" } };
        quoted = true;
      } else if (ch === "\\") {
        if (i + 1 < line.length) literal(line[i + 1]);
        quoted = true;
        i += 2;
      } else if (ch === "$") {
        const [text, used] = expandVar(line, i, env);
        literal(text);
        i += used;
      } else if (ch === "~" && i === start && (i + 1 === line.length || /[\s/|&;<>]/.test(line[i + 1]))) {
        literal(env.HOME ?? "~");
        i++;
      } else {
        value += ch;
        glob += ch;
        if (GLOB_CHARS.has(ch)) hasGlob = true;
        i++;
      }
    }

    // An unquoted $VAR that expanded to nothing disappears, like in Bash.
    if (value === "" && !quoted) continue;
    tokens.push({ kind: "word", word: { value, glob: hasGlob ? glob : null } });
  }

  return { tokens };
}

function readOperator(line: string, i: number): Operator | null {
  const two = line.slice(i, i + 2);
  const three = line.slice(i, i + 3);
  // "2>" only counts as a redirect when the 2 starts a word ("file2>x" is a word "file2" then ">").
  const atWordStart = i === 0 || /[\s|&;<>]/.test(line[i - 1]);
  if (atWordStart && three === "2>>") return "2>>";
  if (atWordStart && two === "2>") return "2>";
  if (two === "||" || two === "&&" || two === ">>") return two;
  const c = line[i];
  if (c === "|" || c === ";" || c === "&" || c === ">" || c === "<") return c;
  return null;
}

/** Expands $NAME, ${NAME} or $? at line[i] (which is "$"). Returns the text and how many characters were used. */
function expandVar(line: string, i: number, env: Record<string, string>): [string, number] {
  const rest = line.slice(i + 1);
  if (rest.startsWith("?")) return [env["?"] ?? "0", 2];
  const braced = rest.match(/^\{([A-Za-z_][A-Za-z0-9_]*)\}/);
  if (braced) return [env[braced[1]] ?? "", braced[0].length + 1];
  const name = rest.match(NAME);
  if (name) return [env[name[0]] ?? "", name[0].length + 1];
  return ["$", 1]; // a lone $ stays as is
}

/** Parses a command line into a list of pipelines. */
export function parse(line: string, env: Record<string, string> = {}): ParseResult {
  const lexed = tokenize(line, env);
  if ("error" in lexed) return { ok: false, error: lexed.error };

  const list: ListItem[] = [];
  let connector: ListItem["connector"] = null;
  let pipeline: Pipeline = [];
  let current: SimpleCommand = { words: [], redirects: [] };
  const tokens = lexed.tokens;
  const empty = (cmd: SimpleCommand) => cmd.words.length === 0 && cmd.redirects.length === 0;

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok.kind === "word") {
      current.words.push(tok.word);
      continue;
    }
    const op = tok.op;
    if (op === "&") return { ok: false, error: { kind: "background" } };
    if (op === ">" || op === ">>" || op === "2>" || op === "2>>" || op === "<") {
      const next = tokens[i + 1];
      if (!next) return { ok: false, error: { kind: "syntax", token: "newline" } };
      if (next.kind !== "word") return { ok: false, error: { kind: "syntax", token: next.op } };
      current.redirects.push({ op, target: next.word });
      i++;
      continue;
    }
    // | && || ; all need a command before them.
    if (empty(current)) return { ok: false, error: { kind: "syntax", token: op } };
    pipeline.push(current);
    current = { words: [], redirects: [] };
    if (op === "|") continue;
    list.push({ connector, pipeline });
    pipeline = [];
    connector = op;
  }

  if (empty(current)) {
    if (pipeline.length > 0 || connector === "&&" || connector === "||") return { ok: false, error: { kind: "incomplete" } };
  } else {
    pipeline.push(current);
  }
  if (pipeline.length > 0) list.push({ connector, pipeline });
  return { ok: true, list };
}

/** Converts a glob segment (with "\" escapes from tokenize) to an anchored RegExp. */
export function globToRegExp(pattern: string): RegExp {
  let re = "";
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === "\\" && i + 1 < pattern.length) {
      re += escapeRe(pattern[++i]);
    } else if (c === "*") re += "[^/]*";
    else if (c === "?") re += "[^/]";
    else if (c === "[") {
      const end = pattern.indexOf("]", i + 2);
      if (end === -1) re += "\\[";
      else {
        let body = pattern.slice(i + 1, end);
        if (body.startsWith("!") || body.startsWith("^")) body = "^" + body.slice(1);
        re += "[" + body.replace(/\\/g, "\\\\") + "]";
        i = end;
      }
    } else re += escapeRe(c);
  }
  return new RegExp("^" + re + "$");
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}

/** True when a glob segment contains an unescaped special character. */
export function hasGlobChars(segment: string): boolean {
  for (let i = 0; i < segment.length; i++) {
    if (segment[i] === "\\") i++;
    else if (GLOB_CHARS.has(segment[i])) return true;
  }
  return false;
}

/** Removes the "\" escapes a glob segment carries. */
export function unescapeGlob(segment: string): string {
  return segment.replace(/\\(.)/g, "$1");
}
