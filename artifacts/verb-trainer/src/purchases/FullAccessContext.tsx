import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import {
  googlePlayPurchases,
  PurchaseSnapshot,
} from "./googlePlayPurchases";
import { isDevelopmentOwnedPreview } from "./devFullAccessPreview";
import {
  isReviewAccessEnabled,
  persistReviewAccess,
  resolveFullAccessEntitlement,
} from "./reviewAccess";

interface FullAccessContextValue extends PurchaseSnapshot {
  paywallOpen: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  purchaseFullAccess: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  reviewAccessEnabled: boolean;
  enableReviewAccess: () => void;
}

const FullAccessContext = createContext<FullAccessContextValue | null>(null);

export function FullAccessProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<PurchaseSnapshot>({
    entitlementReady: false,
    billingAvailable: false,
    hasFullAccess: false,
    localizedPrice: null,
    status: "loading",
    message: null,
  });
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [reviewAccessEnabled, setReviewAccessEnabled] = useState(
    () => isReviewAccessEnabled(localStorage),
  );
  // DEVELOPMENT-ONLY FULL ACCESS PREVIEW: URL-driven, browser-only, and
  // deliberately kept outside the real Google Play purchase service.
  const [developmentOwnedPreview] = useState(isDevelopmentOwnedPreview);

  useEffect(() => {
    const unsubscribe = googlePlayPurchases.subscribe(setSnapshot);
    void googlePlayPurchases.initialize();

    let removeListener: (() => void) | undefined;
    CapacitorApp.addListener("appStateChange", ({ isActive }) => {
      if (isActive) void googlePlayPurchases.reconcile();
    }).then(listener => {
      removeListener = listener.remove;
    });

    return () => {
      unsubscribe();
      removeListener?.();
    };
  }, []);

  const previewSnapshot: PurchaseSnapshot = developmentOwnedPreview
    ? {
        ...snapshot,
        entitlementReady: true,
        hasFullAccess: true,
        status: "purchased",
        message: null,
      }
    : snapshot;

  const effectiveSnapshot: PurchaseSnapshot = reviewAccessEnabled
    ? {
        ...previewSnapshot,
        entitlementReady: true,
        hasFullAccess: resolveFullAccessEntitlement(
          previewSnapshot.hasFullAccess,
          reviewAccessEnabled,
        ),
      }
    : previewSnapshot;

  useEffect(() => {
    if (effectiveSnapshot.hasFullAccess) setPaywallOpen(false);
  }, [effectiveSnapshot.hasFullAccess]);

  const enableReviewAccess = useCallback(() => {
    persistReviewAccess(localStorage);
    setReviewAccessEnabled(true);
    setPaywallOpen(false);
  }, []);

  const value = useMemo<FullAccessContextValue>(() => ({
    ...effectiveSnapshot,
    paywallOpen,
    openPaywall: () => setPaywallOpen(true),
    closePaywall: () => setPaywallOpen(false),
    purchaseFullAccess: () => googlePlayPurchases.purchase(),
    restorePurchases: () => googlePlayPurchases.restore(),
    reviewAccessEnabled,
    enableReviewAccess,
  }), [effectiveSnapshot, paywallOpen, reviewAccessEnabled, enableReviewAccess]);

  return (
    <FullAccessContext.Provider value={value}>
      {effectiveSnapshot.entitlementReady ? children : null}
    </FullAccessContext.Provider>
  );
}

export function useFullAccess(): FullAccessContextValue {
  const context = useContext(FullAccessContext);
  if (!context) throw new Error("useFullAccess must be used inside FullAccessProvider");
  return context;
}