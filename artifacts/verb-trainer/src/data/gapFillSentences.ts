export type Subject = "I" | "you" | "he/she/it" | "we" | "they";
export type Tense = "presentSimple" | "presentContinuous" | "presentPerfect" | "presentPerfectContinuous" | "pastSimple" | "pastContinuous" | "pastPerfect" | "pastPerfectContinuous" | "futureSimple" | "futureContinuous" | "futurePerfect" | "futurePerfectContinuous" | "presentSimplePassive" | "pastSimplePassive" | "presentPerfectPassive" | "pastPerfectPassive" | "futureSimplePassive";

export interface GapFillSentence {
  id: string;
  template: string;
  hint: string;
  verb: string;
  tense: Tense;
  subject: Subject;
  answer: string;
  alternateAnswers?: string[];
}

export const gapFillSentences: GapFillSentence[] = [
  { id: "gf1", template: "Yesterday I _____ to the store.", hint: "(go)", verb: "go", tense: "pastSimple", subject: "I", answer: "went" },
  { id: "gf2", template: "She _____ breakfast right now.", hint: "(cook)", verb: "cook", tense: "presentContinuous", subject: "he/she/it", answer: "is cooking" },
  { id: "gf3", template: "They _____ in this house for ten years.", hint: "(live)", verb: "live", tense: "presentPerfect", subject: "they", answer: "have lived" },
  { id: "gf4", template: "I _____ the report by tomorrow.", hint: "(finish)", verb: "finish", tense: "futurePerfect", subject: "I", answer: "will have finished" },
  { id: "gf5", template: "We _____ TV when the phone rang.", hint: "(watch)", verb: "watch", tense: "pastContinuous", subject: "we", answer: "were watching" },
  // ... adding enough for a basic set.
];

// Add more procedural gap fills for completeness
const subjects: Subject[] = ["I", "you", "he/she/it", "we", "they"];
const sentences = [
  { tmpl: "By the time we arrived, they _____ the pizza.", v: "eat", t: "pastPerfect", a: "had eaten" },
  { tmpl: "Next year, I _____ to Japan.", v: "travel", t: "futureSimple", a: "will travel" },
  { tmpl: "The letter _____ yesterday.", v: "send", t: "pastSimplePassive", a: "was sent" },
  { tmpl: "My car _____ right now.", v: "repair", t: "presentContinuous", a: "is repairing", isPassive: true } // just for testing structure
];

let counter = 6;
for (const s of sentences) {
  gapFillSentences.push({
    id: `gf${counter++}`,
    template: s.tmpl,
    hint: `(${s.v})`,
    verb: s.v,
    tense: s.t as Tense,
    subject: "I", // simplified
    answer: s.a
  });
}
