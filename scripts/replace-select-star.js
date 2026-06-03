// scripts/replace-select-star.js
// Walks src/ and replaces every `.from(table).select('*')` or `.from(table)...select()`
// with `.from(table).select(tableColumns(table))` so repositories never use `select("*")`.
//
// Multi-line safe: uses a depth-based walker that respects parens/braces/strings.
// Safe to re-run: no-ops if the file already uses tableColumns().
//
// Usage: node scripts/replace-select-star.js
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const SRC = path.join(REPO_ROOT, 'src');
const HELPERS_PATH = path.join(SRC, 'lib', 'repository', 'tableColumns.ts');

if (!fs.existsSync(HELPERS_PATH)) {
  console.error('Run build-table-columns.js first');
  process.exit(1);
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(p);
  }
  return out;
}

// Find the next `.select(` at the OUTERMOST paren/brace/bracket depth, starting at `start`.
// Returns the index of the `.` or -1 if the .from() call closes first.
function findNextTopLevelSelect(src, start) {
  let parenDepth = 0;
  let braceDepth = 0;
  let bracketDepth = 0;
  let quote = null;
  let i = start;
  while (i < src.length) {
    const ch = src[i];
    if (quote) {
      if (ch === '\\') { i += 2; continue; }
      if (ch === quote) quote = null;
      i++;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; i++; continue; }
    if (ch === '(') parenDepth++;
    else if (ch === ')') {
      parenDepth--;
      if (parenDepth < 0) return -1;
    } else if (ch === '{') braceDepth++;
    else if (ch === '}') braceDepth--;
    else if (ch === '[') bracketDepth++;
    else if (ch === ']') bracketDepth--;
    else if (parenDepth === 0 && braceDepth === 0 && bracketDepth === 0 && ch === '.') {
      if (src.startsWith('.select(', i)) return i;
    }
    i++;
  }
  return -1;
}

// Find the end (exclusive) of a `.select(...)` call starting at `callStart` (which must be at the `.`).
function findSelectCallEnd(src, callStart) {
  let depth = 0;
  let quote = null;
  let j = callStart + '.select'.length;
  while (j < src.length) {
    const ch = src[j];
    if (quote) {
      if (ch === '\\') { j += 2; continue; }
      if (ch === quote) quote = null;
      j++;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; j++; continue; }
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      j++;
      if (depth === 0) break;
      continue;
    }
    j++;
  }
  return j;
}

const FROM_RE = /\.from\(\s*(['"][a-zA-Z_][a-zA-Z0-9_]*['"]|[A-Z_][A-Z0-9_]*)\s*\)/g;

const files = walk(SRC).filter((p) => !/__tests__/.test(p));
let totalFiles = 0;
let totalReplacements = 0;

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  if (!/\.from\(/.test(src)) continue;

  let out = src;
  let fileReplacements = 0;
  FROM_RE.lastIndex = 0;
  let m;
  while ((m = FROM_RE.exec(out)) !== null) {
    const fromEnd = FROM_RE.lastIndex;
    const tableExpr = m[1];
    const selStart = findNextTopLevelSelect(out, fromEnd);
    if (selStart < 0) {
      FROM_RE.lastIndex = fromEnd + 1;
      continue;
    }
    const callEnd = findSelectCallEnd(out, selStart);
    const inside = out.slice(selStart + '.select'.length + 1, callEnd - 1).trim();
    if (inside === '' || inside === "'*'" || inside === '"*"' || inside === '`*`') {
      const replacement = `.select(tableColumns(${tableExpr}))`;
      out = out.slice(0, selStart) + replacement + out.slice(callEnd);
      fileReplacements++;
      FROM_RE.lastIndex = selStart + replacement.length;
    } else {
      FROM_RE.lastIndex = callEnd;
    }
  }

  if (out === src) continue;
  totalFiles++;
  totalReplacements += fileReplacements;

  if (!/from\s+['"][^'"]*tableColumns['"]/.test(out)) {
    let rel = path.relative(path.dirname(file), HELPERS_PATH).replace(/\\/g, '/');
    if (!rel.startsWith('.')) rel = './' + rel;
    rel = rel.replace(/\.ts$/, '');
    const importLine = `import { tableColumns } from '${rel}';`;
    const lines = out.split('\n');
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) if (/^import\s/.test(lines[i])) lastImport = i;
    if (lastImport >= 0) lines.splice(lastImport + 1, 0, importLine);
    else lines.unshift(importLine);
    out = lines.join('\n');
  }

  fs.writeFileSync(file, out, 'utf8');
  console.log(`  ${path.relative(REPO_ROOT, file)}: ${fileReplacements} replacement(s)`);
}

console.log(`\nDone. ${totalReplacements} replacement(s) in ${totalFiles} file(s).`);
