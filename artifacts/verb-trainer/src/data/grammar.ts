export type Subject = "I" | "you" | "he/she/it" | "we" | "they";

export type Tense =
  | "presentSimple"
  | "presentContinuous"
  | "presentPerfect"
  | "presentPerfectContinuous"
  | "pastSimple"
  | "pastContinuous"
  | "pastPerfect"
  | "pastPerfectContinuous"
  | "futureSimple"
  | "futureContinuous"
  | "futurePerfect"
  | "futurePerfectContinuous"
  | "presentSimplePassive"
  | "pastSimplePassive"
  | "presentPerfectPassive"
  | "pastPerfectPassive"
  | "futureSimplePassive";

const TENSE_LABELS: Record<Tense, string> = {
  presentSimple: "Present Simple",
  presentContinuous: "Present Continuous",
  presentPerfect: "Present Perfect",
  presentPerfectContinuous: "Present Perfect Continuous",
  pastSimple: "Past Simple",
  pastContinuous: "Past Continuous",
  pastPerfect: "Past Perfect",
  pastPerfectContinuous: "Past Perfect Continuous",
  futureSimple: "Future Simple",
  futureContinuous: "Future Continuous",
  futurePerfect: "Future Perfect",
  futurePerfectContinuous: "Future Perfect Continuous",
  presentSimplePassive: "Present Simple Passive",
  pastSimplePassive: "Past Simple Passive",
  presentPerfectPassive: "Present Perfect Passive",
  pastPerfectPassive: "Past Perfect Passive",
  futureSimplePassive: "Future Simple Passive",
};

/** Resolve a stable tense ID to its current display label. */
export function getTenseLabel(tense: Tense | string): string {
  return TENSE_LABELS[tense as Tense] ?? tense;
}

// PRIMARY filter: grammatical behaviour of the verb
// - dynamic: actions/processes — appear naturally in all tenses, can be progressive
// - stative: states — resist progressive; avoid bare-action frames
// - copular: linking verbs — require a complement (adjective/noun) in the frame
export type VerbBehavior = "dynamic" | "stative" | "copular";

// SECONDARY filter: transitivity
// - transitive:     requires a direct object ("she wrote [it / a letter]")
// - intransitive:   no object ("she slept", "they arrived")
// - ambitransitive: both ("she ate" or "she ate the pizza")
export type VerbTransitivity = "transitive" | "intransitive" | "ambitransitive";

// TERTIARY filter: semantic domain (optional, for topically coherent templates)
export type VerbDomain =
  | "motion"         // go, travel, walk, run, fly, drive
  | "creation"       // write, build, make, cook, design, draw
  | "communication"  // say, tell, speak, ask, explain, call
  | "mental"         // think, know, understand, believe, imagine
  | "consumption"    // eat, drink, buy, use, spend, read, watch
  | "physical"       // hit, break, cut, push, pull, carry, lift
  | "social"         // meet, help, visit, join, share, play
  | "change"         // become, grow, develop, improve, increase
  | "general";       // catch-all for verbs that span multiple domains
