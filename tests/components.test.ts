import { describe, expect, it } from "vitest";
import { parseChecked } from "@/components/mdx/checklist";
import { tabKeyTarget } from "@/components/mdx/distro-tabs";

describe("tabKeyTarget", () => {
  it("moves with arrows in reading direction and wraps", () => {
    expect(tabKeyTarget("ArrowRight", 0, 3, false)).toBe(1);
    expect(tabKeyTarget("ArrowLeft", 0, 3, false)).toBe(2);
    // In RTL, ArrowLeft goes to the next tab.
    expect(tabKeyTarget("ArrowLeft", 0, 3, true)).toBe(1);
    expect(tabKeyTarget("ArrowRight", 0, 3, true)).toBe(2);
  });

  it("supports Home/End and ignores other keys", () => {
    expect(tabKeyTarget("Home", 2, 3, true)).toBe(0);
    expect(tabKeyTarget("End", 0, 3, true)).toBe(2);
    expect(tabKeyTarget("Enter", 0, 3, true)).toBeNull();
  });
});

describe("parseChecked", () => {
  it("restores a saved state of the right length", () => {
    expect(parseChecked("[true,false,true]", 3)).toEqual([true, false, true]);
  });

  it("resets on missing, malformed or outdated data", () => {
    expect(parseChecked(null, 2)).toEqual([false, false]);
    expect(parseChecked("not json", 2)).toEqual([false, false]);
    expect(parseChecked("[true]", 2)).toEqual([false, false]);
    expect(parseChecked('["yes","no"]', 2)).toEqual([false, false]);
  });
});
