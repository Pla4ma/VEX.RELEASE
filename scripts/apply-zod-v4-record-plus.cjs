#!/usr/bin/env node
/**
 * scripts/apply-zod-v4-record-plus.cjs
 *
 * Extends the prior narrow record-fix: matches any single-arg z.record(valueSchema)
 * and converts to z.record(z.string(), valueSchema) for Zod v4 compatibility.
 *
 * Patterns (in priority order to avoid double-replacement):
 *   1. z.record(z.string())                 → z.record(z.string(), z.string())
 *   2. z.record(z.unknown())                → z.record(z.string(), z.unknown())
 *   3. z.record(<IDENT>())                  → z.record(z.string(), <IDENT>())
 *
 * Strategy: simple balanced-paren substring re-scan for exact z.record(<X>) forms
 * with EXACTLY ONE top-level argument. We DO NOT touch 2-arg z.record(...)
 * forms. We use balanced-paren scanning to handle nested calls correctly.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

// Recursively collect .ts/.tsx files under src/, skipping __mocks__ and node_modules
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(p);
    }
  }
  return out;
}

const files = walk(SRC).filter((p) => !p.includes(`${path.sep}__mocks__${path.sep}`));

/**
 * Replace single-arg z.record(...) with z.record(z.string(), ...)
 *
 * @param {string} src - file content
 * @param {(match: string, full: string) => string} replacer
 * @returns {{result: string, count: number}}
 */
function applyRecordFix(src, replacer) {
  const out = [];
  let i = 0;
  let count = 0;
  const needle = 'z.record(';
  while (i < src.length) {
    const idx = src.indexOf(needle, i);
    if (idx === -1) { out.push(src.slice(i)); break; }
    out.push(src.slice(i, idx));

    // Balanced-paren scan starting right after 'z.record('
    let depth = 1;
    let j = idx + needle.length;
    let sawComma = false;
    let inStr = null; // current string delimiter ('"' | "'" | "`") or null
    while (j < src.length && depth > 0) {
      const ch = src[j];
      // String-literal handling: do NOT count parens inside strings
      if (inStr) {
        if (ch === '\\') { j += 2; continue; }
        if (ch === inStr) inStr = null;
        j++; continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; j++; continue; }
      if (ch === '(' || ch === '[' || ch === '{') depth++;
      else if (ch === ')' || ch === ']' || ch === '}') {
        depth--;
        if (depth === 0) break;
      } else if (ch === ',' && depth === 1) {
        sawComma = true;
      }
      j++;
    }
    // src[idx..j] inclusive is the whole z.record(...) call
    const full = src.slice(idx, j + 1);
    const inner = src.slice(idx + needle.length, j); // without the closing ')'
    if (!sawComma) {
      // Single-arg form: transform
      out.push(replacer(inner, full));
      count++;
    } else {
      // Two-arg-form (or more): leave alone
      out.push(full);
    }
    i = j + 1;
  }
  return { result: out.join(''), count };
}

function replaceCount(src) {
  return applyRecordFix(src, (inner, full) => {
    const trimmed = inner.trim();
    return `z.record(z.string(), ${trimmed})`;
  });
}

let totalChanged = 0;
let filesChanged = 0;
for (const file of files) {
  const bakPath = file + '.bak';
  if (fs.existsSync(bakPath)) {
    console.error(`SKIP ${path.relative(ROOT, file)}: .bak already exists (would overwrite)`);
    continue;
  }
  const original = fs.readFileSync(file, 'utf8');
  const { result, count } = replaceCount(original);
  if (count === 0) continue;
  console.log(`${APPLY ? 'EDIT ' : 'DRY  '} ${path.relative(ROOT, file)}  +${count}`);
  if (APPLY) {
    fs.writeFileSync(bakPath, original);
    fs.writeFileSync(file, result);
  }
  totalChanged += count;
  filesChanged++;
}
console.log(`\n${APPLY ? 'APPLIED' : 'DRY RUN'} — ${totalChanged} replacement(s) across ${filesChanged} file(s).`);
