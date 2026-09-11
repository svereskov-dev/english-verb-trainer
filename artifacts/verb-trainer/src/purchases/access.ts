import { SessionConfig } from "../engine/exercises";
import { Tense } from "../data/grammar";

export const FULL_ACCESS_PRODUCT_ID = "full_access";

const FREE_TENSES = new Set<Tense>([
  "presentSimple",
  "pastSimple",
  "futureSimple",
]);

export function isMistakesReviewConfig(config: SessionConfig): boolean {
  return config.id === "mistake-review"
    || config.mistakesOnly === true
    || config.selectedIds?.includes("mistakes");
}

export function isPremiumSessionConfig(config: SessionConfig): boolean {
  if (isMistakesReviewConfig(config)) return false;
  if (config.exerciseTypes.includes("irregular") || config.irregularForm) return true;
  if (!config.tenses?.length) return true;
  return config.tenses.some(tense => !FREE_TENSES.has(tense));
}

export function canAccessSessionConfig(
  config: SessionConfig,
  hasFullAccess: boolean,
): boolean {
  return hasFullAccess || !isPremiumSessionConfig(config);
}

export function resolveTrainingSelection(
  current: SessionConfig,
  requested: SessionConfig,
  hasFullAccess: boolean,
): { config: SessionConfig; openPaywall: boolean } {
  return canAccessSessionConfig(requested, hasFullAccess)
    ? { config: requested, openPaywall: false }
    : { config: current, openPaywall: true };
}

export function resolveRestoredSession(
  restored: SessionConfig,
  freeFallback: SessionConfig,
  hasFullAccess: boolean,
): SessionConfig {
  return canAccessSessionConfig(restored, hasFullAccess) ? restored : freeFallback;
}