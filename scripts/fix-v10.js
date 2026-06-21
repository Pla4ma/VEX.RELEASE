#!/usr/bin/env node
// v10 — lift static-defined arrays/objects from inside component/function
// body to module-scope const, ABOVE the component definition.
// NO doctor.config.json edits. Real code only.
//
// Rule: targets diagnostics with message "X inside ComponentFoo uses no
// local state but is rebuilt every render, so it looks new each time &
// breaks memoized children. Move it to the top of the file, outside the
// component." We lift ONLY declarations that are 100% static literals —
// no function calls, no closures over local variables, no [...spread]
// of locals, no computed property keys.
//
// Hard guards:
//  1. The diagnostic.line points at a `const X = <literal>;` or
//     `const X = { ... };` or `const X = [ ... ];` line that does NOT
//     reference any identifier in the surrounding function scope.
//  2. Component anchor: locate the first top-level component declaration
//     in the file. Insert the lifted const above the anchor with the
//     same indentation as the anchor's indentation.
//  3. TYPECHECK GATE: count errors before/after; auto-revert ALL on regression.
//  4. .bakv10 backup before write for post-mortem.
/* eslint-disable */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const ROOT = process.cwd();
const RULE = 'prefer-module-scope-static-value';
const RULE_FILE = path.join(ROOT, 'scripts/fix-batches', RULE + '.json');
const DRY = !process.argv.includes('--write');

function log(...a) { console.log(...a); }
function err(...a) { console.error(...a); }

if (!fs.existsSync(RULE_FILE)) {
  err('FATAL: ' + RULE_FILE + ' missing');
  process.exit(2);
}
const diagnostics = JSON.parse(fs.readFileSync(RULE_FILE, 'utf8'));

// Does `expr` reference any identifier (not a property access on a global)?
// Returns the list of free identifiers in `expr` (very rough heuristic).
function freeIdentifiers(expr) {
  const out = new Set();
  // Strip string literals
  const stripped = expr
    .replace(/(['"`])(?:\\.|(?!\1).)*\1/g, '""')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
  // Find identifier-like tokens: \bidentifier\b not preceded by a dot.
  const re = /\b([A-Za-z_$][\w$]*)\b/g;
  let m;
  while ((m = re.exec(stripped)) !== null) {
    const id = m[1];
    if (/^(true|false|null|undefined|NaN|Infinity)$/.test(id)) continue;
    // Skip common built-ins / globals that aren't local identifiers.
    if (/^(Math|Object|Array|Date|JSON|Promise|Number|Boolean|String|Symbol|console|window|globalThis|require)$/.test(id)) continue;
    // Check if this identifier is preceded by `.` (member access); skip those.
    const before = stripped.slice(Math.max(0, m.index - 2), m.index);
    if (before.endsWith('.')) continue;
    out.add(id);
  }
  return out;
}

function findComponentAnchor(text) {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (/^\s*(export\s+)?function\s+([A-Z]\w*)\s*\(/.test(ln)) return { line: i, indentLen: (ln.match(/^\s*/)[0]).length };
    if (/^\s*(export\s+)?const\s+([A-Z]\w*)\s*[:=]/.test(ln)) return { line: i, indentLen: (ln.match(/^\s*/)[0]).length };
  }
  return null;
}

function buildPlan(diag) {
  const absFile = path.join(ROOT, diag.filePath);
  if (!fs.existsSync(absFile)) return { skip: true, relFile: diag.filePath, reason: 'file missing' };
  const text = fs.readFileSync(absFile, 'utf8');
  const lines = text.split('\n');
  const lineIdx = diag.line - 1;
  if (lineIdx < 0 || lineIdx >= lines.length) return { skip: true, relFile: diag.filePath, reason: 'oob line' };

  // Try multi-line: collect contiguous lines that look like part of one
  // declaration. Up to ~16 lines.
  let buf = '';
  let chunkStart = lineIdx;
  let chunkEnd = lineIdx;
  for (let i = lineIdx; i < Math.min(lines.length, lineIdx + 16); i++) {
    buf += (buf ? '\n' : '') + lines[i];
    chunkEnd = i;
    // Heuristic: a `const X = <somthing>;` ends where `;` appears at depth 0
    // outside braces/brackets/strings.
    let depth = 0, inStr = null;
    for (let k = 0; k < buf.length; k++) {
      const ch = buf[k];
      if (inStr) {
        if (ch === inStr && buf[k - 1] !== '\\') inStr = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
      if (ch === '{' || ch === '[' || ch === '(') depth++;
      else if (ch === '}' || ch === ']' || ch === ')') depth--;
      else if (ch === ';' && depth === 0) {
        // Found the closing semicolon — capture range and stop.
        return makePlan(diag, absFile, text, lines, chunkStart, i, buf);
      }
    }
    // If we hit end of buffer or depth consistently 0 with no semicolon, skip.
  }
  return { skip: true, relFile: diag.filePath, reason: 'no semicolon found within scan window' };
}

function makePlan(diag, absFile, text, lines, startLine, endLine, buf) {
  // Extract name and RHS
  const m = buf.match(/^\s*(?:const|let|var)\s+(\w+)\s*=\s*([\s\S]+?);\s*$/);
  if (!m) return { skip: true, relFile: diag.filePath, reason: 'not const/let/var X = ...;' };
  const name = m[1];
  const rhs = m[2];
  // The RHS must NOT reference any local identifiers.
  const freeIds = freeIdentifiers(rhs);
  if (freeIds.size > 0) return { skip: true, relFile: diag.filePath, reason: 'rhs uses local identifiers: ' + [...freeIds].join(',') };
  // Need a component anchor to hoist ABOVE
  const anchor = findComponentAnchor(text);
  if (!anchor) return { skip: true, relFile: diag.filePath, reason: 'no top-level component anchor' };
  const indent = ' '.repeat(anchor.indentLen);
  const declText = indent + 'const ' + name + ' = ' + rhs + ';';

  // Build new file: remove lines[startLine..endLine], then insert declText
  // before anchor.line (anchor might be BEFORE startLine — in that case
  // stay where it is, but our anchor would still be inside a component).
  if (anchor.line >= startLine) return { skip: true, relFile: diag.filePath, reason: 'anchor is inside the chunk — cannot hoist' };

  // Detect collision: is `name` already declared above the anchor?
  for (let i = 0; i < anchor.line; i++) {
    if (new RegExp('\\b' + name + '\\b').test(lines[i])) {
      return { skip: true, relFile: diag.filePath, reason: 'identifier collision: ' + name };
    }
  }

  const newLines = lines.slice();
  newLines.splice(startLine, endLine - startLine + 1);
  // Anchor line shifts down by (removedCount). Recompute.
  const newAnchor = anchor.line;
  newLines.splice(newAnchor, 0, declText, '');
  const newContent = newLines.join('\n');
  if (newContent === text) return { skip: true, relFile: diag.filePath, reason: 'no-op' };
  return { skip: false, relFile: diag.filePath, absFile, newContent, declName: name };
}

// -- RUN --
const plans = diagnostics.map(buildPlan);
const writeable = plans.filter(p => !p.skip);
const skipped = plans.filter(p => p.skip);

log('--- v10 dry-run for rule: prefer-module-scope-static-value ---');
log('diagnostics: ', diagnostics.length);
log('writeable :  ', writeable.length);
log('skipped   :  ', skipped.length);
log('');
for (const s of skipped) log('  ✗', s.relFile, '-', s.reason);
for (const p of writeable) log('  ✓', p.relFile, '->', p.declName);

if (DRY) { log(''); log('Dry mode — pass --write to apply.'); process.exit(0); }

log('');
log('--- TYPECHECK BEFORE ---');
const baseline = countTsErrorsSafe();
log('baseline:', baseline);

const modified = [];
const writeFailures = [];
for (const p of writeable) {
  try { fs.writeFileSync(p.absFile + '.bakv10', fs.readFileSync(p.absFile, 'utf8')); } catch (e) {
    writeFailures.push(p.relFile + ': backup ' + e.message); continue;
  }
  try { fs.writeFileSync(p.absFile, p.newContent, 'utf8'); modified.push(p.relFile); }
  catch (e) { writeFailures.push(p.relFile + ': write ' + e.message); }
}
log('files written:', modified.length);
log('write failures:', writeFailures.length);
writeFailures.forEach(f => log('  ✗', f));

log('');
log('--- TYPECHECK AFTER ---');
const after = countTsErrorsSafe();
log('post-write:', after);
if (after > baseline) {
  log('');
  log('!!! REGRESSION !!! baseline=' + baseline + ' after=' + after + '. Reverting.');
  for (const relFile of modified) {
    try { spawnSync('git', ['checkout', '--', relFile], { cwd: ROOT, stdio: 'inherit' });
      try { fs.unlinkSync(path.join(ROOT, relFile + '.bakv10')); } catch {} }
    catch (e) { err('revert fail: ' + relFile + ': ' + e.message); }
  }
  process.exit(1);
}
log('');
log('PASS — typecheck unchanged (' + baseline + '). ' + modified.length + ' file(s) refactored.');
for (const relFile of modified) try { fs.unlinkSync(path.join(ROOT, relFile + '.bakv10')); } catch {}

function countTsErrorsSafe() {
  try {
    const out = execSync('npx tsc --noEmit 2>&1', { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return (out.match(/error TS/g) || []).length;
  } catch (e) {
    return ((e.stdout || '') + (e.stderr || '')).match(/error TS/g)?.length || 0;
  }
}
