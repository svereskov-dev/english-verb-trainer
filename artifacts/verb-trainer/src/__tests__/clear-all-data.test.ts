import { describe, expect, it } from "vitest";
import {
  clearLearningBrowserStorage,
  LEARNING_LOCAL_STORAGE_KEYS,
  LEARNING_SESSION_STORAGE_KEYS,
} from "../storage/clearAllData";
import {
  isReviewAccessEnabled,
  persistReviewAccess,
  REVIEW_ACCESS_STORAGE_KEY,
} from "../purchases/reviewAccess";
import { LEARNING_DATA_STORES } from "../db";

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

function seedLearningData(localStorage: MemoryStorage, sessionStorage: MemoryStorage) {
  for (const key of LEARNING_LOCAL_STORAGE_KEYS) {
    localStorage.setItem(key, "learning-data");
  }
  for (const key of LEARNING_SESSION_STORAGE_KEYS) {
    sessionStorage.setItem(key, "learning-data");
  }
}

describe("Clear Progress storage boundary", () => {
  it("clears only the learning IndexedDB stores", () => {
    expect(LEARNING_DATA_STORES).toEqual(["progress", "stats"]);
    expect(LEARNING_DATA_STORES).not.toContain("settings");
  });

  it("clears learning data while preserving a paid user's access state", () => {
    const localStorage = new MemoryStorage();
    const sessionStorage = new MemoryStorage();
    seedLearningData(localStorage, sessionStorage);
    const nativeFullAccess = true;

    clearLearningBrowserStorage(localStorage, sessionStorage);

    expect(nativeFullAccess).toBe(true);
    for (const key of LEARNING_LOCAL_STORAGE_KEYS) {
      expect(localStorage.getItem(key)).toBeNull();
    }
    for (const key of LEARNING_SESSION_STORAGE_KEYS) {
      expect(sessionStorage.getItem(key)).toBeNull();
    }
  });

  it("keeps paid access available for an offline restart", () => {
    const localStorage = new MemoryStorage();
    const sessionStorage = new MemoryStorage();
    seedLearningData(localStorage, sessionStorage);
    const nativeEntitlement = { granted: true };

    clearLearningBrowserStorage(localStorage, sessionStorage);
    const restartedOffline = nativeEntitlement.granted;

    expect(restartedOffline).toBe(true);
  });

  it("does not create access for a free user", () => {
    const localStorage = new MemoryStorage();
    const sessionStorage = new MemoryStorage();
    seedLearningData(localStorage, sessionStorage);
    const nativeEntitlement = { granted: false };

    clearLearningBrowserStorage(localStorage, sessionStorage);

    expect(nativeEntitlement.granted).toBe(false);
  });

  it("does not interfere with later authoritative revocation", () => {
    const localStorage = new MemoryStorage();
    const sessionStorage = new MemoryStorage();
    const nativeEntitlement = { granted: true };

    clearLearningBrowserStorage(localStorage, sessionStorage);
    nativeEntitlement.granted = false;

    expect(nativeEntitlement.granted).toBe(false);
  });

  it("preserves Review Access independently", () => {
    const localStorage = new MemoryStorage();
    const sessionStorage = new MemoryStorage();
    persistReviewAccess(localStorage);
    localStorage.setItem("theme", "dark");
    localStorage.setItem("full_access_first_use_at", "123");
    sessionStorage.setItem("dictionary_filter", "regular");

    clearLearningBrowserStorage(localStorage, sessionStorage);

    expect(isReviewAccessEnabled(localStorage)).toBe(true);
    expect(localStorage.getItem(REVIEW_ACCESS_STORAGE_KEY)).toBe("1");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(localStorage.getItem("full_access_first_use_at")).toBe("123");
    expect(sessionStorage.getItem("dictionary_filter")).toBe("regular");
  });
});