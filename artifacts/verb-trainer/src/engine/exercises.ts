import { Verb, verbs as allVerbs, irregularVerbs as allIrregularVerbs } from "../data/verbs";
import { Subject, Tense } from "../data/grammar";
import { conjugate } from "./conjugate";
import {
  contextExerciseById,
  contextExerciseIndex,
  type ActiveCuratedContextExercise,
  type ContextPracticeTarget,
  type ContextTense,
} from "../data/contextExercises";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExerciseMode  = "verbform" | "tenserecognition" | "irregular" | "gapfill";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type VerbPoolSpec  = "all" | "irregular" | number;
export type IrregularForm = "past" | "pastParticiple" | "mixed";

export interface SessionConfig {
  id: string;
  /** Presentation-only fields. Persisted state must use stable IDs instead. */
  label?: string;
  groupLabel?: string;
  selectedIds: string[];
  exerciseTypes: ("verbform" | "irregular")[];
  verbPool: VerbPoolSpec;
  tenses?: Tense[];
  irregularForm?: IrregularForm;
  mistakesOnly?: boolean;
  reviewMistakeIds?: string[]; // specific mistake record IDs (preserves type+tense+form)
  contextEnabled: boolean;
  letterBuilderEnabled?: boolean; // when true, every exercise uses letter-picker UI
  userCustomized?: boolean;  // true after first manual selection
}

export type PersistedSessionConfig = Omit<SessionConfig, "label" | "groupLabel">;

/** Remove presentation-only labels before writing a config to browser storage. */
export function toPersistedSessionConfig(config: SessionConfig): PersistedSessionConfig {
  const { label: _label, groupLabel: _groupLabel, ...semanticConfig } = config;
  return semanticConfig;
}

export interface ExerciseItem {
  id: string;
  type: ExerciseMode;
  question: any;
  answer: string | string[];
}

// ─── Tense pools ──────────────────────────────────────────────────────────────

const ALL_SUBJECTS: Subject[] = ["I", "you", "he/she/it", "we", "they"];

const beginnerTenses: Tense[] = [
  "presentSimple", "pastSimple", "futureSimple", "presentContinuous",
];
const intermediateTenses: Tense[] = [
  ...beginnerTenses,
  "presentPerfect", "pastContinuous", "pastPerfect", "presentPerfectContinuous",
];
const advancedTenses: Tense[] = [
  ...intermediateTenses,
  "futureContinuous", "futurePerfect", "futurePerfectContinuous",
  "presentSimplePassive", "pastSimplePassive", "presentPerfectPassive",
  "pastPerfectPassive", "futureSimplePassive",
];

export function getTenses(difficulty: DifficultyLevel): Tense[] {
  switch (difficulty) {
    case "beginner":     return beginnerTenses;
    case "intermediate": return intermediateTenses;
    case "advanced":     return advancedTenses;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function pick<T>(arr: T[], random: () => number = Math.random): T {
  const index = Math.min(arr.length - 1, Math.floor(random() * arr.length));
  return arr[index];
}

function makeCuratedGapFillExercise(
  record: ActiveCuratedContextExercise,
  practiceTarget: ContextPracticeTarget,
): ExerciseItem {
  return {
    id: `gapfill:curated:${record.id}:${practiceTarget}`,
    type: "gapfill",
    question: {
      template: record.sentence,
      hint: `(${record.verb})`,
      verb: record.verb,
      tense: record.tense,
      subject: record.subject,
      displaySubject: record.subject,
      practiceTarget,
      curatedExerciseId: record.id,
    },
    answer: record.expectedAnswer,
  };
}

// ─── Internal generators (accept explicit pool + tenses) ──────────────────────

function makeVerbFormFor(
  verb: Verb,
  tense: Tense,
  subject: Subject = pick(ALL_SUBJECTS),
  id?: string,
): ExerciseItem {
  const answer  = conjugate(verb, tense, subject);
  return {
    id: id ?? `verbform:${verb.infinitive}:${tense}:${subject}`,
    type: "verbform",
    question: { verb: verb.infinitive, tense, subject },
    answer,
  };
}

function makeVerbForm(pool: Verb[], tenses: Tense[]): ExerciseItem {
  return makeVerbFormFor(pick(pool), pick(tenses));
}

function makeIrregularFor(
  verb: Verb,
  askFor: "past" | "pastParticiple",
): ExerciseItem {
  const answer = askFor === "past" ? verb.past : verb.pastParticiple;
  return {
    id: `irregular:${verb.infinitive}:${askFor}`,
    type: "irregular",
    question: { verb: verb.infinitive, askFor },
    answer: answer.split("/"),
  };
}

function makeIrregular(pool: Verb[], form: IrregularForm): ExerciseItem {
  const irregPool = pool.filter(v => v.isIrregular);
  const verb = pick(irregPool.length > 0 ? irregPool : allIrregularVerbs);
  const askFor: "past" | "pastParticiple" =
    form === "past"           ? "past" :
    form === "pastParticiple" ? "pastParticiple" :
    pick(["past", "pastParticiple"]);
  return makeIrregularFor(verb, askFor);
}

function findCuratedRecord(
  verb: Verb,
  target: ContextPracticeTarget,
): ActiveCuratedContextExercise | undefined {
  const records = contextExerciseIndex.get(verb.infinitive)?.get(target);
  return records?.length ? pick([...records]) : undefined;
}

export function generateContextExerciseFor(
  verb: Verb,
  target: ContextPracticeTarget,
): ExerciseItem {
  const record = findCuratedRecord(verb, target);
  if (record) return makeCuratedGapFillExercise(record, target);

  if (target === "v2" || target === "v3") {
    return makeIrregularFor(
      verb,
      target === "v2" ? "past" : "pastParticiple",
    );
  }

  return makeVerbFormFor(verb, target);
}

function makeContextForTense(pool: Verb[], tenses: Tense[]): ExerciseItem {
  const verb = pick(pool);
  const tense = pick(tenses);
  return generateContextExerciseFor(verb, tense as ContextTense);
}

function makeContextForIrregular(
  pool: Verb[],
  form: IrregularForm,
): ExerciseItem {
  const irregPool = pool.filter(verb => verb.isIrregular);
  const verb = pick(irregPool.length > 0 ? irregPool : allIrregularVerbs);
  const askFor: "past" | "pastParticiple" =
    form === "past" ? "past" :
    form === "pastParticiple" ? "pastParticiple" :
    pick(["past", "pastParticiple"]);
  const target: ContextPracticeTarget = askFor === "past" ? "v2" : "v3";
  return generateContextExerciseFor(verb, target);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Reconstruct an ExerciseItem from a stored ProgressRecord id.
 * IDs are encoded as:
 *   verbform:   "verbform:<verb>:<tense>:<subject>"
 *   irregular:  "irregular:<verb>:<askFor>"
 *   curated:   "gapfill:curated:<curatedId>:<practiceTarget>"
 */
export function exerciseFromMistakeId(id: string): ExerciseItem | null {
  const parts = id.split(":");
  if (parts.length < 2) return null;

  const type = parts[0];

  if (type === "verbform" && parts.length >= 4) {
    const verbInf = parts[1];
    const tense   = parts[2] as Tense;
    const subject = parts.slice(3).join(":") as Subject; // subject can contain "/"
    const verb = allVerbs.find(v => v.infinitive === verbInf);
    if (
      !verb ||
      !getTenses("advanced").includes(tense) ||
      !ALL_SUBJECTS.includes(subject)
    ) {
      return null;
    }
    const answer = conjugate(verb, tense, subject);
    return { id, type: "verbform", question: { verb: verbInf, tense, subject }, answer };
  }

  if (type === "irregular" && parts.length >= 3) {
    const verbInf = parts[1];
    const askFor  = parts[2] as "past" | "pastParticiple";
    if (askFor !== "past" && askFor !== "pastParticiple") return null;
    const verb =
      allVerbs.find(v => v.infinitive === verbInf) ??
      allIrregularVerbs.find(v => v.infinitive === verbInf);
    if (!verb) return null;
    const raw = askFor === "past" ? verb.past : verb.pastParticiple;
    if (!raw) return null;
    return {
      id,
      type: "irregular",
      question: { verb: verbInf, askFor },
      answer: raw.split("/"),
    };
  }

  if (type === "gapfill" && parts[1] === "curated" && parts.length === 4) {
    const record = contextExerciseById.get(parts[2]);
    const target = parts[3] as ContextPracticeTarget;
    if (!record || !record.practiceTargets.includes(target)) return null;
    return makeCuratedGapFillExercise(record, target);
  }

  // Migrate old template-based mistake IDs to a deterministic non-context
  // exercise. Legacy sentences are never reconstructed or shown.
  if (type === "gapfill") {
    const isV2 = parts[1] === "v2";
    const verbInf = isV2 ? parts[3] : parts[2];
    const tense = (isV2 ? parts[4] : parts[3]) as Tense;
    const encodedSubject = isV2 ? parts[5] : "I";
    const subject: Subject =
      encodedSubject === "he" || encodedSubject === "she"
        ? "he/she/it"
        : (encodedSubject as Subject);
    const verb = allVerbs.find(item => item.infinitive === verbInf);
    if (!verb || !getTenses("advanced").includes(tense) || !ALL_SUBJECTS.includes(subject)) {
      return null;
    }
    return makeVerbFormFor(verb, tense, subject, id);
  }

  return null;
}

export function isRuntimeSafeExercise(exercise: unknown): boolean {
  return restorePersistedExercise(exercise) !== null;
}

export function restorePersistedExercise(
  exercise: unknown,
): ExerciseItem | null {
  if (
    !exercise ||
    typeof exercise !== "object" ||
    !("id" in exercise) ||
    typeof exercise.id !== "string"
  ) {
    return null;
  }
  return exerciseFromMistakeId(exercise.id);
}

// Legacy — kept for any code that still calls the old signature
export function generateExercise(type: ExerciseMode, difficulty: DifficultyLevel): ExerciseItem {
  const tenses = getTenses(difficulty);
  switch (type) {
    case "verbform":         return makeVerbForm(allVerbs, tenses);
    case "irregular":        return makeIrregular(allIrregularVerbs, "mixed");
    case "gapfill":          return makeContextForTense(allVerbs, tenses);
    case "tenserecognition": return makeVerbForm(allVerbs, tenses);
    default:                 return makeVerbForm(allVerbs, tenses);
  }
}

export function generateExerciseFromConfig(
  config: SessionConfig,
  difficulty: DifficultyLevel,
  forceType?: ExerciseMode,
): ExerciseItem {
  // 1. Resolve verb pool
  let pool: Verb[] =
    config.verbPool === "all"       ? allVerbs :
    config.verbPool === "irregular" ? allIrregularVerbs :
    allVerbs.filter(v => v.frequencyRank <= (config.verbPool as number));

  // 2. Tenses
  const tenses: Tense[] = config.tenses ?? getTenses(difficulty);

  // 3. Effective exercise types (context adds gapfill)
  const types: ExerciseMode[] = [
    ...config.exerciseTypes,
    ...(config.contextEnabled ? ["gapfill" as ExerciseMode] : []),
  ];

  // 4. Pick a type and generate
  // forceType lets the caller guarantee a specific mode (e.g. "gapfill" when
  // Context Mode is first enabled, so the user immediately sees a context sentence).
  const resolvedType =
    forceType && types.includes(forceType) ? forceType : pick(types);
  let exercise: ExerciseItem;
  switch (resolvedType) {
    case "verbform":
      exercise = makeVerbForm(pool, tenses);
      break;
    case "irregular":
      exercise = makeIrregular(pool, config.irregularForm ?? "mixed");
      break;
    case "gapfill": {
      if (config.irregularForm) {
        exercise = makeContextForIrregular(pool, config.irregularForm);
      } else {
        exercise = makeContextForTense(pool, tenses);
      }
      break;
    }
    default:
      exercise = makeVerbForm(pool, tenses);
  }

  return exercise;
}
