import { Tense, Subject, VerbBehavior, VerbTransitivity, VerbDomain } from "./grammar";

export interface ContextTemplate {
  id: string;
  // Sentence frame. Use {subject} for the grammatical subject (replaced at render time).
  // Passive templates may omit {subject} and use a hardcoded noun instead.
  frame: string;
  // Which tenses are grammatically valid for this frame
  tenses: Tense[];
  // Restrict to specific grammatical subjects (undefined = all five)
  subjects?: Subject[];
  // PRIMARY filter: which verb behaviours can fill the gap
  allowedBehaviors: VerbBehavior[];
  // SECONDARY filter: allowed transitivity (undefined = no restriction)
  allowedTransitivity?: VerbTransitivity[];
  // TERTIARY filter: allowed semantic domains (undefined = all domains)
  allowedDomains?: VerbDomain[];
}

export const contextTemplates: ContextTemplate[] = [

  // ─── COPULAR (10 templates) ───────────────────────────────────────────────
  // For: be, become, seem, appear
  // These frames require a complement (adjective / noun phrase) after the gap.
  {
    id: "cop-01",
    frame: "{subject} _____ very tired after the long journey.",
    tenses: ["pastSimple", "presentPerfect"],
    allowedBehaviors: ["copular"],
  },
  {
    id: "cop-02",
    frame: "{subject} _____ more confident with each passing day.",
    tenses: ["pastSimple", "presentPerfect", "futureSimple"],
    allowedBehaviors: ["copular"],
  },
  {
    id: "cop-03",
    frame: "{subject} _____ ready for whatever comes next.",
    tenses: ["pastSimple", "presentSimple", "futureSimple"],
    allowedBehaviors: ["copular"],
  },
  {
    id: "cop-04",
    frame: "By the time we arrived, {subject} _____ completely exhausted.",
    tenses: ["pastPerfect"],
    allowedBehaviors: ["copular"],
  },
  {
    id: "cop-05",
    frame: "{subject} _____ a different person after that experience.",
    tenses: ["pastSimple", "presentPerfect"],
    allowedBehaviors: ["copular"],
  },
  {
    id: "cop-06",
    frame: "One day, {subject} _____ a successful professional in their field.",
    tenses: ["futureSimple", "futurePerfect"],
    allowedBehaviors: ["copular"],
  },
  {
    id: "cop-07",
    frame: "{subject} _____ frustrated with the slow progress.",
    tenses: ["pastSimple", "presentSimple", "presentPerfect"],
    allowedBehaviors: ["copular"],
  },
  {
    id: "cop-08",
    frame: "After years of hard practice, {subject} _____ very skilled.",
    tenses: ["pastSimple", "presentPerfect"],
    allowedBehaviors: ["copular"],
  },
  {
    id: "cop-09",
    frame: "At first, {subject} _____ nervous, but then relaxed completely.",
    tenses: ["pastSimple"],
    allowedBehaviors: ["copular"],
  },
  {
    id: "cop-10",
    frame: "In a few years, {subject} _____ an expert in the field.",
    tenses: ["futureSimple"],
    allowedBehaviors: ["copular"],
  },

  // ─── STATIVE-MENTAL (8 templates) ────────────────────────────────────────
  // For: know, believe, understand, remember, imagine, realize, recognize, prefer, intend
  // Non-progressive tenses only — stative verbs resist the continuous aspect.
  {
    id: "sta-m-01",
    frame: "{subject} always _____ that honesty is the best policy.",
    tenses: ["presentSimple", "pastSimple"],
    allowedBehaviors: ["stative"],
    allowedDomains: ["mental"],
  },
  {
    id: "sta-m-02",
    frame: "For a long time, {subject} _____ the truth about what had happened.",
    tenses: ["pastSimple", "pastPerfect", "presentPerfect"],
    allowedBehaviors: ["stative"],
    allowedDomains: ["mental"],
  },
  {
    id: "sta-m-03",
    frame: "{subject} _____ exactly what to do in that situation.",
    tenses: ["presentSimple", "pastSimple", "pastPerfect"],
    allowedBehaviors: ["stative"],
    allowedDomains: ["mental"],
  },
  {
    id: "sta-m-04",
    frame: "Even now, {subject} _____ every detail of that day.",
    tenses: ["presentSimple", "presentPerfect"],
    allowedBehaviors: ["stative"],
    allowedDomains: ["mental"],
  },
  {
    id: "sta-m-05",
    frame: "{subject} _____ that something was wrong from the very beginning.",
    tenses: ["pastSimple", "pastPerfect"],
    allowedBehaviors: ["stative"],
    allowedDomains: ["mental"],
  },
  {
    id: "sta-m-06",
    frame: "It was only later that {subject} _____ what had really happened.",
    tenses: ["pastSimple"],
    allowedBehaviors: ["stative"],
    allowedDomains: ["mental"],
  },
  {
    id: "sta-m-07",
    frame: "{subject} _____ the answer straight away, without even thinking.",
    tenses: ["pastSimple", "presentSimple"],
    allowedBehaviors: ["stative"],
    allowedDomains: ["mental"],
  },
  {
    id: "sta-m-08",
    frame: "After reading the report, {subject} _____ the full picture.",
    tenses: ["pastSimple", "presentPerfect"],
    allowedBehaviors: ["stative"],
    allowedDomains: ["mental"],
  },

  // ─── STATIVE-GENERAL (7 templates) ───────────────────────────────────────
  // For: have, like, love, hate, need, prefer, contain, enjoy, own, care, feel, cost
  {
    id: "sta-g-01",
    frame: "{subject} _____ everything they needed for the journey.",
    tenses: ["pastSimple", "presentPerfect", "pastPerfect"],
    allowedBehaviors: ["stative"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "sta-g-02",
    frame: "{subject} always _____ the quieter option over the noisy one.",
    tenses: ["presentSimple", "pastSimple"],
    allowedBehaviors: ["stative"],
  },
  {
    id: "sta-g-03",
    frame: "At that point, {subject} _____ enough experience to handle it alone.",
    tenses: ["pastSimple", "pastPerfect"],
    allowedBehaviors: ["stative"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "sta-g-04",
    frame: "The box _____ all the tools needed for the repair.",
    tenses: ["pastSimple", "presentSimple"],
    subjects: ["he/she/it"],
    allowedBehaviors: ["stative"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "sta-g-05",
    frame: "{subject} _____ exactly what they were looking for.",
    tenses: ["pastSimple", "presentPerfect"],
    allowedBehaviors: ["stative"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "sta-g-06",
    frame: "{subject} _____ the outdoors more than anything else.",
    tenses: ["presentSimple", "pastSimple"],
    allowedBehaviors: ["stative"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "sta-g-07",
    frame: "{subject} _____ the perfect opportunity to prove everyone wrong.",
    tenses: ["pastSimple", "presentPerfect"],
    allowedBehaviors: ["stative"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },

  // ─── DYNAMIC · PRESENT (6 templates) ─────────────────────────────────────
  {
    id: "dyn-pr-01",
    frame: "Every morning, {subject} _____ for at least thirty minutes.",
    tenses: ["presentSimple"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-pr-02",
    frame: "{subject} _____ very hard these days.",
    tenses: ["presentSimple", "presentContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-pr-03",
    frame: "Right now, {subject} _____ in the next room.",
    tenses: ["presentContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-pr-04",
    frame: "{subject} _____ a lot lately.",
    tenses: ["presentSimple", "presentContinuous", "presentPerfect"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-pr-05",
    frame: "{subject} _____ here every single week without fail.",
    tenses: ["presentSimple"],
    allowedBehaviors: ["dynamic"],
  },
  {
    id: "dyn-pr-06",
    frame: "At this very moment, {subject} _____ while listening to music.",
    tenses: ["presentContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },

  // ─── DYNAMIC · PAST (8 templates) ────────────────────────────────────────
  {
    id: "dyn-pa-01",
    frame: "Last week, {subject} _____ more than usual.",
    tenses: ["pastSimple", "pastContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-pa-02",
    frame: "Yesterday, {subject} _____ for the very first time.",
    tenses: ["pastSimple"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-pa-03",
    frame: "When we were young, {subject} _____ together all the time.",
    tenses: ["pastSimple", "pastContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-pa-04",
    frame: "Back then, {subject} _____ every single day without exception.",
    tenses: ["pastSimple", "pastContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-pa-05",
    frame: "While I was away, {subject} _____ the whole time.",
    tenses: ["pastContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-pa-06",
    frame: "In those days, {subject} _____ much more than today.",
    tenses: ["pastSimple", "pastContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-pa-07",
    frame: "At this time last year, {subject} _____ almost every day.",
    tenses: ["pastSimple", "pastContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-pa-08",
    frame: "In the evenings, {subject} _____ to unwind after a long day.",
    tenses: ["pastSimple", "presentSimple"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },

  // ─── DYNAMIC · PERFECT & CONTINUOUS (5 templates) ────────────────────────
  {
    id: "dyn-pf-01",
    frame: "So far, {subject} _____ this many times before.",
    tenses: ["presentPerfect"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-pf-02",
    frame: "Since moving to the new city, {subject} _____ quite a bit.",
    tenses: ["presentPerfect", "presentPerfectContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-pf-03",
    frame: "By the time they arrived, {subject} _____ for several hours.",
    tenses: ["pastPerfectContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-pf-04",
    frame: "{subject} _____ for the past three hours without a single break.",
    tenses: ["presentPerfectContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-pf-05",
    frame: "When the power went out, {subject} _____ for over an hour.",
    tenses: ["pastPerfectContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },

  // ─── DYNAMIC · FUTURE (5 templates) ──────────────────────────────────────
  {
    id: "dyn-fu-01",
    frame: "Next year, {subject} _____ much more than ever before.",
    tenses: ["futureSimple"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-fu-02",
    frame: "By this time next week, {subject} _____ in a completely new place.",
    tenses: ["futureContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-fu-03",
    frame: "By the end of the month, {subject} _____ everything at least once.",
    tenses: ["futurePerfect"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-fu-04",
    frame: "In ten years, {subject} _____ for a very long time.",
    tenses: ["futurePerfectContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-fu-05",
    frame: "This time tomorrow, {subject} _____ and not thinking about work.",
    tenses: ["futureContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },

  // ─── DYNAMIC · TRANSITIVE (object in frame, 10 templates) ────────────────
  // For dynamic verbs that naturally take a direct object.
  {
    id: "dyn-tr-01",
    frame: "{subject} _____ it in just a few minutes.",
    tenses: ["pastSimple", "pastPerfect", "presentPerfect", "futureSimple"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "dyn-tr-02",
    frame: "{subject} _____ everything before the deadline.",
    tenses: ["pastSimple", "pastPerfect", "futurePerfect"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "dyn-tr-03",
    frame: "At last, {subject} _____ everything on the list.",
    tenses: ["pastSimple", "pastPerfect", "presentPerfect"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "dyn-tr-04",
    frame: "{subject} _____ something very important that day.",
    tenses: ["pastSimple", "pastPerfect", "pastContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "dyn-tr-05",
    frame: "{subject} _____ it carefully before making any decision.",
    tenses: ["pastSimple", "pastPerfect", "presentPerfect"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "dyn-tr-06",
    frame: "By that point, {subject} _____ everything they needed.",
    tenses: ["pastPerfect", "futurePerfect"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "dyn-tr-07",
    frame: "{subject} _____ it before the end of the week.",
    tenses: ["futureSimple", "futurePerfect"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "dyn-tr-08",
    frame: "{subject} _____ the whole thing in a single afternoon.",
    tenses: ["pastSimple", "presentPerfect"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "dyn-tr-09",
    frame: "In the end, {subject} _____ the right thing.",
    tenses: ["pastSimple", "presentPerfect"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "dyn-tr-10",
    frame: "{subject} _____ something unusual that nobody else had noticed.",
    tenses: ["pastSimple", "pastPerfect"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },

  // ─── DYNAMIC · INTRANSITIVE (8 templates) ────────────────────────────────
  {
    id: "dyn-in-01",
    frame: "{subject} _____ as fast as they possibly could.",
    tenses: ["pastSimple", "pastContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive"],
  },
  {
    id: "dyn-in-02",
    frame: "{subject} _____ quietly in the corner for a while.",
    tenses: ["pastSimple", "pastContinuous", "pastPerfect"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive"],
  },
  {
    id: "dyn-in-03",
    frame: "In the morning, {subject} _____ for about an hour.",
    tenses: ["pastSimple", "pastContinuous", "presentSimple"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-in-04",
    frame: "{subject} _____ when they heard the unexpected news.",
    tenses: ["pastSimple"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive"],
    allowedDomains: ["social", "general", "physical"],
  },
  {
    id: "dyn-in-05",
    frame: "{subject} _____ well that night despite everything.",
    tenses: ["pastSimple"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive"],
    allowedDomains: ["general", "physical"],
  },
  {
    id: "dyn-in-06",
    frame: "{subject} _____ patiently for over an hour.",
    tenses: ["pastSimple", "pastContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive"],
    allowedDomains: ["general", "social"],
  },
  {
    id: "dyn-in-07",
    frame: "Every evening, {subject} _____ to relax after a long day.",
    tenses: ["presentSimple", "pastSimple"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "dyn-in-08",
    frame: "At the competition, {subject} _____ better than anyone expected.",
    tenses: ["pastSimple", "presentPerfect"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
    allowedDomains: ["physical", "social", "general", "motion"],
  },

  // ─── MOTION-SPECIFIC (8 templates) ───────────────────────────────────────
  // For: go, come, travel, walk, run, fly, drive, ride, move, return, escape, etc.
  {
    id: "mot-01",
    frame: "Yesterday, {subject} _____ to the city centre.",
    tenses: ["pastSimple"],
    allowedBehaviors: ["dynamic"],
    allowedDomains: ["motion"],
  },
  {
    id: "mot-02",
    frame: "Last summer, {subject} _____ across three different countries.",
    tenses: ["pastSimple", "pastContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedDomains: ["motion"],
  },
  {
    id: "mot-03",
    frame: "Every weekend, {subject} _____ to the local market.",
    tenses: ["presentSimple"],
    allowedBehaviors: ["dynamic"],
    allowedDomains: ["motion"],
  },
  {
    id: "mot-04",
    frame: "When {subject} _____ home, dinner was already on the table.",
    tenses: ["pastSimple"],
    allowedBehaviors: ["dynamic"],
    allowedDomains: ["motion"],
  },
  {
    id: "mot-05",
    frame: "Next month, {subject} _____ to a much bigger city.",
    tenses: ["futureSimple"],
    allowedBehaviors: ["dynamic"],
    allowedDomains: ["motion"],
  },
  {
    id: "mot-06",
    frame: "By the time we called, {subject} _____ already.",
    tenses: ["pastPerfect"],
    allowedBehaviors: ["dynamic"],
    allowedDomains: ["motion"],
  },
  {
    id: "mot-07",
    frame: "For hours, {subject} _____ through the forest without stopping.",
    tenses: ["pastContinuous", "pastPerfectContinuous"],
    allowedBehaviors: ["dynamic"],
    allowedDomains: ["motion"],
  },
  {
    id: "mot-08",
    frame: "Before long, {subject} _____ to a new location entirely.",
    tenses: ["pastSimple", "futurePerfect"],
    allowedBehaviors: ["dynamic"],
    allowedDomains: ["motion"],
  },

  // ─── COMMUNICATION-SPECIFIC (5 templates) ────────────────────────────────
  // For: say, tell, speak, ask, explain, call, describe, mention, discuss, etc.
  {
    id: "com-01",
    frame: "{subject} _____ something very important to the whole group.",
    tenses: ["pastSimple", "presentPerfect"],
    allowedBehaviors: ["dynamic"],
    allowedDomains: ["communication"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "com-02",
    frame: "Earlier today, {subject} _____ about the upcoming changes.",
    tenses: ["pastSimple"],
    allowedBehaviors: ["dynamic"],
    allowedDomains: ["communication"],
    allowedTransitivity: ["intransitive", "ambitransitive"],
  },
  {
    id: "com-03",
    frame: "In the meeting, {subject} _____ the new strategy to everyone.",
    tenses: ["pastSimple"],
    allowedBehaviors: ["dynamic"],
    allowedDomains: ["communication"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "com-04",
    frame: "{subject} _____ the whole story from beginning to end.",
    tenses: ["pastSimple", "presentPerfect"],
    allowedBehaviors: ["dynamic"],
    allowedDomains: ["communication"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "com-05",
    frame: "By the time the meeting ended, {subject} _____ everything.",
    tenses: ["pastPerfect"],
    allowedBehaviors: ["dynamic"],
    allowedDomains: ["communication"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },

  // ─── CREATION-SPECIFIC (5 templates) ─────────────────────────────────────
  // For: write, build, make, design, draw, cook, create, produce, publish, etc.
  {
    id: "cre-01",
    frame: "Over the summer, {subject} _____ something truly impressive.",
    tenses: ["pastSimple", "pastContinuous", "presentPerfect"],
    allowedBehaviors: ["dynamic"],
    allowedDomains: ["creation"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "cre-02",
    frame: "{subject} _____ it completely from scratch in under a week.",
    tenses: ["pastSimple", "pastPerfect"],
    allowedBehaviors: ["dynamic"],
    allowedDomains: ["creation"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "cre-03",
    frame: "Next year, {subject} _____ a new version of the whole project.",
    tenses: ["futureSimple"],
    allowedBehaviors: ["dynamic"],
    allowedDomains: ["creation"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "cre-04",
    frame: "{subject} _____ something original every single month.",
    tenses: ["presentSimple"],
    allowedBehaviors: ["dynamic"],
    allowedDomains: ["creation"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "cre-05",
    frame: "By the deadline, {subject} _____ everything that was required.",
    tenses: ["futurePerfect", "pastPerfect"],
    allowedBehaviors: ["dynamic"],
    allowedDomains: ["creation"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },

  // ─── PASSIVE (6 templates) ────────────────────────────────────────────────
  // No {subject} in frame — the noun is embedded. `subjects` controls conjugation.
  {
    id: "pas-01",
    frame: "The report _____ last week.",
    tenses: ["pastSimplePassive"],
    subjects: ["he/she/it"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "pas-02",
    frame: "The package _____ before we even arrived.",
    tenses: ["pastPerfectPassive"],
    subjects: ["he/she/it"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "pas-03",
    frame: "These forms _____ every month by the administration.",
    tenses: ["presentSimplePassive"],
    subjects: ["they"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "pas-04",
    frame: "The decision _____ by the committee yesterday.",
    tenses: ["pastSimplePassive", "presentPerfectPassive"],
    subjects: ["he/she/it"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "pas-05",
    frame: "The results _____ by the end of the week.",
    tenses: ["futureSimplePassive"],
    subjects: ["they"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
  {
    id: "pas-06",
    frame: "The project _____ since the beginning of last year.",
    tenses: ["presentPerfectPassive"],
    subjects: ["he/she/it"],
    allowedBehaviors: ["dynamic"],
    allowedTransitivity: ["transitive", "ambitransitive"],
  },
];
