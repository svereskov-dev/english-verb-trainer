import { describe, expect, it, vi } from "vitest";
import {
  GooglePlayPurchases,
  PurchaseSnapshot,
} from "../purchases/googlePlayPurchases";
import { OfflineEntitlementStore } from "../purchases/offlineEntitlementStore";

const FULL_ACCESS_PRODUCT_ID = "full_access";

class MemoryOfflineEntitlements implements OfflineEntitlementStore {
  grants = 0;
  clears = 0;
  refreshError = false;
  clearError = false;
  playOwned: boolean;

  constructor(public owned = false) {
    this.playOwned = owned;
  }

  async load(): Promise<boolean> {
    return this.owned;
  }

  async refresh(): Promise<boolean> {
    if (this.refreshError) throw new Error("Billing unavailable");
    this.grants += 1;
    this.owned = this.playOwned;
    return this.owned;
  }

  async clear(): Promise<void> {
    if (this.clearError) throw new Error("Storage unavailable");
    this.clears += 1;
    this.owned = false;
  }
}

class FakeGooglePlayStore {
  ownedValue = false;
  initializeError: Error | null = null;
  updateError: Error | null = null;
  restoreError: Error | null = null;
  approvedHandler: ((transaction: any) => Promise<void>) | null = null;

  register() {}

  get() {
    return {
      pricing: { price: "€4.99" },
      getOffer: () => ({ order: async () => undefined }),
    };
  }

  owned() {
    return this.ownedValue;
  }

  when() {
    const chain = {
      productUpdated: () => chain,
      pending: () => chain,
      approved: (handler: (transaction: any) => Promise<void>) => {
        this.approvedHandler = handler;
        return chain;
      },
      finished: () => chain,
      receiptsReady: () => chain,
    };
    return chain;
  }

  async initialize() {
    return this.initializeError ? [this.initializeError] : [];
  }

  async update() {
    if (this.updateError) throw this.updateError;
  }

  async restorePurchases() {
    return this.restoreError;
  }
}

function createService(
  offlineEntitlements: MemoryOfflineEntitlements,
  store?: FakeGooglePlayStore,
) {
  const cdv = store
    ? {
        store,
        ProductType: { NON_CONSUMABLE: "non consumable" },
        Platform: { GOOGLE_PLAY: "android-playstore" },
        ErrorCode: { PAYMENT_CANCELLED: 6777001 },
      }
    : undefined;

  return new GooglePlayPurchases({
    isNativeAndroid: () => true,
    getCdvPurchase: () => cdv,
    offlineEntitlements,
  });
}

function latestSnapshot(service: GooglePlayPurchases): () => PurchaseSnapshot {
  let snapshot!: PurchaseSnapshot;
  service.subscribe(next => {
    snapshot = next;
  });
  return () => snapshot;
}

describe("offline Google Play entitlement", () => {
  it("keeps an existing purchaser unlocked after an offline restart", async () => {
    const offline = new MemoryOfflineEntitlements();
    const onlineStore = new FakeGooglePlayStore();
    onlineStore.ownedValue = true;
    offline.playOwned = true;
    const onlineService = createService(offline, onlineStore);

    await onlineService.initialize();
    expect(offline.owned).toBe(true);

    offline.refreshError = true;
    const restartedOffline = createService(offline);
    const current = latestSnapshot(restartedOffline);
    await restartedOffline.initialize();

    expect(current()).toMatchObject({
      entitlementReady: true,
      billingAvailable: false,
      hasFullAccess: true,
      status: "purchased",
    });
  });

  it("keeps a new offline user locked when no entitlement exists", async () => {
    const offline = new MemoryOfflineEntitlements(false);
    offline.refreshError = true;
    const service = createService(offline);
    const current = latestSnapshot(service);

    await service.initialize();

    expect(current()).toMatchObject({
      entitlementReady: true,
      billingAvailable: false,
      hasFullAccess: false,
      status: "error",
    });
  });

  it("preserves cached ownership through a temporary billing failure", async () => {
    const offline = new MemoryOfflineEntitlements(true);
    offline.refreshError = true;
    const store = new FakeGooglePlayStore();
    store.initializeError = new Error("Billing temporarily unavailable");
    const service = createService(offline, store);
    const current = latestSnapshot(service);

    await service.initialize();

    expect(current()).toMatchObject({
      hasFullAccess: true,
      billingAvailable: false,
      status: "purchased",
      message: null,
    });
    expect(offline.clears).toBe(0);
  });

  it("retries reconciliation on resume after startup billing failure", async () => {
    const offline = new MemoryOfflineEntitlements(true);
    offline.refreshError = true;
    const store = new FakeGooglePlayStore();
    store.initializeError = new Error("Billing temporarily unavailable");
    const service = createService(offline, store);
    const current = latestSnapshot(service);
    await service.initialize();

    store.initializeError = null;
    store.ownedValue = true;
    offline.refreshError = false;
    offline.playOwned = true;
    await service.reconcile();

    expect(current()).toMatchObject({
      hasFullAccess: true,
      billingAvailable: true,
      status: "purchased",
    });
    expect(offline.clears).toBe(0);
  });

  it("refreshes persisted ownership after authoritative Play confirmation", async () => {
    const offline = new MemoryOfflineEntitlements(false);
    const store = new FakeGooglePlayStore();
    store.ownedValue = true;
    offline.playOwned = true;
    const service = createService(offline, store);
    const current = latestSnapshot(service);

    await service.initialize();

    expect(current().hasFullAccess).toBe(true);
    expect(offline.owned).toBe(true);
    expect(offline.grants).toBe(1);
  });

  it("removes persisted ownership after authoritative revocation", async () => {
    const offline = new MemoryOfflineEntitlements(true);
    const store = new FakeGooglePlayStore();
    store.ownedValue = false;
    const service = createService(offline, store);
    const current = latestSnapshot(service);

    await service.initialize();

    expect(current().hasFullAccess).toBe(false);
    expect(offline.owned).toBe(false);
    expect(offline.clears).toBe(1);
  });

  it("persists ownership restored by Google Play", async () => {
    const offline = new MemoryOfflineEntitlements(false);
    const store = new FakeGooglePlayStore();
    const service = createService(offline, store);
    const current = latestSnapshot(service);
    await service.initialize();

    store.ownedValue = true;
    offline.playOwned = true;
    await service.restore();

    expect(current().hasFullAccess).toBe(true);
    expect(offline.owned).toBe(true);
  });

  it("persists only after an approved purchase is finalized", async () => {
    const offline = new MemoryOfflineEntitlements(false);
    const store = new FakeGooglePlayStore();
    const service = createService(offline, store);
    const current = latestSnapshot(service);
    await service.initialize();

    const finish = vi.fn(async () => undefined);
    offline.playOwned = true;
    await store.approvedHandler?.({
      products: [{ id: FULL_ACCESS_PRODUCT_ID }],
      finish,
    });

    expect(finish).toHaveBeenCalledOnce();
    expect(current().hasFullAccess).toBe(true);
    expect(offline.owned).toBe(true);
  });

  it("does not unlock when native Google Play reports ownership absent", async () => {
    const offline = new MemoryOfflineEntitlements(false);
    offline.playOwned = false;
    const store = new FakeGooglePlayStore();
    store.ownedValue = true;
    const service = createService(offline, store);
    const current = latestSnapshot(service);

    await service.initialize();

    expect(current()).toMatchObject({
      hasFullAccess: false,
      billingAvailable: true,
      status: "ready",
      message: "Google Play не подтвердил покупку.",
    });
    expect(offline.owned).toBe(false);
  });

  it("does not claim a new purchase is durable when native persistence fails", async () => {
    const offline = new MemoryOfflineEntitlements(false);
    const store = new FakeGooglePlayStore();
    const service = createService(offline, store);
    const current = latestSnapshot(service);
    await service.initialize();

    offline.refreshError = true;
    const finish = vi.fn(async () => undefined);
    await store.approvedHandler?.({
      products: [{ id: FULL_ACCESS_PRODUCT_ID }],
      finish,
    });

    expect(finish).toHaveBeenCalledOnce();
    expect(current()).toMatchObject({
      hasFullAccess: false,
      status: "error",
      message: "Не удалось подтвердить покупку. Попробуйте восстановление.",
    });
    expect(offline.owned).toBe(false);
  });

  it("keeps revocation locked and retries when secure deletion fails", async () => {
    const offline = new MemoryOfflineEntitlements(true);
    offline.clearError = true;
    const store = new FakeGooglePlayStore();
    store.ownedValue = false;
    const service = createService(offline, store);
    const current = latestSnapshot(service);

    await service.initialize();
    expect(current().hasFullAccess).toBe(false);
    expect(offline.owned).toBe(true);

    offline.clearError = false;
    await service.reconcile();
    expect(current().hasFullAccess).toBe(false);
    expect(offline.owned).toBe(false);
    expect(offline.clears).toBe(1);
  });
});