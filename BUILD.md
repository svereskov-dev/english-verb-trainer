# English Verb Trainer — Build Guide

Cross-platform build guide for Linux, macOS, and Windows.

## What's in this ZIP

```
artifacts/
  verb-trainer/          ← ALL the app source code lives here
    src/                 ← React + TypeScript source
    public/              ← Static assets
    capacitor-android-templates/  ← Android native files
    scripts/             ← Cross-platform build helpers
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

## Prerequisites

| Tool | Version | Link |
|------|---------|------|
| Node.js | 20 LTS+ | https://nodejs.org |
| pnpm | 9+ | `npm i -g pnpm` |
| Java JDK | 17 | https://adoptium.net |
| Android Studio | Ladybug 2024.2+ | https://developer.android.com/studio |

After installing Android Studio, set `ANDROID_HOME`:

- **macOS/Linux**: add to `~/.zshrc` or `~/.bashrc`
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk   # macOS
  export ANDROID_HOME=$HOME/Android/Sdk           # Linux
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```
- **Windows**: add a System Environment Variable
  ```
  ANDROID_HOME = C:\Users\<YourName>\AppData\Local\Android\Sdk
  ```

## Quick start — one-command APK build

From the **root of the extracted folder** (same command on every OS):

```bash
pnpm install
pnpm run build:android
pnpm run cap:open
```

Then in Android Studio: **Build → Build APK(s)**.

That's it — no manual edits, no copying files, and no Unix shell required. All
three commands run from the project root; the `cap:open` script delegates to the
`verb-trainer` package automatically.

## What each script does

| Script | Purpose |
|--------|---------|
| `pnpm install` | Installs all dependencies; the preinstall hook ensures pnpm is used |
| `pnpm run build:android` | Builds web assets, ensures the Android platform exists, copies the native templates, and syncs everything into `android/` |
| `pnpm run cap:open` | Opens the Android project in Android Studio |

## Individual commands

If you prefer to run the steps separately:

```bash
pnpm install
pnpm run build          # typecheck + build web assets
pnpm run cap:sync       # ensures android/ exists, copies templates, syncs web assets
pnpm run cap:open
```

## Windows notes

- Use **PowerShell** or **Command Prompt**. No Git Bash, WSL, or Unix shell is required.
- All build scripts are plain Node.js files so they work identically on every OS.
- `pnpm install` automatically removes stray `package-lock.json` / `yarn.lock` files.

## Replit vs. local builds

This exported project does **not** depend on any Replit-only libraries or environment variables:

- `PORT` and `BASE_PATH` have sensible defaults (`5173` and `/`).
- Replit-specific Vite plugins are not imported or loaded.
- The build succeeds on a clean clone with no extra environment variables.

See `artifacts/verb-trainer/ANDROID_BUILD.md` for release signing, device installation, and troubleshooting.
