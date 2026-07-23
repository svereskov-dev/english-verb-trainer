# Android APK Build Guide — English Verb Trainer

Packaging: **Capacitor 8** · App ID: `com.verbtrainer.app`

---

## Prerequisites — install once

| Tool | Version | Link |
|------|---------|------|
| Node.js | 20 LTS+ | https://nodejs.org |
| pnpm | 9+ | `npm i -g pnpm` |
| Java JDK | 17 | https://adoptium.net |
| Android Studio | Ladybug 2024.2+ | https://developer.android.com/studio |

After installing Android Studio:
1. **SDK Manager** → install **Android SDK Platform 35** + **Build-Tools 35**
2. Set `ANDROID_HOME`:
   - **macOS/Linux** (`~/.zshrc` or `~/.bashrc`):
     ```
     export ANDROID_HOME=$HOME/Library/Android/sdk   # macOS
     export ANDROID_HOME=$HOME/Android/Sdk           # Linux
     export PATH=$PATH:$ANDROID_HOME/platform-tools
     ```
   - **Windows** (System Environment Variables):
     ```
     ANDROID_HOME = C:\Users\<YourName>\AppData\Local\Android\Sdk
     ```

---

## Step 1 — Install dependencies

Extract the ZIP, then from the **root of the extracted folder**:

```bash
pnpm install
```

The preinstall hook is a plain Node.js script, so this works on Windows
(Command Prompt / PowerShell) without Git Bash or WSL.

---

## Step 2 — One-command build (recommended)

```bash
pnpm run build:android
```

This script performs the full sequence automatically:

1. `cap:build` — produces `artifacts/verb-trainer/dist/public/` with relative
   paths and hash routing (required for Capacitor's `file://` WebView).
2. `cap:ensure-android` — runs `npx cap add android` only if `android/` does not
   already exist.
3. `cap:copy-templates` — copies the native system-bar / WebView templates into
   the Android project. This is cross-platform; no `cp` or `mkdir -p` is needed.
4. `cap:sync` — copies `dist/public/` into `android/app/src/main/assets/public/`.

Run this every time you want a fresh APK. It is safe to run repeatedly.

---

## Step 2b — Manual steps (if you prefer)

```bash
cd artifacts/verb-trainer
pnpm run cap:build          # build web assets
pnpm run cap:ensure-android # add Android platform only on first run
pnpm run cap:copy-templates # copy native templates
pnpm run cap:sync           # sync web assets to android/
```

---

## Step 3 — Apply Android system bar templates

The `cap:copy-templates` step handles this automatically. If you ever need to
do it manually, these are the source and destination paths:

| Template | Destination |
|---|---|
| `capacitor-android-templates/colors.xml` | `android/app/src/main/res/values/colors.xml` |
| `capacitor-android-templates/styles.xml` | `android/app/src/main/res/values/styles.xml` |
| `capacitor-android-templates/splash.xml` | `android/app/src/main/res/drawable/splash.xml` |
| `capacitor-android-templates/values-v35/styles.xml` | `android/app/src/main/res/values-v35/styles.xml` |
| `capacitor-android-templates/MainActivity.java` | `android/app/src/main/java/com/verbtrainer/app/MainActivity.java` |
| `capacitor-android-templates/NoNumberRowWebView.java` | `android/app/src/main/java/com/verbtrainer/app/NoNumberRowWebView.java` |
| `capacitor-android-templates/capacitor_bridge_layout_main.xml` | `android/app/src/main/res/layout/capacitor_bridge_layout_main.xml` |

What this configures:
- Status Bar → **transparent** (app background shows through)
- Navigation Bar → **solid dark** `#070B17` (no white scrim on ColorOS/One UI/MIUI)
- **White icons** on both bars via `WindowInsetsControllerCompat`
- `setDecorFitsSystemWindows` is NOT called — Capacitor 8's edge-to-edge is preserved
- Bar config **re-applied on every `onResume()`** to survive OEM resets
- `NoNumberRowWebView` removes the keyboard number row by stripping the
  `TYPE_TEXT_VARIATION_WEB_EDIT_TEXT` flag that Chromium adds to every web input

---

## Step 3c — Set keyboard resize mode (recommended)

In `android/app/src/main/AndroidManifest.xml`, find `<activity android:name=".MainActivity"` and add:

```xml
android:windowSoftInputMode="adjustResize"
```

This makes the viewport shrink when the keyboard opens (instead of the whole
page panning up), so the Practice screen's adaptive layout works smoothly.

---

## Step 4 — Sync web assets to Android

```bash
pnpm run cap:sync
```

Copies `dist/public/` into `android/app/src/main/assets/public/`.
Run this every time you rebuild the web assets.

---

## Step 5 — Open in Android Studio

```bash
pnpm run cap:open
```

---

## Step 6 — Build the APK

In Android Studio:

1. Wait for Gradle sync (first time: 2–5 min)
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Click the **locate** link in the notification bar

Debug APK location:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK (for distribution)
1. **Build → Generate Signed Bundle / APK → APK**
2. Create or reuse a keystore
3. Select **release** build variant

Release APK:
```
android/app/build/outputs/apk/release/app-release.apk
```

> **Back up your keystore.** You need the same file for every future update.

---

## Step 7 — Install on device

Enable USB debugging on the phone:
- Settings → About Phone → tap **Build Number** 7 times
- Settings → Developer Options → enable **USB Debugging**

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

Or copy the `.apk` to the device and open with a file manager.

---

## Daily workflow (after initial setup)

```bash
# From project root
pnpm install                          # only if package.json changed

cd artifacts/verb-trainer
pnpm run cap:build                    # rebuild web assets
pnpm run cap:sync                     # push to android/
pnpm run cap:open                     # open Android Studio → Build APK
```

---

## App configuration

| Setting | Value |
|---------|-------|
| App ID | `com.verbtrainer.app` |
| Capacitor | 8.x |
| Min SDK | 22 (Android 5.1) |
| Target SDK | 35 (Android 15) |
| Web dir | `dist/public` |
| Routing | Hash-based (`#/practice`, `#/dictionary`, …) |
| Status Bar | Transparent — app background visible |
| Navigation Bar | Transparent — app background visible, no white scrim |
| Splash Screen | `#070B17` background, auto-hides on mount |

---

## Troubleshooting

**"SDK location not found"** — Set `ANDROID_HOME` (see Prerequisites).

**Blank white screen** — Run `cap:build` then `cap:sync`; web assets are missing.

**White navigation bar** — You skipped Step 3b. Copy the template files and rebuild.

**Page shifts up when keyboard opens** — You skipped Step 3c. Add `adjustResize` to AndroidManifest.

**Routing 404** — Make sure you ran `pnpm run cap:build` (not the regular `build`).

**Status/nav bar wrong color after lock/unlock** — `MainActivity.java` from Step 3b re-applies on `onResume()`. Make sure you copied it.
