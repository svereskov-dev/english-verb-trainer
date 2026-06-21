import { Verb, verbs, irregularVerbs } from '../data/verbs';
import { Subject, Tense } from '../data/gapFillSentences';
import { conjugate } from './conjugate';
import { gapFillSentences, GapFillSentence } from '../data/gapFillSentences';

export type ExerciseMode = "verbform" | "tenserecognition" | "irregular" | "gapfill";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface ExerciseItem {
  id: string;
  type: ExerciseMode;
  question: any;
  answer: string | string[];
}

const beginnerTenses: Tense[] = ["presentSimple", "pastSimple", "futureSimple", "presentContinuous"];
const intermediateTenses: Tense[] = [...beginnerTenses, "presentPerfect", "pastContinuous", "pastPerfect", "presentPerfectContinuous"];
const advancedTenses: Tense[] = [...intermediateTenses, "futureContinuous", "futurePerfect", "futurePerfectContinuous", "presentSimplePassive", "pastSimplePassive", "presentPerfectPassive", "pastPerfectPassive", "futureSimplePassive"];

function getTenses(difficulty: DifficultyLevel): Tense[] {
  switch (difficulty) {
    case "beginner": return beginnerTenses;
    case "intermediate": return intermediateTenses;
    case "advanced": return advancedTenses;
  }
}

export function generateExercise(type: ExerciseMode, difficulty: DifficultyLevel): ExerciseItem {
  const subjects: Subject[] = ["I", "you", "he/she/it", "we", "they"];
  const tenses = getTenses(difficulty);
  
  if (type === "verbform") {
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    const tense = tenses[Math.floor(Math.random() * tenses.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const answer = conjugate(verb, tense, subject);
    
    return {
      id: `verbform:${verb.infinitive}:${tense}:${subject}`,
      type: "verbform",
      question: { verb: verb.infinitive, tense, subject },
      answer
    };
  }
  
  if (type === "tenserecognition") {
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    const tense = tenses[Math.floor(Math.random() * tenses.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const sentence = `${subject} ${conjugate(verb, tense, subject)}`;
    
    const options = new Set<Tense>([tense]);
    while (options.size < 4) {
      options.add(tenses[Math.floor(Math.random() * tenses.length)]);
    }
    
    return {
      id: `tenserecognition:${verb.infinitive}:${tense}:${subject}`,
      type: "tenserecognition",
      question: { sentence, options: Array.from(options) },
      answer: tense
    };
  }
  
  if (type === "irregular") {
    const verb = irregularVerbs[Math.floor(Math.random() * irregularVerbs.length)];
    const forms = ["past", "pastParticiple"];
    const askFor = forms[Math.floor(Math.random() * forms.length)];

    let answer = "";
    if (askFor === "past") answer = verb.past;
    else answer = verb.pastParticiple;
    
    return {
      id: `irregular:${verb.infinitive}:${askFor}`,
      type: "irregular",
      question: { verb: verb.infinitive, askFor },
      answer: answer.split("/")
    };
  }
  
  // gapfill
  const eligibleGapFills = gapFillSentences.filter(gf => tenses.includes(gf.tense));
  const gf = eligibleGapFills[Math.floor(Math.random() * eligibleGapFills.length)] || gapFillSentences[0];
  
  return {
    id: `gapfill:${gf.id}`,
    type: "gapfill",
    question: { template: gf.template, hint: gf.hint, verb: gf.verb },
    answer: gf.alternateAnswers ? [gf.answer, ...gf.alternateAnswers] : gf.answer
  };
}
