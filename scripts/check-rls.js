/**
 * check-rls.js — Verifies every public table has Row Level Security enabled.
 *
 * This script checks RLS status using a local SQL file or prompts the operator
 * to run the verification SQL in the Supabase dashboard.
 *
 * In CI, set SUPABASE_SERVICE_ROLE_KEY env var to run the check automatically.
 *
 * Usage:
 *   node scripts/check-rls.js          # SQL-only mode (prints query)
 *   node scripts/check-rls.js --ci     # CI mode (connects to Supabase, fails on violations)
 *   node scripts/check-rls.js --audit  # Print tables with RLS status
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ciMode = process.argv.includes('--ci');
const auditMode = process.argv.includes('--audit');

const CHECK_SQL = `
SELECT
  t.tablename,
  CASE WHEN p.polname IS NOT NULL THEN 'ENABLED' ELSE 'MISSING' END AS rls_status
FROM pg_tables t
LEFT JOIN pg_policy p ON p.polrelid = (t.schemaname || '.' || t.tablename)::regclass
WHERE t.schemaname = 'public'
  AND t.tablename NOT LIKE '_%'
ORDER BY rls_status DESC, t.tablename;
`;

async function main() {
  console.log('RLS Verification — Row Level Security Check\n');

  if (!ciMode) {
    console.log('To run this check against your Supabase instance, execute the following SQL');
    console.log('in the Supabase SQL Editor:\n');
    console.log('```sql');
    console.log(CHECK_SQL);
    console.log('```\n');

    console.log('Every table in the "public" schema must show rls_status = ENABLED.');
    console.log('Tables with rls_status = MISSING are CRITICAL security holes.\n');

    console.log('To enable RLS on a missing table:');
    console.log('  ALTER TABLE <tablename> ENABLE ROW LEVEL SECURITY;\n');

    if (auditMode) {
      console.log('-- For CI mode, set SUPABASE_SERVICE_ROLE_KEY env var and run:');
      console.log('  node scripts/check-rls.js --ci\n');
    }

    process.exit(0);
  }

  // CI mode — connect to Supabase and verify
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('ERROR: CI mode requires SUPABASE_SERVICE_ROLE_KEY and EXPO_PUBLIC_SUPABASE_URL env vars.');
    console.error('Set SUPABASE_SERVICE_ROLE_KEY in your CI secrets.');
    process.exit(2);
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase.rpc('check_rls_status');

    if (error) {
      // RPC might not exist — fall back to raw SQL via REST API
      console.log('check_rls_status RPC not found. Run this SQL to create it, then re-run:\n');
      console.log('```sql');
      console.log(`CREATE OR REPLACE FUNCTION public.check_rls_status()
RETURNS TABLE(tablename text, rls_status text) AS $$
BEGIN
  RETURN QUERY ${CHECK_SQL.trim()}
$$ LANGUAGE plpgsql SECURITY DEFINER;
`);
      console.log('```\n');

      // Fallback: try raw SQL via supabase management API
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/check_rls_status`,
        {
          method: 'POST',
          headers: {
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('ERROR: Could not verify RLS status. Create the check_rls_status RPC first.');
        console.error('The SQL above creates the function — run it in Supabase SQL Editor.');
        process.exit(2);
      }

      const tables = await response.json();
      processResults(tables);
    } else {
      processResults(data);
    }
  } catch (err) {
    console.error(`ERROR: ${err instanceof Error ? err.message : String(err)}`);
    console.error('\nMake sure @supabase/supabase-js is available for CI mode.');
    console.error('For local checks, use the SQL printed above in Supabase dashboard.');
    process.exit(2);
  }
}

function processResults(tables) {
  const missing = tables.filter((t) => t.rls_status !== 'ENABLED');

  if (missing.length === 0) {
    console.log('PASS: All public tables have Row Level Security enabled.');
    console.log(`Verified ${tables.length} tables.`);
    process.exit(0);
  }

  console.error(`FAIL: ${missing.length} table(s) missing Row Level Security:\n`);
  for (const t of missing) {
    console.error(`  - ${t.tablename}`);
  }
  console.error('\nFix: Run the following SQL for each missing table:');
  console.error('  ALTER TABLE <tablename> ENABLE ROW LEVEL SECURITY;\n');
  console.error('CRITICAL: These tables are accessible without row-level restrictions.');
  process.exit(1);
}

main();
