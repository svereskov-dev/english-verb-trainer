import { describe, expect, it, vi } from "vitest";
import {
  generateExerciseFromConfig,
  pick,
  type SessionConfig,
} from "../engine/exercises";

const NEW_VERB_CONFIG: SessionConfig = {
  id: "randomization-audit",
  label: "Randomization audit",
  groupLabel: "Audit",
  selectedIds: ["randomization-audit"],
  exerciseTypes: ["verbform"],
  verbPool: "all",
  tenses: ["presentSimple"],
  contextEnabled: false,
};

function generateVerbSequence(randomValues: number[], count: number): string[] {
  let call = 0;
  const random = () => randomValues[call++ % randomValues.length];
  const randomSpy = vi.spyOn(Math, "random").mockImplementation(random);

  try {
    return Array.from({ length: count }, () =>
      generateExerciseFromConfig(NEW_VERB_CONFIG, "beginner", "verbform").question.verb
    );
  } finally {
    randomSpy.mockRestore();
  }
}

describe("verb selection randomization", () => {
  it("can select a later equally eligible candidate instead of the first array item", () => {
    expect(pick(["first", "later"], () => 0.99)).toBe("later");
  });

  it("produces different independent sequences from the same new-verb pool", () => {
    const firstSequence = generateVerbSequence(
      [0.01, 0.2, 0.4, 0.12, 0.2, 0.4, 0.24, 0.2, 0.4, 0.36, 0.2, 0.4],
      4,
    );
    const secondSequence = generateVerbSequence(
      [0.91, 0.2, 0.4, 0.77, 0.2, 0.4, 0.63, 0.2, 0.4, 0.48, 0.2, 0.4],
      4,
    );

    expect(secondSequence).not.toEqual(firstSequence);
  });
});