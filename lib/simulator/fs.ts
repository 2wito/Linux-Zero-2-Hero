// In-memory filesystem for the terminal simulator. Nothing here touches the real machine.

export const USER = "dana";
export const HOST = "ubuntu";
export const HOME = `/home/${USER}`;

export type Owner = typeof USER | "root";
export type FileNode = { type: "file"; content: string; mode: number; owner: Owner; mtime: number };
export type DirNode = { type: "dir"; children: Map<string, FsNode>; mode: number; owner: Owner; mtime: number };
export type FsNode = FileNode | DirNode;

/** Seed format: a string is a file with that content, an object is a directory. */
export type Tree = { [name: string]: string | Tree };

export type FsError = "ENOENT" | "ENOTDIR" | "EACCES";
export type Lookup = { node: FsNode; error?: undefined } | { node?: undefined; error: FsError };

/** The default home directory: matches the examples in chapters 4–7. */
export const defaultHome: Tree = {
  ".bashrc": "# ~/.bashrc: executed by bash(1) for non-login shells.\n",
  ".profile": "# ~/.profile: executed by the command interpreter for login shells.\n",
  Desktop: {},
  Documents: {},
  Downloads: {},
  "notes.txt": "Linux notes\n- pwd shows where I am\n- ls lists files\n- cd moves between directories\n",
  projects: {},
};

/** Placeholder mtime for the starting files: "when the simulator was first used". */
const SEED_TIME = -1;

const SYSTEM_DIRS = ["bin", "boot", "dev", "etc", "lib", "media", "mnt", "opt", "proc", "root", "run", "sbin", "srv", "sys", "tmp", "usr", "var"];

/** Absolute, normalized path for `path` seen from `cwd` (resolves ".", ".." and repeated slashes). */
export function resolvePath(cwd: string, path: string): string {
  const parts = path.startsWith("/") ? [] : cwd.split("/").filter(Boolean);
  for (const seg of path.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") parts.pop();
    else parts.push(seg);
  }
  return "/" + parts.join("/");
}

export function basename(path: string): string {
  const trimmed = path.replace(/\/+$/, "");
  return trimmed.slice(trimmed.lastIndexOf("/") + 1) || "/";
}

export function dirname(abs: string): string {
  const i = abs.lastIndexOf("/");
  return i <= 0 ? "/" : abs.slice(0, i);
}

/** Path for the prompt and window title: the home directory becomes "~". */
export function displayPath(abs: string): string {
  if (abs === HOME) return "~";
  return abs.startsWith(HOME + "/") ? "~" + abs.slice(HOME.length) : abs;
}

/** Permission check for the simulated user (dana is not in root's group). */
export function can(node: FsNode, perm: "r" | "w" | "x"): boolean {
  const bits = node.owner === USER ? node.mode >> 6 : node.mode & 7;
  return (bits & { r: 4, w: 2, x: 1 }[perm]) !== 0;
}

function dir(owner: Owner, mtime: number, mode = 0o755): DirNode {
  return { type: "dir", children: new Map(), mode, owner, mtime };
}

function file(owner: Owner, mtime: number, content: string): FileNode {
  return { type: "file", content, mode: 0o644, owner, mtime };
}

function fill(target: DirNode, tree: Tree, owner: Owner, mtime: number) {
  for (const [name, value] of Object.entries(tree)) {
    if (typeof value === "string") target.children.set(name, file(owner, mtime, value));
    else {
      const child = dir(owner, mtime);
      fill(child, value, owner, mtime);
      target.children.set(name, child);
    }
  }
}

export class VirtualFs {
  readonly root: DirNode;

  constructor(
    home: Tree = defaultHome,
    readonly now: () => number = Date.now,
  ) {
    // The starting files get SEED_TIME, resolved to the clock on first use (see timeOf). Reading the clock here
    // would run during server prerender, which Next.js forbids for Date.now() in Client Components.
    const t = SEED_TIME;
    this.root = dir("root", t);
    for (const name of SYSTEM_DIRS) this.root.children.set(name, dir("root", t));
    const sys = (path: string) => this.get(path) as DirNode;
    sys("/root").mode = 0o700;
    sys("/tmp").mode = 0o777;
    fill(sys("/etc"), { hostname: `${HOST}\n`, "os-release": 'PRETTY_NAME="Ubuntu 24.04 LTS"\nNAME="Ubuntu"\nVERSION_ID="24.04"\n' }, "root", t);
    sys("/dev").children.set("null", { ...file("root", t, ""), mode: 0o666 });
    const homeDir = dir("root", t);
    this.root.children.set("home", homeDir);
    const userHome = dir(USER, t);
    fill(userHome, home, USER, t);
    homeDir.children.set(USER, userHome);
  }

  private seedTime: number | null = null;

  /** A node's modification time; the starting files count as created when the simulator is first used. */
  timeOf(node: FsNode): number {
    if (node.mtime !== SEED_TIME) return node.mtime;
    this.seedTime ??= this.now();
    return this.seedTime;
  }

  /** Walks an absolute path. Every directory on the way must be searchable (x), like the real kernel. */
  lookup(abs: string): Lookup {
    let node: FsNode = this.root;
    for (const seg of abs.split("/").filter(Boolean)) {
      if (node.type !== "dir") return { error: "ENOTDIR" };
      if (!can(node, "x")) return { error: "EACCES" };
      const next: FsNode | undefined = node.children.get(seg);
      if (!next) return { error: "ENOENT" };
      node = next;
    }
    return { node };
  }

  get(abs: string): FsNode | undefined {
    return this.lookup(abs).node;
  }

  /** The directory that would hold `abs`, or why it can't. */
  parent(abs: string): { dir: DirNode; name: string; error?: undefined } | { error: FsError } {
    const found = this.lookup(dirname(abs));
    if (found.error) return { error: found.error };
    if (found.node.type !== "dir") return { error: "ENOTDIR" };
    return { dir: found.node, name: basename(abs) };
  }

  /** Creates a directory; the caller has already checked that the parent is writable. */
  mkdir(parent: DirNode, name: string): DirNode {
    const created = dir(USER, this.now());
    parent.children.set(name, created);
    parent.mtime = created.mtime;
    return created;
  }

  writeFile(parent: DirNode, name: string, content: string, append = false) {
    const existing = parent.children.get(name);
    const t = this.now();
    if (existing?.type === "file") {
      existing.content = append ? existing.content + content : content;
      existing.mtime = t;
      return;
    }
    parent.children.set(name, file(USER, t, content));
    parent.mtime = t;
  }

  remove(parent: DirNode, name: string) {
    parent.children.delete(name);
    parent.mtime = this.now();
  }

  /** A deep copy owned by the simulated user, with fresh timestamps (like cp without -p). */
  clone(node: FsNode): FsNode {
    const t = this.now();
    if (node.type === "file") return { ...file(USER, t, node.content), mode: node.mode };
    const copy = dir(USER, t, node.mode);
    for (const [name, child] of node.children) copy.children.set(name, this.clone(child));
    return copy;
  }

  /** Sorted names in a directory, in C locale order (uppercase first), like `ls` with LANG=C.UTF-8. */
  static names(d: DirNode): string[] {
    return [...d.children.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  }
}
