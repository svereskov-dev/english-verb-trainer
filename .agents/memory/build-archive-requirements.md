---
name: Build archive requirements
description: Every zip created for the user to build the Android app must include all root workspace files and the android/ project — never just artifacts/.
---

# Build archive requirements

**Rule:** Every zip handed to the user for building the Android APK must be a complete, self-contained archive that works after a single `pnpm install`.

**Why:** The user has had to ask multiple times because archives were missing root workspace files. A zip that unpacks to only `artifacts/` with no `package.json` / `pnpm-workspace.yaml` at the root is unusable — `pnpm install` fails immediately.

**How to apply:** Any time the user asks for a build archive / download zip, construct it like this:

```bash
zip -r verbflow-build.zip \
  package.json \
  pnpm-workspace.yaml \
  pnpm-lock.yaml \
  tsconfig.json \
  tsconfig.base.json \
  .npmrc \
  scripts/preinstall.cjs \
  artifacts/verb-trainer \
  --exclude "artifacts/verb-trainer/node_modules/*" \
  --exclude "artifacts/verb-trainer/dist/*" \
  --exclude "artifacts/verb-trainer/dev-dist/*" \
  --exclude "artifacts/verb-trainer/.vite/*" \
  --exclude "artifacts/verb-trainer/android/app/build/*" \
  --exclude "artifacts/verb-trainer/android/.gradle/*" \
  --exclude "artifacts/verb-trainer/android/build/*" \
  --exclude "artifacts/verb-trainer/android/capacitor-cordova-android-plugins/build/*"
```

**Must include:**
- Root `package.json` — workspace definition and `build:android` script
- `pnpm-workspace.yaml` — tells pnpm which packages exist
- `pnpm-lock.yaml` — reproducible installs
- `tsconfig.json` + `tsconfig.base.json` — TypeScript project references
- `.npmrc` — pnpm config (auto-install-peers etc.)
- `scripts/preinstall.cjs` — runs on `pnpm install` via root preinstall hook
- `artifacts/verb-trainer/` — full source including `android/` project

**Must exclude (generated / cache only):**
- `node_modules/` anywhere
- `dist/`, `dev-dist/`, `.vite/`
- `android/app/build/`, `android/.gradle/`, `android/build/`
- `android/capacitor-cordova-android-plugins/build/`
