import { describe, expect, it } from "vitest";
import {
  ExerciseItem,
  SessionConfig,
  exerciseFromMistakeId,
} from "../engine/exercises";
import {
  canRestorePendingReviewQueue,
  createExactReviewConfig,
  createReviewQueue,
  getActiveMistakeRecords,
  removeCurrentReviewItem,
  rotateCurrentReviewItem,
} from "../engine/reviewQueue";
import type { ProgressRecord } from "../engine/srs";

function makeConfig(overrides: Partial<SessionConfig> = {}): SessionConfig {
  return {
    id: "full-all",
    label: "All Tenses",
    groupLabel: "Full Conjugation",
    selectedIds: ["full-all"],
    exerciseTypes: ["verbform"],
    verbPool: "all",
    contextEnabled: false,
    ...overrides,
  };
}

function makeRecord(id: string, lastFailureDate: number): ProgressRecord {
  return {
    id,
    type: "verbform",
    verbInfinitive: "go",
    easeFactor: 2.5,
    interval: 1,
    dueDate: 0,
    successCount: 0,
    failureCount: 1,
    lastReviewDate: 0,
    lastFailureDate,
  };
}

function generatedGapFill(): ExerciseItem {
  const exercise = exerciseFromMistakeId(
    "gapfill:curated:go_pastSimple_01:v2",
  );
  if (!exercise) throw new Error("Expected known curated Context exercise");
  return exercise;
}

describe("Review Mistakes queue", () => {
  it("uses the active failure marker, not historical failureCount", () => {
    const active = makeRecord("verbform:go:pastSimple:I", 123);
    const solved = { ...makeRecord("verbform:go:presentSimple:I", 456), lastFailureDate: 0 };

    expect(getActiveMistakeRecords([active, solved])).toEqual([active]);
  });

  it("removes a correct current item immediately and never re-adds it", () => {
    const queue = createReviewQueue(["first", "second", "first"]);
    const afterCorrect = removeCurrentReviewItem(queue);

    expect(queue).toEqual(["first", "second"]);
    expect(afterCorrect).toEqual(["second"]);
    expect(afterCorrect).not.toContain("first");
  });

  it("keeps skipped items unresolved while finishing the one-pass queue", () => {
    const skipped = makeRecord("verbform:go:pastSimple:I", 123);
    const queue = ["skip-me", "continue"];

    expect(removeCurrentReviewItem(queue)).toEqual(["continue"]);
    expect(getActiveMistakeRecords([skipped])).toEqual([skipped]);
  });

  it("rotates incorrect answers without creating duplicate queue items", () => {
    expect(rotateCurrentReviewItem(["first", "second", "third"])).toEqual([
      "second",
      "third",
      "first",
    ]);
    expect(rotateCurrentReviewItem(["only"])).toEqual(["only"]);
  });

  it("restores a saved unfinished queue only when every pending ID is still active", () => {
    expect(canRestorePendingReviewQueue(["second"], ["second", "skipped"])).toBe(true);
    expect(canRestorePendingReviewQueue(["resolved"], ["second", "skipped"])).toBe(false);
    expect(canRestorePendingReviewQueue([], ["second"])).toBe(false);
  });
});

describe("Review Mistakes identity", () => {
  it("keeps different forms of the same verb as separate review IDs", () => {
    const ids = [
      "verbform:go:pastSimple:I",
      "verbform:go:presentSimple:I",
      "irregular:go:past",
      "irregular:go:pastParticiple",
    ];

    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach(id => expect(exerciseFromMistakeId(id)?.id).toBe(id));
  });

  it("reconstructs a v2 context exercise exactly, including its rendered subject", () => {
    const generated = generatedGapFill();
    expect(generated.type).toBe("gapfill");

    const restored = exerciseFromMistakeId(generated.id);
    expect(restored).toEqual(generated);
    expect(generated.id).toBe(
      `gapfill:curated:${generated.question.curatedExerciseId}:${generated.question.practiceTarget}`,
    );
  });

  it("rejects a changed practice target instead of reconstructing another sentence", () => {
    const generated = generatedGapFill();
    const alternateTarget = "presentPerfect";
    const alteredId =
      `gapfill:curated:${generated.question.curatedExerciseId}:${alternateTarget}`;

    expect(exerciseFromMistakeId(alteredId)).toBeNull();
  });

  it("migrates legacy context IDs to non-context review without restoring templates", () => {
    const legacyId = "gapfill:v2:legacy-template:go:pastSimple:she";
    const restored = exerciseFromMistakeId(legacyId);

    expect(restored?.id).toBe(legacyId);
    expect(restored?.type).toBe("verbform");
    expect(restored?.question).toEqual({
      verb: "go",
      tense: "pastSimple",
      subject: "he/she/it",
    });
    expect(restored?.question.template).toBeUndefined();
  });

  it("uses the same exact-ID config for Mistakes and Training Mode entry points", () => {
    const ids = ["verbform:go:pastSimple:I", "irregular:go:past"];
    const fromMistakes = createExactReviewConfig(ids, false);
    const fromTraining = createExactReviewConfig(ids, false);

    expect(fromMistakes).toEqual(fromTraining);
    expect(fromMistakes.reviewMistakeIds).toEqual(ids);
    expect("reviewVerbs" in fromMistakes).toBe(false);
  });

  it("keeps a review identity unchanged for keyboard and Letter Builder input", () => {
    const exercise = exerciseFromMistakeId("verbform:go:pastSimple:I");
    const keyboard = createExactReviewConfig([exercise!.id], false);
    const letterBuilder = createExactReviewConfig([exercise!.id], true);

    expect(keyboard.reviewMistakeIds).toEqual(letterBuilder.reviewMistakeIds);
    expect(exerciseFromMistakeId(keyboard.reviewMistakeIds![0])).toEqual(exercise);
  });
});