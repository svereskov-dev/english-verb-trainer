import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { App } from "@capacitor/app";

const APP_BACKGROUND = "#070B17";

/**
 * Configures Android system bars to match the app theme.
 *
 * Runs once at startup (hides splash screen + sets initial colors) and
 * re-applies the same settings every time the app returns from background.
 *
 * This ensures the Status Bar and Navigation Bar never revert to gray/white
 * after device lock, theme change, or activity recreation.
 *
 * Only runs inside a native Capacitor build — does nothing in a browser.
 */
export function useSystemUI() {
  const splashHidden = useRef(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    /**
     * Apply the full system UI configuration:
     * — Status Bar: solid #070B17 background + light icons
     * — Navigation Bar: solid #070B17 background + light icons
     */
    const applyBars = async () => {
      try {
        await StatusBar.setBackgroundColor({ color: APP_BACKGROUND });
        await StatusBar.setStyle({ style: Style.Dark });
      } catch {
        // Plugins may not be available during web dev — silently ignore
      }
    };

    /**
     * First-time startup sequence:
     * 1. Set bar colors immediately
     * 2. Hide splash screen with a smooth fade once React is mounted
     */
    const startup = async () => {
      await applyBars();
      if (!splashHidden.current) {
        try {
          await SplashScreen.hide({ fadeOutDuration: 500 });
          splashHidden.current = true;
        } catch {
          // Splash plugin may not be present during web dev
        }
      }
    };

    startup();

    // Re-apply bar colors whenever the app returns from background.
    // Some OEMs reset system UI on resume, lock/unlock, or theme changes.
    let removeListener: (() => void) | undefined;

    App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) {
        applyBars();
      }
    }).then((listener) => {
      removeListener = listener.remove;
    });

    return () => {
      removeListener?.();
    };
  }, []);
}
