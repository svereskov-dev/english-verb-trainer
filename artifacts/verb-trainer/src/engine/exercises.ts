import { Verb, verbs, irregularVerbs } from "../data/verbs";
import { Subject, Tense } from "../data/grammar";
import { conjugate } from "./conjugate";
import { contextTemplates, ContextTemplate } from "../data/contextTemplates";

export type ExerciseMode = "verbform" | "tenserecognition" | "irregular" | "gapfill";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface ExerciseItem {
  id: string;
  type: ExerciseMode;
  question: any;
  answer: string | string[];
}

const ALL_SUBJECTS: Subject[] = ["I", "you", "he/she/it", "we", "they"];

const beginnerTenses: Tense[] = ["presentSimple", "pastSimple", "futureSimple", "presentContinuous"];
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

function getTenses(difficulty: DifficultyLevel): Tense[] {
  switch (difficulty) {
    case "beginner":     return beginnerTenses;
    case "intermediate": return intermediateTenses;
    case "advanced":     return advancedTenses;
  }
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Render "{subject}" in a frame, handling capitalisation and he/she display.
function renderFrame(frame: string, subject: Subject): string {
  let display: string;
  if (subject === "he/she/it") {
    display = Math.random() < 0.5 ? "he" : "she";
  } else {
    display = subject;
  }
  const rendered = frame.replace("{subject}", display);
  // Always capitalise the first character (handles both {subject}-led and noun-led frames)
  return rendered.charAt(0).toUpperCase() + rendered.slice(1);
}

// ─── Exercise generators ──────────────────────────────────────────────────────

function generateVerbForm(difficulty: DifficultyLevel): ExerciseItem {
  const tenses  = getTenses(difficulty);
  const verb    = pick(verbs);
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

function generateIrregular(): ExerciseItem {
  const verb    = pick(irregularVerbs);
  const askFor  = pick(["past", "pastParticiple"] as const);
  const answer  = askFor === "past" ? verb.past : verb.pastParticiple;

  return {
    id: `irregular:${verb.infinitive}:${askFor}`,
    type: "irregular",
    question: { verb: verb.infinitive, askFor },
    answer: answer.split("/"),
  };
}

function generateGapFill(difficulty: DifficultyLevel): ExerciseItem {
  const allowedTenses = getTenses(difficulty);

  // 1. Templates whose tense list overlaps with the difficulty level
  const eligibleTemplates = contextTemplates.filter(t =>
    t.tenses.some(tense => allowedTenses.includes(tense))
  );
  const template: ContextTemplate = pick(eligibleTemplates);

  // 2. Tense: intersection of template tenses and difficulty-allowed tenses
  const sharedTenses = template.tenses.filter(t => allowedTenses.includes(t));
  const tense = pick(sharedTenses);

  // 3. Subject
  const subjectPool: Subject[] = template.subjects ?? ALL_SUBJECTS;
  const subject = pick(subjectPool);

  // 4. Verb: filter by behavior → transitivity → domain
  let pool: Verb[] = verbs.filter(v => template.allowedBehaviors.includes(v.behavior));

  if (template.allowedTransitivity && template.allowedTransitivity.length > 0) {
    const filtered = pool.filter(v => template.allowedTransitivity!.includes(v.transitivity));
    if (filtered.length > 0) pool = filtered;
  }

  if (template.allowedDomains && template.allowedDomains.length > 0) {
    const filtered = pool.filter(v => v.domains.some(d => template.allowedDomains!.includes(d)));
    if (filtered.length > 0) pool = filtered;
  }

  // Fallback: any dynamic verb (should never be needed with 91 templates)
  if (pool.length === 0) {
    pool = verbs.filter(v => v.behavior === "dynamic");
  }

  const verb = pick(pool);

  // 5. Answer: always computed — never stored
  const answer = conjugate(verb, tense, subject);

  // 6. Render the frame
  const renderedFrame = renderFrame(template.frame, subject);

  return {
    id: `gapfill:${template.id}:${verb.infinitive}:${tense}`,
    type: "gapfill",
    question: {
      template: renderedFrame,
      hint: `(${verb.infinitive})`,
      verb: verb.infinitive,
    },
    answer,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function generateExercise(type: ExerciseMode, difficulty: DifficultyLevel): ExerciseItem {
  switch (type) {
    case "verbform":         return generateVerbForm(difficulty);
    case "irregular":        return generateIrregular();
    case "gapfill":          return generateGapFill(difficulty);
    // tenserecognition kept for backwards-compat but not exposed in the UI
    case "tenserecognition": return generateVerbForm(difficulty);
    default:                 return generateVerbForm(difficulty);
  }
}
