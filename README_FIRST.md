# English Verb Trainer — Android APK Build Guide

A mobile-first Progressive Web App (PWA) for practising English irregular verb
conjugations. This guide covers everything you need to build and install the
Android APK on a fresh machine, with no prior knowledge of the project assumed.

---

## Project overview

The app lets learners:
- Drill irregular verb forms (past simple, past participle) with instant feedback
- Choose which tense groups and verb sets to practise
- Track mistakes and review them in a dedicated Mistakes mode
- Browse a full irregular-verb dictionary
- Toggle dark / light theme and font size

All data (progress, settings, mistake history) is stored locally on the device
using IndexedDB and localStorage — no server, no account required.

**Tech stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui · wouter · IndexedDB (idb)  
**Mobile packaging:** Capacitor 8 (Android WebView wrapper)

---

## Required software

Install these tools once on your local machine before proceeding.

| Tool | Version | Download |
|------|---------|---------|
| Node.js | 20 LTS or newer | https://nodejs.org |
| pnpm | 9 or newer | `npm install -g pnpm` |
| Java JDK | 17 | https://adoptium.net |
| Android Studio | Ladybug 2024.2 or newer | https://developer.android.com/studio |
| Git | any | https://git-scm.com |

### After installing Android Studio

1. Open **Android Studio → More Actions → SDK Manager**
2. Under **SDK Platforms**, install **Android API 35** (or the latest stable)
3. Under **SDK Tools**, ensure **Android SDK Build-Tools** and **Android SDK Platform-Tools** are installed
4. Set the `ANDROID_HOME` environment variable:

**macOS / Linux** — add to `~/.zshrc` or `~/.bashrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk    # macOS default
# or
export ANDROID_HOME=$HOME/Android/Sdk            # Linux default
export PATH=$PATH:$ANDROID_HOME/platform-tools
```
Then reload: `source ~/.zshrc`

**Windows** — add to System → Environment Variables → User variables:
```
Variable: ANDROID_HOME
Value:    C:\Users\YourName\AppData\Local\Android\Sdk
```
Also add `%ANDROID_HOME%\platform-tools` to the `Path` variable.

---

## Step-by-step: build the APK

### Step 1 — Get the project

```bash
git clone <your-repo-url>
cd <repo-root>          # the folder that contains this README_FIRST.md
```

### Step 2 — Install dependencies

```bash
pnpm install
```

This installs every package the project needs. No manual steps are required
after this command finishes.

### Step 3 — Build the web assets for Capacitor

```bash
cd artifacts/verb-trainer
pnpm run cap:build
```

This runs a Vite build configured specifically for Capacitor. It produces
relative-path assets (required for the Android `file://` WebView) in:
```
artifacts/verb-trainer/dist/public/
```

### Step 4 — Add the Android platform *(first time only)*

```bash
pnpm run cap:add:android
```

This generates the `android/` Gradle project inside `artifacts/verb-trainer/`.
You only need to do this once. On subsequent rebuilds, skip to Step 5.

### Step 4b — Configure system bars to match the app theme *(first time only)*

Copy the pre-made Android theme files so the Status Bar and Navigation Bar
match your app's dark background on all Android versions (13–15+):

```bash
cd artifacts/verb-trainer

# Base theme — all Android versions
cp capacitor-android-templates/colors.xml \
   android/app/src/main/res/values/colors.xml

cp capacitor-android-templates/styles.xml \
   android/app/src/main/res/values/styles.xml

cp capacitor-android-templates/splash.xml \
   android/app/src/main/res/drawable/splash.xml

# Android 15 edge-to-edge opt-out (critical — prevents transparent bars)
mkdir -p android/app/src/main/res/values-v35
cp capacitor-android-templates/values-v35/styles.xml \
   android/app/src/main/res/values-v35/styles.xml

# Custom MainActivity — re-applies bar colors on every resume
# (prevents gray bars after lock/unlock or theme change)
cp capacitor-android-templates/MainActivity.java \
   android/app/src/main/java/com/verbtrainer/app/MainActivity.java
```

What this does:
- Status Bar → solid `#070B17` with light icons
- Navigation Bar → solid `#070B17` with light icons
- Splash screen → `#070B17` background matching the app
- Android 15 edge-to-edge → explicitly disabled so bars stay solid
- Lifecycle re-application → bar colors re-applied on every resume

You only need to do this once. It survives every `cap:sync`.

### Step 5 — Sync web assets into the Android project

```bash
pnpm run cap:sync
```

This copies `dist/public/` into the Android project and updates native plugin
configuration. Run this every time you change the app code and rebuild.

### Step 6 — Open in Android Studio

```bash
pnpm run cap:open
```

Android Studio opens and begins a Gradle sync (first time: 2–5 minutes).

### Step 7 — Build the APK in Android Studio

1. Wait for Gradle sync to finish (status bar at the bottom)
2. Menu → **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Click **Build APK(s)**
4. When the notification says "APK(s) generated", click **locate**

**Debug APK location:**
```
artifacts/verb-trainer/android/app/build/outputs/apk/debug/app-debug.apk
```

### Step 8 — Install on a device

**Option A — USB (fastest):**
1. On your Android phone: Settings → About Phone → tap **Build number** 7 times
2. Settings → Developer options → enable **USB Debugging**
3. Connect via USB and run:
   ```bash
   adb install artifacts/verb-trainer/android/app/build/outputs/apk/debug/app-debug.apk
   ```

**Option B — File transfer:**
Copy the `.apk` file to the phone (via USB, Google Drive, email, etc.) and
open it with a file manager app. You may need to allow "Install from unknown
sources" in Settings → Security.

---

## Daily workflow (after initial setup)

```bash
# Pull latest code
git pull

# Rebuild web assets and sync to Android
cd artifacts/verb-trainer
pnpm run cap:build
pnpm run cap:sync

# Open Android Studio and rebuild APK (or reinstall directly via adb)
pnpm run cap:open
```

---

## Building a signed Release APK (for distribution)

The debug APK above is fine for personal use. For publishing to Google Play
or sharing more broadly, build a signed release:

1. In Android Studio: **Build → Generate Signed Bundle / APK**
2. Choose **APK**, click Next
3. Create a keystore (first time):
   - Save it somewhere safe — e.g. `~/keys/verbtrainer.jks`
   - Key alias: `verbtrainer`
   - Validity: 25 years
4. Select the **release** build variant, click Finish

**Keep the keystore file backed up.** You need the same keystore for every
future update. Losing it means you cannot update the same app listing.

Release APK location:
```
artifacts/verb-trainer/android/app/build/outputs/apk/release/app-release.apk
```

---

## App configuration reference

| Setting | Value |
|---------|-------|
| App ID (package name) | `com.verbtrainer.app` |
| App name | `English Verb Trainer` |
| Capacitor version | 8.x |
| Minimum Android | API 22 (Android 5.1 Lollipop) |
| Target Android | API 35 (Android 15) |
| Web assets directory | `dist/public/` |
| Routing mode | Hash-based (`#/practice`, `#/dictionary`, …) |
| Storage | `localStorage` + IndexedDB — persists across sessions |
| Status Bar | `#070B17` background, light icons |
| Navigation Bar | `#070B17` background, light icons |
| Splash Screen | `#070B17` background, auto-hides on app mount |

---

## Troubleshooting

**`pnpm install` fails with "SDK location not found" or esbuild errors**  
Make sure `ANDROID_HOME` is set and your shell has been reloaded. Also verify
Node.js ≥ 20 and pnpm ≥ 9: `node -v` and `pnpm -v`.

**Blank white screen when opening the app on a device**  
The web assets may be stale. Run `cap:build` then `cap:sync` again, then
reinstall the APK.

**"INSTALL_FAILED_UPDATE_INCOMPATIBLE" when running adb install**  
Uninstall the previous version first:
```bash
adb uninstall com.verbtrainer.app
adb install app-debug.apk
```

**Gradle sync fails in Android Studio**  
Try: File → Invalidate Caches → Invalidate and Restart. If it persists,
check that Java 17 is selected: File → Project Structure → SDK → JDK location.

**Routing shows 404 or a blank page after navigation**  
Capacitor builds use hash routing (`/#/practice`). If you tap a link and the
page is blank, check whether the route appears in the URL bar after the `#`.

**Keyboard covers the input field on Android**  
The app uses the VisualViewport API to detect the keyboard and shrinks the
card/input/button area automatically. This requires Android WebView ≥ 61
(shipped with Android 5.0+).

**"adb: command not found"**  
`adb` lives in the Android SDK platform-tools folder. Ensure that folder is in
your `PATH` (see the `ANDROID_HOME` setup above).

**Status Bar or Navigation Bar shows gray / white instead of dark**  
You skipped Step 4b. Copy the XML files from `capacitor-android-templates/`
into `android/app/src/main/res/values/` as shown in the guide, then rebuild
the APK in Android Studio.

**Splash screen is white / doesn't match the app**  
Same fix as above — the splash background is defined in `colors.xml` and
`splash.xml` inside `capacitor-android-templates/`. Copy them to the
Android project and rebuild.

---

## Project structure (quick reference)

```
repo-root/
├── artifacts/
│   └── verb-trainer/          ← the English Verb Trainer app
│       ├── src/               ← React source code
│       ├── public/            ← static assets (icons, manifest)
│       ├── capacitor.config.ts   ← Capacitor configuration
│       ├── vite.config.cap.ts    ← Vite config for Capacitor builds
│       ├── vite.config.ts        ← Vite config for web dev server (Replit)
│       ├── ANDROID_BUILD.md      ← detailed Capacitor build reference
│       └── android/           ← generated by cap:add:android (not in git)
├── pnpm-workspace.yaml        ← monorepo workspace config
└── README_FIRST.md            ← this file
```

---

## Getting help

- Capacitor docs: https://capacitorjs.com/docs
- Android Studio docs: https://developer.android.com/studio/intro
- For app-specific questions, see `artifacts/verb-trainer/ANDROID_BUILD.md`
