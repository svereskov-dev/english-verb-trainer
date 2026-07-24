/**
 * Cross-platform cleanup: remove the Capacitor-generated splash.png from the
 * unqualified drawable/ bucket so it can never collide with our splash.xml.
 *
 * Both splash.png and splash.xml would resolve to @drawable/splash, which is a
 * duplicate-resource build error. XML takes precedence for us, so the PNG must
 * always be gone. This script runs before and after `cap sync` to keep the
 * pipeline idempotent even if a future Capacitor or plugin version recreates it.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const conflictingPng = path.join(root, 'android/app/src/main/res/drawable/splash.png');

if (fs.existsSync(conflictingPng)) {
  fs.unlinkSync(conflictingPng);
  console.log('Removed drawable/splash.png (keeps drawable/splash.xml authoritative)');
} else {
  console.log('drawable/splash.png already absent — no conflict');
}
