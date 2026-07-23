/**
 * Cross-platform preinstall hook for the workspace root.
 *
 * Replaces the previous Unix-only shell script:
 *   sh -c 'rm -f package-lock.json yarn.lock; case "$npm_config_user_agent" in pnpm/*) ;; *) echo "Use pnpm instead" >&2; exit 1 ;; esac'
 *
 * This version runs on Node.js, which is available on Linux, macOS, and Windows.
 */

const fs = require('fs');
const path = require('path');

function removeFile(name) {
  try {
    fs.rmSync(path.resolve(name), { force: true });
  } catch {
    // ignore errors (e.g. file does not exist)
  }
}

// Remove lock files from other package managers so they never interfere with pnpm.
removeFile('package-lock.json');
removeFile('yarn.lock');

// Ensure pnpm is being used. npm/yarn set a different npm_config_user_agent.
const userAgent = process.env.npm_config_user_agent || '';
if (!userAgent.startsWith('pnpm/')) {
  console.error('Use pnpm instead');
  process.exit(1);
}
