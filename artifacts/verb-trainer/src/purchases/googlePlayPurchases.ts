import { Capacitor } from "@capacitor/core";
import { FULL_ACCESS_PRODUCT_ID } from "./access";
import {
  offlineEntitlementStore,
  OfflineEntitlementStore,
} from "./offlineEntitlementStore";

export type PurchaseStatus =
  | "loading"
  | "ready"
  | "unavailable"
  | "purchasing"
  | "pending"
  | "purchased"
  | "cancelled"
  | "restoring"
  | "error";

export interface PurchaseSnapshot {
  entitlementReady: boolean;
  billingAvailable: boolean;
  hasFullAccess: boolean;
  localizedPrice: string | null;
  status: PurchaseStatus;
  message: string | null;
}

type Listener = (snapshot: PurchaseSnapshot) => void;

export interface PurchaseDependencies {
  isNativeAndroid: () => boolean;
  getCdvPurchase: () => any;
  offlineEntitlements: OfflineEntitlementStore;
}

const DEFAULT_DEPENDENCIES: PurchaseDependencies = {
  isNativeAndroid: () =>
    Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android",
  getCdvPurchase: () => (globalThis as any).CdvPurchase,
  offlineEntitlements: offlineEntitlementStore,
};

const INITIAL_SNAPSHOT: PurchaseSnapshot = {
  entitlementReady: false,
  billingAvailable: false,
  hasFullAccess: false,
  localizedPrice: null,
  status: "loading",
  message: null,
};

export type PurchaseOutcome =
  | "successful"
  | "pending"
  | "cancelled"
  | "failed"
  | "restored"
  | "already-owned";

export function applyPurchaseOutcome(
  snapshot: PurchaseSnapshot,
  outcome: PurchaseOutcome,
  message: string | null = null,
): PurchaseSnapshot {
  if (outcome === "successful" || outcome === "restored" || outcome === "already-owned") {
    return {
      ...snapshot,
      entitlementReady: true,
      billingAvailable: true,
      hasFullAccess: true,
      status: "purchased",
      message: null,
    };
  }
  if (outcome === "pending") {
    return {
      ...snapshot,
      entitlementReady: true,
      hasFullAccess: false,
      status: "pending",
      message: message ?? "Платёж обрабатывается Google Play.",
    };
  }
  return {
    ...snapshot,
    entitlementReady: true,
    hasFullAccess: false,
    status: outcome === "cancelled" ? "cancelled" : "error",
    message,
  };
}

function transactionContainsProduct(transaction: any): boolean {
  return transaction?.products?.some(
    (product: { id?: string }) => product.id === FULL_ACCESS_PRODUCT_ID,
  ) ?? false;
}

export class GooglePlayPurchases {
  private snapshot: PurchaseSnapshot = INITIAL_SNAPSHOT;
  private listeners = new Set<Listener>();
  private store: any = null;
  private cdv: any = null;
  private initializePromise: Promise<void> | null = null;
  private revocationPersistencePending = false;
  private readonly dependencies: PurchaseDependencies;

  constructor(dependencies: PurchaseDependencies = DEFAULT_DEPENDENCIES) {
    this.dependencies = dependencies;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot);
    return () => this.listeners.delete(listener);
  }

  private update(patch: Partial<PurchaseSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach(listener => listener(this.snapshot));
  }

  private async refreshPersistedEntitlement(): Promise<boolean | null> {
    try {
      return await this.dependencies.offlineEntitlements.refresh();
    } catch {
      // A transient native Billing failure is not evidence of revocation.
      return null;
    }
  }

  private async clearPersistedEntitlement(): Promise<boolean> {
    try {
      await this.dependencies.offlineEntitlements.clear();
      this.revocationPersistencePending = false;
      return true;
    } catch {
      this.revocationPersistencePending = true;
      return false;
    }
  }

  private async grantConfirmedOwnership(
    status: PurchaseStatus = "purchased",
  ): Promise<boolean> {
    const persistedOwnership = await this.refreshPersistedEntitlement();
    if (persistedOwnership === null) {
      throw new Error("Google Play ownership could not be persisted.");
    }
    if (!persistedOwnership) {
      this.update({
        entitlementReady: true,
        billingAvailable: true,
        hasFullAccess: false,
        status: "ready",
        message: "Google Play не подтвердил покупку.",
      });
      return false;
    }

    const product = this.store?.get?.(FULL_ACCESS_PRODUCT_ID);
    const localizedPrice = product?.pricing?.price ?? this.snapshot.localizedPrice;
    this.update(applyPurchaseOutcome({
      ...this.snapshot,
      entitlementReady: true,
      billingAvailable: true,
      localizedPrice: localizedPrice ?? null,
      status,
      message: null,
    }, "already-owned"));
    return true;
  }

  private async reconcileAuthoritativeOwnership(
    status: PurchaseStatus = "ready",
  ): Promise<void> {
    const hasFullAccess = Boolean(this.store?.owned?.(FULL_ACCESS_PRODUCT_ID));
    const product = this.store?.get?.(FULL_ACCESS_PRODUCT_ID);
    const localizedPrice = product?.pricing?.price ?? this.snapshot.localizedPrice;

    if (hasFullAccess) {
      await this.grantConfirmedOwnership("purchased");
      return;
    }

    await this.clearPersistedEntitlement();
    this.update({
      entitlementReady: true,
      billingAvailable: true,
      hasFullAccess: false,
      localizedPrice: localizedPrice ?? null,
      status,
      message: null,
    });
  }

  private async reconcileWithNativeBilling(): Promise<boolean> {
    const hasFullAccess = await this.refreshPersistedEntitlement();
    if (hasFullAccess === null) return false;

    this.revocationPersistencePending = false;
    this.update({
      entitlementReady: true,
      hasFullAccess,
      status: hasFullAccess ? "purchased" : "ready",
      message: null,
    });
    return true;
  }

  initialize(): Promise<void> {
    if (this.initializePromise) return this.initializePromise;
    this.initializePromise = this.initializeInternal();
    return this.initializePromise;
  }

  private async initializeInternal(): Promise<void> {
    if (!this.dependencies.isNativeAndroid()) {
      this.update({
        entitlementReady: true,
        billingAvailable: false,
        hasFullAccess: false,
        status: "unavailable",
        message: "Покупка доступна в Android-приложении через Google Play.",
      });
      return;
    }

    let persistedOwnership = false;
    try {
      persistedOwnership = await this.dependencies.offlineEntitlements.load();
    } catch {
      // Treat unreadable or unavailable secure storage as no cached purchase.
    }

    this.update({
      entitlementReady: true,
      billingAvailable: false,
      hasFullAccess: persistedOwnership,
      status: persistedOwnership ? "purchased" : "loading",
      message: null,
    });

    this.cdv = this.dependencies.getCdvPurchase();
    if (!this.cdv?.store) {
      if (await this.reconcileWithNativeBilling()) return;
      this.update({
        entitlementReady: true,
        billingAvailable: false,
        status: persistedOwnership ? "purchased" : "error",
        message: persistedOwnership ? null : "Google Play Billing не удалось загрузить.",
      });
      return;
    }

    this.store = this.cdv.store;
    this.store.register({
      id: FULL_ACCESS_PRODUCT_ID,
      type: this.cdv.ProductType.NON_CONSUMABLE,
      platform: this.cdv.Platform.GOOGLE_PLAY,
    });

    this.store.when()
      .productUpdated((product: any) => {
        if (product.id !== FULL_ACCESS_PRODUCT_ID) return;
        this.update({ localizedPrice: product.pricing?.price ?? null });
      }, "verbflow-product-updated")
      .pending((transaction: any) => {
        if (!transactionContainsProduct(transaction)) return;
        this.update({
          entitlementReady: true,
          status: "pending",
          message: "Платёж обрабатывается Google Play.",
        });
      }, "verbflow-pending")
      .approved(async (transaction: any) => {
        if (!transactionContainsProduct(transaction)) return;
        this.update({ status: "purchasing", message: "Завершаем покупку…" });
        try {
          await transaction.finish();
          await this.grantConfirmedOwnership("purchased");
        } catch {
          this.update({
            entitlementReady: true,
            status: "error",
            message: "Не удалось подтвердить покупку. Попробуйте восстановление.",
          });
        }
      }, "verbflow-approved")
      .finished((transaction: any) => {
        if (transactionContainsProduct(transaction)) {
          void this.grantConfirmedOwnership("purchased").catch(() => {
            // The approved handler reports persistence failures to the UI.
          });
        }
      }, "verbflow-finished")
      .receiptsReady(() => {
        if (this.store?.owned?.(FULL_ACCESS_PRODUCT_ID)) {
          void this.grantConfirmedOwnership("purchased").catch(() => {
            // Startup reconciliation below retries and preserves cached access.
          });
        }
      }, "verbflow-receipts-ready");

    try {
      const errors = await this.store.initialize([this.cdv.Platform.GOOGLE_PLAY]);
      const error = errors?.[0];
      if (error) throw new Error(error.message);
      await this.store.update();
      await this.reconcileAuthoritativeOwnership();
    } catch (error) {
      if (await this.reconcileWithNativeBilling()) return;
      this.update({
        entitlementReady: true,
        billingAvailable: false,
        status: this.snapshot.hasFullAccess ? "purchased" : "error",
        message: this.snapshot.hasFullAccess
          ? null
          : error instanceof Error
            ? error.message
            : "Google Play Billing недоступен.",
      });
    }
  }

  async purchase(): Promise<void> {
    await this.initialize();
    if (!this.store || !this.snapshot.billingAvailable) return;

    const product = this.store.get(FULL_ACCESS_PRODUCT_ID);
    const offer = product?.getOffer?.();
    if (!offer) {
      this.update({ status: "error", message: "Товар full_access не найден в Google Play." });
      return;
    }

    this.update({ status: "purchasing", message: null });
    const error = await offer.order();
    if (!error) return;

    const cancelled = error.code === this.cdv.ErrorCode.PAYMENT_CANCELLED;
    this.update({
      entitlementReady: true,
      status: cancelled ? "cancelled" : "error",
      message: cancelled ? "Покупка отменена." : (error.message ?? "Покупка не удалась."),
    });
  }

  async restore(): Promise<void> {
    await this.initialize();
    if (!this.store || !this.snapshot.billingAvailable) {
      this.update({ status: "restoring", message: null });
      if (await this.reconcileWithNativeBilling()) {
        if (!this.snapshot.hasFullAccess) {
          this.update({ status: "ready", message: "Покупка не найдена." });
        }
      } else {
        this.update({
          status: this.snapshot.hasFullAccess ? "purchased" : "error",
          message: this.snapshot.hasFullAccess ? null : "Не удалось восстановить покупку.",
        });
      }
      return;
    }
    this.update({ status: "restoring", message: null });
    try {
      const error = await this.store.restorePurchases();
      if (error) throw new Error(error.message);
      await this.store.update();
      await this.reconcileAuthoritativeOwnership();
      if (!this.snapshot.hasFullAccess) {
        this.update({ status: "ready", message: "Покупка не найдена." });
      }
    } catch (error) {
      this.update({
        status: "error",
        message: error instanceof Error ? error.message : "Не удалось восстановить покупку.",
      });
    }
  }

  async reconcile(): Promise<void> {
    await this.initialize();
    if (!this.store) return;
    try {
      await this.store.update();
      await this.reconcileAuthoritativeOwnership();
    } catch {
      // The plugin Store cannot be initialized twice. Use a fresh native
      // BillingClient ownership query to recover after failed initialization.
      await this.reconcileWithNativeBilling();
    }
  }
}

export const googlePlayPurchases = new GooglePlayPurchases();