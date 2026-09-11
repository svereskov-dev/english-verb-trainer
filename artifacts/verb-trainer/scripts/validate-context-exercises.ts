import recordsJson from "../src/data/contextExercises.json";
import {
  CONTEXT_TENSES,
  type ContextPracticeTarget,
  type ContextTense,
} from "../src/data/contextExercises";
import { verbs } from "../src/data/verbs";
import { conjugate } from "../src/engine/conjugate";
import type { Subject } from "../src/data/grammar";

type RawRecord = {
  id?: unknown;
  verb?: unknown;
  tense?: unknown;
  subject?: unknown;
  sentence?: unknown;
  expectedAnswer?: unknown;
  practiceTargets?: unknown;
  notRecommended?: unknown;
  reason?: unknown;
};

const records = recordsJson as RawRecord[];
const tenseSet = new Set<string>(CONTEXT_TENSES);
const targetSet = new Set<string>([...CONTEXT_TENSES, "v2", "v3"]);
const verbByInfinitive = new Map(verbs.map((verb) => [verb.infinitive, verb]));

const pluralSubjects = new Set([
  "balloons",
  "blankets",
  "higher shipping costs",
  "nettles",
  "people",
  "prices",
  "rabbits",
  "the last clouds",
  "the plants",
  "the repairs",
  "the shutters",
  "the students",
  "the totals",
  "their answers",
  "their choices",
  "their opinions",
  "those words",
  "wet leaves",
]);

function grammarSubject(subject: string): Subject {
  if (subject === "I") return "I";
  if (subject === "we") return "we";
  if (subject === "they" || pluralSubjects.has(subject)) return "they";
  return "he/she/it";
}

const duplicateIds: string[] = [];
const unknownVerbs: string[] = [];
const invalidTenses: string[] = [];
const invalidPracticeTargets: string[] = [];
const v2v3Inconsistencies: string[] = [];
const formInconsistencies: string[] = [];
const invalidActiveRecords: string[] = [];
const invalidUnavailableRecords: string[] = [];
const seenIds = new Set<string>();

for (const record of records) {
  const id = typeof record.id === "string" ? record.id : "<missing-id>";
  if (seenIds.has(id)) duplicateIds.push(id);
  seenIds.add(id);

  if (typeof record.verb !== "string" || !verbByInfinitive.has(record.verb)) {
    unknownVerbs.push(id);
  }
  if (typeof record.tense !== "string" || !tenseSet.has(record.tense)) {
    invalidTenses.push(id);
  }
  if (
    !Array.isArray(record.practiceTargets) ||
    record.practiceTargets.length === 0 ||
    record.practiceTargets.some(
      (target) => typeof target !== "string" || !targetSet.has(target),
    ) ||
    record.practiceTargets[0] !== record.tense
  ) {
    invalidPracticeTargets.push(id);
  }

  const unavailable = record.notRecommended === true;
  if (unavailable) {
    if (
      typeof record.id !== "string" ||
      typeof record.verb !== "string" ||
      typeof record.tense !== "string" ||
      typeof record.subject !== "string" ||
      !Array.isArray(record.practiceTargets) ||
      typeof record.reason !== "string" ||
      "sentence" in record ||
      "expectedAnswer" in record
    ) {
      invalidUnavailableRecords.push(id);
    }
    continue;
  }

  if (
    typeof record.sentence !== "string" ||
    typeof record.expectedAnswer !== "string" ||
    typeof record.subject !== "string" ||
    (record.sentence.match(/_____/g) ?? []).length !== 1
  ) {
    invalidActiveRecords.push(id);
    continue;
  }

  const verb = typeof record.verb === "string"
    ? verbByInfinitive.get(record.verb)
    : undefined;
  const tense = typeof record.tense === "string" && tenseSet.has(record.tense)
    ? (record.tense as ContextTense)
    : undefined;
  if (!verb || !tense) continue;

  const expected = conjugate(verb, tense, grammarSubject(record.subject));
  if (record.expectedAnswer !== expected) {
    formInconsistencies.push(`${id}: "${record.expectedAnswer}" != "${expected}"`);
  }

  const targets = record.practiceTargets as ContextPracticeTarget[];
  if (targets.includes("v2") && (!verb.isIrregular || tense !== "pastSimple")) {
    v2v3Inconsistencies.push(`${id}: invalid v2 target`);
  }
  if (
    targets.includes("v3") &&
    (!verb.isIrregular ||
      !["pastPerfect", "presentPerfect", "futurePerfect"].includes(tense))
  ) {
    v2v3Inconsistencies.push(`${id}: invalid v3 target`);
  }
  if (
    verb.isIrregular &&
    tense === "pastSimple" &&
    !targets.includes("v2")
  ) {
    v2v3Inconsistencies.push(`${id}: missing v2 target`);
  }
  if (
    verb.isIrregular &&
    ["pastPerfect", "presentPerfect", "futurePerfect"].includes(tense) &&
    !targets.includes("v3")
  ) {
    v2v3Inconsistencies.push(`${id}: missing v3 target`);
  }
}

const representedVerbs = new Set(
  records.flatMap((record) =>
    typeof record.verb === "string" ? [record.verb] : []
  ),
);
const missingVerbs = verbs
  .filter((verb) => !representedVerbs.has(verb.infinitive))
  .map((verb) => verb.infinitive);
const active = records.filter((record) => record.notRecommended !== true).length;
const unavailable = records.length - active;

const report = {
  totalRecords: records.length,
  active,
  notRecommended: unavailable,
  uniqueVerbs: representedVerbs.size,
  dictionaryVerbs: verbs.length,
  missingVerbs,
  duplicateIds,
  unknownVerbs,
  invalidTenses,
  invalidPracticeTargets,
  v2v3Inconsistencies,
  formInconsistencies,
  invalidActiveRecords,
  invalidUnavailableRecords,
};

console.log(JSON.stringify(report, null, 2));

if (
  missingVerbs.length ||
  duplicateIds.length ||
  unknownVerbs.length ||
  invalidTenses.length ||
  invalidPracticeTargets.length ||
  v2v3Inconsistencies.length ||
  formInconsistencies.length ||
  invalidActiveRecords.length ||
  invalidUnavailableRecords.length
) {
  process.exitCode = 1;
}