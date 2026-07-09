# Android System UI Templates

These files configure the Android Status Bar and Navigation Bar to match
your app's dark theme (#070B17) and guarantee consistent behavior across
Android 13, 14, and 15+.

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

### Android 15 edge-to-edge opt-out

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
| `styles.xml` (values/) | Base theme: solid bars, light icons, all Android versions |
| `styles.xml` (values-v35/) | Android 15 override: explicitly opts out of edge-to-edge |
| `splash.xml` | Splash background drawable matching the app |
| `MainActivity.java` | Native `onResume()` re-applies bar colors; `setDecorFitsSystemWindows` for Android 15 |

## Three-layer defence

| Layer | When it runs | What it protects against |
|-------|-------------|-------------------------|
| **Native XML** (`styles.xml`) | App process start (before WebView) | Wrong colors during cold boot |
| **Native Java** (`MainActivity.onResume`) | Every resume from background | OEM resets after lock/unlock/theme change |
| **Capacitor JS** (`useSystemUI.ts`) | App startup + `appStateChange` resume | WebView-level edge cases |

## Dark keyboard

The app forces dark mode (`AppCompatDelegate.MODE_NIGHT_YES`) in `MainActivity.java`
and uses `Theme.AppCompat.DayNight.NoActionBar` in both `styles.xml` files. This tells
Android — and therefore the system keyboard — that the app is always dark-themed,
so the keyboard should use its dark appearance whenever supported.

> **OEM limitation:** Some manufacturer keyboards (e.g. older Samsung, Xiaomi, Huawei)
> ignore the app theme and use their own color scheme. This is an OEM bug, not an
> app bug — the app correctly reports itself as dark. Gboard and most stock Android
> keyboards will honor the dark theme.

## Re-applying after `cap:sync`

`npx cap sync` does **not** overwrite `android/app/src/main/res/values/`,
`values-v35/`, or `MainActivity.java`, so you only need to copy these files
once. If you ever delete and regenerate the `android/` directory, copy them
again.
