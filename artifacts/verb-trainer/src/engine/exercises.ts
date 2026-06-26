import { Verb, verbs as allVerbs, irregularVerbs as allIrregularVerbs } from "../data/verbs";
import { Subject, Tense } from "../data/grammar";
import { conjugate } from "./conjugate";
import { contextTemplates, ContextTemplate } from "../data/contextTemplates";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExerciseMode  = "verbform" | "tenserecognition" | "irregular" | "gapfill";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type VerbPoolSpec  = "all" | "irregular" | number;
export type IrregularForm = "past" | "pastParticiple" | "mixed";

export interface SessionConfig {
  id: string;
  label: string;
  groupLabel: string;
  selectedIds: string[];
  exerciseTypes: ("verbform" | "irregular")[];
  verbPool: VerbPoolSpec;
  tenses?: Tense[];
  irregularForm?: IrregularForm;
  mistakesOnly?: boolean;
  reviewVerbs?: string[];  // temporary filtered list from Mistakes page
  contextEnabled: boolean;
  userCustomized?: boolean;  // true after first manual selection
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

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function renderFrame(frame: string, subject: Subject): string {
  const display =
    subject === "he/she/it" ? (Math.random() < 0.5 ? "he" : "she") : subject;
  const rendered = frame.replace("{subject}", display);
  return rendered.charAt(0).toUpperCase() + rendered.slice(1);
}

// ─── Internal generators (accept explicit pool + tenses) ──────────────────────

function makeVerbForm(pool: Verb[], tenses: Tense[]): ExerciseItem {
  const verb    = pick(pool);
  const tense   = pick(tenses);
  const subject = pick(ALL_SUBJECTS);
  const answer  = conjugate(verb, tense, subject);
  return {
    id: `verbform:${verb.infinitive}:${tense}:${subject}`,
    type: "verbform",
    question: { verb: verb.infinitive, tense, subject },
    answer,
  };
}

function makeIrregular(pool: Verb[], form: IrregularForm): ExerciseItem {
  const irregPool = pool.filter(v => v.isIrregular);
  const verb = pick(irregPool.length > 0 ? irregPool : allIrregularVerbs);
  const askFor: "past" | "pastParticiple" =
    form === "past"           ? "past" :
    form === "pastParticiple" ? "pastParticiple" :
    pick(["past", "pastParticiple"]);
  const answer = askFor === "past" ? verb.past : verb.pastParticiple;
  return {
    id: `irregular:${verb.infinitive}:${askFor}`,
    type: "irregular",
    question: { verb: verb.infinitive, askFor },
    answer: answer.split("/"),
  };
}

function makeGapFill(pool: Verb[], tenses: Tense[]): ExerciseItem {
  const eligible = contextTemplates.filter(t =>
    t.tenses.some(tense => tenses.includes(tense))
  );
  const template: ContextTemplate = pick(eligible.length > 0 ? eligible : contextTemplates);
  const shared   = template.tenses.filter(t => tenses.includes(t));
  const tense    = pick(shared.length > 0 ? shared : template.tenses);
  const subject  = pick(template.subjects ?? ALL_SUBJECTS);

  let verbPool = pool.filter(v => template.allowedBehaviors.includes(v.behavior));
  if (template.allowedTransitivity?.length) {
    const f = verbPool.filter(v => template.allowedTransitivity!.includes(v.transitivity));
    if (f.length > 0) verbPool = f;
  }
  if (template.allowedDomains?.length) {
    const f = verbPool.filter(v => v.domains.some(d => template.allowedDomains!.includes(d)));
    if (f.length > 0) verbPool = f;
  }
  if (verbPool.length === 0) verbPool = pool.filter(v => v.behavior === "dynamic");
  if (verbPool.length === 0) verbPool = pool;

  const verb   = pick(verbPool);
  const answer = conjugate(verb, tense, subject);
  return {
    id: `gapfill:${template.id}:${verb.infinitive}:${tense}`,
    type: "gapfill",
    question: {
      template: renderFrame(template.frame, subject),
      hint: `(${verb.infinitive})`,
      verb: verb.infinitive,
      tense,
    },
    answer,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

// Legacy — kept for any code that still calls the old signature
export function generateExercise(type: ExerciseMode, difficulty: DifficultyLevel): ExerciseItem {
  const tenses = getTenses(difficulty);
  switch (type) {
    case "verbform":         return makeVerbForm(allVerbs, tenses);
    case "irregular":        return makeIrregular(allIrregularVerbs, "mixed");
    case "gapfill":          return makeGapFill(allVerbs, tenses);
    case "tenserecognition": return makeVerbForm(allVerbs, tenses);
    default:                 return makeVerbForm(allVerbs, tenses);
  }
}

export function generateExerciseFromConfig(
  config: SessionConfig,
  difficulty: DifficultyLevel,
  mistakeVerbs?: string[],
): ExerciseItem {
  // 1. Resolve verb pool
  let pool: Verb[] =
    config.verbPool === "all"       ? allVerbs :
    config.verbPool === "irregular" ? allIrregularVerbs :
    allVerbs.filter(v => v.frequencyRank <= (config.verbPool as number));

  // 2. Narrow to mistake verbs if applicable
  if (config.mistakesOnly && mistakeVerbs && mistakeVerbs.length > 0) {
    const narrowed = pool.filter(v => mistakeVerbs.includes(v.infinitive));
    if (narrowed.length > 0) pool = narrowed;
  }

  // 3. Narrow to review verbs from Mistakes page
  if (config.reviewVerbs && config.reviewVerbs.length > 0) {
    const narrowed = pool.filter(v => config.reviewVerbs!.includes(v.infinitive));
    if (narrowed.length > 0) pool = narrowed;
  }

  // 5. Tenses
  const tenses: Tense[] = config.tenses ?? getTenses(difficulty);

  // 6. Effective exercise types (context adds gapfill)
  const types: ExerciseMode[] = [
    ...config.exerciseTypes,
    ...(config.contextEnabled ? ["gapfill" as ExerciseMode] : []),
  ];

  // 7. Pick a type and generate
  switch (pick(types)) {
    case "verbform":  return makeVerbForm(pool, tenses);
    case "irregular": return makeIrregular(pool, config.irregularForm ?? "mixed");
    case "gapfill": {
      // When an irregularForm is set, constrain gapfill tenses so the sentence
      // structure matches the form being drilled:
      //   past            → pastSimple  (She put it on the table.)
      //   pastParticiple  → perfect tenses  (She has/had put it away.)
      //   mixed           → pastSimple + all perfect tenses
      let gapfillTenses = tenses;
      if (config.irregularForm) {
        const PAST_SIMPLE:  Tense[] = ["pastSimple"];
        const PERFECT:      Tense[] = ["presentPerfect", "pastPerfect", "futurePerfect"];
        gapfillTenses =
          config.irregularForm === "past"           ? PAST_SIMPLE :
          config.irregularForm === "pastParticiple" ? PERFECT :
          /* mixed */                                 [...PAST_SIMPLE, ...PERFECT];
      }
      return makeGapFill(pool, gapfillTenses);
    }
    default: return makeVerbForm(pool, tenses);
  }
}
