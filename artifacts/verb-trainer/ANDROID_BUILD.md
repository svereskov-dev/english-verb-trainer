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

---

## Step 2 — Build web assets for Capacitor

```bash
cd artifacts/verb-trainer
pnpm run cap:build
```

This produces `artifacts/verb-trainer/dist/public/` with relative paths and
hash routing — both required for Capacitor's `file://` WebView.

---

## Step 3 — Add Android platform (first time only)

```bash
pnpm run cap:add:android
```

Generates the `android/` Gradle project. Run once; use `cap:sync` after that.

---

## Step 3b — Apply Android system bar templates (first time only)

Copy the pre-configured native files into the generated Android project.
These implement the **Android 15 edge-to-edge** approach with transparent
bars and white icons:

```bash
cd artifacts/verb-trainer

# Base theme (all Android versions)
cp capacitor-android-templates/colors.xml   android/app/src/main/res/values/colors.xml
cp capacitor-android-templates/styles.xml   android/app/src/main/res/values/styles.xml
cp capacitor-android-templates/splash.xml   android/app/src/main/res/drawable/splash.xml

# Android 15 override
mkdir -p android/app/src/main/res/values-v35
cp capacitor-android-templates/values-v35/styles.xml \
   android/app/src/main/res/values-v35/styles.xml

# Custom MainActivity
cp capacitor-android-templates/MainActivity.java \
   android/app/src/main/java/com/verbtrainer/app/MainActivity.java
```

What this configures:
- Status Bar and Navigation Bar → **fully transparent** (app background shows through)
- **No white scrim** on navigation bar (Android 10+ contrast enforcement disabled)
- **White icons** on both bars via `WindowInsetsControllerCompat`
- `setDecorFitsSystemWindows` is NOT called — Capacitor 8's edge-to-edge is preserved
- Bar config **re-applied on every `onResume()`** to survive OEM resets (ColorOS, One UI)

`cap sync` never overwrites these files — copy them once.

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
