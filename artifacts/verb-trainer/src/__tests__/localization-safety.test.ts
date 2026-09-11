import { describe, expect, it } from "vitest";
import { getTenseLabel, Tense } from "../data/grammar";
import {
  SessionConfig,
  toPersistedSessionConfig,
} from "../engine/exercises";
import { configsMatch } from "../hooks/useExerciseSession";

const TENSE_LABELS: Array<[Tense, string]> = [
  ["presentSimple", "Present Simple"],
  ["presentContinuous", "Present Continuous"],
  ["presentPerfect", "Present Perfect"],
  ["presentPerfectContinuous", "Present Perfect Continuous"],
  ["pastSimple", "Past Simple"],
  ["pastContinuous", "Past Continuous"],
  ["pastPerfect", "Past Perfect"],
  ["pastPerfectContinuous", "Past Perfect Continuous"],
  ["futureSimple", "Future Simple"],
  ["futureContinuous", "Future Continuous"],
  ["futurePerfect", "Future Perfect"],
  ["futurePerfectContinuous", "Future Perfect Continuous"],
  ["presentSimplePassive", "Present Simple Passive"],
  ["pastSimplePassive", "Past Simple Passive"],
  ["presentPerfectPassive", "Present Perfect Passive"],
  ["pastPerfectPassive", "Past Perfect Passive"],
  ["futureSimplePassive", "Future Simple Passive"],
];

const SESSION_CONFIG: SessionConfig = {
  id: "past-mixed",
  label: "Mixed",
  groupLabel: "Past Tenses",
  selectedIds: ["past-mixed"],
  exerciseTypes: ["verbform"],
  verbPool: "all",
  tenses: ["pastSimple", "pastContinuous", "pastPerfect", "pastPerfectContinuous"],
  contextEnabled: false,
  letterBuilderEnabled: true,
};

describe("localization safety", () => {
  it.each(TENSE_LABELS)("resolves %s through the shared tense label source", (id, label) => {
    expect(getTenseLabel(id)).toBe(label);
  });

  it("persists semantic session fields without presentation labels", () => {
    const persisted = toPersistedSessionConfig(SESSION_CONFIG);

    expect(persisted).not.toHaveProperty("label");
    expect(persisted).not.toHaveProperty("groupLabel");
    expect(persisted).toMatchObject({
      id: "past-mixed",
      selectedIds: ["past-mixed"],
      tenses: ["pastSimple", "pastContinuous", "pastPerfect", "pastPerfectContinuous"],
      contextEnabled: false,
    });
  });

  it("restores the same semantic session even when display labels differ", () => {
    expect(
      configsMatch(SESSION_CONFIG, {
        ...SESSION_CONFIG,
        label: "Mixto",
        groupLabel: "Pasado",
      }),
    ).toBe(true);
  });
});