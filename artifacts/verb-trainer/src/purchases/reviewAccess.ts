export const REVIEW_ACCESS_STORAGE_KEY = "verbflow_review_access_enabled_v1";
export const REVIEW_ACCESS_CODE_SHA256 =
  "a2b288966f51acca21f753aee978e836360a080f99c9840b3080618f457a936c";

export const REVIEW_ACCESS_TAP_COUNT = 5;
export const REVIEW_ACCESS_TAP_WINDOW_MS = 5_000;

export interface ReviewAccessStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ReviewAccessTapState {
  count: number;
  startedAt: number | null;
}

export const EMPTY_REVIEW_ACCESS_TAP_STATE: ReviewAccessTapState = {
  count: 0,
  startedAt: null,
};

export interface ReviewAccessTapResult {
  state: ReviewAccessTapState;
  shouldOpen: boolean;
}

export function registerReviewAccessTap(
  current: ReviewAccessTapState,
  now: number,
): ReviewAccessTapResult {
  const sequenceExpired =
    current.startedAt === null ||
    now - current.startedAt > REVIEW_ACCESS_TAP_WINDOW_MS;
  const startedAt = sequenceExpired ? now : current.startedAt;
  const count = sequenceExpired ? 1 : current.count + 1;

  if (count >= REVIEW_ACCESS_TAP_COUNT) {
    return {
      state: EMPTY_REVIEW_ACCESS_TAP_STATE,
      shouldOpen: true,
    };
  }

  return {
    state: { count, startedAt },
    shouldOpen: false,
  };
}

export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hashesMatch(left: string, right: string): boolean {
  if (left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export async function verifyReviewAccessCode(
  candidate: string,
  expectedHash = REVIEW_ACCESS_CODE_SHA256,
): Promise<boolean> {
  const candidateHash = await sha256Hex(candidate.trim());
  return hashesMatch(candidateHash, expectedHash);
}

export function isReviewAccessEnabled(storage: ReviewAccessStorage): boolean {
  try {
    return storage.getItem(REVIEW_ACCESS_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function persistReviewAccess(storage: ReviewAccessStorage): void {
  storage.setItem(REVIEW_ACCESS_STORAGE_KEY, "1");
}

export function resolveFullAccessEntitlement(
  googlePlayPurchaseEntitlement: boolean,
  reviewAccessOverride: boolean,
): boolean {
  return googlePlayPurchaseEntitlement || reviewAccessOverride;
}