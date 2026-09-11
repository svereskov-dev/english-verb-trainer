import { Capacitor } from "@capacitor/core";
import { FULL_ACCESS_PRODUCT_ID } from "./access";

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

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot);
    return () => this.listeners.delete(listener);
  }

  private update(patch: Partial<PurchaseSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach(listener => listener(this.snapshot));
  }

  private reconcileOwnership(status: PurchaseStatus = "ready"): void {
    const hasFullAccess = Boolean(this.store?.owned?.(FULL_ACCESS_PRODUCT_ID));
    const product = this.store?.get?.(FULL_ACCESS_PRODUCT_ID);
    const localizedPrice = product?.pricing?.price ?? this.snapshot.localizedPrice;
    const next = {
      entitlementReady: true,
      billingAvailable: true,
      hasFullAccess,
      localizedPrice: localizedPrice ?? null,
      status: hasFullAccess ? "purchased" : status,
      message: null,
    } satisfies PurchaseSnapshot;
    this.update(hasFullAccess
      ? applyPurchaseOutcome(next, "already-owned")
      : next);
  }

  initialize(): Promise<void> {
    if (this.initializePromise) return this.initializePromise;
    this.initializePromise = this.initializeInternal();
    return this.initializePromise;
  }

  private async initializeInternal(): Promise<void> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
      this.update({
        entitlementReady: true,
        billingAvailable: false,
        hasFullAccess: false,
        status: "unavailable",
        message: "Покупка доступна в Android-приложении через Google Play.",
      });
      return;
    }

    this.cdv = (globalThis as any).CdvPurchase;
    if (!this.cdv?.store) {
      this.update({
        entitlementReady: true,
        billingAvailable: false,
        status: "error",
        message: "Google Play Billing не удалось загрузить.",
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
        this.update(applyPurchaseOutcome(this.snapshot, "pending"));
      }, "verbflow-pending")
      .approved(async (transaction: any) => {
        if (!transactionContainsProduct(transaction)) return;
        this.update({ status: "purchasing", message: "Завершаем покупку…" });
        try {
          await transaction.finish();
          this.reconcileOwnership("purchased");
        } catch {
          this.update({
            entitlementReady: true,
            hasFullAccess: false,
            status: "error",
            message: "Не удалось подтвердить покупку. Попробуйте восстановление.",
          });
        }
      }, "verbflow-approved")
      .finished((transaction: any) => {
        if (transactionContainsProduct(transaction)) this.reconcileOwnership("purchased");
      }, "verbflow-finished")
      .receiptsReady(() => this.reconcileOwnership(), "verbflow-receipts-ready");

    try {
      const errors = await this.store.initialize([this.cdv.Platform.GOOGLE_PLAY]);
      const error = errors?.[0];
      if (error) throw new Error(error.message);
      await this.store.update();
      this.reconcileOwnership();
    } catch (error) {
      this.update({
        entitlementReady: true,
        billingAvailable: false,
        hasFullAccess: false,
        status: "error",
        message: error instanceof Error ? error.message : "Google Play Billing недоступен.",
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

    this.reconcileOwnership();
    if (this.snapshot.hasFullAccess) return;

    const cancelled = error.code === this.cdv.ErrorCode.PAYMENT_CANCELLED;
    this.update(applyPurchaseOutcome(
      this.snapshot,
      cancelled ? "cancelled" : "failed",
      cancelled ? "Покупка отменена." : (error.message ?? "Покупка не удалась."),
    ));
  }

  async restore(): Promise<void> {
    await this.initialize();
    if (!this.store || !this.snapshot.billingAvailable) return;
    this.update({ status: "restoring", message: null });
    try {
      const error = await this.store.restorePurchases();
      if (error) throw new Error(error.message);
      await this.store.update();
      this.reconcileOwnership();
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
    if (!this.store || !this.snapshot.billingAvailable) return;
    try {
      await this.store.update();
      this.reconcileOwnership();
    } catch {
      // Keep the last authoritative store result while temporarily offline.
    }
  }
}

export const googlePlayPurchases = new GooglePlayPurchases();