import { describe, expect, it } from "vitest";
import { commandsText, dedent, parseTerminal } from "@/lib/terminal";

describe("parseTerminal", () => {
  const src = `
    $ pwd
    /home/dana
    $ echo "שלום"
    שלום

    $
  `;

  it("dedents and trims blank edges but keeps inner blank lines", () => {
    expect(dedent(src)).toEqual(["$ pwd", "/home/dana", '$ echo "שלום"', "שלום", "", "$"]);
  });

  it("splits commands from output", () => {
    expect(parseTerminal(src)).toEqual([
      { kind: "cmd", text: "pwd" },
      { kind: "out", text: "/home/dana" },
      { kind: "cmd", text: 'echo "שלום"' },
      { kind: "out", text: "שלום" },
      { kind: "out", text: "" },
      { kind: "cmd", text: "" },
    ]);
  });

  it("treats $ without a following space as output (e.g. $HOME)", () => {
    expect(parseTerminal("$HOME")).toEqual([{ kind: "out", text: "$HOME" }]);
  });

  it("supports a custom prompt such as # for root", () => {
    expect(parseTerminal("# apt update\n$ not a command", "#")).toEqual([
      { kind: "cmd", text: "apt update" },
      { kind: "out", text: "$ not a command" },
    ]);
  });

  it("copies only non-empty commands", () => {
    expect(commandsText(parseTerminal(src))).toBe('pwd\necho "שלום"');
  });
});
