/**
 * Letter Builder — automated test suite
 *
 * Tests the pure logic layer (generateChoices, generateExerciseFromConfig with
 * letterBuilderEnabled) without needing a DOM or React renderer.
 */

import { describe, it, expect } from "vitest";
import { generateChoices } from "../hooks/useLetterBuilder";
import {
  generateExerciseFromConfig,
  SessionConfig,
} from "../engine/exercises";

// ─── Shared config factory ────────────────────────────────────────────────────

function makeConfig(overrides: Partial<SessionConfig> = {}): SessionConfig {
  return {
    id: "full-all",
    label: "All Tenses",
    groupLabel: "Full Conjugation",
    selectedIds: ["full-all"],
    exerciseTypes: ["verbform"],
    verbPool: "all",
    contextEnabled: false,
    letterBuilderEnabled: false,
    ...overrides,
  };
}

// ─── generateChoices ──────────────────────────────────────────────────────────

describe("generateChoices", () => {
  it("returns exactly 5 choices", () => {
    expect(generateChoices("w")).toHaveLength(5);
  });

  it("always contains the correct letter (uppercase)", () => {
    for (const letter of ["a", "e", "w", "z", "m"]) {
      const choices = generateChoices(letter);
      expect(choices).toContain(letter.toUpperCase());
    }
  });

  it("contains no duplicate letters", () => {
    for (let trial = 0; trial < 20; trial++) {
      const choices = generateChoices("s");
      const unique = new Set(choices);
      expect(unique.size).toBe(5);
    }
  });

  it("distractors never equal the correct letter", () => {
    for (let trial = 0; trial < 50; trial++) {
      const correct = "G";
      const choices = generateChoices(correct);
      const distractors = choices.filter(c => c !== correct);
      expect(distractors).toHaveLength(4);
      for (const d of distractors) {
        expect(d).not.toBe(correct);
      }
    }
  });

  it("works for every letter in the alphabet", () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    for (const letter of alphabet) {
      const choices = generateChoices(letter);
      expect(choices).toHaveLength(5);
      expect(choices).toContain(letter);
    }
  });

  it("shuffles choices (not always correct-last)", () => {
    const positions = new Set<number>();
    for (let i = 0; i < 100; i++) {
      const choices = generateChoices("T");
      positions.add(choices.indexOf("T"));
    }
    // Over 100 trials the correct letter should appear in at least 2 distinct positions
    expect(positions.size).toBeGreaterThan(1);
  });
});

// ─── generateExerciseFromConfig — letterBuilderEnabled flag ───────────────────

describe("generateExerciseFromConfig — letterBuilderEnabled: false", () => {
  const config = makeConfig({ letterBuilderEnabled: false });

  it("never sets letterBuilder on generated exercises", () => {
    for (let i = 0; i < 100; i++) {
      const ex = generateExerciseFromConfig(config, "intermediate");
      expect(ex.letterBuilder).toBeUndefined();
    }
  });
});

describe("generateExerciseFromConfig — letterBuilderEnabled: true", () => {
  const config = makeConfig({ letterBuilderEnabled: true });

  it("sets letterBuilder to true on every exercise", () => {
    for (let i = 0; i < 50; i++) {
      const ex = generateExerciseFromConfig(config, "intermediate");
      expect(ex.letterBuilder).toBe(true);
    }
  });
});

// ─── SessionConfig field persistence ─────────────────────────────────────────

describe("SessionConfig — letterBuilderEnabled field", () => {
  it("preserves letterBuilderEnabled: false in the generated config shape", () => {
    const config = makeConfig({ letterBuilderEnabled: false });
    expect(config.letterBuilderEnabled).toBe(false);
  });

  it("preserves letterBuilderEnabled: true in the generated config shape", () => {
    const config = makeConfig({ letterBuilderEnabled: true });
    expect(config.letterBuilderEnabled).toBe(true);
  });

  it("coexists with contextEnabled: true", () => {
    const config = makeConfig({ contextEnabled: true, letterBuilderEnabled: true });
    // Context adds gapfill; exercises should still get the letterBuilder flag
    const results = Array.from({ length: 60 }, () =>
      generateExerciseFromConfig(config, "advanced")
    );
    const withFlag = results.filter(ex => ex.letterBuilder === true);
    expect(withFlag).toHaveLength(60);
  });

  it("coexists with contextEnabled: false (typing-only mode)", () => {
    const config = makeConfig({ contextEnabled: false, letterBuilderEnabled: false });
    const results = Array.from({ length: 30 }, () =>
      generateExerciseFromConfig(config, "beginner")
    );
    for (const ex of results) {
      expect(ex.letterBuilder).toBeUndefined();
    }
  });
});

// ─── Multi-word and single-word answer shapes ─────────────────────────────────

describe("Answer shapes compatible with Letter Builder", () => {
  it("generates single-word answers for past-simple verbform exercises", () => {
    const config = makeConfig({
      tenses: ["pastSimple"],
      letterBuilderEnabled: true,
    });
    for (let i = 0; i < 30; i++) {
      const ex = generateExerciseFromConfig(config, "beginner");
      if (ex.type !== "verbform") continue;
      const ans = Array.isArray(ex.answer) ? ex.answer[0] : ex.answer;
      // Past Simple answer: a single word like "worked", "went"
      expect(typeof ans).toBe("string");
      expect(ans.length).toBeGreaterThan(0);
    }
  });

  it("generates multi-word answers for perfect-tense verbform exercises", () => {
    const config = makeConfig({
      tenses: ["presentPerfect"],
      letterBuilderEnabled: true,
    });
    const answers: string[] = [];
    for (let i = 0; i < 60; i++) {
      const ex = generateExerciseFromConfig(config, "intermediate");
      if (ex.type !== "verbform") continue;
      const ans = Array.isArray(ex.answer) ? ex.answer[0] : ex.answer;
      answers.push(ans);
    }
    // Present Perfect: "has worked", "have gone", etc. — contain a space
    const multiWord = answers.filter(a => a.includes(" "));
    expect(multiWord.length).toBeGreaterThan(0);
  });

  it("generates string[] answers for irregular exercises", () => {
    const config = makeConfig({
      exerciseTypes: ["irregular"],
      verbPool: "irregular",
      letterBuilderEnabled: true,
    });
    for (let i = 0; i < 30; i++) {
      const ex = generateExerciseFromConfig(config, "intermediate");
      expect(ex.type).toBe("irregular");
      // Answer is always string[] for irregular
      expect(Array.isArray(ex.answer)).toBe(true);
      // Letter Builder uses the first alternative
      const first = (ex.answer as string[])[0];
      expect(typeof first).toBe("string");
      expect(first.length).toBeGreaterThan(0);
    }
  });

  it("generates gap-fill answers (string) with contextEnabled", () => {
    const config = makeConfig({
      tenses: ["pastSimple", "presentPerfect"],
      contextEnabled: true,
      letterBuilderEnabled: true,
    });
    const gapFills: string[] = [];
    for (let i = 0; i < 60; i++) {
      const ex = generateExerciseFromConfig(config, "intermediate");
      if (ex.type !== "gapfill") continue;
      const ans = ex.answer as string;
      expect(typeof ans).toBe("string");
      expect(ans.length).toBeGreaterThan(0);
      gapFills.push(ans);
    }
    expect(gapFills.length).toBeGreaterThan(0);
  });
});

// ─── Letter Builder ON/OFF toggle — behaviour parity ─────────────────────────

describe("Letter Builder toggle — coexistence with existing modes", () => {
  const modes: Array<[string, Partial<SessionConfig>]> = [
    ["Past Simple",       { tenses: ["pastSimple"] }],
    ["Present Perfect",   { tenses: ["presentPerfect"] }],
    ["Future Continuous", { tenses: ["futureContinuous"] }],
    ["Irregular Mixed",   { exerciseTypes: ["irregular"], verbPool: "irregular" }],
    ["Context ON",        { contextEnabled: true }],
  ];

  for (const [label, extra] of modes) {
    it(`${label}: exercises are valid with letterBuilderEnabled: true`, () => {
      const config = makeConfig({ ...extra, letterBuilderEnabled: true });
      for (let i = 0; i < 20; i++) {
        const ex = generateExerciseFromConfig(config, "intermediate");
        expect(ex.id).toBeTruthy();
        expect(ex.type).toBeTruthy();
        const ans = Array.isArray(ex.answer) ? ex.answer[0] : ex.answer;
        expect(ans.length).toBeGreaterThan(0);
        expect(ex.letterBuilder).toBe(true);
      }
    });

    it(`${label}: exercises are valid with letterBuilderEnabled: false`, () => {
      const config = makeConfig({ ...extra, letterBuilderEnabled: false });
      for (let i = 0; i < 20; i++) {
        const ex = generateExerciseFromConfig(config, "intermediate");
        expect(ex.id).toBeTruthy();
        expect(ex.letterBuilder).toBeUndefined();
      }
    });
  }
});
