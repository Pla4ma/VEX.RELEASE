const { execSync } = require('child_process');

const projectId = process.env.SUPABASE_PROJECT_ID;

if (!projectId) {
  console.error('ERROR: SUPABASE_PROJECT_ID environment variable is not set.');
  console.error('Add it to your .env.local or shell profile.');
  process.exit(1);
}

execSync(
  `npx supabase gen types typescript --project-id ${projectId} --schema public > src/types/supabase.ts`,
  { stdio: 'inherit' }
);
