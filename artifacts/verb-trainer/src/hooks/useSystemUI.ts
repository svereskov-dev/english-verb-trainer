import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { App } from "@capacitor/app";

/**
 * Configures the Android status bar and hides the splash screen.
 *
 * In Capacitor 8 + Android 15 edge-to-edge mode:
 *  - The navigation bar is transparent (app background shows through) and
 *    is controlled entirely by native code in MainActivity.java.
 *  - The StatusBar plugin still works for the status bar overlay style.
 *  - We request Style.Dark which means "light/white icons on a dark bg".
 *
 * Re-applies on every appStateChange resume to survive OEM resets
 * (ColorOS, One UI, MIUI may reset bar appearance after lock/unlock).
 *
 * Only runs inside a native Capacitor build — does nothing in a browser.
 */
export function useSystemUI() {
  const splashHidden = useRef(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    /**
     * Apply status bar overlay style.
     * Style.Dark = light/white icons (correct for our dark #070B17 background).
     * The bar background itself is transparent — the WebView background shows through.
     */
    const applyBars = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
      } catch {
        // Plugin may not be available during web dev — silently ignore.
      }
    };

    /**
     * First-time startup sequence:
     * 1. Set status bar style immediately.
     * 2. Hide splash screen with a smooth fade once React is mounted.
     */
    const startup = async () => {
      await applyBars();
      if (!splashHidden.current) {
        try {
          await SplashScreen.hide({ fadeOutDuration: 500 });
          splashHidden.current = true;
        } catch {
          // Splash plugin may not be present during web dev.
        }
      }
    };

    startup();

    // Re-apply status bar style whenever the app returns from background.
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
