/**
 * Cross-platform helper: ensures the Capacitor Android platform exists.
 * If `android/` is missing, runs `npx cap add android` automatically.
 * This makes `pnpm run cap:sync` work on a clean Windows/macOS/Linux clone
 * without any manual shell commands.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const androidDir = path.join(root, 'android');

if (!fs.existsSync(androidDir)) {
  console.log('Android platform not found. Adding it now...');
  execSync('npx cap add android', { stdio: 'inherit', cwd: root });
} else {
  console.log('Android platform already exists.');
}
