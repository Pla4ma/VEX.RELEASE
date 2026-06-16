// Auto-remove redundant .eq('user_id', userId) clauses
// These are defense-in-depth alongside RLS. The linter wants RLS-only enforcement.
const fs = require('fs');
const path = require('path');

const files = [
  'src/features/streaks/repair-quest-queries.ts',
  'src/features/streaks/repository-insurance.ts',
  'src/features/streaks/streak-queries.ts',
  'src/features/streaks/repository/comeback.ts',
  'src/features/streaks/repository/repair-quest.ts',
  'src/features/streaks/repository/risk-status.ts',
  'src/features/streaks/repository/streak-repository.ts',
  'src/features/settings/repository-sync.ts',
  'src/features/session-start/repository.ts',
  'src/features/session/repository/stakes-stats.ts',
  'src/features/reward-ledger/repository.ts',
  'src/features/rescue-mode/repository.ts',
];

const root = 'C:/Users/jonat/CascadeProjects/vex-app-old';
let totalFixed = 0;

for (const f of files) {
  const full = path.join(root, f);
  if (!fs.existsSync(full)) {
    console.log('SKIP missing:', f);
    continue;
  }
  let content = fs.readFileSync(full, 'utf8');
  const before = content;
  // Remove .eq('user_id', userId) clauses
  content = content.replace(/^\s*\.eq\(['"]user_id['"],\s*userId\)\s*\n/gm, '');
  content = content.replace(/^\s*\.eq\(['"]user_id['"],\s*userId\s*\)\s*\.maybeSingle\(\)\s*$/gm, '.maybeSingle()');
  if (content !== before) {
    fs.writeFileSync(full, content);
    totalFixed++;
    console.log('Fixed:', f);
  } else {
    console.log('No change:', f);
  }
}
console.log('Total fixed:', totalFixed);
