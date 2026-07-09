# Android APK Build Guide — English Verb Trainer

Packaging method: **Capacitor 8**
App ID: `com.verbtrainer.app`
App name: `English Verb Trainer`

---

## Prerequisites

Install these once on your local machine:

| Tool | Version | Download |
|------|---------|---------|
| Node.js | 20 LTS or newer | https://nodejs.org |
| pnpm | 9 or newer | `npm i -g pnpm` |
| Java JDK | 17 (required by Android Gradle) | https://adoptium.net |
| Android Studio | Ladybug 2024.2 or newer | https://developer.android.com/studio |

After installing Android Studio:
1. Open Android Studio → SDK Manager
2. Install **Android SDK Platform 35** (or latest stable)
3. Install **Android SDK Build-Tools 35**
4. Set the `ANDROID_HOME` environment variable:
   - **macOS/Linux**: add to `~/.zshrc` or `~/.bashrc`:
     ```
     export ANDROID_HOME=$HOME/Library/Android/sdk        # macOS
     export ANDROID_HOME=$HOME/Android/Sdk               # Linux
     export PATH=$PATH:$ANDROID_HOME/platform-tools
     ```
   - **Windows**: add to System Environment Variables:
     ```
     ANDROID_HOME = C:\Users\<YourName>\AppData\Local\Android\Sdk
     ```

---

## Step 1 — Get the project

Clone or pull the latest code from Replit, then install dependencies:

```bash
git clone <your-repo-url>
cd <repo-root>
pnpm install
```

---

## Step 2 — Build the web assets for Capacitor

Run the Capacitor-specific Vite build. This produces a relative-path build
in `artifacts/verb-trainer/dist/public/`:

```bash
cd artifacts/verb-trainer
pnpm run cap:build
```

This command uses `vite.config.cap.ts` which:
- Sets `base: "./"` so all asset paths are relative (required for `file://` webview)
- Enables hash-based routing (`#/practice`, `#/dictionary`, etc.)
- Excludes Replit-specific dev plugins

---

## Step 3 — Add the Android platform (first time only)

```bash
pnpm run cap:add:android
```

This generates the `android/` directory with the full Gradle project.
You only need to run this once. After that, use `cap:sync` to update it.

---

## Step 3b — Configure Android system bars *(first time only)*

Copy the pre-made native Android theme files into the generated project so
the Status Bar and Navigation Bar match your app's dark background:

```bash
cd artifacts/verb-trainer

# Create the colors resource
cp capacitor-android-templates/colors.xml \
   android/app/src/main/res/values/colors.xml

# Replace the generated theme with the app-matching one
cp capacitor-android-templates/styles.xml \
   android/app/src/main/res/values/styles.xml

# Copy the splash background
cp capacitor-android-templates/splash.xml \
   android/app/src/main/res/drawable/splash.xml
```

What this does:
- Status Bar → solid `#070B17` background with light icons
- Navigation Bar → solid `#070B17` background with light icons
- Splash screen → `#070B17` background matching the app

You only need to do this once. `cap:sync` will never overwrite these files.

---

## Step 4 — Sync web assets to Android

```bash
pnpm run cap:sync
```

This copies `dist/public/` into `android/app/src/main/assets/public/`
and updates any native plugin configuration.

Run this every time you rebuild the web assets.

---

## Step 5 — Open in Android Studio

```bash
pnpm run cap:open
```

Android Studio opens the `android/` Gradle project automatically.

---

## Step 6 — Build the Debug APK

In Android Studio:

1. Wait for Gradle sync to complete (first time takes 2–5 minutes)
2. Menu → **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Click **Build APK(s)**
4. When complete, click the **locate** link in the notification bar

The debug APK is at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Step 6b — Build a Release APK (optional, for distribution)

1. Menu → **Build → Generate Signed Bundle / APK**
2. Select **APK**, click Next
3. Create a new keystore (first time) or use an existing one:
   - Key store path: save to a safe location, e.g. `~/keys/verbtrainer.jks`
   - Key alias: `verbtrainer`
   - Validity: 25+ years
4. Select **release** build variant, click Finish

The release APK is at:
```
android/app/build/outputs/apk/release/app-release.apk
```

**Important:** Keep the keystore file backed up. You need the same keystore for
every future update to the same app — losing it means creating a new app listing.

---

## Step 7 — Install on a physical device

Enable developer options on your Android phone:
1. Settings → About Phone → tap **Build Number** 7 times
2. Settings → Developer Options → enable **USB Debugging**

Connect via USB, then run:

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

Or transfer the `.apk` file to the device and open it with a file manager.

---

## Daily workflow (after initial setup)

```bash
# Edit code in Replit, then pull latest changes
git pull

# Rebuild web assets
cd artifacts/verb-trainer
pnpm run cap:build

# Sync to Android
pnpm run cap:sync

# Open Android Studio or reinstall via adb
pnpm run cap:open
```

---

## App configuration

| Setting | Value |
|---------|-------|
| App ID | `com.verbtrainer.app` |
| App name | `English Verb Trainer` |
| Capacitor version | 8.x |
| Min Android SDK | 22 (Android 5.1) |
| Target SDK | 35 (Android 15) |
| Web dir | `dist/public` |
| Routing | Hash-based (`#/practice`, etc.) |
| Storage | `localStorage` + IndexedDB (both work natively in Capacitor webview) |
| Status Bar | `#070B17` background, light icons |
| Navigation Bar | `#070B17` background, light icons |
| Splash Screen | `#070B17` background, auto-hides on app mount |

---

## Troubleshooting

**"SDK location not found"**
Set `ANDROID_HOME` environment variable (see Prerequisites).

**Blank white screen on device**
Run `pnpm run cap:build` and `pnpm run cap:sync` again — the web assets may be missing.

**Routing shows 404 / wrong page**
Capacitor builds use hash routing (`#/`). If you navigate to `/#/practice` manually and it works, routing is fine.

**localStorage data not persisting**
Capacitor's webview persists `localStorage` across sessions by default. No extra configuration needed.

**Keyboard pushes content off screen**
The `useKeyboardVisible` hook in the app uses the VisualViewport API which works in Capacitor's webview on Android 5+.

**Status Bar or Navigation Bar shows wrong color (gray/white)**
You skipped Step 3b. Copy the XML files from `capacitor-android-templates/`
into `android/app/src/main/res/values/` as shown in the guide, then rebuild
the APK in Android Studio.

**Splash screen is white / doesn't match the app**
Same fix as above — the splash background is defined in `colors.xml` and
`splash.xml` inside `capacitor-android-templates/`. Copy them to the
Android project and rebuild.

---

## Publishing to Google Play (future)

When ready to publish:
1. Build a signed Release APK (Step 6b above)
2. Create a Google Play Developer account ($25 one-time fee)
3. Create a new app → upload the `.aab` (Android App Bundle) or `.apk`
4. Fill in store listing, screenshots, and privacy policy
5. Submit for review

For Play Store, use **Build Bundle** (`.aab`) instead of **Build APK** —
it produces smaller downloads for users.
