import rawContextExercises from "./contextExercises.json";

export const CONTEXT_TENSES = [
  "pastSimple",
  "pastContinuous",
  "pastPerfect",
  "pastPerfectContinuous",
  "presentSimple",
  "presentContinuous",
  "presentPerfect",
  "presentPerfectContinuous",
  "futureSimple",
  "futureContinuous",
  "futurePerfect",
  "futurePerfectContinuous",
] as const;

export type ContextTense = (typeof CONTEXT_TENSES)[number];
export type ContextPracticeTarget = ContextTense | "v2" | "v3";

interface CuratedContextRecordBase {
  id: string;
  verb: string;
  tense: ContextTense;
  subject: string;
  practiceTargets: readonly ContextPracticeTarget[];
}

export interface ActiveCuratedContextExercise extends CuratedContextRecordBase {
  sentence: string;
  expectedAnswer: string;
  notRecommended?: false;
  reason?: never;
}

export interface UnavailableCuratedContextExercise extends CuratedContextRecordBase {
  notRecommended: true;
  reason: string;
  sentence?: never;
  expectedAnswer?: never;
}

export type CuratedContextRecord =
  | ActiveCuratedContextExercise
  | UnavailableCuratedContextExercise;

export const contextExercises =
  rawContextExercises as unknown as readonly CuratedContextRecord[];

export type ContextExerciseIndex = ReadonlyMap<
  string,
  ReadonlyMap<ContextPracticeTarget, readonly ActiveCuratedContextExercise[]>
>;

function buildContextExerciseIndex(
  records: readonly ActiveCuratedContextExercise[],
): ContextExerciseIndex {
  const mutableIndex = new Map<
    string,
    Map<ContextPracticeTarget, ActiveCuratedContextExercise[]>
  >();

  for (const record of records) {
    let verbIndex = mutableIndex.get(record.verb);
    if (!verbIndex) {
      verbIndex = new Map();
      mutableIndex.set(record.verb, verbIndex);
    }

    for (const target of record.practiceTargets) {
      const targetRecords = verbIndex.get(target);
      if (targetRecords) {
        targetRecords.push(record);
      } else {
        verbIndex.set(target, [record]);
      }
    }
  }

  return mutableIndex;
}

export function isActiveCuratedContextExercise(
  record: CuratedContextRecord,
): record is ActiveCuratedContextExercise {
  return record.notRecommended !== true;
}

export const activeContextExercises = contextExercises.filter(
  isActiveCuratedContextExercise,
);

export const unavailableContextExercises = contextExercises.filter(
  (record): record is UnavailableCuratedContextExercise =>
    record.notRecommended === true,
);

export const contextExerciseById = new Map(
  activeContextExercises.map((record) => [record.id, record] as const),
);

/**
 * Active-only runtime index. Intentionally excludes notRecommended records.
 */
export const contextExerciseIndex = buildContextExerciseIndex(
  activeContextExercises,
);