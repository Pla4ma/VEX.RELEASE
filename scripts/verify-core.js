const { spawnSync } = require('node:child_process');

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const COMMAND_TIMEOUT_MS = 180_000;

const checks = [
  ['typecheck', ['run', 'typecheck']],
  ['lint', ['run', 'lint']],
  ['banned-patterns', ['run', 'check:banned-patterns']],
  ['line-limit', ['run', 'check:line-limit']],
  ['typescript-suppression', ['run', 'check:no-ts-nocheck']],
  ['select-star', ['run', 'check:select-star']],
  ['core-jest', ['run', 'test:core']],
  ['web-e2e', ['run', 'test:e2e:web']],
];

let failed = 0;

for (const [name, args] of checks) {
  process.stdout.write(`\n[verify:core] ${name}\n`);
  const result = spawnSync(npm, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
    timeout: COMMAND_TIMEOUT_MS,
    windowsHide: true,
  });

  if (result.error) {
    process.stderr.write(
      `[verify:core] ${name} failed: ${result.error.message}\n`,
    );
    failed += 1;
    continue;
  }

  if (result.status !== 0) {
    process.stderr.write(
      `[verify:core] ${name} exited with ${result.status ?? 'unknown'}\n`,
    );
    failed += 1;
  }
}

if (failed > 0) {
  process.stderr.write(`\n[verify:core] ${failed} check(s) failed\n`);
  process.exitCode = 1;
} else {
  process.stdout.write('\n[verify:core] all checks passed\n');
}
