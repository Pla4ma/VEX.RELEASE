#!/usr/bin/env node
/**
 * scripts/apply-zod-v4-refine-fix.cjs
 *
 * Narrowest-possible migration: append `{ message: 'invalid' }` as 2nd arg to
 * `z.refine(fn)` calls that have exactly ONE argument.  Zod v4 made this a
 * required options bag (previously a plain error-message string was accepted).
 *
 * Skips: any .refine that already has a 2nd arg (literal, options bag, etc).
 * Idempotency: refuses to write if .bak exists.
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
const sample = [];

// Refine pattern: `.refine(predicateFn)` with no extra args.
// We scan for `.refine(` then a balanced expression (single arg), then close paren
// and a non-comma/non-')' char (so `.refine(fn,` or `.refine(fn).foo()` is left alone).
function refineAddOptions(src) {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const idx = src.indexOf('.refine(', i);
    if (idx === -1) { out += src.slice(i); break; }
    // Walk back from idx to confirm we're at end of a Zod expression (just before .refine().
    // Also reject `.superRefine(` (which has `.refine` as a substring).
    const prev = src[idx - 1];
    if (prev && /[a-zA-Z0-9_]/.test(prev)) {
      // Likely ".superRefine(" → do not treat as refine
      out += src.slice(i, idx + '.refine('.length);
      i = idx + '.refine('.length;
      continue;
    }
    out += src.slice(i, idx);
    out += '.refine(';
    let depth = 1;
    let j = idx + '.refine('.length;
    while (j < src.length && depth > 0) {
      const ch = src[j];
      if (ch === '(' || ch === '[' || ch === '{') depth++;
      else if (ch === ')' || ch === ']' || ch === '}') depth--;
      j++;
    }
    const inner = src.slice(idx + '.refine('.length, j - 1);
    // Peek at character after `)` — if it's `,` or `.` or end-of-call, assume already 2nd arg.
    const after = src[j];
    if (after === ',' || after === '.') {
      // Already has a 2nd arg or chained - leave alone
      out += inner;
    } else {
      // Single-arg refine. Append { message: 'invalid' } as 2nd arg.
      out += inner + ', { message: "invalid" }';
      if (sample.length < 5) sample.push(`  app-refine-context: ${inner.slice(0, 80)}...`);
    }
    i = j;
  }
  return out;
}

for (const file of files) {
  const orig = fs.readFileSync(file, 'utf8');
  const cur = refineAddOptions(orig);
  if (cur !== orig) {
    totalChanged++;
    if (APPLY) {
      const bakPath = file + '.bak';
      if (fs.existsSync(bakPath)) {
        console.error(`REFUSE: .bak exists at ${bakPath} — refusing to overwrite`);
        process.exit(2);
      }
      fs.writeFileSync(bakPath, orig);
      fs.writeFileSync(file, cur);
    }
  }
}

console.log(`\nz.refine single-arg fix (${APPLY ? 'APPLY' : 'DRY-RUN'})`);
console.log(`Files scanned: ${files.length}`);
console.log(`Files changed: ${totalChanged}`);
if (sample.length) console.log('\nFirst 5 sample contexts:\n' + sample.join('\n'));
if (!APPLY) console.log('\n(Re-run with --apply to write changes + .bak)');
