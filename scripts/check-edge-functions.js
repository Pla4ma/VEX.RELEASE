#!/usr/bin/env node

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const localDeno = process.env.HOME
  ? path.join(process.env.HOME, '.deno', 'bin', 'deno')
  : null;
const deno = process.env.DENO_BIN ?? (localDeno && fs.existsSync(localDeno) ? localDeno : 'deno');
const entrypoints = [
  'supabase/functions/ai-coach/index.ts',
  'supabase/functions/session-complete/index.ts',
];
const contentStudyFiles = [
  'supabase/functions/content-study/index.ts',
];

try {
  execFileSync(deno, ['check', '--no-config', ...entrypoints], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  execFileSync(
    deno,
    ['test', '--no-config', 'supabase/functions/ai-coach/success-response_test.ts'],
    { cwd: repoRoot, stdio: 'inherit' },
  );
  execFileSync(deno, ['check', '--no-config', ...contentStudyFiles], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  execFileSync(
    deno,
    [
      'test',
      '--no-config',
      'supabase/functions/content-study/__tests__/study-access.test.ts',
      'supabase/functions/content-study/__tests__/submit-content.test.ts',
      'supabase/functions/content-study/__tests__/extractors-text.test.ts',
      'supabase/functions/content-study/__tests__/youtube-video.test.ts',
    ],
    { cwd: repoRoot, stdio: 'inherit' },
  );
  execFileSync(
    deno,
    [
      'check',
      '--unstable-sloppy-imports',
      '--config',
      'supabase/functions/ai/deno.json',
      'supabase/functions/ai/index.ts',
    ],
    { cwd: repoRoot, stdio: 'inherit' },
  );
  execFileSync(
    deno,
    [
      'test',
      '--unstable-sloppy-imports',
      '--config',
      'supabase/functions/ai/deno.json',
      '--allow-env=LLM_API_KEY,LLM_BASE_URL,LLM_MODEL_FAST,LLM_ALLOW_INSECURE_HTTP',
      'supabase/functions/ai/generation_test.ts',
    ],
    { cwd: repoRoot, stdio: 'inherit' },
  );
  console.log('Edge Function type checks passed.');
} catch (error) {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
    console.error('ERROR: Deno is required for Edge Function validation.');
  }
  process.exitCode = 1;
}
