import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import {
  googlePlayPurchases,
  PurchaseSnapshot,
} from "./googlePlayPurchases";
import { isDevelopmentOwnedPreview } from "./devFullAccessPreview";

interface FullAccessContextValue extends PurchaseSnapshot {
  paywallOpen: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  purchaseFullAccess: () => Promise<void>;
  restorePurchases: () => Promise<void>;
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

  useEffect(() => {
    if (snapshot.hasFullAccess) setPaywallOpen(false);
  }, [snapshot.hasFullAccess]);

  const effectiveSnapshot: PurchaseSnapshot = developmentOwnedPreview
    ? {
        ...snapshot,
        entitlementReady: true,
        hasFullAccess: true,
        status: "purchased",
        message: null,
      }
    : snapshot;

  const value = useMemo<FullAccessContextValue>(() => ({
    ...effectiveSnapshot,
    paywallOpen,
    openPaywall: () => setPaywallOpen(true),
    closePaywall: () => setPaywallOpen(false),
    purchaseFullAccess: () => googlePlayPurchases.purchase(),
    restorePurchases: () => googlePlayPurchases.restore(),
  }), [effectiveSnapshot, paywallOpen]);

  return (
    <FullAccessContext.Provider value={value}>
      {children}
    </FullAccessContext.Provider>
  );
}

export function useFullAccess(): FullAccessContextValue {
  const context = useContext(FullAccessContext);
  if (!context) throw new Error("useFullAccess must be used inside FullAccessProvider");
  return context;
}