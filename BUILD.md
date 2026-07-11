# English Verb Trainer — Build Guide

## What's in this ZIP

```
artifacts/
  verb-trainer/          ← ALL the app source code lives here
    src/                 ← React + TypeScript source
    public/              ← Static assets
    capacitor-android-templates/  ← Android native files to copy (see below)
    capacitor.config.ts  ← Capacitor configuration
    index.html
    package.json
    vite.config.ts
    vite.config.cap.ts   ← Capacitor-specific Vite build
    ANDROID_BUILD.md     ← Full step-by-step APK build guide

package.json             ← Root workspace config
pnpm-workspace.yaml      ← pnpm workspace definition
pnpm-lock.yaml           ← Locked dependencies
tsconfig.base.json
tsconfig.json
```

## Quick start — build the APK

```bash
# 1. Install dependencies (from this folder)
pnpm install

# 2. Build web assets
cd artifacts/verb-trainer
pnpm run cap:build

# 3. Add Android platform (first time only)
pnpm run cap:add:android

# 4. Copy Android system bar templates (first time only)
cp capacitor-android-templates/colors.xml   android/app/src/main/res/values/colors.xml
cp capacitor-android-templates/styles.xml   android/app/src/main/res/values/styles.xml
cp capacitor-android-templates/splash.xml   android/app/src/main/res/drawable/splash.xml
mkdir -p android/app/src/main/res/values-v35
cp capacitor-android-templates/values-v35/styles.xml android/app/src/main/res/values-v35/styles.xml
cp capacitor-android-templates/MainActivity.java android/app/src/main/java/com/verbtrainer/app/MainActivity.java

# 5. Sync and open Android Studio
pnpm run cap:sync
pnpm run cap:open
```

Then in Android Studio: **Build → Build APK(s)**

See `artifacts/verb-trainer/ANDROID_BUILD.md` for the complete guide including
release signing, device installation, and troubleshooting.
