# Android Build Guide — English Verb Trainer

Packaging: **Capacitor 8** · App ID: `com.verbflow.app` · Google Play release: **AAB**

---

## Prerequisites — install once

| Tool | Version | Link |
|------|---------|------|
| Node.js | 22.12.0 or later (required by Capacitor CLI 8) | https://nodejs.org |
| pnpm | 10.26.1 | `npm i -g pnpm@10.26.1` |
| Java JDK | 21 | https://adoptium.net |
| Android Studio | Ladybug 2024.2+ | https://developer.android.com/studio |

After installing Android Studio:
1. **SDK Manager** → install **Android SDK Platform 36** + **Android SDK Build-Tools 36.0.0**
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
4. `cap:configure-jdk` — creates Android Studio's local Gradle JDK mapping when
   `JAVA_HOME`, the system Java installation, or the Android Studio embedded JDK
   is available.
5. `cap:sync` — copies `dist/public/` into `android/app/src/main/assets/public/`.

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
| `capacitor-android-templates/MainActivity.java` | `android/app/src/main/java/com/verbflow/app/MainActivity.java` |
| `capacitor-android-templates/NoNumberRowWebView.java` | `android/app/src/main/java/com/verbflow/app/NoNumberRowWebView.java` |
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

## Step 3c — Keyboard resize mode

The current Android configuration does **not** set `adjustResize`. Do not add
`android:windowSoftInputMode="adjustResize"` as part of this build setup; the
app uses Capacitor 8's edge-to-edge window behavior.

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

### If Android Studio says “Invalid Gradle JDK configuration”

This message means Android Studio cannot resolve its project-local
`#GRADLE_LOCAL_JAVA_HOME` setting. It is not an application or Gradle script
error. The local JDK path is intentionally not included in the ZIP because it
is different on every computer.

Choose **Use Embedded JDK** in the warning, or set it manually:

1. Open **File → Settings → Build, Execution, Deployment → Build Tools →
   Gradle**.
2. Set **Gradle JDK** to **Embedded JDK** (Java 21).
3. Click **Apply → OK**, then run **File → Sync Project with Gradle Files**.

If you ran `pnpm run build:android` after installing Java 21, the setup script
usually creates `android/.gradle/config.properties` automatically. That file
is local-only and must not be committed or copied between computers.

---

## Step 6 — Restore Google Play upload signing

Google Play release bundles must be signed with your existing private upload
key. Restore your existing upload keystore and `signing.properties` from your
secure backup; do not generate a replacement key. Never commit the keystore,
passwords, alias, or `signing.properties`.

### 6.1 Restore your existing upload keystore

On the new computer, restore your existing `.jks`/`.keystore` file to its
original private location, or another private location you control. If restoring
to a different location, update the local `storeFile` path in
`signing.properties` accordingly. Keep the keystore and its backup private.

### 6.2 Restore the local signing properties file

Restore your existing, untracked file:

```text
artifacts/verb-trainer/android/signing.properties
```

The file must point to the restored keystore and contain the same credentials
used for the existing upload key. Do not create a new key or replace these
credentials.

`signing.properties`, `*.jks`, and `*.keystore` are ignored by Git. Do not put
real signing values in any committed file, screenshot, chat, or build archive.

As an alternative for command-line or CI builds, omit `signing.properties` and
set all four environment variables:

```powershell
$env:VERBFLOW_UPLOAD_STORE_FILE="C:\Users\YOUR_WINDOWS_USER\.android\keys\verbflow-upload.jks"
$env:VERBFLOW_UPLOAD_STORE_PASSWORD="YOUR_KEYSTORE_PASSWORD"
$env:VERBFLOW_UPLOAD_KEY_ALIAS="verbflow-upload"
$env:VERBFLOW_UPLOAD_KEY_PASSWORD="YOUR_KEY_PASSWORD"
```

The Gradle configuration rejects partial signing credentials. Either provide
all four values or none.

### 6.3 Build the signed release AAB

From the extracted project root:

```powershell
pnpm install
pnpm run build:android
Set-Location artifacts\verb-trainer\android
.\gradlew.bat bundleRelease
```

Expected output:

```text
artifacts\verb-trainer\android\app\build\outputs\bundle\release\app-release.aab
```

### 6.4 Verify the AAB signature

From the project root:

```powershell
jarsigner -verify -verbose -certs `
  artifacts\verb-trainer\android\app\build\outputs\bundle\release\app-release.aab
```

The command must finish with `jar verified`. You can also inspect the signing
certificate:

```powershell
keytool -printcert -jarfile `
  artifacts\verb-trainer\android\app\build\outputs\bundle\release\app-release.aab
```

Do not upload the bundle to Google Play until its application ID, version,
certificate, and release contents have been reviewed.

---

## Step 7 — Build an APK for local testing

In Android Studio:

1. Wait for Gradle sync (first time: 2–5 min)
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Click the **locate** link in the notification bar

Debug APK location:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK (for local distribution)
1. **Build → Generate Signed Bundle / APK → APK**
2. Select the existing VerbFlow upload keystore
3. Select **release** build variant

Release APK:
```
android/app/build/outputs/apk/release/app-release.apk
```

> **Back up your keystore and credentials.** You need them for future updates.

---

## Step 8 — Install on device

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
| App ID | `com.verbflow.app` |
| Capacitor | 8.x |
| Min SDK | 24 (Android 7.0) |
| Target SDK | 36 (Android 16) |
| Web dir | `dist/public` |
| Routing | Hash-based (`#/practice`, `#/dictionary`, …) |
| Status Bar | Transparent — app background visible |
| Navigation Bar | Opaque dark `#070B17` |
| Splash Screen | `#070B17` background, auto-hides on mount |

---

## Troubleshooting

**"SDK location not found"** — Set `ANDROID_HOME` (see Prerequisites).

**"Invalid Gradle JDK configuration"** — Select **Embedded JDK (Java 21)** in
Android Studio's Gradle settings as described in Step 5. Then sync the project
again. The native project uses Java 21 source compatibility.

**Blank white screen** — Run `cap:build` then `cap:sync`; web assets are missing.

**Navigation bar color is wrong** — Re-run `pnpm run cap:copy-templates` and
`pnpm run cap:sync`, then rebuild. The configured navigation bar is opaque dark
`#070B17`.

**Keyboard behavior differs from expectation** — This configuration intentionally
does not set `adjustResize`; do not add it as a build workaround.

**Routing 404** — Make sure you ran `pnpm run cap:build` (not the regular `build`).

**Status/nav bar wrong color after lock/unlock** — `MainActivity.java` from Step 3b re-applies on `onResume()`. Make sure you copied it.
