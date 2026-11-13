// Parses the text inside <TerminalWindow> into command and output lines.
// A line that starts with the prompt symbol followed by a space ("$ ls") is a command; everything else is output.

export type TermLine = { kind: "cmd"; text: string } | { kind: "out"; text: string };

/** Drops leading/trailing blank lines and the indentation shared by all non-empty lines (MDX template literals are often indented). */
export function dedent(src: string): string[] {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^[ \t]*/)![0].length));
  return lines.map((l) => l.slice(Number.isFinite(indent) ? indent : 0).trimEnd());
}

export function parseTerminal(src: string, prompt = "$"): TermLine[] {
  return dedent(src).map((line) => {
    if (line === prompt) return { kind: "cmd", text: "" };
    if (line.startsWith(prompt + " ")) return { kind: "cmd", text: line.slice(prompt.length + 1) };
    return { kind: "out", text: line };
  });
}

/** What the copy button copies: the commands only, one per line, never the output or prompts. */
export const commandsText = (lines: TermLine[]) =>
  lines
    .filter((l) => l.kind === "cmd" && l.text)
    .map((l) => l.text)
    .join("\n");
