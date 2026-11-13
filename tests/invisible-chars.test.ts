import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Invisible characters (bidi marks/overrides, zero-width chars, non-breaking spaces, BOM) silently change how
// Hebrew/English text renders and are impossible to spot in review. Use bidi-isolating markup (<bdi>, dir="auto",
// <En>, inline code) or a named constant instead.
const roots = ["app", "components", "lib", "content", "mdx-components.tsx"];
const invisible = /[ ​-‏‪-‮⁦-⁩﻿]/g;

function files(path: string): string[] {
  if (statSync(path).isFile()) return /\.(tsx?|css|mdx?)$/.test(path) ? [path] : [];
  return readdirSync(path).flatMap((name) => files(join(path, name)));
}

describe("no invisible characters in source", () => {
  it.each(roots.flatMap((root) => files(root)))("%s", (file) => {
    const hits = readFileSync(file, "utf8")
      .split("\n")
      .flatMap((line, i) =>
        [...line.matchAll(invisible)].map((m) => `${i + 1}:${m.index + 1} U+${m[0].codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`),
      );
    expect(hits).toEqual([]);
  });
});
