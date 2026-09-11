export const FIRST_USE_KEY = "full_access_first_use_at";
export const LAST_AUTO_PAYWALL_KEY = "full_access_last_auto_paywall_at";

export const FIRST_PROMOTION_DELAY_MS = 48 * 60 * 60 * 1000;
export const PROMOTION_COOLDOWN_MS = 72 * 60 * 60 * 1000;

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function readTimestamp(storage: StorageLike, key: string): number | null {
  const value = Number(storage.getItem(key));
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function ensureFirstUseTimestamp(
  storage: StorageLike,
  now: number = Date.now(),
): number {
  const existing = readTimestamp(storage, FIRST_USE_KEY);
  if (existing !== null) return existing;
  storage.setItem(FIRST_USE_KEY, String(now));
  return now;
}

export function shouldShowAutomaticPaywall(options: {
  storage: StorageLike;
  now?: number;
  entitlementReady: boolean;
  hasFullAccess: boolean;
  onboardingComplete: boolean;
  shownThisLaunch: boolean;
  paywallOpen: boolean;
}): boolean {
  const now = options.now ?? Date.now();
  const firstUse = ensureFirstUseTimestamp(options.storage, now);
  if (!options.entitlementReady || options.hasFullAccess) return false;
  if (!options.onboardingComplete || options.shownThisLaunch || options.paywallOpen) return false;
  if (now - firstUse < FIRST_PROMOTION_DELAY_MS) return false;

  const lastShown = readTimestamp(options.storage, LAST_AUTO_PAYWALL_KEY);
  return lastShown === null || now - lastShown >= PROMOTION_COOLDOWN_MS;
}

export function recordAutomaticPaywallShown(
  storage: StorageLike,
  now: number = Date.now(),
): void {
  storage.setItem(LAST_AUTO_PAYWALL_KEY, String(now));
}