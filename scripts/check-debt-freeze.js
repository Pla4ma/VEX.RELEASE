const fs = require('fs');
const path = require('path');
const {
  checkPartFiles,
  checkLineLimit,
  checkAsUnknownAs,
  checkAsAny,
  checkSupabaseLeakage,
  checkComponentBusinessLogic,
} = require('./check-debt-freeze-checks');

// === CONFIGURATION ===
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const BASELINE_DIR = path.join(ROOT, '.debt-baseline');
const auditMode = process.argv.includes('--audit');
const rebuildBaseline = process.argv.includes('--rebuild-baseline');

const ignoredDirs = new Set(['__snapshots__', 'archive']);
const generatedFiles = new Set([path.join(SRC, 'types', 'supabase.ts')]);

// === FILE WALKING ===
function walkSrc() {
  const results = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirs.has(entry.name)) walk(fullPath);
      } else if (/\.(ts|tsx)$/.test(entry.name) && !generatedFiles.has(fullPath)) {
        results.push(fullPath);
      }
    }
  }
  walk(SRC);
  return results;
}

// === BASELINE MANAGEMENT ===
function loadBaseline(name) {
  const p = path.join(BASELINE_DIR, name + '.json');
  if (fs.existsSync(p)) {
    return new Set(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  return new Set();
}

function saveBaseline(name, findings) {
  if (!fs.existsSync(BASELINE_DIR)) {
    fs.mkdirSync(BASELINE_DIR, { recursive: true });
  }
  const files = new Set(findings.map((f) => f.file));
  fs.writeFileSync(path.join(BASELINE_DIR, name + '.json'), JSON.stringify([...files].sort(), null, 2));
}

// === MAIN ===
function main() {
  const files = walkSrc();

  const checks = {
    'part-n': { run: checkPartFiles, label: 'part-N files' },
    'line-limit': { run: checkLineLimit, label: 'line limit (>200)' },
    'as-unknown-as': { run: checkAsUnknownAs, label: 'as unknown as' },
    'as-any': { run: checkAsAny, label: 'as any' },
    'supabase-leak': { run: checkSupabaseLeakage, label: 'Supabase outside repository' },
    'component-query': { run: checkComponentBusinessLogic, label: 'useQuery in component' },
  };

  if (rebuildBaseline) {
    console.log('Rebuilding debt freeze baselines...\n');
    for (const [key, check] of Object.entries(checks)) {
      const findings = check.run(files);
      saveBaseline(key, findings);
      console.log(`  ${check.label}: baselined ${findings.length} existing violations`);
    }
    console.log('\nBaselines rebuilt in .debt-baseline/');
    process.exit(0);
  }

  let totalNew = 0;
  const allNew = [];

  for (const [key, check] of Object.entries(checks)) {
    const findings = check.run(files);
    const baseline = loadBaseline(key);
    const newViolations = findings.filter((f) => !baseline.has(f.file));

    if (newViolations.length > 0) {
      allNew.push({ label: check.label, violations: newViolations });
      totalNew += newViolations.length;
    }
  }

  if (totalNew === 0) {
    console.log('Debt freeze OK: no new violations since baseline.');
    process.exit(0);
  }

  console.error(`DEBT FREEZE VIOLATIONS: ${totalNew} new violations found.\n`);
  for (const group of allNew) {
    console.error(`=== ${group.label} (${group.violations.length} new) ===`);
    for (const v of group.violations) {
      const detail = v.detail ? ` (${v.detail})` : '';
      console.error(`  ${v.file}${detail}`);
    }
    console.error('');
  }

  process.exit(auditMode ? 0 : 1);
}

main();
