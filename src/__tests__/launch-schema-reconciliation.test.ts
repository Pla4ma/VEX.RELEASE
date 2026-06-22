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
  'companion_promises',
  'companion_memories',
  'focus_contracts',
];

const sourceRoot = join(process.cwd(), 'src');
const migrationsRoot = join(process.cwd(), 'supabase', 'migrations');

function readFiles(root: string, matcher: RegExp): string {
  return readdirSync(root, { withFileTypes: true })
    .map((entry) => {
      const fullPath = join(root, entry.name);
      if (entry.isDirectory()) {
        return readFiles(fullPath, matcher);
      }
      return matcher.test(entry.name) ? readFileSync(fullPath, 'utf8') : '';
    })
    .join('\n');
}

function usedTables(): string[] {
  const source = readFiles(sourceRoot, /\.tsx?$/);
  return [...source.matchAll(/\.from\('([^']+)'/g)]
    .map((match) => match[1])
    .filter((table, index, tables) => tables.indexOf(table) === index)
    .sort();
}

function committedTables(): string[] {
  const migrations = readFiles(migrationsRoot, /\.sql$/);
  return [
    ...migrations.matchAll(
      /create\s+table(?:\s+if\s+not\s+exists)?\s+(?:public\.)?"?([A-Za-z0-9_-]+)"?/gi,
    ),
  ]
    .map((match) => match[1])
    .sort();
}

function createTablePattern(table: string): RegExp {
  return new RegExp(
    `create\\s+table\\s+if\\s+not\\s+exists\\s+(?:public\\.)?${table}\\b`,
  );
}

function enableRlsPattern(table: string): RegExp {
  return new RegExp(
    `alter\\s+table\\s+(?:public\\.)?${table}\\s+enable\\s+row\\s+level\\s+security`,
  );
}

describe('launch schema reconciliation migration', () => {
  it('keeps Supabase queries out of screen components', () => {
    const screens = readFiles(join(sourceRoot, 'screens'), /\.tsx?$/);

    expect(screens.match(/supabase\.(from|rpc)\(/g) ?? []).toEqual([]);
  });

  it('keeps notification components out of Supabase transport', () => {
    const notificationComponents = readFiles(
      join(sourceRoot, 'features', 'notifications', 'components'),
      /\.tsx?$/,
    );

    expect(
      notificationComponents.match(/getSupabaseClient|\.from\(|\.channel\(/g) ??
        [],
    ).toEqual([]);
  });

  it('keeps every referenced Supabase table in committed SQL', () => {
    const declared = new Set(committedTables());

    const archivedFeatureTables = new Set([
      'daily_missions',
      'focus_memories',
      'rescue_memories',
      'session_narratives',
      'squad_members',
      'squads',
      'transactions',
      'users',
      'wallets',
      'captures',
      'content_items',
      'notification_rate_limits',
      'plan_items',
      'plan_projects',
      'plan_study_plans',
      'session_presets',
    ]);

    expect(
      usedTables().filter(
        (table) => !declared.has(table) && !archivedFeatureTables.has(table),
      ),
    ).toEqual([]);
  });

  it('declares launch-critical repository tables', () => {
    const sql = readFiles(migrationsRoot, /\.sql$/).toLowerCase();

    for (const table of requiredTables) {
      expect(sql).toMatch(createTablePattern(table));
      expect(sql).toMatch(enableRlsPattern(table));
    }
  });

  it('uses owner-scoped policies for user-owned tables', () => {
    const sql = readFileSync(migrationPath, 'utf8').toLowerCase();

    expect(sql).toContain('auth.uid() = user_id');
    expect(sql).toContain('with check (auth.uid() = user_id)');
    expect(sql).not.toContain('using (true)');
  });
});
