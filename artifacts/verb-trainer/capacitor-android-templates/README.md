# Android System UI Templates

These files configure the Android Status Bar and Navigation Bar to match your
app's dark theme (#070B17) and guarantee consistent behavior across
Android 13, 14, and 15+ (including ColorOS, One UI, MIUI).

## Where these files go

These templates are copied automatically by the cross-platform script:

```bash
cd artifacts/verb-trainer
pnpm run cap:copy-templates
```

`pnpm run build:android` runs `cap:copy-templates` for you, so you do not need
to call it manually. The script uses plain Node.js and works on Linux, macOS,
and Windows without `cp`, `mkdir -p`, or any Unix shell.

If you prefer to copy them manually, overwrite the generated files as shown
below:

> **Note:** `styles.xml` and `MainActivity.java` replace existing generated
> files — overwrite them when prompted.

### Base theme (all Android versions)

```bash
cp capacitor-android-templates/colors.xml   android/app/src/main/res/values/
cp capacitor-android-templates/styles.xml   android/app/src/main/res/values/
cp capacitor-android-templates/splash.xml   android/app/src/main/res/drawable/
```

### Android 15 edge-to-edge reinforcement

```bash
mkdir -p android/app/src/main/res/values-v35
cp capacitor-android-templates/values-v35/styles.xml \
   android/app/src/main/res/values-v35/styles.xml
```

### Custom MainActivity with lifecycle re-application

```bash
cp capacitor-android-templates/MainActivity.java \
   android/app/src/main/java/com/verbtrainer/app/MainActivity.java
```

### Compact keyboard layout (NoNumberRowWebView)

```bash
cp capacitor-android-templates/NoNumberRowWebView.java \
   android/app/src/main/java/com/verbtrainer/app/NoNumberRowWebView.java

cp capacitor-android-templates/capacitor_bridge_layout_main.xml \
   android/app/src/main/res/layout/capacitor_bridge_layout_main.xml
```

## What each file does

| File | Purpose |
|------|---------|
| `colors.xml` | Single source of truth — `appBackground` = `#070B17` |
| `styles.xml` (values/) | Base theme: transparent status bar, solid dark nav bar, light icons |
| `styles.xml` (values-v35/) | Android 15: same as base, reinforces nav-bar color |
| `splash.xml` | Splash background drawable matching the app |
| `MainActivity.java` | Re-applies bar colors on every `onResume()`; forces dark mode; suppresses OEM scrims |

## Why the nav bar is solid instead of transparent

ColorOS, MIUI, and One UI ignore `TRANSPARENT` on the navigation bar and draw
a white or grey scrim instead. To guarantee a dark nav bar on every device:

- `styles.xml` sets `navigationBarColor` to the solid `#070B17` app background
- `MainActivity.java` sets it to the same solid color at runtime
- `setNavigationBarContrastEnforced(false)` removes any extra tint on top

The status bar stays transparent in edge-to-edge mode — the WebView background
shows through it. CSS `max(env(safe-area-inset-top), 28px)` adds minimum top
padding so content never overlaps the status bar.

## Dark keyboard

The app forces dark mode (`AppCompatDelegate.MODE_NIGHT_YES`) in `MainActivity.java`
and uses `Theme.AppCompat.DayNight.NoActionBar` in both `styles.xml` files. This tells
Android — and therefore the system keyboard — that the app is always dark-themed,
so the keyboard should use its dark appearance whenever supported.

> **OEM limitation:** Some manufacturer keyboards (e.g. older Samsung, Xiaomi, Huawei)
> ignore the app theme and use their own color scheme. This is an OEM bug, not an
> app bug — the app correctly reports itself as dark. Gboard and most stock Android
> keyboards will honor the dark theme.

## Keyboard mode for the Practice screen

For the smoothest experience, set `windowSoftInputMode="adjustResize"` in
`android/app/src/main/AndroidManifest.xml`:

```xml
<activity
  android:name=".MainActivity"
  android:windowSoftInputMode="adjustResize"
  ...>
```

With `adjustResize`:
- The WebView viewport shrinks when the keyboard appears
- CSS `dvh` units update to the new height
- The practice screen container shrinks accordingly
- Content inside the scrollable exercise area stays accessible

> `adjustResize` does not conflict with edge-to-edge mode. The WebView still
> draws behind system bars; only the area above the keyboard changes.

## Removing the number row from the keyboard

By default, Chrome/WebView tags every web text input with
`TYPE_TEXT_VARIATION_WEB_EDIT_TEXT`. Android keyboards (MIUI, Samsung,
Gboard) see this flag and add a number row — because web pages often need
digits. Native apps like ConjuGato receive `TYPE_TEXT_VARIATION_NORMAL`
(0x00) instead, so keyboards show a compact letter-only layout.

**No HTML attribute can change this.** It is hardcoded in Chromium's
`ImeUtils.java:computeEditorInfo()`, regardless of `inputmode`, `type`,
`autocorrect`, `spellcheck`, or `autocapitalize`.

**The fix — two files:**

```bash
# 1. Java class: subclasses CapacitorWebView and strips WEB_EDIT_TEXT
cp capacitor-android-templates/NoNumberRowWebView.java \
   android/app/src/main/java/com/verbtrainer/app/NoNumberRowWebView.java

# 2. Layout override: tells Android to inflate NoNumberRowWebView instead of
#    CapacitorWebView (app resources override library resources by same name)
mkdir -p android/app/src/main/res/layout
cp capacitor-android-templates/capacitor_bridge_layout_main.xml \
   android/app/src/main/res/layout/capacitor_bridge_layout_main.xml
```

No changes to `MainActivity.java` are needed. Bridge still finds the WebView
by `id="webview"` exactly as before.

## Re-applying after `cap:sync`

`npx cap sync` does **not** overwrite `android/app/src/main/res/values/`,
`values-v35/`, `res/layout/`, or `MainActivity.java`, so you only need to
copy these files once. If you ever delete and regenerate the `android/`
directory, copy them again.
