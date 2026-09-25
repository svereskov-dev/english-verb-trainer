# VerbFlow — Android source and release build

This repository is the complete source tree for the VerbFlow Android app. It
contains the React/Vite application, its local educational data and assets,
Capacitor configuration, the native Android project (including the Gradle
wrapper and Billing plugin module), and the pnpm workspace files needed for a
fresh install. The API server and mockup project from the original workspace
are not dependencies and are not included.

The Android application ID is `com.verbflow.app`. The current release values
are `versionCode 1` and `versionName "1.0"` in
`artifacts/verb-trainer/android/app/build.gradle`. The existing one-time
purchase product ID is `full_access`. Do not change the application ID or
product ID when preparing an update.

## Windows prerequisites

- **Node.js 22.12.0 or newer** (the installed Capacitor CLI requires Node 22+
  and Vite requires Node 22.12+ on the Node 22 line).
- **pnpm 10.26.1** (the version used to validate this export). Install or
  activate this version before running the commands below; for example, use
  `corepack enable` and `corepack prepare pnpm@10.26.1 --activate` if Corepack
  is available.
- **JDK 21**, with `JAVA_HOME` pointing to that JDK and `java -version`
  reporting 21. Configure Android Studio's **Gradle JDK** to use Java 21 too.
- **Android SDK Platform 36**, Android SDK Build-Tools **36.0.0**, Platform
  Tools, and Android SDK Command-line Tools in Android Studio's SDK Manager.
  Set `ANDROID_HOME` to your SDK directory if it is not detected (normally
  `C:\Users\<you>\AppData\Local\Android\Sdk`).

The included Gradle wrapper is 8.14.3; use `gradlew.bat` rather than a
separately installed Gradle. The native project compiles and targets SDK 36
and uses Java 21 compatibility. On first build, Gradle downloads its declared
plugins and Maven dependencies; no application source needs to be downloaded
separately.

## Install, build web assets, and synchronize Android

1. Extract `VerbFlow_GooglePlay_Source.zip` into a new directory such as
   `C:\dev\VerbFlow`. The extracted directory should contain `package.json`,
   `pnpm-lock.yaml`, `.npmrc`, and `artifacts\verb-trainer\` directly (there
   should be no extra nested archive folder).
2. Open **PowerShell** and run these commands **from the extracted root**:

   ```powershell
   Set-Location C:\dev\VerbFlow
   node --version
   pnpm --version
   java -version
   pnpm install --frozen-lockfile
   pnpm --filter @workspace/verb-trainer run typecheck
   pnpm --filter @workspace/verb-trainer run test:training
   ```

3. Still **from the extracted root**, build the Android web assets and then
   synchronize them and the plugins into the included native project:

   ```powershell
   pnpm --filter @workspace/verb-trainer run cap:build
   pnpm --filter @workspace/verb-trainer run cap:sync
   ```

   `pnpm run build:android` is an equivalent single command that performs both
   steps in that order. Re-run it after web source, native template, or
   dependency changes. The separate web/PWA production build, if wanted, is
   `pnpm --filter @workspace/verb-trainer run build`.

   The sync generates `artifacts\verb-trainer\android\app\src\main\assets\public\`
   with `index.html`, the offline Third-Party Licenses notice, Inter font
   assets, and the rest of the app. Generated web assets and machine-local
   Gradle files are deliberately not committed. The `cap:configure-jdk` step
   in the sync attempts to set up a local Android Studio JDK mapping; if
   Android Studio reports an invalid Gradle JDK, select your JDK 21 manually
   in **Settings > Build, Execution, Deployment > Build Tools > Gradle**.
   Do not commit a machine-specific `.gradle/config.properties`.

## Restore your *existing* upload signing key

You already have the original upload key and `signing.properties`. **Do not
generate a new key.** Store the existing `.jks`/`.keystore` outside the
repository, then restore your existing signing properties to:

`C:\dev\VerbFlow\artifacts\verb-trainer\android\signing.properties`

If you extracted elsewhere, use that location's
`artifacts\verb-trainer\android\signing.properties`. In that file, `storeFile`
must point to the existing keystore (an absolute path with forward slashes is
reliable on Windows), and the existing `storePassword`, `keyAlias`, and
`keyPassword` must all be present. A relative `storeFile` resolves from the
`android` directory. Gradle also accepts all four `VERBFLOW_UPLOAD_*`
environment variables instead of the properties file. Partial credentials
cause a build error; a release built with no credentials may be unsigned.
Both the signing properties and private keys are ignored by Git and excluded
from this ZIP. Never paste them into source control.

## Build and verify the signed release AAB

After restoring signing files, change into the native Android project and
build with the included Windows wrapper:

```powershell
Set-Location C:\dev\VerbFlow\artifacts\verb-trainer\android
.\gradlew.bat :app:bundleRelease
```

The output is:

`C:\dev\VerbFlow\artifacts\verb-trainer\android\app\build\outputs\bundle\release\app-release.aab`

Verify that the bundle is signed with the **same upload certificate** used for
previous uploads, and that the build finished successfully:

```powershell
jarsigner -verify -verbose -certs .\app\build\outputs\bundle\release\app-release.aab
```

Check that the output includes `jar verified` and compare the signing
certificate fingerprint with the upload certificate registered in Play
Console. The Cordova purchase module declares
`com.android.vending.BILLING`, which should merge into the app manifest.
After the release build, confirm the permission appears in a **release**
merged manifest:

```powershell
Get-ChildItem .\app\build\intermediates -Recurse -Filter AndroidManifest.xml |
  Where-Object { $_.FullName -match 'release' } |
  Select-String -Pattern 'com.android.vending.BILLING'
```

Alternatively, inspect the **Merged Manifest** for the release variant in
Android Studio. Confirm the final package ID, `versionCode`, `versionName`,
purchase product, and license/offline entitlement behavior before uploading
the AAB. The final signed AAB and merged manifest are **not built or
verified by this source export**; perform those checks on your Java 21
Windows build machine.

## Subsequent releases and GitHub

For each Play update, increase `versionCode` in
`artifacts/verb-trainer/android/app/build.gradle` beyond the last uploaded
code; set `versionName` to the desired user-facing release label. Rebuild and
sync, then sign with the **same original upload key**. Do not commit signing
files, local Android SDK paths, generated APKs, or AABs.

This extracted folder is also the GitHub-ready project. After confirming the
destination repository and its visibility, initialize/push it from the
extracted root if the destination is empty:

```powershell
Set-Location C:\dev\VerbFlow
git init
git add .
git status --short
git diff --cached --check
git commit -m "Add VerbFlow Android source"
git branch -M main
git remote add origin <approved-repository-URL>
git push -u origin main
```

If the destination **already has commits**, clone it first and copy the
exported source into that clone, then commit and push normally. Do not
force-push or rewrite existing history. No GitHub push is performed by
creating this export.

## Legal and source notices

The offline dependency/font notices are in
`artifacts/verb-trainer/src/assets/licenses/THIRD_PARTY_LICENSES.txt`.
The copyright and content provenance reports remain alongside the app
source. The original workspace's root `MIT` package metadata was not carried
into this standalone export: it did not establish a license for original
VerbFlow educational materials or artwork. No blanket license for those
materials is granted here; retain all third-party notices and decide any
separate public licensing terms explicitly.