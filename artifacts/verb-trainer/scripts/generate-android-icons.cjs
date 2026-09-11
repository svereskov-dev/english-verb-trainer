/**
 * Cross-platform Android adaptive icon generator.
 *
 * Converts the canonical assets/app-icon.png artwork into the mipmap PNGs required by
 * Android, at all standard densities. Works on Windows, macOS, and Linux as
 * long as ImageMagick 7+ is installed (uses `magick` if available, otherwise
 * `convert`).
 *
 * Run from the artifact root:
 *   node scripts/generate-android-icons.cjs
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const androidRes = path.join(root, 'android', 'app', 'src', 'main', 'res');
const assetsDir = path.join(root, 'assets');

// The single source-of-truth app icon (wave + book), also used by onboarding.
const appIconPng = path.join(assetsDir, 'app-icon.png');

const densities = [
  { name: 'mdpi', scale: 1, fg: 108, legacy: 48 },
  { name: 'hdpi', scale: 1.5, fg: 162, legacy: 72 },
  { name: 'xhdpi', scale: 2, fg: 216, legacy: 96 },
  { name: 'xxhdpi', scale: 3, fg: 324, legacy: 144 },
  { name: 'xxxhdpi', scale: 4, fg: 432, legacy: 192 },
];

function findImageMagick() {
  for (const cmd of ['magick', 'convert']) {
    try {
      execFileSync(cmd, ['-version'], { stdio: 'ignore' });
      return cmd;
    } catch {
      // try next
    }
  }
  throw new Error('ImageMagick not found. Please install ImageMagick and ensure "magick" or "convert" is on PATH.');
}

// ---------------------------------------------------------------------------
// Check whether rasterisation is needed:
//   - All output PNGs already exist  AND
//   - Neither the source artwork nor this generator is newer than the outputs
// If so, skip (ImageMagick may not be available on Windows).
// ---------------------------------------------------------------------------
function allPngsExist() {
  for (const d of densities) {
    const mipmap = path.join(androidRes, `mipmap-${d.name}`);
    if (
      !fs.existsSync(path.join(mipmap, 'ic_launcher_foreground.png')) ||
      !fs.existsSync(path.join(mipmap, 'ic_launcher.png')) ||
      !fs.existsSync(path.join(mipmap, 'ic_launcher_round.png'))
    ) return false;
  }
  return true;
}

function sourceNewerThanPngs() {
  const srcMtime = Math.max(
    fs.statSync(appIconPng).mtimeMs,
    fs.statSync(__filename).mtimeMs,
  );
  for (const d of densities) {
    const mipmap = path.join(androidRes, `mipmap-${d.name}`);
    const pngMtime = fs.statSync(path.join(mipmap, 'ic_launcher.png')).mtimeMs;
    if (srcMtime > pngMtime) return true;
  }
  return false;
}

if (allPngsExist() && !sourceNewerThanPngs()) {
  console.log('Android icon PNGs are up to date — skipping ImageMagick rasterisation.');
  process.exit(0);
}

// PNGs are missing or the source/generator changed — rasterisation required.
let im;
try {
  im = findImageMagick();
} catch (e) {
  // ImageMagick is not installed. Pre-generated PNGs should have been shipped
  // with the project. If they are missing this will cause a Gradle build error.
  console.warn('WARNING: ' + e.message);
  console.warn('Skipping icon rasterisation. If mipmap PNGs are missing, install ImageMagick and re-run.');
  process.exit(0);
}

function convertPng(input, output, canvasSize, artworkSize = canvasSize) {
  execFileSync(im, [
    input,
    '-resize', `${artworkSize}x${artworkSize}`,
    '-background', 'none',
    '-gravity', 'center',
    '-extent', `${canvasSize}x${canvasSize}`,
    output,
  ], { stdio: 'inherit' });
}

for (const d of densities) {
  const mipmap = path.join(androidRes, `mipmap-${d.name}`);
  if (!fs.existsSync(mipmap)) {
    fs.mkdirSync(mipmap, { recursive: true });
  }

  // Adaptive icon foreground (108dp canvas). Android launchers and the Android
  // 12+ splash screen crop this canvas to different masks, so keep the complete
  // canonical icon inside the 72dp safe area instead of zooming/cropping it.
  const fgOut = path.join(mipmap, 'ic_launcher_foreground.png');
  convertPng(appIconPng, fgOut, d.fg, Math.round(d.fg * 2 / 3));
  console.log(`Generated ${fgOut}`);

  // Legacy launcher icon (48dp canvas)
  const legacyOut = path.join(mipmap, 'ic_launcher.png');
  const roundOut = path.join(mipmap, 'ic_launcher_round.png');
  convertPng(appIconPng, legacyOut, d.legacy);
  fs.copyFileSync(legacyOut, roundOut);
  console.log(`Generated ${legacyOut} + round variant`);
}

console.log('\nAndroid adaptive icon assets generated successfully.');
