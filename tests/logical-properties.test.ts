import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// RTL rule: layout uses logical utilities (ms/me, ps/pe, start/end, text-start/end, border-s/e, rounded-s/e).
// Physical left/right utilities would break mirroring between Hebrew and English.
const roots = ["app", "components", "lib", "mdx-components.tsx"];
const forbidden =
  /(?<![\w-])(?:-?(?:ml|mr|pl|pr|left|right|border-l|border-r|rounded-l|rounded-r|rounded-tl|rounded-tr|rounded-bl|rounded-br|scroll-ml|scroll-mr|scroll-pl|scroll-pr)-[\w./[\]-]+|text-left|text-right|float-left|float-right|clear-left|clear-right)(?![\w-])/g;

function files(path: string): string[] {
  if (statSync(path).isFile()) return /\.(tsx?|css)$/.test(path) ? [path] : [];
  return readdirSync(path).flatMap((name) => files(join(path, name)));
}

describe("logical properties only", () => {
  const all = roots.flatMap((root) => files(root));

  it.each(all)("%s has no physical left/right utilities", (file) => {
    const hits = readFileSync(file, "utf8")
      .split("\n")
      .flatMap((line, i) => [...line.matchAll(forbidden)].map((m) => `${i + 1}: ${m[0]}`));
    expect(hits).toEqual([]);
  });
});
