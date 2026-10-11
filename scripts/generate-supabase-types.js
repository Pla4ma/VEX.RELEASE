const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const projectId = process.env.SUPABASE_PROJECT_ID;

if (!projectId) {
  console.error('ERROR: SUPABASE_PROJECT_ID environment variable is not set.');
  console.error('Add it to your .env.local or shell profile.');
  process.exit(1);
}

const generatedTypes = execFileSync(
  'npx',
  ['--yes', 'supabase', 'gen', 'types', 'typescript', '--project-id', projectId, '--schema', 'public'],
  { encoding: 'utf8', stdio: ['inherit', 'pipe', 'inherit'] },
);
if (!generatedTypes.includes('export type Database')) {
  throw new Error('Supabase CLI returned an invalid TypeScript schema');
}

const outputPath = path.resolve(__dirname, '../src/types/supabase.ts');
const temporaryPath = `${outputPath}.${process.pid}.tmp`;
try {
  fs.writeFileSync(temporaryPath, generatedTypes, 'utf8');
  fs.renameSync(temporaryPath, outputPath);
} finally {
  if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
}
