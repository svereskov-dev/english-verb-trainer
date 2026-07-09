package com.verbtrainer.app;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;

import androidx.appcompat.app.AppCompatDelegate;
import com.getcapacitor.BridgeActivity;

/**
 * MainActivity for English Verb Trainer.
 *
 * Extends BridgeActivity (Capacitor's standard base) and adds:
 * 1. Force dark mode so the keyboard appears dark
 * 2. Android 15 edge-to-edge opt-out via setDecorFitsSystemWindows
 * 3. Native re-application of system bar colors in onResume()
 *
 * This guarantees solid #070B17 bars on every Android version (13–15+)
 * and survives lifecycle events (background, lock/unlock, theme change).
 */
public class MainActivity extends BridgeActivity {

  private static final int APP_BACKGROUND = Color.parseColor("#070B17");

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // Force the app to always report as dark-themed to Android.
    // This tells the system keyboard (and any other system UI) to use
    // its dark appearance whenever supported.
    AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES);

    super.onCreate(savedInstanceState);

    Window window = getWindow();

    // Opt out of edge-to-edge on Android 15+ so content never draws behind
    // the Status Bar or Navigation Bar. This is the native companion to
    // windowOptOutEdgeToEdgeEnforcement in values-v35/styles.xml.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM) {
      window.setDecorFitsSystemWindows(true);
    }

    // Apply bar colors natively — this runs before the WebView loads and
    // guarantees zero flash during cold start.
    applySystemBars(window);
  }

  @Override
  protected void onResume() {
    super.onResume();

    // Re-apply bar colors whenever the activity resumes.
    // Some devices (Samsung One UI, Xiaomi MIUI) reset system UI
    // settings after lock/unlock, theme changes, or app switching.
    applySystemBars(getWindow());
  }

  /**
   * Sets solid #070B17 backgrounds with light icons on both Status Bar
   * and Navigation Bar. Works on API 23+ (Android 6.0+).
   */
  private void applySystemBars(Window window) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      window.setStatusBarColor(APP_BACKGROUND);

      // Light Status Bar icons (white on dark background)
      View decor = window.getDecorView();
      int flags = decor.getSystemUiVisibility();
      flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
      decor.setSystemUiVisibility(flags);
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      window.setNavigationBarColor(APP_BACKGROUND);

      // Light Navigation Bar icons (white on dark background)
      View decor = window.getDecorView();
      int flags = decor.getSystemUiVisibility();
      flags &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
      decor.setSystemUiVisibility(flags);
    }
  }
}
