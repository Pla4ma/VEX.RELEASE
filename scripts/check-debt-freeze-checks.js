/**
 * Debt Freeze Checks
 *
 * Individual check functions for debt freeze enforcement.
 * Extracted from check-debt-freeze.js for file size compliance.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

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

// 1. part-N files
function checkPartFiles(files) {
  return files
    .filter((f) => /\.part-\d+\.tsx?$/.test(f))
    .map((f) => ({ file: path.relative(ROOT, f).replace(/\\/g, '/'), rule: 'part-N-file' }));
}

// 2. Line limit violations (>200 lines)
function checkLineLimit(files) {
  return files
    .map((f) => ({
      file: path.relative(ROOT, f).replace(/\\/g, '/'),
      lines: fs.readFileSync(f, 'utf8').split(/\r?\n/).length,
    }))
    .filter((r) => r.lines > 200)
    .map((r) => ({ file: r.file, lines: r.lines, rule: 'line-limit', detail: `${r.lines} lines` }));
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

module.exports = {
  isSupabaseAllowed,
  checkPartFiles,
  checkLineLimit,
  checkAsUnknownAs,
  checkAsAny,
  checkSupabaseLeakage,
  checkComponentBusinessLogic,
};
