package com.verbtrainer.app;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;

import androidx.appcompat.app.AppCompatDelegate;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

/**
 * MainActivity for English Verb Trainer.
 *
 * Capacitor 8 already calls WindowCompat.setDecorFitsSystemWindows(window, false)
 * inside BridgeActivity, putting the WebView into edge-to-edge mode. We embrace
 * that — fighting it causes the white navigation bar and broken viewport height.
 *
 * What this class does on top of BridgeActivity:
 *  1. Force dark mode so the system keyboard appears dark.
 *  2. Make both system bars fully transparent so the app background shows through.
 *  3. Suppress Android 10+ automatic contrast scrims on the transparent bars.
 *  4. Set light icon appearance (white icons) via WindowInsetsControllerCompat.
 *  5. Re-apply on every onResume() so OEM resets don't cause regressions.
 *
 * Layout padding is handled entirely in CSS via env(safe-area-inset-*).
 * The WebView receives correct insets because edge-to-edge is active.
 */
public class MainActivity extends BridgeActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // Force dark mode so the system keyboard uses its dark appearance.
    AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES);

    super.onCreate(savedInstanceState);
    // NOTE: super.onCreate() already calls
    //   WindowCompat.setDecorFitsSystemWindows(window, false)
    // which enables edge-to-edge and lets the WebView receive correct insets.
    // Do NOT call setDecorFitsSystemWindows(true) — that breaks inset delivery.

    applySystemBars(getWindow());
  }

  @Override
  protected void onResume() {
    super.onResume();
    // Re-apply on every resume. Some OEMs (ColorOS, One UI, MIUI) reset
    // system bar appearance after lock/unlock or task-switch.
    applySystemBars(getWindow());
  }

  /**
   * Configures both system bars for edge-to-edge dark mode:
   *  - Fully transparent bars (app background #070B17 shows through)
   *  - No automatic contrast scrim (API 29+)
   *  - White (light) icons on both bars
   */
  private void applySystemBars(Window window) {
    // Try transparent first (edge-to-edge). If the OEM ignores it
    // (ColorOS, MIUI) it falls back to the solid dark app background.
    // The native navigationBarColor must be opaque for the scrim disable
    // to work on some OEM skins.
    window.setStatusBarColor(Color.TRANSPARENT);
    window.setNavigationBarColor(Color.parseColor("#070B17"));

    // API 29+ (Android 10+): prevent the system from drawing an automatic
    // semi-transparent scrim over the nav bar area. Without this the
    // nav bar gets a white/grey tint even on a dark background.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      window.setNavigationBarContrastEnforced(false);
      window.setStatusBarContrastEnforced(false);
    }

    // Use WindowInsetsControllerCompat (the non-deprecated API) to request
    // light-on-dark icon appearance. setAppearanceLightXxxBars(false) means
    // "use light/white icons" — correct for a dark background.
    WindowInsetsControllerCompat controller =
        WindowCompat.getInsetsController(window, window.getDecorView());
    controller.setAppearanceLightStatusBars(false);
    controller.setAppearanceLightNavigationBars(false);
  }
}
