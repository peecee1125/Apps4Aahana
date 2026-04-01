import { describe, it, expect } from "vitest";
import {
  shuffle,
  starsFromScore,
  trimHistory,
  MAX_HISTORY_ENTRIES,
} from "./registry.js";

describe("starsFromScore", () => {
  it("returns 3 stars at 90+", () => {
    expect(starsFromScore(90)).toBe(3);
    expect(starsFromScore(100)).toBe(3);
  });
  it("returns 2 stars from 70–89", () => {
    expect(starsFromScore(70)).toBe(2);
    expect(starsFromScore(89)).toBe(2);
  });
  it("returns 1 star below 70", () => {
    expect(starsFromScore(0)).toBe(1);
    expect(starsFromScore(69)).toBe(1);
  });
});

describe("shuffle", () => {
  it("preserves length and multiset of elements", () => {
    const input = ["a", "b", "c", "a"];
    const out = shuffle(input);
    expect(out).toHaveLength(4);
    expect([...out].sort()).toEqual([...input].sort());
    expect(input).toEqual(["a", "b", "c", "a"]);
  });
});

describe("trimHistory", () => {
  it("keeps the newest entries when over the cap", () => {
    const over = MAX_HISTORY_ENTRIES + 50;
    const arr = Array.from({ length: over }, (_, i) => ({ n: i }));
    const trimmed = trimHistory(arr);
    expect(trimmed).toHaveLength(MAX_HISTORY_ENTRIES);
    expect(trimmed[0].n).toBe(50);
    expect(trimmed.at(-1).n).toBe(over - 1);
  });
  it("returns the same array reference when under cap", () => {
    const small = [{ x: 1 }];
    expect(trimHistory(small)).toBe(small);
  });
});
