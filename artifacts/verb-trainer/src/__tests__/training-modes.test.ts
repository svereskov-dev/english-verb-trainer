/**
 * Automated regression suite — Training Mode
 *
 * Verifies that every preset in TrainingMenu generates only the expected
 * exercise tenses/types, that Context Mode adds correctly-constrained
 * gap-fill exercises, and that answer validation accepts/rejects correctly.
 *
 * Run:  pnpm --filter @workspace/verb-trainer test:training
 */

import { describe, it, expect } from "vitest";
import {
  generateExerciseFromConfig,
  SessionConfig,
  ExerciseItem,
} from "../engine/exercises";
import { isCorrect } from "../engine/validate";
import type { Tense } from "../data/grammar";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Exercises generated per mode — high enough to catch any tense that sneaks in. */
const N = 80;

/** All past tenses used in the Past Tenses group. */
const PAST: Tense[] = [
  "pastSimple",
  "pastContinuous",
  "pastPerfect",
  "pastPerfectContinuous",
];
/** All present tenses used in the Present Tenses group. */
const PRESENT: Tense[] = [
  "presentSimple",
  "presentContinuous",
  "presentPerfect",
  "presentPerfectContinuous",
];
/** All future tenses used in the Future Tenses group. */
const FUTURE: Tense[] = [
  "futureSimple",
  "futureContinuous",
  "futurePerfect",
  "futurePerfectContinuous",
];
/** Tenses used for V3 (Past Participle) context gap-fill. */
const PERFECT: Tense[] = ["presentPerfect", "pastPerfect", "futurePerfect"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeConfig(
  id: string,
  label: string,
  groupLabel: string,
  overrides: Partial<SessionConfig> = {},
): SessionConfig {
  return {
    id,
    label,
    groupLabel,
    selectedIds: [id],
    exerciseTypes: ["verbform"],
    verbPool: "all",
    contextEnabled: false,
    ...overrides,
  };
}

function generate(cfg: SessionConfig, count = N): ExerciseItem[] {
  return Array.from({ length: count }, () =>
    generateExerciseFromConfig(cfg, "advanced"),
  );
}

/**
 * Assert that every exercise in `items` uses a tense from `allowed`.
 * Returns the set of tenses actually seen (for completeness checks).
 */
function assertTenses(
  items: ExerciseItem[],
  allowed: Tense[],
  label: string,
): Set<Tense> {
  const seen = new Set<Tense>();
  for (const ex of items) {
    const tense: Tense = ex.question.tense;
    expect(
      allowed,
      `[${label}] Unexpected tense "${tense}" — not in allowed set [${allowed.join(", ")}]`,
    ).toContain(tense);
    seen.add(tense);
  }
  return seen;
}

/**
 * Assert that every tense in `required` appears at least once across `items`.
 * Used for mixed-mode completeness checks.
 */
function assertAllTensesAppear(
  seen: Set<Tense>,
  required: Tense[],
  label: string,
): void {
  for (const t of required) {
    expect(
      seen,
      `[${label}] Required tense "${t}" never appeared in ${N} exercises`,
    ).toContain(t);
  }
}

// ─── PAST TENSES ─────────────────────────────────────────────────────────────

describe("Past Tenses — Context OFF", () => {
  it("Past Simple: only pastSimple exercises", () => {
    const cfg = makeConfig("past-simple", "Past Simple", "Past Tenses", {
      tenses: ["pastSimple"],
    });
    const items = generate(cfg);
    items.forEach(ex => {
      expect(ex.type).toBe("verbform");
      expect(ex.question.tense).toBe("pastSimple");
    });
  });

  it("Past Continuous: only pastContinuous exercises", () => {
    const cfg = makeConfig("cont-past", "Past Continuous", "Past Tenses", {
      tenses: ["pastContinuous"],
    });
    generate(cfg).forEach(ex => {
      expect(ex.type).toBe("verbform");
      expect(ex.question.tense).toBe("pastContinuous");
    });
  });

  it("Past Perfect: only pastPerfect exercises", () => {
    const cfg = makeConfig("perf-past", "Past Perfect", "Past Tenses", {
      tenses: ["pastPerfect"],
    });
    generate(cfg).forEach(ex => {
      expect(ex.type).toBe("verbform");
      expect(ex.question.tense).toBe("pastPerfect");
    });
  });

  it("Past Perfect Continuous: only pastPerfectContinuous exercises", () => {
    const cfg = makeConfig("past-pc", "Past Perfect Continuous", "Past Tenses", {
      tenses: ["pastPerfectContinuous"],
    });
    generate(cfg).forEach(ex => {
      expect(ex.type).toBe("verbform");
      expect(ex.question.tense).toBe("pastPerfectContinuous");
    });
  });

  it("Past Mixed: only past tenses, all four appear", () => {
    const cfg = makeConfig("past-mixed", "Past Mixed", "Past Tenses", {
      tenses: PAST,
    });
    const items = generate(cfg);
    const seen = assertTenses(items, PAST, "Past Mixed");
    assertAllTensesAppear(seen, PAST, "Past Mixed");
    // Must never produce present or future
    items.forEach(ex =>
      expect([...PRESENT, ...FUTURE]).not.toContain(ex.question.tense),
    );
  });
});

describe("Past Tenses — Context ON", () => {
  it("Past Simple: verbform + gapfill, both pastSimple only", () => {
    const cfg = makeConfig("past-simple", "Past Simple", "Past Tenses", {
      tenses: ["pastSimple"],
      contextEnabled: true,
    });
    const items = generate(cfg);
    const gapfills = items.filter(e => e.type === "gapfill");
    expect(gapfills.length).toBeGreaterThan(0);
    items.forEach(ex => expect(ex.question.tense).toBe("pastSimple"));
  });

  it("Past Continuous: gapfill uses pastContinuous only", () => {
    const cfg = makeConfig("cont-past", "Past Continuous", "Past Tenses", {
      tenses: ["pastContinuous"],
      contextEnabled: true,
    });
    generate(cfg).forEach(ex =>
      expect(ex.question.tense).toBe("pastContinuous"),
    );
  });

  it("Past Perfect: gapfill uses pastPerfect only", () => {
    const cfg = makeConfig("perf-past", "Past Perfect", "Past Tenses", {
      tenses: ["pastPerfect"],
      contextEnabled: true,
    });
    generate(cfg).forEach(ex =>
      expect(ex.question.tense).toBe("pastPerfect"),
    );
  });

  it("Past Perfect Continuous: gapfill uses pastPerfectContinuous only", () => {
    const cfg = makeConfig("past-pc", "Past Perfect Continuous", "Past Tenses", {
      tenses: ["pastPerfectContinuous"],
      contextEnabled: true,
    });
    generate(cfg).forEach(ex =>
      expect(ex.question.tense).toBe("pastPerfectContinuous"),
    );
  });

  it("Past Mixed: gapfill never uses present or future", () => {
    const cfg = makeConfig("past-mixed", "Past Mixed", "Past Tenses", {
      tenses: PAST,
      contextEnabled: true,
    });
    const items = generate(cfg);
    assertTenses(items, PAST, "Past Mixed [Context ON]");
    items.forEach(ex =>
      expect([...PRESENT, ...FUTURE]).not.toContain(ex.question.tense),
    );
  });
});

// ─── PRESENT TENSES ──────────────────────────────────────────────────────────

describe("Present Tenses — Context OFF", () => {
  it("Present Simple: only presentSimple exercises", () => {
    const cfg = makeConfig("ps-all", "Present Simple", "Present Tenses", {
      tenses: ["presentSimple"],
    });
    generate(cfg).forEach(ex => {
      expect(ex.type).toBe("verbform");
      expect(ex.question.tense).toBe("presentSimple");
    });
  });

  it("Present Continuous: only presentContinuous exercises", () => {
    const cfg = makeConfig("cont-pres", "Present Continuous", "Present Tenses", {
      tenses: ["presentContinuous"],
    });
    generate(cfg).forEach(ex => {
      expect(ex.type).toBe("verbform");
      expect(ex.question.tense).toBe("presentContinuous");
    });
  });

  it("Present Perfect: only presentPerfect exercises", () => {
    const cfg = makeConfig("perf-pres", "Present Perfect", "Present Tenses", {
      tenses: ["presentPerfect"],
    });
    generate(cfg).forEach(ex => {
      expect(ex.type).toBe("verbform");
      expect(ex.question.tense).toBe("presentPerfect");
    });
  });

  it("Present Perfect Continuous: only presentPerfectContinuous exercises", () => {
    const cfg = makeConfig("pres-pc", "Present Perfect Continuous", "Present Tenses", {
      tenses: ["presentPerfectContinuous"],
    });
    generate(cfg).forEach(ex => {
      expect(ex.type).toBe("verbform");
      expect(ex.question.tense).toBe("presentPerfectContinuous");
    });
  });

  it("Present Mixed: only present tenses, all four appear", () => {
    const cfg = makeConfig("pres-mixed", "Present Mixed", "Present Tenses", {
      tenses: PRESENT,
    });
    const items = generate(cfg);
    const seen = assertTenses(items, PRESENT, "Present Mixed");
    assertAllTensesAppear(seen, PRESENT, "Present Mixed");
    items.forEach(ex =>
      expect([...PAST, ...FUTURE]).not.toContain(ex.question.tense),
    );
  });
});

describe("Present Tenses — Context ON", () => {
  it("Present Simple: gapfill uses presentSimple only", () => {
    const cfg = makeConfig("ps-all", "Present Simple", "Present Tenses", {
      tenses: ["presentSimple"],
      contextEnabled: true,
    });
    const items = generate(cfg);
    expect(items.some(e => e.type === "gapfill")).toBe(true);
    items.forEach(ex => expect(ex.question.tense).toBe("presentSimple"));
  });

  it("Present Continuous: gapfill uses presentContinuous only", () => {
    const cfg = makeConfig("cont-pres", "Present Continuous", "Present Tenses", {
      tenses: ["presentContinuous"],
      contextEnabled: true,
    });
    generate(cfg).forEach(ex =>
      expect(ex.question.tense).toBe("presentContinuous"),
    );
  });

  it("Present Perfect: gapfill uses presentPerfect only", () => {
    const cfg = makeConfig("perf-pres", "Present Perfect", "Present Tenses", {
      tenses: ["presentPerfect"],
      contextEnabled: true,
    });
    generate(cfg).forEach(ex =>
      expect(ex.question.tense).toBe("presentPerfect"),
    );
  });

  it("Present Perfect Continuous: gapfill uses presentPerfectContinuous only", () => {
    const cfg = makeConfig("pres-pc", "Present Perfect Continuous", "Present Tenses", {
      tenses: ["presentPerfectContinuous"],
      contextEnabled: true,
    });
    generate(cfg).forEach(ex =>
      expect(ex.question.tense).toBe("presentPerfectContinuous"),
    );
  });

  it("Present Mixed: gapfill never uses past or future", () => {
    const cfg = makeConfig("pres-mixed", "Present Mixed", "Present Tenses", {
      tenses: PRESENT,
      contextEnabled: true,
    });
    const items = generate(cfg);
    assertTenses(items, PRESENT, "Present Mixed [Context ON]");
    items.forEach(ex =>
      expect([...PAST, ...FUTURE]).not.toContain(ex.question.tense),
    );
  });
});

// ─── FUTURE TENSES ────────────────────────────────────────────────────────────

describe("Future Tenses — Context OFF", () => {
  it("Future Simple: only futureSimple exercises", () => {
    const cfg = makeConfig("fut-simple", "Future Simple", "Future Tenses", {
      tenses: ["futureSimple"],
    });
    generate(cfg).forEach(ex => {
      expect(ex.type).toBe("verbform");
      expect(ex.question.tense).toBe("futureSimple");
    });
  });

  it("Future Continuous: only futureContinuous exercises", () => {
    const cfg = makeConfig("cont-fut", "Future Continuous", "Future Tenses", {
      tenses: ["futureContinuous"],
    });
    generate(cfg).forEach(ex => {
      expect(ex.type).toBe("verbform");
      expect(ex.question.tense).toBe("futureContinuous");
    });
  });

  it("Future Perfect: only futurePerfect exercises", () => {
    const cfg = makeConfig("perf-fut", "Future Perfect", "Future Tenses", {
      tenses: ["futurePerfect"],
    });
    generate(cfg).forEach(ex => {
      expect(ex.type).toBe("verbform");
      expect(ex.question.tense).toBe("futurePerfect");
    });
  });

  it("Future Perfect Continuous: only futurePerfectContinuous exercises", () => {
    const cfg = makeConfig("fut-pc", "Future Perfect Continuous", "Future Tenses", {
      tenses: ["futurePerfectContinuous"],
    });
    generate(cfg).forEach(ex => {
      expect(ex.type).toBe("verbform");
      expect(ex.question.tense).toBe("futurePerfectContinuous");
    });
  });

  it("Future Mixed: only future tenses, all four appear", () => {
    const cfg = makeConfig("fut-mixed", "Future Mixed", "Future Tenses", {
      tenses: FUTURE,
    });
    const items = generate(cfg);
    const seen = assertTenses(items, FUTURE, "Future Mixed");
    assertAllTensesAppear(seen, FUTURE, "Future Mixed");
    items.forEach(ex =>
      expect([...PAST, ...PRESENT]).not.toContain(ex.question.tense),
    );
  });
});

describe("Future Tenses — Context ON", () => {
  it("Future Simple: gapfill uses futureSimple only", () => {
    const cfg = makeConfig("fut-simple", "Future Simple", "Future Tenses", {
      tenses: ["futureSimple"],
      contextEnabled: true,
    });
    const items = generate(cfg);
    expect(items.some(e => e.type === "gapfill")).toBe(true);
    items.forEach(ex => expect(ex.question.tense).toBe("futureSimple"));
  });

  it("Future Continuous: gapfill uses futureContinuous only", () => {
    const cfg = makeConfig("cont-fut", "Future Continuous", "Future Tenses", {
      tenses: ["futureContinuous"],
      contextEnabled: true,
    });
    generate(cfg).forEach(ex =>
      expect(ex.question.tense).toBe("futureContinuous"),
    );
  });

  it("Future Perfect: gapfill uses futurePerfect only", () => {
    const cfg = makeConfig("perf-fut", "Future Perfect", "Future Tenses", {
      tenses: ["futurePerfect"],
      contextEnabled: true,
    });
    generate(cfg).forEach(ex =>
      expect(ex.question.tense).toBe("futurePerfect"),
    );
  });

  it("Future Perfect Continuous: gapfill uses futurePerfectContinuous only", () => {
    const cfg = makeConfig("fut-pc", "Future Perfect Continuous", "Future Tenses", {
      tenses: ["futurePerfectContinuous"],
      contextEnabled: true,
    });
    generate(cfg).forEach(ex =>
      expect(ex.question.tense).toBe("futurePerfectContinuous"),
    );
  });

  it("Future Mixed: gapfill never uses past or present", () => {
    const cfg = makeConfig("fut-mixed", "Future Mixed", "Future Tenses", {
      tenses: FUTURE,
      contextEnabled: true,
    });
    const items = generate(cfg);
    assertTenses(items, FUTURE, "Future Mixed [Context ON]");
    items.forEach(ex =>
      expect([...PAST, ...PRESENT]).not.toContain(ex.question.tense),
    );
  });
});

// ─── IRREGULAR VERB FORMS ─────────────────────────────────────────────────────

describe("Irregular Verb Forms — Context OFF", () => {
  it("V2 (Past Simple): every exercise has askFor=past", () => {
    const cfg = makeConfig("irr-past", "Past Simple (V2)", "Irregular Verb Forms", {
      exerciseTypes: ["irregular"],
      verbPool: "irregular",
      irregularForm: "past",
    });
    generate(cfg).forEach(ex => {
      expect(ex.type).toBe("irregular");
      expect(ex.question.askFor).toBe("past");
    });
  });

  it("V3 (Past Participle): every exercise has askFor=pastParticiple", () => {
    const cfg = makeConfig("irr-pp", "Past Participle (V3)", "Irregular Verb Forms", {
      exerciseTypes: ["irregular"],
      verbPool: "irregular",
      irregularForm: "pastParticiple",
    });
    generate(cfg).forEach(ex => {
      expect(ex.type).toBe("irregular");
      expect(ex.question.askFor).toBe("pastParticiple");
    });
  });

  it("Irregular Mixed: both V2 and V3 appear, no other types", () => {
    const cfg = makeConfig("irr-mixed", "Irregular Mixed", "Irregular Verb Forms", {
      exerciseTypes: ["irregular"],
      verbPool: "irregular",
      irregularForm: "mixed",
    });
    const items = generate(cfg);
    const seenForms = new Set(items.map(ex => ex.question.askFor));
    items.forEach(ex => {
      expect(ex.type).toBe("irregular");
      expect(["past", "pastParticiple"]).toContain(ex.question.askFor);
    });
    expect(seenForms, "V2 never appeared in Irregular Mixed").toContain("past");
    expect(seenForms, "V3 never appeared in Irregular Mixed").toContain("pastParticiple");
  });
});

describe("Irregular Verb Forms — Context ON", () => {
  it("V2 context: gap-fill uses only pastSimple sentences", () => {
    const cfg = makeConfig("irr-past", "Past Simple (V2)", "Irregular Verb Forms", {
      exerciseTypes: ["irregular"],
      verbPool: "irregular",
      irregularForm: "past",
      contextEnabled: true,
    });
    const items = generate(cfg);
    const gapfills = items.filter(e => e.type === "gapfill");
    expect(gapfills.length).toBeGreaterThan(0);
    gapfills.forEach(ex =>
      expect(ex.question.tense, "V2 gapfill used non-pastSimple tense").toBe("pastSimple"),
    );
    items
      .filter(e => e.type !== "gapfill")
      .forEach(ex => expect(ex.type).toBe("irregular"));
  });

  it("V3 context: gap-fill uses only perfect tenses", () => {
    const cfg = makeConfig("irr-pp", "Past Participle (V3)", "Irregular Verb Forms", {
      exerciseTypes: ["irregular"],
      verbPool: "irregular",
      irregularForm: "pastParticiple",
      contextEnabled: true,
    });
    const items = generate(cfg);
    const gapfills = items.filter(e => e.type === "gapfill");
    expect(gapfills.length).toBeGreaterThan(0);
    gapfills.forEach(ex =>
      expect(PERFECT, `V3 gapfill used "${ex.question.tense}" — not a perfect tense`).toContain(
        ex.question.tense,
      ),
    );
  });

  it("Irregular Mixed context: gapfill uses pastSimple or perfect tenses only", () => {
    const cfg = makeConfig("irr-mixed", "Irregular Mixed", "Irregular Verb Forms", {
      exerciseTypes: ["irregular"],
      verbPool: "irregular",
      irregularForm: "mixed",
      contextEnabled: true,
    });
    const allowed: Tense[] = ["pastSimple", ...PERFECT];
    const items = generate(cfg);
    items
      .filter(e => e.type === "gapfill")
      .forEach(ex =>
        expect(allowed, `Irregular Mixed gapfill used unexpected tense "${ex.question.tense}"`).toContain(
          ex.question.tense,
        ),
      );
  });
});

// ─── FULL CONJUGATION ─────────────────────────────────────────────────────────

describe("Full Conjugation", () => {
  const fullCfg = makeConfig("full-all", "All Tenses", "Full Conjugation", {
    exerciseTypes: ["verbform"],
    verbPool: "all",
    // no tenses — uses difficulty pool
  });

  it("Context OFF: all exercises are verbform type", () => {
    generate(fullCfg).forEach(ex => expect(ex.type).toBe("verbform"));
  });

  it("Context OFF: multiple distinct tenses appear (not locked to one)", () => {
    const seen = new Set(generate(fullCfg).map(ex => ex.question.tense));
    expect(seen.size).toBeGreaterThan(4);
  });

  it("Context ON: produces both verbform and gapfill", () => {
    const ctx = { ...fullCfg, contextEnabled: true };
    const items = generate(ctx);
    expect(items.some(e => e.type === "verbform")).toBe(true);
    expect(items.some(e => e.type === "gapfill")).toBe(true);
  });
});

// ─── ANSWER VALIDATION ────────────────────────────────────────────────────────

describe("Answer Validation", () => {
  /** Generate one exercise and verify the validation contract. */
  function validationCase(label: string, cfg: SessionConfig) {
    it(`${label}: correct answer accepted, wrong answer rejected`, () => {
      const ex = generateExerciseFromConfig(cfg, "advanced");
      const correct = Array.isArray(ex.answer) ? ex.answer[0] : ex.answer;
      expect(
        isCorrect(correct, ex.answer),
        `Correct answer "${correct}" should be accepted`,
      ).toBe(true);
      expect(
        isCorrect("xyzzy_not_a_word_42", ex.answer),
        `Junk answer should be rejected`,
      ).toBe(false);
    });

    it(`${label}: normalizes trailing whitespace`, () => {
      const ex = generateExerciseFromConfig(cfg, "advanced");
      const correct = Array.isArray(ex.answer) ? ex.answer[0] : ex.answer;
      expect(isCorrect("  " + correct + "  ", ex.answer)).toBe(true);
    });

    it(`${label}: normalizes to lowercase`, () => {
      const ex = generateExerciseFromConfig(cfg, "advanced");
      const correct = Array.isArray(ex.answer) ? ex.answer[0] : ex.answer;
      expect(isCorrect(correct.toUpperCase(), ex.answer)).toBe(true);
    });
  }

  validationCase(
    "Past Simple (verbform)",
    makeConfig("past-simple", "Past Simple", "Past Tenses", { tenses: ["pastSimple"] }),
  );
  validationCase(
    "Present Simple (verbform)",
    makeConfig("ps-all", "Present Simple", "Present Tenses", { tenses: ["presentSimple"] }),
  );
  validationCase(
    "Future Simple (verbform)",
    makeConfig("fut-simple", "Future Simple", "Future Tenses", { tenses: ["futureSimple"] }),
  );
  validationCase(
    "Irregular V2",
    makeConfig("irr-past", "Past Simple (V2)", "Irregular Verb Forms", {
      exerciseTypes: ["irregular"],
      verbPool: "irregular",
      irregularForm: "past",
    }),
  );
  validationCase(
    "Irregular V3",
    makeConfig("irr-pp", "Past Participle (V3)", "Irregular Verb Forms", {
      exerciseTypes: ["irregular"],
      verbPool: "irregular",
      irregularForm: "pastParticiple",
    }),
  );
  validationCase(
    "Gapfill / Context Mode",
    makeConfig("ps-all", "Present Simple", "Present Tenses", {
      tenses: ["presentSimple"],
      contextEnabled: true,
    }),
  );
});

// ─── GENERATOR BOUNDARIES (mixed-mode isolation) ──────────────────────────────

describe("Generator Boundaries — mixed-mode isolation", () => {
  it("Past Mixed never generates a Present or Future tense", () => {
    const cfg = makeConfig("past-mixed", "Past Mixed", "Past Tenses", { tenses: PAST });
    generate(cfg, 120).forEach(ex =>
      expect([...PRESENT, ...FUTURE]).not.toContain(ex.question.tense),
    );
  });

  it("Present Mixed never generates a Past or Future tense", () => {
    const cfg = makeConfig("pres-mixed", "Present Mixed", "Present Tenses", {
      tenses: PRESENT,
    });
    generate(cfg, 120).forEach(ex =>
      expect([...PAST, ...FUTURE]).not.toContain(ex.question.tense),
    );
  });

  it("Future Mixed never generates a Past or Present tense", () => {
    const cfg = makeConfig("fut-mixed", "Future Mixed", "Future Tenses", { tenses: FUTURE });
    generate(cfg, 120).forEach(ex =>
      expect([...PAST, ...PRESENT]).not.toContain(ex.question.tense),
    );
  });

  it("Past Simple never bleeds into Past Continuous or Perfect", () => {
    const cfg = makeConfig("past-simple", "Past Simple", "Past Tenses", {
      tenses: ["pastSimple"],
    });
    generate(cfg, 120).forEach(ex =>
      expect(ex.question.tense).toBe("pastSimple"),
    );
  });

  it("Irregular V2 never generates pastParticiple", () => {
    const cfg = makeConfig("irr-past", "Past Simple (V2)", "Irregular Verb Forms", {
      exerciseTypes: ["irregular"],
      verbPool: "irregular",
      irregularForm: "past",
    });
    generate(cfg, 120).forEach(ex =>
      expect(ex.question.askFor).toBe("past"),
    );
  });

  it("Irregular V3 never generates past (V2)", () => {
    const cfg = makeConfig("irr-pp", "Past Participle (V3)", "Irregular Verb Forms", {
      exerciseTypes: ["irregular"],
      verbPool: "irregular",
      irregularForm: "pastParticiple",
    });
    generate(cfg, 120).forEach(ex =>
      expect(ex.question.askFor).toBe("pastParticiple"),
    );
  });
});
