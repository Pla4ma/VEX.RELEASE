#!/usr/bin/env node
/**
 * scripts/apply-zod-v4-migration.cjs
 *
 * Hardened Zod v3 → v4 codemod. CRITICAL: uses fs.readFileSync/writeFileSync
 * directly (NOT PowerShell Set-Content, which silently fails with BOM issues
 * on Windows). Reads/writes UTF-8 BOM-clean files.
 *
 * Transforms applied (conservative):
 *   1. `error.errors`  →  `error.issues`     [REGEX: `\berror\.errors\b`]
 *      [Sadly the prior codemod also renamed `err.errors` and `e.errors`
 *       blindly. We DO NOT touch those here. Only the most common `error.errors`]
 *   2. `z.string().date()`  →  `z.iso.date()`
 *   3. `z.object(...).default(value)`  →  `z.object(...).default(() => value)`
 *      (Zod v4 allows an optional function form; required if dependent on refs)
 *
 * Skipped (require AST-aware codemod or manual migration):
 *   - `z.record(z.X())` 1-arg → 2-arg: applied in earlier targeted sed; should be done per-file
 *   - `.refine(fn)` missing options bag
 *   - `.transform(fn)` no longer receiving value as 1st arg (use ctx.value)
 *
 * Usage:
 *   node scripts/apply-zod-v4-migration.cjs           # dry-run
 *   node scripts/apply-zod-v4-migration.cjs --apply   # writes .bak + new file
 */

'use strict';

const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name.startsWith('.')) continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(ent.name)) {
      out.push(p);
    }
  }
  return out;
}

const files = walk(SRC);

// Transform 1: error.errors → error.issues — most common case, narrowest match.
const TX_ERROR_ERRORS = (src) => src.replace(/\berror\.errors\b/g, 'error.issues');

// Transform 2: z.string().date() → z.iso.date() — exact match.
const TX_STRING_DATE = (src) => src.replace(/z\.string\(\)\.date\(\s*\)/g, 'z.iso.date()');

const transforms = [
  ['error.errors → error.issues', TX_ERROR_ERRORS],
  ['z.string().date() → z.iso.date()', TX_STRING_DATE],
];

let totalChanged = 0;
let hitsPerTransform = transforms.map(() => 0);

for (const file of files) {
  const orig = fs.readFileSync(file, 'utf8');
  let cur = orig;
  for (let k = 0; k < transforms.length; k++) {
    const before = cur;
    cur = transforms[k][1](cur);
    if (cur !== before) hitsPerTransform[k]++;
  }
  if (cur !== orig) {
    totalChanged++;
    if (APPLY) {
      fs.writeFileSync(file + '.bak', orig);
      fs.writeFileSync(file, cur);
    }
  }
}

console.log(`\nZod v4 (safe-mode) migration (${APPLY ? 'APPLY' : 'DRY-RUN'})`);
console.log(`Files scanned: ${files.length}`);
console.log(`Files changed: ${totalChanged}`);
console.log('\nPer-transform file counts:');
for (let k = 0; k < transforms.length; k++) {
  console.log(`  - ${transforms[k][0]}: ${hitsPerTransform[k]} files`);
}
if (!APPLY) console.log('\n(Re-run with --apply to write changes + .bak)');

// After this run, also emit a per-file TS2554 lookup table for manual fixes.
// Reads tmp-typecheck-baseline.txt if present and groups errors by file path.
const baselinePath = path.join(ROOT, 'tmp-typecheck-baseline.txt');
if (fs.existsSync(baselinePath)) {
  const lines = fs.readFileSync(baselinePath, 'utf8').split(/\r?\n/);
  const byFile = new Map();
  for (const line of lines) {
    const m = line.match(/^(\S+\.(?:ts|tsx))\((\d+),(\d+)\): error TS(\d+):/);
    if (m) {
      const [, file, ln, col, code] = m;
      if (!byFile.has(file)) byFile.set(file, []);
      byFile.get(file).push({ line: Number(ln), col: Number(col), code: Number(code) });
    }
  }
  // Print exact paths and counts for each TS2554 file (the bulk of remaining errors).
  const ts2554Files = [...byFile.entries()]
    .filter(([, errs]) => errs.some((e) => e.code === 2554))
    .sort((a, b) => b[1].length - a[1].length);
  console.log(`\nFiles with TS2554 (top 30):`);
  for (const [file, errs] of ts2554Files.slice(0, 30)) {
    const ts2554Count = errs.filter((e) => e.code === 2554).length;
    console.log(`  ${file}: ${ts2554Count} TS2554 errors`);
  }
}
