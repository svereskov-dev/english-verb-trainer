import { Verb } from "../data/verbs";
import { Subject, Tense } from "../data/gapFillSentences";

export function getIngForm(verb: string): string {
  if (verb === "be") return "being";
  const v = verb.toLowerCase();
  if (v.endsWith("ie")) return v.slice(0, -2) + "ying";
  if (v.endsWith("e") && v !== "see" && v !== "flee" && v !== "agree") return v.slice(0, -1) + "ing";
  
  // Basic CVC check
  const vowels = "aeiou";
  if (v.length >= 3) {
    const c1 = v[v.length - 3];
    const v2 = v[v.length - 2];
    const c2 = v[v.length - 1];
    if (!vowels.includes(c1) && vowels.includes(v2) && !vowels.includes(c2) && c2 !== 'w' && c2 !== 'x' && c2 !== 'y') {
      return v + c2 + "ing";
    }
  }
  return v + "ing";
}

export function getThirdPerson(verb: string): string {
  if (verb === "be") return "is";
  if (verb === "have") return "has";
  const v = verb.toLowerCase();
  if (v.endsWith("y")) {
    const vowels = "aeiou";
    if (!vowels.includes(v[v.length - 2])) return v.slice(0, -1) + "ies";
  }
  if (v.endsWith("s") || v.endsWith("sh") || v.endsWith("ch") || v.endsWith("x") || v.endsWith("z") || v.endsWith("o")) {
    return v + "es";
  }
  return v + "s";
}

export function conjugate(verb: Verb, tense: Tense, subject: Subject): string {
  const isThirdPerson = subject === "he/she/it";
  const v = verb.infinitive;
  
  let bePresent = isThirdPerson ? "is" : (subject === "I" ? "am" : "are");
  let bePast = (subject === "I" || isThirdPerson) ? "was" : "were";
  let havePresent = isThirdPerson ? "has" : "have";

  switch (tense) {
    case "presentSimple":
      if (v === "be") return bePresent;
      return isThirdPerson ? getThirdPerson(v) : v;
    case "presentContinuous":
      return `${bePresent} ${getIngForm(v)}`;
    case "presentPerfect":
      return `${havePresent} ${verb.pastParticiple}`;
    case "presentPerfectContinuous":
      return `${havePresent} been ${getIngForm(v)}`;
    case "pastSimple":
      if (v === "be") return bePast;
      return verb.past;
    case "pastContinuous":
      return `${bePast} ${getIngForm(v)}`;
    case "pastPerfect":
      return `had ${verb.pastParticiple}`;
    case "pastPerfectContinuous":
      return `had been ${getIngForm(v)}`;
    case "futureSimple":
      return `will ${v}`;
    case "futureContinuous":
      return `will be ${getIngForm(v)}`;
    case "futurePerfect":
      return `will have ${verb.pastParticiple}`;
    case "futurePerfectContinuous":
      return `will have been ${getIngForm(v)}`;
    case "presentSimplePassive":
      return `${bePresent} ${verb.pastParticiple}`;
    case "pastSimplePassive":
      return `${bePast} ${verb.pastParticiple}`;
    case "presentPerfectPassive":
      return `${havePresent} been ${verb.pastParticiple}`;
    case "pastPerfectPassive":
      return `had been ${verb.pastParticiple}`;
    case "futureSimplePassive":
      return `will be ${verb.pastParticiple}`;
    default:
      return v;
  }
}
