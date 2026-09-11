/**
 * Cross-platform helper: copies the Android system-bar / WebView templates
 * into the generated `android/` directory.
 *
 * Replaces the manual `cp` and `mkdir -p` commands from BUILD.md so that
 * Windows developers do not need Unix shell tools or WSL.
 *
 * These templates implement:
 *   - dark transparent status bar / solid dark nav bar
 *   - Android 15 edge-to-edge reinforcement
 *   - lifecycle-aware bar color re-application in MainActivity
 *   - compact keyboard layout via NoNumberRowWebView
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const templatesDir = path.join(root, 'capacitor-android-templates');
const androidDir = path.join(root, 'android');

const mappings = [
  ['colors.xml', 'app/src/main/res/values/colors.xml'],
  ['strings.xml', 'app/src/main/res/values/strings.xml'],
  ['styles.xml', 'app/src/main/res/values/styles.xml'],
  ['splash.xml', 'app/src/main/res/drawable/splash.xml'],
  ['file_paths.xml', 'app/src/main/res/xml/file_paths.xml'],
  ['ic_launcher_background.xml', 'app/src/main/res/values/ic_launcher_background.xml'],
  ['mipmap-anydpi-v26/ic_launcher.xml', 'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml'],
  ['mipmap-anydpi-v26/ic_launcher_round.xml', 'app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml'],
  ['values-v35/styles.xml', 'app/src/main/res/values-v35/styles.xml'],
  ['MainActivity.java', 'app/src/main/java/com/verbtrainer/app/MainActivity.java'],
  ['NoNumberRowWebView.java', 'app/src/main/java/com/verbtrainer/app/NoNumberRowWebView.java'],
  ['capacitor_bridge_layout_main.xml', 'app/src/main/res/layout/capacitor_bridge_layout_main.xml'],
];

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log(`Copied ${path.relative(root, src)} -> ${path.relative(root, dest)}`);
}

for (const [srcRel, destRel] of mappings) {
  const src = path.join(templatesDir, srcRel);
  const dest = path.join(androidDir, destRel);
  copyFile(src, dest);
}

// ---------------------------------------------------------------------------
// Remove the unqualified Capacitor-generated splash.png so it does not conflict
// with splash.xml. cleanup-android-splash.cjs runs before and after cap sync and
// also removes orientation/density variants that could override this XML.
// ---------------------------------------------------------------------------
const conflictingPng = path.join(androidDir, 'app/src/main/res/drawable/splash.png');
if (fs.existsSync(conflictingPng)) {
  fs.unlinkSync(conflictingPng);
  console.log('Removed drawable/splash.png (conflicts with drawable/splash.xml — XML takes precedence)');
}
