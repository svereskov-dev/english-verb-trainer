import { Capacitor, registerPlugin } from "@capacitor/core";

interface OfflineFullAccessPlugin {
  getFullAccess(): Promise<{ granted: boolean }>;
  refreshFullAccess(): Promise<{ granted: boolean }>;
  clearFullAccess(): Promise<void>;
}

export interface OfflineEntitlementStore {
  load(): Promise<boolean>;
  refresh(): Promise<boolean>;
  clear(): Promise<void>;
}

const OfflineFullAccess = registerPlugin<OfflineFullAccessPlugin>(
  "OfflineFullAccess",
);

function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

class NativeOfflineEntitlementStore implements OfflineEntitlementStore {
  async load(): Promise<boolean> {
    if (!isNativeAndroid()) return false;
    const result = await OfflineFullAccess.getFullAccess();
    return result.granted === true;
  }

  async refresh(): Promise<boolean> {
    if (!isNativeAndroid()) return false;
    const result = await OfflineFullAccess.refreshFullAccess();
    return result.granted === true;
  }

  async clear(): Promise<void> {
    if (!isNativeAndroid()) return;
    await OfflineFullAccess.clearFullAccess();
  }
}

export const offlineEntitlementStore: OfflineEntitlementStore =
  new NativeOfflineEntitlementStore();