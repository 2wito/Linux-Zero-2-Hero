// The landing page's typed terminal demo: real commands a beginner runs in their first minute.
// Each command line records the directory it runs in, so the prompt shows the path changing after `cd`.

export type HeroLine = { kind: "cmd"; cwd: string; text: string } | { kind: "out"; text: string };

export function heroScript(welcome: string): HeroLine[] {
  return [
    { kind: "cmd", cwd: "~", text: "whoami" },
    { kind: "out", text: "you" },
    { kind: "cmd", cwd: "~", text: "pwd" },
    { kind: "out", text: "/home/you" },
    { kind: "cmd", cwd: "~", text: "ls" },
    { kind: "out", text: "Documents  projects  welcome.txt" },
    { kind: "cmd", cwd: "~", text: "cat welcome.txt" },
    { kind: "out", text: welcome },
    { kind: "cmd", cwd: "~", text: "cd projects" },
    { kind: "cmd", cwd: "~/projects", text: "mkdir hello" },
  ];
}

/** The directory shown on the final, empty prompt (where the last command left you). */
export const finalCwd = (script: HeroLine[]) => {
  const last = [...script].reverse().find((l) => l.kind === "cmd");
  if (!last || last.kind !== "cmd") return "~";
  const cd = last.text.match(/^cd\s+(\S+)/);
  return cd ? `${last.cwd}/${cd[1]}` : last.cwd;
};
