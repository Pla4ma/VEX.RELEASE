#!/usr/bin/env node
/**
 * scripts/apply-zod-v4-record-fix.cjs
 *
 * Narrowest-possible Zod v4 fix. Only matches the EXACT pattern:
 *   `z.record(z.unknown())`  →  `z.record(z.string(), z.unknown())`
 *
 * Zod v4 removed the 1-arg overload of z.record; the key schema is now required.
 *
 * Skips ANY occurrence that's already 2+ args or that has a different inner schema.
 * Idempotency: refuses to write if .bak already exists.
 * Safe by design: only touches the exact `z.record(z.unknown())` substring.
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

let totalChanged = 0;
let totalMatches = 0;
const sampleFiles = [];

const PATTERN = /z\.record\(z\.unknown\(\)\)/g;
const REPLACE = 'z.record(z.string(), z.unknown())';

for (const file of files) {
  const orig = fs.readFileSync(file, 'utf8');
  // Count matches without breaking re.exec state
  const matches = orig.match(PATTERN);
  if (!matches || matches.length === 0) continue;
  totalMatches += matches.length;
  const cur = orig.replace(PATTERN, REPLACE);
  totalChanged++;
  if (sampleFiles.length < 6) sampleFiles.push(`${path.relative(ROOT, file)}: ${matches.length}`);
  if (APPLY) {
    const bakPath = file + '.bak';
    if (fs.existsSync(bakPath)) {
      console.error(`REFUSE: .bak exists at ${bakPath} — refusing to overwrite. Delete the .bak or restore from git first.`);
      process.exit(2);
    }
    fs.writeFileSync(bakPath, orig);
    fs.writeFileSync(file, cur);
  }
}

console.log(`\nz.record(z.unknown()) → z.record(z.string(), z.unknown()) (${APPLY ? 'APPLY' : 'DRY-RUN'})`);
console.log(`Files scanned: ${files.length}`);
console.log(`Files matched: ${totalChanged}`);
console.log(`Total occurrences: ${totalMatches}`);
console.log(`Sample files (first 6):`);
for (const s of sampleFiles) console.log(`  ${s}`);
if (!APPLY) console.log('\nRe-run with --apply to write changes (+ .bak for safety).');
