import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const migrationPath = join(
  process.cwd(),
  'supabase',
  'migrations',
  '202605150001_launch_schema_reconciliation.sql',
);

const requiredTables = [
  'sessions',
  'session_completion_ledgers',
  'reward_ledger',
  'wallet_transactions',
  'streaks',
  'streak_shields',
  'streak_repair_quests',
  'notifications',
  'reminder_plans',
  'push_tokens',
  'purchase_attempts',
];

const sourceRoot = join(process.cwd(), 'src_impl');
const migrationsRoot = join(process.cwd(), 'supabase', 'migrations');

function readFiles(root: string, matcher: RegExp): string {
  return readdirSync(root, { withFileTypes: true }).map((entry) => {
    const fullPath = join(root, entry.name);
    if (entry.isDirectory()) {
      return readFiles(fullPath, matcher);
    }
    return matcher.test(entry.name) ? readFileSync(fullPath, 'utf8') : '';
  }).join('\n');
}

function usedTables(): string[] {
  const source = readFiles(sourceRoot, /\.tsx?$/);
  return [...source.matchAll(/\.from\('([^']+)'/g)]
    .map((match) => match[1])
    .filter((table, index, tables) => tables.indexOf(table) === index)
    .sort();
}

function committedTables(): string[] {
  const schema = readFileSync(join(process.cwd(), 'SUPABASE_SCHEMA.sql'), 'utf8');
  const migrations = readFiles(migrationsRoot, /\.sql$/);
  return [...`${schema}\n${migrations}`.matchAll(
    /create\s+table(?:\s+if\s+not\s+exists)?\s+(?:public\.)?"?([A-Za-z0-9_-]+)"?/gi,
  )].map((match) => match[1]).sort();
}

describe('launch schema reconciliation migration', () => {
  it('keeps Supabase queries out of screen components', () => {
    const screens = readFiles(join(sourceRoot, 'screens'), /\.tsx?$/);

    expect(screens.match(/supabase\.(from|rpc)\(/g) ?? []).toEqual([]);
  });

  it('keeps every referenced Supabase table in committed SQL', () => {
    const declared = new Set(committedTables());

    expect(usedTables().filter((table) => !declared.has(table))).toEqual([]);
  });

  it('declares launch-critical repository tables', () => {
    const sql = readFileSync(migrationPath, 'utf8').toLowerCase();

    for (const table of requiredTables) {
      expect(sql).toContain(`create table if not exists public.${table}`);
      expect(sql).toContain(`alter table public.${table} enable row level security`);
    }
  });

  it('uses owner-scoped policies for user-owned tables', () => {
    const sql = readFileSync(migrationPath, 'utf8').toLowerCase();

    expect(sql).toContain('auth.uid() = user_id');
    expect(sql).toContain('with check (auth.uid() = user_id)');
    expect(sql).not.toContain('using (true)');
  });
});
