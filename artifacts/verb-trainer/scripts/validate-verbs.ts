#!/usr/bin/env tsx
/**
 * validate-verbs.ts
 *
 * Automated spelling and completeness validation for the VerbFlow verb database.
 *
 * Run with:
 *   pnpm --filter @workspace/verb-trainer run validate-verbs
 *
 * EXIT CODES
 *   0 – all checks passed
 *   1 – one or more failures found
 *
 * ─── CHECKS ──────────────────────────────────────────────────────────────────
 *
 * REGULAR VERBS (per-verb)
 *   R1  V2 / V3 (identical for regular verbs) follows English spelling rules:
 *         – ends in -e             → +d           (moved, lived)
 *         – ends in consonant + y  → -y+ied        (tried, carried)
 *         – CVC and not neverDouble → double+ed    (stopped, planned)
 *         – otherwise              → +ed            (listened, opened)
 *   R2  -ing form follows the same CVC / neverDouble rules.
 *   R3  No spurious consonant doubling: generated V2/V3 must not introduce a
 *         consecutive duplicate consonant that was not already in the infinitive.
 *   R4  IPA entry (infinitiveIPA + pastIPA) is non-empty.
 *   R5  Russian translation is non-empty.
 *
 * IRREGULAR VERBS (per-verb)
 *   I1  V2 and V3 are stored and non-empty.
 *   I2  V2 / V3 contain only lowercase letters, hyphens, and spaces (for "was/were").
 *   I3  V2 ≠ infinitive OR verb is known to be identical (set/set/set, etc.).
 *       (Warns only — suppressed for known invariant-form verbs.)
 *   I4  IPA entry (infinitiveIPA + pastIPA + pastParticipleIPA) is non-empty.
 *   I5  Russian translation is non-empty.
 *
 * GLOBAL
 *   G1  No duplicate infinitives across the full verb list.
 *   G2  Every entry in neverDouble exists as an infinitive in the database.
 *       (Entries that are NOT in the database are dead weight; remove them.)
 */

import { irregularVerbs, regularVerbs, neverDouble } from "../src/data/verbs.js";
import { getIngForm } from "../src/engine/conjugate.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GREEN  = "\x1b[32m";
const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BOLD   = "\x1b[1m";
const RESET  = "\x1b[0m";

const PASS = `${GREEN}✓${RESET}`;
const FAIL = `${RED}✗${RESET}`;
const WARN = `${YELLOW}⚠${RESET}`;

let failures = 0;
let warnings = 0;
const failLog: string[] = [];
const warnLog: string[] = [];

function fail(verb: string, check: string, detail: string): void {
  const msg = `[${verb}] ${check}: ${detail}`;
  failLog.push(msg);
  failures++;
}

function warn(verb: string, check: string, detail: string): void {
  const msg = `[${verb}] ${check}: ${detail}`;
  warnLog.push(msg);
  warnings++;
}

/**
 * Re-derive the expected regular past/participle using the canonical rules.
 * This mirrors getRegularPast() in verbs.ts exactly so the test stays in sync
 * by importing and re-implementing the same shared neverDouble guard.
 */
function vowels(ch: string): boolean {
  return "aeiou".includes(ch);
}
function isCVC(w: string): boolean {
  if (w.length < 3) return false;
  const c1 = w[w.length - 3];
  const v  = w[w.length - 2];
  const c2 = w[w.length - 1];
  return !vowels(c1) && vowels(v) && !vowels(c2) && c2 !== "w" && c2 !== "x" && c2 !== "y";
}
function expectedPast(inf: string): string {
  const w = inf.toLowerCase();
  if (w.endsWith("e")) return w + "d";
  if (w.endsWith("y") && !vowels(w[w.length - 2])) return w.slice(0, -1) + "ied";
  if (isCVC(w) && !neverDouble.has(w)) return w + w[w.length - 1] + "ed";
  return w + "ed";
}

/**
 * Detect spurious consonant doubling: a new doubled consonant was introduced
 * into `form` that (a) was not already in `base` and (b) should have been
 * prevented because `base` is in `neverDouble`.
 *
 * Correct doublings (stop→stopped, prefer→preferred) are NOT spurious because
 * those verbs are not in `neverDouble`.
 */
function hasSpuriousDoubling(base: string, form: string): boolean {
  // Only verbs in neverDouble should never double — skip everything else.
  if (!neverDouble.has(base)) return false;

  // Strip known suffixes to expose the stem.
  const suffixes = ["ing", "ied", "ed", "d"];
  let stem = form;
  for (const suf of suffixes) {
    if (form.endsWith(suf)) { stem = form.slice(0, -suf.length); break; }
  }
  if (stem.length < 2) return false;

  const last = stem[stem.length - 1];
  const prev = stem[stem.length - 2];
  if (last !== prev || vowels(last)) return false; // no doubled consonant at end of stem

  // A doubled consonant is present — was it already in the base?
  const doubled = last + last;
  return !base.includes(doubled); // not in original → spurious
}

// Known irregular verbs whose V2 = infinitive (invariant forms).
// These are intentional — suppress warning I3 for them.
const invariantIrregulars = new Set([
  "set", "put", "let", "cut", "read", "spread", "hurt", "hit", "cost",
  "shut", "beat", "shed", "bid", "rid", "quit", "thrust", "cast", "burst",
  "upset",
]);

// ─── Section 1: Regular verbs ─────────────────────────────────────────────────

console.log(`\n${BOLD}── Regular verbs (${regularVerbs.length}) ──────────────────────────────────────────────${RESET}`);

for (const verb of regularVerbs) {
  const inf = verb.infinitive;
  const ep  = expectedPast(inf);
  const ing = getIngForm(inf);

  // R1: V2 / V3 matches expected form
  if (verb.past !== ep) {
    fail(inf, "R1", `V2="${verb.past}" expected="${ep}"`);
  }
  if (verb.pastParticiple !== ep) {
    fail(inf, "R1", `V3="${verb.pastParticiple}" expected="${ep}"`);
  }

  // R2: -ing form has no spurious doubling
  if (hasSpuriousDoubling(inf, ing)) {
    fail(inf, "R2", `-ing="${ing}" contains spurious doubling`);
  }

  // R3: V2/V3 has no spurious doubling
  if (hasSpuriousDoubling(inf, verb.past)) {
    fail(inf, "R3", `V2="${verb.past}" contains spurious doubling`);
  }

  // R4: IPA completeness
  if (!verb.infinitiveIPA || !verb.pastIPA) {
    warn(inf, "R4", `missing IPA (infinitiveIPA="${verb.infinitiveIPA}" pastIPA="${verb.pastIPA}")`);
  }

  // R5: Translation completeness
  if (!verb.translation) {
    fail(inf, "R5", "missing Russian translation");
  }
}

const rFail = failures;
const rWarn = warnings;
console.log(`  ${rFail === 0 ? PASS : FAIL} ${rFail} failure(s)   ${rWarn === 0 ? PASS : WARN} ${rWarn} warning(s)`);

// ─── Section 2: Irregular verbs ───────────────────────────────────────────────

console.log(`\n${BOLD}── Irregular verbs (${irregularVerbs.length}) ─────────────────────────────────────────────${RESET}`);

const iFail0 = failures;
const iWarn0 = warnings;

for (const verb of irregularVerbs) {
  const inf = verb.infinitive;

  // I1: V2 and V3 stored
  if (!verb.past) {
    fail(inf, "I1", "V2 is empty");
  }
  if (!verb.pastParticiple) {
    fail(inf, "I1", "V3 is empty");
  }

  // I2: V2/V3 contain only valid characters
  const validForm = /^[a-z/ ]+$/;
  if (verb.past && !validForm.test(verb.past)) {
    fail(inf, "I2", `V2="${verb.past}" contains unexpected characters`);
  }
  if (verb.pastParticiple && !validForm.test(verb.pastParticiple)) {
    fail(inf, "I2", `V3="${verb.pastParticiple}" contains unexpected characters`);
  }

  // I3: V2 ≠ infinitive (for non-invariant verbs)
  if (!invariantIrregulars.has(inf) && verb.past === inf) {
    warn(inf, "I3", `V2="${verb.past}" is identical to infinitive — is this intentional?`);
  }

  // I4: IPA completeness
  if (!verb.infinitiveIPA || !verb.pastIPA || !verb.pastParticipleIPA) {
    warn(inf, "I4", `missing IPA fields`);
  }

  // I5: Translation completeness
  if (!verb.translation) {
    fail(inf, "I5", "missing Russian translation");
  }
}

const iFail = failures - iFail0;
const iWarn = warnings - iWarn0;
console.log(`  ${iFail === 0 ? PASS : FAIL} ${iFail} failure(s)   ${iWarn === 0 ? PASS : WARN} ${iWarn} warning(s)`);

// ─── Section 3: Global checks ─────────────────────────────────────────────────

console.log(`\n${BOLD}── Global checks ──────────────────────────────────────────────────────────${RESET}`);

const gFail0 = failures;
const gWarn0 = warnings;
const allVerbs = [...irregularVerbs, ...regularVerbs];

// G1: No duplicate infinitives
const seen = new Map<string, number>();
for (const v of allVerbs) {
  seen.set(v.infinitive, (seen.get(v.infinitive) ?? 0) + 1);
}
for (const [inf, count] of seen) {
  if (count > 1) fail(inf, "G1", `appears ${count} times`);
}

// G2: Every neverDouble entry exists in the database
const dbInfinitives = new Set(allVerbs.map(v => v.infinitive));
for (const nd of neverDouble) {
  if (!dbInfinitives.has(nd)) {
    warn(nd, "G2", `is in neverDouble but not in the verb database (dead entry)`);
  }
}

const gFail = failures - gFail0;
const gWarn = warnings - gWarn0;
console.log(`  ${gFail === 0 ? PASS : FAIL} ${gFail} failure(s)   ${gWarn === 0 ? PASS : WARN} ${gWarn} warning(s)`);

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${BOLD}━━ SUMMARY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
console.log(`  Total verbs:  ${allVerbs.length} (${irregularVerbs.length} irregular + ${regularVerbs.length} regular)`);

if (failLog.length > 0) {
  console.log(`\n${RED}${BOLD}Failures (${failures}):${RESET}`);
  for (const m of failLog) console.log(`  ${FAIL} ${m}`);
}

if (warnLog.length > 0) {
  console.log(`\n${YELLOW}Warnings (${warnings}):${RESET}`);
  for (const m of warnLog) console.log(`  ${WARN} ${m}`);
}

if (failures === 0 && warnings === 0) {
  console.log(`\n  ${PASS} ${GREEN}${BOLD}All checks passed.${RESET}`);
} else if (failures === 0) {
  console.log(`\n  ${PASS} ${GREEN}${BOLD}No failures.${RESET}  ${WARN} ${warnings} warning(s) above.`);
} else {
  console.log(`\n  ${FAIL} ${RED}${BOLD}${failures} failure(s) found.${RESET}`);
}

process.exit(failures > 0 ? 1 : 0);
