// Remove user_id from select clauses in flagged files
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

for (const f of files) {
  const full = path.join(root, f);
  if (!fs.existsSync(full)) continue;
  let content = fs.readFileSync(full, 'utf8');
  // Remove ,user_id from select strings (preserves position in select list)
  content = content.replace(/,user_id(?!_)/g, '');
  // Remove user_id at start of select
  content = content.replace(/\.select\(['"]user_id,?/g, ".select('");
  fs.writeFileSync(full, content);
  console.log('Processed:', f);
}
