import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Guards WCAG AA (4.5:1) for every text/background pair the design uses, in both themes.
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

function tokens(selector: string): Record<string, string> {
  const body = css.split(`${selector} {`)[1].split("}")[0];
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const pairs: [string, string][] = [
  ...["ink", "muted", "accent", "ok", "info", "danger"].flatMap((fg) => ["bg", "surface", "surface-2"].map((bg): [string, string] => [fg, bg])),
  ["accent-ink", "accent"],
  ...["term-ink", "term-dim", "term-user", "term-path", "term-accent"].map((fg): [string, string] => [fg, "term"]),
];

describe.each([
  ["light", ".light"],
  ["dark", ".dark"],
])("%s theme contrast", (_name, selector) => {
  const t = tokens(selector);
  it.each(pairs)("%s on %s is at least 4.5:1", (fg, bg) => {
    expect(t[fg], `missing --${fg}`).toBeDefined();
    expect(t[bg], `missing --${bg}`).toBeDefined();
    expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
  });
});
