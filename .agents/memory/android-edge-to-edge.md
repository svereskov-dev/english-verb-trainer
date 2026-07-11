---
name: Android edge-to-edge working configuration
description: Exact native + CSS setup that makes Capacitor 8 + Android 15 edge-to-edge work on ColorOS, with dark nav bar, transparent status bar, and correct keyboard handling.
---

## What works (confirmed on ColorOS / OPPO Android 15)

- Status bar: transparent, white icons, app background (#070B17) shows through
- Navigation bar: solid dark #070B17 (not transparent — ColorOS ignores transparent and draws white)
- System keyboard: dark themed (dark mode forced)
- Practice screen: no content under status bar, no white nav bar, keyboard doesn't cover input

## Why this specific combination works

1. **Nav bar MUST be opaque `#070B17`** — ColorOS, MIUI, One UI ignore `TRANSPARENT` and draw a white/grey scrim. The opaque color guarantees dark.
2. **`setNavigationBarContrastEnforced(false)`** — removes the extra white tint on top of the opaque color.
3. **`onResume()` re-applies bars** — OEMs reset bar appearance after lock/unlock. `public void onResume()` (not `protected`) because `BridgeActivity.onResume()` is public.
4. **CSS `pt-safe` uses `max(env(...), 28px)`** — `env(safe-area-inset-top)` returns 0 on ColorOS; the 28px minimum prevents content from sliding under the status bar.
5. **`useKeyboardVisible` uses baseline max-height** — with `adjustResize`, both `window.innerHeight` and `visualViewport.height` shrink together, so `innerHeight - viewportHeight` diff stays ~0. Tracking a `maxHeight` baseline correctly detects keyboard opening.
6. **Practice screen: `overflow-y-auto` on exercise area** — not `overflow-hidden` on the outer container. The exercise area scrolls when the keyboard shrinks the viewport, keeping the input visible.
7. **`onFocus` scrolls input into view** — `scrollIntoView({ block: "center" })` inside `AnswerInput` guarantees the field is never behind the keyboard.
8. **`AppTheme` must exist in both `styles.xml` files** — AndroidManifest.xml references `@style/AppTheme`. Both `values/styles.xml` and `values-v35/styles.xml` must define it.

## Files that must all be present together

| File | Destination after `cap add android` |
|------|------------------------------------|
| `colors.xml` | `android/app/src/main/res/values/colors.xml` |
| `styles.xml` | `android/app/src/main/res/values/styles.xml` |
| `values-v35/styles.xml` | `android/app/src/main/res/values-v35/styles.xml` |
| `MainActivity.java` | `android/app/src/main/java/com/verbtrainer/app/MainActivity.java` |
| `splash.xml` | `android/app/src/main/res/drawable/splash.xml` |

## Critical AndroidManifest.xml setting

```xml
<activity
  android:name=".MainActivity"
  android:windowSoftInputMode="adjustResize"
  ...>
```

`adjustResize` is required for the keyboard detection and scroll behavior to work.

## Do NOT do these

- Do NOT set `navigationBarColor` to `TRANSPARENT` — ColorOS draws white over it
- Do NOT call `setDecorFitsSystemWindows(true)` — breaks edge-to-edge insets
- Do NOT use `protected void onResume()` — compile error, must be `public`
- Do NOT rely on `env(safe-area-inset-top)` alone — add `max(..., 28px)` fallback
