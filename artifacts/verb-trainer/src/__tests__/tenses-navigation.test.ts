import { describe, expect, it } from "vitest";
import { wrapIndex } from "../lib/circularNavigation";

describe("English Tenses circular navigation", () => {
  it("wraps forward from Future back to Past", () => {
    expect(wrapIndex(3, 3)).toBe(0);
  });

  it("wraps backward from Past back to Future", () => {
    expect(wrapIndex(-1, 3)).toBe(2);
  });

  it("keeps direct Past, Present, and Future tab indexes unchanged", () => {
    expect([0, 1, 2].map(index => wrapIndex(index, 3))).toEqual([0, 1, 2]);
  });

  it("continues wrapping across multiple carousel cycles", () => {
    expect(wrapIndex(4, 3)).toBe(1);
    expect(wrapIndex(-4, 3)).toBe(2);
  });
});