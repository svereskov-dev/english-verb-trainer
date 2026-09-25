import { describe, expect, it } from "vitest";
import { SessionConfig } from "../engine/exercises";
import { resolveTrainingSelection } from "../purchases/access";
import {
  applyPurchaseOutcome,
  PurchaseSnapshot,
} from "../purchases/googlePlayPurchases";
import {
  EMPTY_REVIEW_ACCESS_TAP_STATE,
  isReviewAccessEnabled,
  persistReviewAccess,
  registerReviewAccessTap,
  resolveFullAccessEntitlement,
  REVIEW_ACCESS_STORAGE_KEY,
  REVIEW_ACCESS_TAP_WINDOW_MS,
  sha256Hex,
  verifyReviewAccessCode,
} from "../purchases/reviewAccess";

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const purchaseSnapshot: PurchaseSnapshot = {
  entitlementReady: true,
  billingAvailable: true,
  hasFullAccess: false,
  localizedPrice: "€4.99",
  status: "ready",
  message: null,
};

const freeConfig: SessionConfig = {
  id: "ps-all",
  selectedIds: ["ps-all"],
  exerciseTypes: ["verbform"],
  verbPool: "all",
  tenses: ["presentSimple"],
  contextEnabled: false,
  letterBuilderEnabled: true,
};

const premiumConfig: SessionConfig = {
  ...freeConfig,
  id: "perf-pres",
  selectedIds: ["perf-pres"],
  tenses: ["presentPerfect"],
};

describe("review access hidden trigger", () => {
  it("does not open for fewer than five taps", () => {
    let state = EMPTY_REVIEW_ACCESS_TAP_STATE;
    for (let count = 0; count < 4; count += 1) {
      const result = registerReviewAccessTap(state, 1_000 + count * 500);
      expect(result.shouldOpen).toBe(false);
      state = result.state;
    }
  });

  it("opens on the fifth tap within five seconds and resets", () => {
    let state = EMPTY_REVIEW_ACCESS_TAP_STATE;
    let result = registerReviewAccessTap(state, 1_000);
    state = result.state;

    for (let count = 1; count < 5; count += 1) {
      result = registerReviewAccessTap(state, 1_000 + count * 1_000);
      state = result.state;
    }

    expect(result.shouldOpen).toBe(true);
    expect(result.state).toEqual(EMPTY_REVIEW_ACCESS_TAP_STATE);
  });

  it("expires and restarts the sequence after the timeout", () => {
    let result = registerReviewAccessTap(EMPTY_REVIEW_ACCESS_TAP_STATE, 1_000);
    for (let count = 1; count < 4; count += 1) {
      result = registerReviewAccessTap(result.state, 1_000 + count * 500);
    }

    result = registerReviewAccessTap(
      result.state,
      1_000 + REVIEW_ACCESS_TAP_WINDOW_MS + 1,
    );
    expect(result.shouldOpen).toBe(false);
    expect(result.state.count).toBe(1);
  });
});

describe("review access verification and persistence", () => {
  it("rejects an incorrect code", async () => {
    const fixtureHash = await sha256Hex("test-only-correct-value");
    expect(await verifyReviewAccessCode("wrong-value", fixtureHash)).toBe(false);
  });

  it("accepts a matching hash without exposing the production code", async () => {
    const fixtureValue = "test-only-correct-value";
    const fixtureHash = await sha256Hex(fixtureValue);
    expect(await verifyReviewAccessCode(fixtureValue, fixtureHash)).toBe(true);
  });

  it("survives persistence reconstruction", () => {
    const storage = new MemoryStorage();
    persistReviewAccess(storage);

    expect(storage.getItem(REVIEW_ACCESS_STORAGE_KEY)).toBe("1");
    expect(isReviewAccessEnabled(storage)).toBe(true);
  });
});

describe("review access entitlement isolation", () => {
  it("unlocks the same premium selection check as real Full Access", () => {
    const hasFullAccess = resolveFullAccessEntitlement(false, true);
    expect(resolveTrainingSelection(freeConfig, premiumConfig, hasFullAccess)).toEqual({
      config: premiumConfig,
      openPaywall: false,
    });
  });

  it("does not mutate Google Play purchase state", () => {
    const storage = new MemoryStorage();
    const before = { ...purchaseSnapshot };

    persistReviewAccess(storage);

    expect(purchaseSnapshot).toEqual(before);
    expect(purchaseSnapshot.hasFullAccess).toBe(false);
  });

  it("keeps genuine Google Play ownership valid independently", () => {
    const purchased = applyPurchaseOutcome(purchaseSnapshot, "successful");
    expect(resolveFullAccessEntitlement(purchased.hasFullAccess, false)).toBe(true);
  });

  it("leaves normal users without either entitlement unaffected", () => {
    expect(resolveFullAccessEntitlement(false, false)).toBe(false);
    expect(resolveTrainingSelection(freeConfig, premiumConfig, false)).toEqual({
      config: freeConfig,
      openPaywall: true,
    });
  });
});