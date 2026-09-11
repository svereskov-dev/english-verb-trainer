/**
 * Cross-platform cleanup: remove every Capacitor-generated splash.png so the
 * canonical drawable/splash.xml is used for all orientations and densities.
 *
 * The qualified drawable-port-* / drawable-land-* PNGs can silently override
 * the XML and previously showed Capacitor's old white logo. This script runs
 * before and after `cap sync` so those stale variants cannot return.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const resDir = path.join(root, 'android/app/src/main/res');
const drawableDirs = fs.existsSync(resDir)
  ? fs.readdirSync(resDir)
      .filter(name => name === 'drawable' || /^drawable-(?:port|land)-/.test(name))
      .map(name => path.join(resDir, name))
  : [];

let removed = 0;
for (const drawableDir of drawableDirs) {
  const splashPng = path.join(drawableDir, 'splash.png');
  if (fs.existsSync(splashPng)) {
    fs.unlinkSync(splashPng);
    removed += 1;
    console.log(`Removed ${path.relative(resDir, splashPng)}`);
  }
}

console.log(
  removed > 0
    ? `Removed ${removed} generated splash PNG variant(s); drawable/splash.xml is authoritative.`
    : 'Generated splash PNG variants already absent; drawable/splash.xml is authoritative.',
);
