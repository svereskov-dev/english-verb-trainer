# Android System UI Templates

These files configure the Android Status Bar and Navigation Bar to match your
app's dark theme (#070B17) and guarantee consistent behavior across
Android 13, 14, and 15+ (including ColorOS, One UI, MIUI).

## Where these files go

After running `npx cap add android` (first-time setup), copy them into the
generated `android/` directory as shown below.

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

## Re-applying after `cap:sync`

`npx cap sync` does **not** overwrite `android/app/src/main/res/values/`,
`values-v35/`, or `MainActivity.java`, so you only need to copy these files
once. If you ever delete and regenerate the `android/` directory, copy them
again.
