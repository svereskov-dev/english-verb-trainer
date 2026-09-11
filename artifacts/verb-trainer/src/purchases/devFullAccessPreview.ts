import { Capacitor } from "@capacitor/core";

/**
 * DEVELOPMENT-ONLY FULL ACCESS PREVIEW
 *
 * This query flag is intentionally guarded by both Vite's compile-time DEV
 * constant and Capacitor's browser-platform check. It only changes the UI
 * context snapshot and never writes ownership to storage or the purchase
 * service.
 *
 * Remove this file and its FullAccessContext import after visual review.
 */
export const DEV_FULL_ACCESS_PREVIEW_QUERY = "previewFullAccess";

export function isDevelopmentOwnedPreview(): boolean {
  if (!import.meta.env.DEV) return false;
  if (Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "web") return false;
  if (typeof window === "undefined") return false;

  return new URLSearchParams(window.location.search)
    .get(DEV_FULL_ACCESS_PREVIEW_QUERY) === "owned";
}