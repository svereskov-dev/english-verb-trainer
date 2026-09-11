import { describe, expect, it } from "vitest";
import { isDailyGoalReached } from "../lib/dailyProgress";

describe("daily progress completion", () => {
  it.each([
    [0, 10, false],
    [9, 10, false],
    [10, 10, true],
    [12, 10, true],
  ])("returns %s for %s / %s", (completed, goal, expected) => {
    expect(isDailyGoalReached(completed, goal)).toBe(expected);
  });
});