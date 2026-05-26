const fs = require('fs');
const path = require('path');

// === CONFIGURATION ===
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const BASELINE_DIR = path.join(ROOT, '.debt-baseline');
const LIMIT = 200;
const auditMode = process.argv.includes('--audit');
const rebuildBaseline = process.argv.includes('--rebuild-baseline');

const ignoredDirs = new Set(['__snapshots__', 'archive']);
const generatedFiles = new Set([path.join(SRC, 'types', 'supabase.ts')]);

// Files allowed to contain Supabase calls (repository.ts, config, edge functions)
const supabaseAllowedPaths = [
  path.join(SRC, 'config', 'supabase.ts'),
];

function isSupabaseAllowed(filePath) {
  if (filePath.includes(path.sep + 'repository.ts')) return true;
  if (filePath.includes(path.sep + 'Repository.ts')) return true;
  if (supabaseAllowedPaths.some((p) => filePath === p)) return true;
  if (filePath.includes('supabase' + path.sep + 'functions' + path.sep)) return true;
  if (filePath.includes('__tests__')) return true;
  if (filePath.includes('mocks')) return true;
  return false;
}

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

// === CHECKS ===

// 1. part-N files
function checkPartFiles(files) {
  return files
    .filter((f) => /\.part-\d+\.tsx?$/.test(f))
    .map((f) => ({ file: path.relative(ROOT, f).replace(/\\/g, '/'), rule: 'part-N-file' }));
}

// 2. Line limit violations
function checkLineLimit(files) {
  return files
    .map((f) => ({
      file: path.relative(ROOT, f).replace(/\\/g, '/'),
      lines: fs.readFileSync(f, 'utf8').split(/\r?\n/).length,
    }))
    .filter((r) => r.lines > LIMIT)
    .map((r) => ({ file: r.file, rule: 'line-limit', detail: `${r.lines} lines` }));
}

// 3. as unknown as
function checkAsUnknownAs(files) {
  const results = [];
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    if (/\bas unknown as\b/.test(content)) {
      results.push({
        file: path.relative(ROOT, f).replace(/\\/g, '/'),
        rule: 'as-unknown-as',
      });
    }
  }
  return results;
}

// 4. as any
function checkAsAny(files) {
  const results = [];
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    if (/\bas any\b/.test(content)) {
      results.push({
        file: path.relative(ROOT, f).replace(/\\/g, '/'),
        rule: 'as-any',
      });
    }
  }
  return results;
}

// 5. Supabase outside repository
function checkSupabaseLeakage(files) {
  const results = [];
  for (const f of files) {
    if (isSupabaseAllowed(f)) continue;
    const content = fs.readFileSync(f, 'utf8');
    if (/supabase\.\s*(from|rpc|channel|storage|auth)|\bSupabaseClient\b/.test(content)) {
      results.push({
        file: path.relative(ROOT, f).replace(/\\/g, '/'),
        rule: 'supabase-leakage',
      });
    }
  }
  return results;
}

// 6. Business logic in components (useQuery/useMutation in component files)
function checkComponentBusinessLogic(files) {
  const results = [];
  for (const f of files) {
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');
    // Only check component files, not hooks/services/repos
    if (!rel.includes('/components/') && !rel.includes('/containers/') && !rel.includes('/screens/')) continue;
    if (rel.includes('__tests__')) continue;
    const content = fs.readFileSync(f, 'utf8');
    if (/\buseQuery\s*\(/.test(content) || /\buseMutation\s*\(/.test(content) || /\buseInfiniteQuery\s*\(/.test(content)) {
      results.push({
        file: rel,
        rule: 'component-query-leak',
      });
    }
  }
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
