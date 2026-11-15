// Pure helpers behind the simulator's text and permission commands (wc, sort, uniq, cut, chmod, date).
// Behavior and messages were checked against GNU coreutils 9.4 on Ubuntu 24.04 (LANG=C.UTF-8, TZ=UTC).

// ---------- wc ----------

export type WcCounts = { lines: number; words: number; chars: number; bytes: number };

export function wcCounts(text: string): WcCounts {
  return {
    lines: (text.match(/\n/g) ?? []).length,
    words: (text.match(/\S+/g) ?? []).length,
    chars: [...text].length,
    bytes: new TextEncoder().encode(text).length,
  };
}

/**
 * GNU wc's column width: 1 when a single count is printed for a single input; otherwise the number of digits
 * of the total size of the regular files, and at least 7 when any input isn't a regular file (pipe, directory).
 * `failedFirst`: the first input couldn't be opened (wc then falls back to width 1).
 */
export function wcWidth(inputs: { regular: boolean; size: number; failed: boolean }[], fields: number): number {
  if (fields === 1 && inputs.length === 1) return 1;
  if (!inputs.length || inputs[0].failed) return 1;
  let total = 0;
  let minimum = 1;
  for (const i of inputs) {
    if (i.failed) continue;
    if (i.regular) total += i.size;
    else minimum = 7;
  }
  return Math.max(String(total).length, minimum);
}

// ---------- sort ----------

export type SortOptions = { numeric?: boolean; human?: boolean; reverse?: boolean; unique?: boolean; fold?: boolean; sep?: string; key?: string };

/** The part of `line` a `-k N[,M]` key selects (fields split by `sep`, or by blank-to-nonblank transitions). */
function keyOf(line: string, key: { start: number; end: number | null }, sep?: string): string {
  if (sep !== undefined) {
    const fields = line.split(sep);
    const end = key.end ?? fields.length;
    return fields.slice(key.start - 1, end).join(sep);
  }
  const fields = line.match(/\s*\S+/g) ?? [];
  const end = key.end ?? fields.length;
  return fields.slice(key.start - 1, end).join("");
}

/** Parses a `-k` spec like `3`, `2,2` or `3n`. Returns null when invalid. */
export function parseSortKey(spec: string): { start: number; end: number | null; flags: string } | null {
  const m = spec.match(/^(\d+)(?:,(\d+))?([bdfhinr]*)$/);
  if (!m || Number(m[1]) < 1) return null;
  return { start: Number(m[1]), end: m[2] ? Number(m[2]) : null, flags: m[3] };
}

function leadingNumber(s: string): number {
  const m = s.match(/^\s*(-?\d*\.?\d+)/);
  return m ? parseFloat(m[1]) : 0;
}

const HUMAN_SUFFIX = "KMGTPEZY";

function humanValue(s: string): [number, number] {
  const m = s.match(/^\s*(-?\d*\.?\d+)([KMGTPEZY]?)/);
  if (!m) return [0, 0];
  const n = parseFloat(m[1]);
  return [Math.sign(n) * (m[2] ? HUMAN_SUFFIX.indexOf(m[2]) + 1 : 0), n];
}

const byteCmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

export function sortLines(lines: string[], o: SortOptions): string[] {
  const key = o.key ? parseSortKey(o.key) : null;
  const flags = key?.flags ? key.flags : `${o.numeric ? "n" : ""}${o.human ? "h" : ""}${o.fold ? "f" : ""}`;
  const pick = (l: string) => (key ? keyOf(l, key, o.sep) : l);
  const keyCmp = (a: string, b: string) => {
    const ka = pick(a);
    const kb = pick(b);
    if (flags.includes("n")) return leadingNumber(ka) - leadingNumber(kb);
    if (flags.includes("h")) {
      const [sa, na] = humanValue(ka);
      const [sb, nb] = humanValue(kb);
      return sa - sb || na - nb;
    }
    if (flags.includes("f")) return byteCmp(ka.toUpperCase(), kb.toUpperCase());
    return byteCmp(ka, kb);
  };
  const reverse = o.reverse || (key?.flags.includes("r") ?? false);
  // GNU: keys first, then the whole line as a last resort; -r reverses both.
  const sorted = [...lines].sort((a, b) => {
    const c = keyCmp(a, b) || byteCmp(a, b);
    return reverse ? -c : c;
  });
  if (!o.unique) return sorted;
  return sorted.filter((l, i) => i === 0 || keyCmp(sorted[i - 1], l) !== 0);
}

// ---------- uniq ----------

export function uniqLines(lines: string[], o: { count?: boolean; repeated?: boolean; unique?: boolean; ignoreCase?: boolean }): string[] {
  const same = (a: string, b: string) => (o.ignoreCase ? a.toLowerCase() === b.toLowerCase() : a === b);
  const groups: { line: string; n: number }[] = [];
  for (const l of lines) {
    const last = groups[groups.length - 1];
    if (last && same(last.line, l)) last.n++;
    else groups.push({ line: l, n: 1 });
  }
  return groups
    .filter((g) => (o.repeated ? g.n > 1 : true) && (o.unique ? g.n === 1 : true))
    .map((g) => (o.count ? `${String(g.n).padStart(7)} ${g.line}` : g.line));
}

// ---------- cut ----------

export type CutRange = { from: number; to: number };

/** Parses a cut list (`1,3`, `2-4`, `-2`, `3-`). Returns the ranges, or the exact GNU error message. */
export function parseCutList(spec: string, kind: "fields" | "chars"): CutRange[] | { error: string } {
  const ranges: CutRange[] = [];
  for (const item of spec.split(",")) {
    const m = item.match(/^(\d*)(-?)(\d*)$/);
    if (!m || (!m[1] && !m[3])) {
      return { error: kind === "fields" ? `invalid field value ‘${item}’` : `invalid byte/character position ‘${item}’` };
    }
    const from = m[1] ? Number(m[1]) : 1;
    const to = m[2] ? (m[3] ? Number(m[3]) : Infinity) : from;
    if ((m[1] && from === 0) || (m[3] && Number(m[3]) === 0)) {
      return { error: kind === "fields" ? "fields are numbered from 1" : "byte/character positions are numbered from 1" };
    }
    if (to < from) return { error: "invalid decreasing range" };
    ranges.push({ from, to });
  }
  return ranges;
}

const inRanges = (n: number, ranges: CutRange[]) => ranges.some((r) => n >= r.from && n <= r.to);

/** One line of `cut`: fields keep their order in the input; lines without the delimiter pass through (unless `onlyDelimited`). */
export function cutLine(line: string, ranges: CutRange[], mode: "fields" | "chars", delim = "\t", onlyDelimited = false): string | null {
  if (mode === "chars") return [...line].filter((_, i) => inRanges(i + 1, ranges)).join("");
  if (!line.includes(delim)) return onlyDelimited ? null : line;
  return line
    .split(delim)
    .filter((_, i) => inRanges(i + 1, ranges))
    .join(delim);
}

// ---------- chmod ----------

const UMASK = 0o022;
const CLASS_BITS = { u: 0o4700, g: 0o2070, o: 0o1007 } as const;
const RWX = { r: 0o444, w: 0o222, x: 0o111 } as const;

/**
 * Applies a chmod mode (octal like `755`, or symbolic like `u+x`, `go-w`, `a=r`, `g=u`) to `current`.
 * Returns the new mode bits, or null for an invalid mode. Without a "who" letter, the umask (022) filters the bits.
 */
export function applyMode(spec: string, current: number, isDir: boolean): number | null {
  if (/^[0-7]{1,4}$/.test(spec)) return parseInt(spec, 8);
  let mode = current & 0o7777;
  for (const clause of spec.split(",")) {
    const m = clause.match(/^([ugoa]*)((?:[-+=](?:[rwxXst]*|[ugo]))+)$/);
    if (!m) return null;
    const who = m[1].includes("a") || m[1] === "" ? "ugo" : m[1];
    let mask = [...who].reduce((acc, c) => acc | CLASS_BITS[c as "u" | "g" | "o"], 0);
    if (m[1] === "") mask &= ~UMASK;
    // [ugo] first: [rwxXst]* would otherwise match the empty string before "u" in "g=u".
    for (const [, op, perms] of m[2].matchAll(/([-+=])([ugo]|[rwxXst]*)/g)) {
      let bits = 0;
      if (/^[ugo]$/.test(perms)) {
        // Copy another class's bits (g=u): take its rwx and spread them to every class.
        const src = (mode >> { u: 6, g: 3, o: 0 }[perms as "u" | "g" | "o"]) & 7;
        bits = (src << 6) | (src << 3) | src;
      } else {
        for (const p of perms) {
          if (p === "r" || p === "w" || p === "x") bits |= RWX[p];
          else if (p === "X") bits |= isDir || mode & 0o111 ? 0o111 : 0;
          else if (p === "s") bits |= 0o6000;
          else if (p === "t") bits |= 0o1000;
        }
      }
      bits &= mask;
      if (op === "+") mode |= bits;
      else if (op === "-") mode &= ~bits;
      else mode = (mode & ~(mask & 0o777)) | bits;
    }
  }
  return mode;
}

/** `rwxr-xr-x` for the permission bits, with s/S/t/T for setuid, setgid and sticky. */
export function permString(mode: number): string {
  const out = [...("rwxrwxrwx" as string)].map((c, i) => (mode & (1 << (8 - i)) ? c : "-"));
  const special = (i: number, bit: number, on: string) => {
    if (mode & bit) out[i] = out[i] === "x" ? on : on.toUpperCase();
  };
  special(2, 0o4000, "s");
  special(5, 0o2000, "s");
  special(8, 0o1000, "t");
  return out.join("");
}

// ---------- date ----------

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** GNU date formatting (a common subset) in UTC. `date` with no format uses `%a %b %e %H:%M:%S %Z %Y`. */
export function formatDate(time: number, format = "%a %b %e %H:%M:%S %Z %Y"): string {
  const d = new Date(time);
  const p2 = (n: number) => String(n).padStart(2, "0");
  const map: Record<string, () => string> = {
    a: () => DAYS[d.getUTCDay()].slice(0, 3),
    A: () => DAYS[d.getUTCDay()],
    b: () => MONTHS_LONG[d.getUTCMonth()].slice(0, 3),
    h: () => MONTHS_LONG[d.getUTCMonth()].slice(0, 3),
    B: () => MONTHS_LONG[d.getUTCMonth()],
    d: () => p2(d.getUTCDate()),
    e: () => String(d.getUTCDate()).padStart(2),
    m: () => p2(d.getUTCMonth() + 1),
    Y: () => String(d.getUTCFullYear()),
    y: () => p2(d.getUTCFullYear() % 100),
    H: () => p2(d.getUTCHours()),
    M: () => p2(d.getUTCMinutes()),
    S: () => p2(d.getUTCSeconds()),
    F: () => `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`,
    T: () => `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}:${p2(d.getUTCSeconds())}`,
    Z: () => "UTC",
    s: () => String(Math.floor(time / 1000)),
    n: () => "\n",
    t: () => "\t",
    "%": () => "%",
  };
  return format.replace(/%(.)/g, (all, c: string) => (map[c] ? map[c]() : all));
}
