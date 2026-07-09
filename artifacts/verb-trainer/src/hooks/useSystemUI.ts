import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";

const APP_BACKGROUND = "#070B17";

/**
 * Configures Android system bars to match the app theme.
 *
 * This is called once on app startup and stays consistent across
 * all screens. It only runs inside a native Capacitor build —
 * it does nothing in a browser.
 *
 * What it does:
 * — Status Bar: solid #070B17 background with light icons/text
 * — Navigation Bar: solid #070B17 background with light icons
 * — Hides the splash screen once React has mounted
 */
export function useSystemUI() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const setup = async () => {
      try {
        // Status bar — solid dark background, light icons
        await StatusBar.setBackgroundColor({ color: APP_BACKGROUND });
        await StatusBar.setStyle({ style: Style.Dark });

        // Hide splash screen with a smooth fade
        await SplashScreen.hide({ fadeOutDuration: 500 });
      } catch (e) {
        // Plugins may not be available during web dev — silently ignore
      }
    };

    setup();
  }, []);
}
