import { describe, expect, it } from "vitest";
import { SessionConfig } from "../engine/exercises";
import {
  isPremiumSessionConfig,
  resolveRestoredSession,
  resolveTrainingSelection,
} from "../purchases/access";
import {
  applyPurchaseOutcome,
  PurchaseSnapshot,
} from "../purchases/googlePlayPurchases";
import {
  FIRST_PROMOTION_DELAY_MS,
  LAST_AUTO_PAYWALL_KEY,
  PROMOTION_COOLDOWN_MS,
  shouldShowAutomaticPaywall,
} from "../purchases/paywallSchedule";
import { getPaywallPriceLine } from "../components/FullAccessPaywall";

function config(overrides: Partial<SessionConfig> = {}): SessionConfig {
  return {
    id: "ps-all",
    selectedIds: ["ps-all"],
    exerciseTypes: ["verbform"],
    verbPool: "all",
    tenses: ["presentSimple"],
    contextEnabled: false,
    letterBuilderEnabled: true,
    ...overrides,
  };
}

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const purchaseSnapshot: PurchaseSnapshot = {
  entitlementReady: true,
  billingAvailable: true,
  hasFullAccess: false,
  localizedPrice: "₽499",
  status: "ready",
  message: null,
};

describe("semantic Full Access rules", () => {
  it.each(["presentSimple", "pastSimple", "futureSimple"] as const)("%s is free", tense => {
    expect(isPremiumSessionConfig(config({ tenses: [tense] }))).toBe(false);
  });

  it.each([
    "presentContinuous", "pastContinuous", "futureContinuous",
    "presentPerfect", "pastPerfect", "futurePerfect",
    "presentPerfectContinuous", "pastPerfectContinuous", "futurePerfectContinuous",
  ] as const)("%s is premium", tense => {
    expect(isPremiumSessionConfig(config({ tenses: [tense] }))).toBe(true);
  });

  it.each(["past", "pastParticiple", "mixed"] as const)("irregular %s is premium", irregularForm => {
    expect(isPremiumSessionConfig(config({
      exerciseTypes: ["irregular"],
      irregularForm,
      tenses: undefined,
    }))).toBe(true);
  });

  it("Full Conjugation and mixed premium configurations are premium", () => {
    expect(isPremiumSessionConfig(config({ id: "full-all", tenses: undefined }))).toBe(true);
    expect(isPremiumSessionConfig(config({ tenses: ["presentSimple", "pastPerfect"] }))).toBe(true);
  });

  it("Context and Letter Builder do not change access", () => {
    expect(isPremiumSessionConfig(config({ contextEnabled: true }))).toBe(false);
    expect(isPremiumSessionConfig(config({ letterBuilderEnabled: false }))).toBe(false);
  });

  it("Mistakes Review stays free, including premium-origin exact IDs", () => {
    expect(isPremiumSessionConfig(config({
      id: "mistake-review",
      selectedIds: ["mistakes"],
      mistakesOnly: true,
      reviewMistakeIds: ["gapfill:pastPerfect:write:they:dyn-pa-01"],
      tenses: ["pastPerfect"],
    }))).toBe(false);
  });

  it("a locked selection opens the paywall without changing current config", () => {
    const current = config();
    const result = resolveTrainingSelection(
      current,
      config({ id: "perf-pres", tenses: ["presentPerfect"] }),
      false,
    );
    expect(result).toEqual({ config: current, openPaywall: true });
  });

  it("a persisted premium config falls back to Present Simple only", () => {
    const fallback = config();
    expect(resolveRestoredSession(
      config({ id: "full-all", tenses: undefined }),
      fallback,
      false,
    )).toBe(fallback);
    expect(fallback.tenses).toEqual(["presentSimple"]);
  });
});

describe("purchase outcomes and price", () => {
  it.each(["successful", "restored", "already-owned"] as const)("%s grants Full Access", outcome => {
    expect(applyPurchaseOutcome(purchaseSnapshot, outcome).hasFullAccess).toBe(true);
  });

  it("pending never grants Full Access", () => {
    expect(applyPurchaseOutcome(purchaseSnapshot, "pending")).toMatchObject({
      hasFullAccess: false,
      status: "pending",
    });
  });

  it.each(["cancelled", "failed"] as const)("%s does not grant Full Access", outcome => {
    expect(applyPurchaseOutcome(purchaseSnapshot, outcome).hasFullAccess).toBe(false);
  });

  it("renders the localized store price without a hardcoded currency", () => {
    expect(getPaywallPriceLine("₽499")).toBe("₽499 · один платёж · доступ навсегда");
  });

  it("uses one clear loading message when the localized price is unavailable", () => {
    expect(getPaywallPriceLine(null)).toBe("Загружаем цену...");
  });
});

describe("automatic promotional paywall", () => {
  const eligible = (storage: MemoryStorage, now: number, shownThisLaunch = false) =>
    shouldShowAutomaticPaywall({
      storage,
      now,
      entitlementReady: true,
      hasFullAccess: false,
      onboardingComplete: true,
      shownThisLaunch,
      paywallOpen: false,
    });

  it("records first use and suppresses the first 48 hours", () => {
    const storage = new MemoryStorage();
    expect(eligible(storage, 1_000_000)).toBe(false);
    expect(eligible(storage, 1_000_000 + FIRST_PROMOTION_DELAY_MS - 1)).toBe(false);
    expect(eligible(storage, 1_000_000 + FIRST_PROMOTION_DELAY_MS)).toBe(true);
  });

  it("enforces the 72-hour cooldown", () => {
    const storage = new MemoryStorage();
    const now = 10_000_000_000;
    storage.setItem("full_access_first_use_at", String(now - FIRST_PROMOTION_DELAY_MS));
    storage.setItem(LAST_AUTO_PAYWALL_KEY, String(now));
    expect(eligible(storage, now + PROMOTION_COOLDOWN_MS - 1)).toBe(false);
    expect(eligible(storage, now + PROMOTION_COOLDOWN_MS)).toBe(true);
  });

  it("shows at most once per launch and never to an owner", () => {
    const storage = new MemoryStorage();
    const now = 10_000_000_000;
    storage.setItem("full_access_first_use_at", String(now - FIRST_PROMOTION_DELAY_MS));
    expect(eligible(storage, now, true)).toBe(false);
    expect(shouldShowAutomaticPaywall({
      storage,
      now,
      entitlementReady: true,
      hasFullAccess: true,
      onboardingComplete: true,
      shownThisLaunch: false,
      paywallOpen: false,
    })).toBe(false);
  });
});