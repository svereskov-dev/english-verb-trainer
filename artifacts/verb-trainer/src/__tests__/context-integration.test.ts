import { describe, expect, it } from "vitest";
import {
  contextExerciseIndex,
  unavailableContextExercises,
} from "../data/contextExercises";
import { verbs } from "../data/verbs";
import {
  exerciseFromMistakeId,
  generateContextExerciseFor,
  generateExerciseFromConfig,
  isRuntimeSafeExercise,
  restorePersistedExercise,
  type SessionConfig,
} from "../engine/exercises";

function verb(infinitive: string) {
  const match = verbs.find((candidate) => candidate.infinitive === infinitive);
  if (!match) throw new Error(`Missing test verb: ${infinitive}`);
  return match;
}

describe("curated Context runtime integration", () => {
  it("returns the exact curated sentence and answer for a regular verb and tense", () => {
    const record = contextExerciseIndex.get("make")?.get("presentSimple")?.[0];
    expect(record).toBeDefined();

    const exercise = generateContextExerciseFor(verb("make"), "presentSimple");

    expect(exercise.type).toBe("gapfill");
    expect(exercise.question.curatedExerciseId).toBe(record!.id);
    expect(exercise.question.template).toBe(record!.sentence);
    expect(exercise.answer).toBe(record!.expectedAnswer);
    expect(exercise.question.practiceTarget).toBe("presentSimple");
  });

  it("falls back to the same non-context verb and tense for notRecommended", () => {
    expect(
      unavailableContextExercises.some(
        (record) =>
          record.verb === "be" &&
          record.practiceTargets.includes("pastPerfectContinuous"),
      ),
    ).toBe(true);

    const exercise = generateContextExerciseFor(
      verb("be"),
      "pastPerfectContinuous",
    );

    expect(exercise.type).toBe("verbform");
    expect(exercise.question.verb).toBe("be");
    expect(exercise.question.tense).toBe("pastPerfectContinuous");
    expect(exercise.id.startsWith("gapfill:")).toBe(false);
    expect(exercise.question.template).toBeUndefined();
  });

  it("uses an explicitly tagged irregular Past Simple record in V2 mode", () => {
    const exercise = generateContextExerciseFor(verb("go"), "v2");

    expect(exercise.type).toBe("gapfill");
    expect(exercise.question.practiceTarget).toBe("v2");
    expect(exercise.question.tense).toBe("pastSimple");
    expect(
      contextExerciseIndex
        .get("go")
        ?.get("v2")
        ?.some((record) => record.id === exercise.question.curatedExerciseId),
    ).toBe(true);
  });

  it("uses only explicitly tagged Perfect Simple records in V3 mode", () => {
    const exercise = generateContextExerciseFor(verb("go"), "v3");

    expect(exercise.type).toBe("gapfill");
    expect(exercise.question.practiceTarget).toBe("v3");
    expect(["presentPerfect", "pastPerfect", "futurePerfect"]).toContain(
      exercise.question.tense,
    );
    expect(
      contextExerciseIndex
        .get("go")
        ?.get("v3")
        ?.some((record) => record.id === exercise.question.curatedExerciseId),
    ).toBe(true);
  });

  it("never admits Perfect Continuous records to V3 through the auxiliary been", () => {
    const v3Records = [...contextExerciseIndex.values()]
      .flatMap((targets) => [...(targets.get("v3") ?? [])]);

    expect(v3Records.length).toBeGreaterThan(0);
    expect(
      v3Records.some((record) => record.tense.endsWith("PerfectContinuous")),
    ).toBe(false);
  });

  it.each(["v2", "v3"] as const)(
    "builds %s Context exercises only from explicitly tagged records",
    (target) => {
      const exercise = generateContextExerciseFor(verb("take"), target);

      expect(exercise.type).toBe("gapfill");
      expect(exercise.question.practiceTarget).toBe(target);
      expect(
        contextExerciseIndex
          .get(exercise.question.verb)
          ?.get(target)
          ?.some(
            (record) => record.id === exercise.question.curatedExerciseId,
          ),
      ).toBe(true);
    },
  );

  it("restores the same curated ID, sentence, answer, and target for review", () => {
    const original = generateContextExerciseFor(verb("take"), "v2");
    const restored = exerciseFromMistakeId(original.id);

    expect(restored).toEqual(original);
    expect(restored?.question.curatedExerciseId)
      .toBe(original.question.curatedExerciseId);
    expect(restored?.question.template).toBe(original.question.template);
    expect(restored?.answer).toBe(original.answer);
    expect(restored?.question.practiceTarget)
      .toBe(original.question.practiceTarget);
  });

  it("rehydrates curated persistence and migrates legacy Context without its sentence", () => {
    const curated = generateContextExerciseFor(verb("make"), "presentSimple");
    const legacy = {
      ...curated,
      id: "gapfill:v2:legacy-template:make:presentSimple:she",
    };

    expect(isRuntimeSafeExercise(curated)).toBe(true);
    expect(isRuntimeSafeExercise(legacy)).toBe(true);
    expect(restorePersistedExercise(legacy)?.type).toBe("verbform");
    expect(restorePersistedExercise(legacy)?.question.template).toBeUndefined();
  });

  it("rehydrates persisted Context content from the active record instead of trusting it", () => {
    const curated = generateContextExerciseFor(verb("make"), "presentSimple");
    const forged = {
      ...curated,
      question: {
        ...curated.question,
        template: "Forged _____ sentence.",
      },
      answer: "forged",
    };

    expect(restorePersistedExercise(forged)).toEqual(curated);
  });

  it("uses the ID, not a forged persisted type discriminator", () => {
    const curated = generateContextExerciseFor(verb("make"), "presentSimple");
    const forged = {
      ...curated,
      type: "verbform",
      question: { verb: "make", tense: "pastSimple", subject: "I" },
      answer: "forged",
    };

    expect(restorePersistedExercise(forged)).toEqual(curated);
  });

  it("rejects malformed, unknown, invalid-target, and inactive persistence", () => {
    const curated = generateContextExerciseFor(verb("make"), "presentSimple");
    const inactive = unavailableContextExercises.find(
      (record) => record.practiceTargets.length > 0,
    );
    expect(inactive).toBeDefined();
    const unknown = {
      ...curated,
      id: "gapfill:curated:missing_record:presentSimple",
    };
    const invalidTarget = {
      ...curated,
      id: `gapfill:curated:${curated.question.curatedExerciseId}:v3`,
    };

    expect(restorePersistedExercise(null)).toBeNull();
    expect(restorePersistedExercise({ type: "gapfill" })).toBeNull();
    expect(restorePersistedExercise(unknown)).toBeNull();
    expect(restorePersistedExercise(invalidTarget)).toBeNull();
    expect(
      restorePersistedExercise({
        ...curated,
        id: `gapfill:curated:${inactive!.id}:${inactive!.practiceTargets[0]}`,
      }),
    ).toBeNull();
  });
});