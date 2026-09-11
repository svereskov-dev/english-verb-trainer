import { describe, expect, it } from "vitest";
import { verbs } from "../data/verbs";
import { conjugate, getIngForm } from "../engine/conjugate";

function verb(infinitive: string) {
  const match = verbs.find((candidate) => candidate.infinitive === infinitive);
  if (!match) throw new Error(`Missing test verb: ${infinitive}`);
  return match;
}

describe("-ing form generation", () => {
  it.each([
    ["quit", "quitting"],
    ["travel", "traveling"],
    ["disagree", "disagreeing"],
    ["agree", "agreeing"],
    ["see", "seeing"],
    ["make", "making"],
  ])("forms %s as %s", (infinitive, expected) => {
    expect(getIngForm(infinitive)).toBe(expected);
  });
});

describe("continuous conjugation spelling", () => {
  it("uses quitting in a full tense form", () => {
    expect(conjugate(verb("quit"), "presentContinuous", "he/she/it"))
      .toBe("is quitting");
  });

  it("uses American traveling in a full tense form", () => {
    expect(conjugate(verb("travel"), "futurePerfectContinuous", "they"))
      .toBe("will have been traveling");
  });

  it("uses disagreeing in a full tense form", () => {
    expect(conjugate(verb("disagree"), "pastContinuous", "they"))
      .toBe("were disagreeing");
  });
});