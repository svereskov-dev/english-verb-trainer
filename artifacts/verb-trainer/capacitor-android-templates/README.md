# Android System UI Templates

These XML files configure the Android Status Bar and Navigation Bar to match
your app’s dark theme (#070B17). They are applied at the native Android level,
so they work automatically on every screen with no JavaScript code required.

## Where these files go

After running `npx cap add android` (first-time setup), copy them into the
generated `android/` directory:

```bash
cp capacitor-android-templates/colors.xml   android/app/src/main/res/values/
cp capacitor-android-templates/styles.xml   android/app/src/main/res/values/
```

> **Note:** `styles.xml` replaces the existing file — overwrite it when prompted.

## What each file does

| File | Purpose |
|------|---------|
| `colors.xml` | Defines `appBackground` as `#070B17` — shared by both bars |
| `styles.xml` | Sets Status Bar + Navigation Bar to that color with light icons |

## Why two layers?

1. **Native Android XML** (these files) — sets the bars before the webview loads
2. **Capacitor StatusBar plugin** (JavaScript) — reinforces the same colors after the webview is ready

Together they guarantee zero flash of wrong colors during startup.

## Re-applying after `cap:sync`

`npx cap sync` does **not** overwrite `android/app/src/main/res/values/`,
so you only need to copy these files once. If you ever delete and regenerate
the `android/` directory, copy them again.
