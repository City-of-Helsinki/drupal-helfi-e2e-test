const fs = require('fs');
const path = require('path');

const gitDir = path.join(process.cwd(), '.git');
const hooksDir = path.join(gitDir, 'hooks');
const hookPath = path.join(hooksDir, 'pre-commit');

// Skip when running under `npm ci` or when the hook already exists.
if (
  process.env.npm_command !== 'install' ||
  !fs.existsSync(gitDir) ||
  !fs.existsSync(hooksDir) ||
  fs.existsSync(hookPath)
) {
  process.exit(0);
}

const hookContent = `#!/bin/sh
npm run lint:js
RESULT=$?
if [ $RESULT -ne 0 ]; then
  exit 1
fi
exit 0
`;

fs.writeFileSync(hookPath, hookContent, { mode: 0o755 });
fs.chmodSync(hookPath, 0o755);
