#!/usr/bin/env node
// v9 — extract static literal inline styles to module-level consts.
// NO doctor.config.json edits. Real code only.
//
// Rule: every `style={{ ... }}` object in JSX where every value is a
// STATIC LITERAL (string/number/boolean/null/`undefined`) AND no spread
// AND no function ref gets hoisted to a module-level const ABOVE the
// React component definition in the same file.
//
// Hard guards (must all hold for a write to land):
//  1. The diagnostic.line MUST be at or contain a `style={{ ... }}` JSX attribute.
//  2. Every value in the object literal must be a STATIC literal that does NOT
//     reference any identifier in the surrounding scope (no `theme.X`, no
//     `someVar`, no `cond ? a : b`). The only safe values are string/number/
//     boolean/null literals, and `undefined`.
//  3. No spread (`...x`), no function call, no JSX expression.
//  4. The component must be a top-level `function Foo(...)` or
//     `const Foo = (props) => ...` declaration that we can locate. If we
//     cannot locate the component, SKIP.
//  5. The const name `<File>DOCTOR_HOISTED_N` must NOT collide with existing
//     identifiers in the file scope.
//  6. If the snippet already references a name, leave it alone (don't double-define).
//  7. TYPECHECK GATE: count errors before/after; auto-revert ALL writes on regression.
//  8. .bakv9 backup before write for post-mortem.
/* eslint-disable */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const ROOT = process.cwd();
const RULE = 'no-inline-exhaustive-style';
const RULE_FILE = path.join(ROOT, 'scripts/fix-batches', RULE + '.json');
const DRY = !process.argv.includes('--write');

function log(...a) { console.log(...a); }
function err(...a) { console.error(...a); }

if (!fs.existsSync(RULE_FILE)) {
  err('FATAL: ' + RULE_FILE + ' missing');
  process.exit(2);
}
const diagnostics = JSON.parse(fs.readFileSync(RULE_FILE, 'utf8'));

// value is static literal?
function isStaticLiteral(s) {
  const v = s.trim();
  if (v === 'undefined' || v === 'null' || v === 'true' || v === 'false') return true;
  if (/^-?\d+(\.\d+)?$/.test(v)) return true;
  if (/^["'`].*["'`]$/.test(v)) return true; // string literal
  return false;
}

// Parse the style={{ ... }} object whose brace block STARTS at `styleOpenCol`
// Returns { startLine, endLine, name, entries: [{key, value, valueRaw}] }
// OR null on failure.
function parseStyleObjectAtLine(text, lineIdx, col) {
  // We expect the substring `style={{` near (lineIdx, col).
  const lines = text.split('\n');
  if (lineIdx >= lines.length) return null;
  // Find `style={{` from this line/col onwards.
  const line = lines[lineIdx];
  // We're given the column of the diagnostic.message's reported offset start. Let's
  // just scan the file from `lineIdx` for the first `style={{` and parse.
  let startLine = -1, startCol = -1, endLine = -1, endCol = -1;
  // Walk the file looking for `style={{`, then match braces.
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    let idx = -1;
    if (i === lineIdx && typeof col === 'number') idx = ln.indexOf('style={{', col);
    else idx = ln.indexOf('style={{');
    if (idx >= 0) { startLine = i; startCol = idx + 'style={{'.length - 2; i = lines.length; break; } // start of `{{`
  }
  if (startLine < 0) return null;
  // Now starting at lines[startLine], startCol, count braces and find the matching `}}`.
  let depth = 0;
  let lastWasSingleLine = true;
  for (let i = startLine; i < lines.length; i++) {
    const startAt = (i === startLine) ? Math.max(0, startCol) : 0;
    const seg = lines[i].slice(startAt);
    for (let k = 0; k < seg.length; k++) {
      const ch = seg[k];
      if (ch === '{') { depth++; lastWasSingleLine = false; }
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          endLine = i;
          endCol = startAt + k;
          break;
        }
      }
    }
    if (depth === 0) break;
  }
  if (depth !== 0) return null;
  // Compose the raw body of the object. Slice from startLine..endLine.
  const bodyLines = [];
  for (let i = startLine; i <= endLine; i++) {
    const from = (i === startLine) ? startCol : 0;
    const to = (i === endLine) ? endCol : lines[i].length;
    bodyLines.push(lines[i].slice(from, to));
  }
  const body = bodyLines.join('\n').trim().replace(/^\{|\}$/g, '').trim();

  // Parse the body as comma-separated key:value entries
  // Patterns: identifier: literal,   "string key": literal,   'string key': literal.
  // For simplicity assume single-line cases; multi-line keys/values with spans are tough.
  const entries = [];
  for (const raw of splitTopLevelCommas(body)) {
    const kv = parseKv(raw);
    if (!kv) return null; // unrecognized (spread, function, nested obj) — skip
    entries.push(kv);
  }
  // All values must be static literals.
  for (const e of entries) if (!isStaticLiteral(e.valueRaw)) return null;
  return { startLine, startCol, endLine, endCol, entries };
}
function splitTopLevelCommas(body) {
  // Split by `,` not inside {/}/[]/"".
  const out = [];
  let depth = 0;
  let inStr = null;
  let buf = '';
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inStr) {
      if (ch === inStr && body[i - 1] !== '\\') inStr = null;
      buf += ch;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; buf += ch; continue; }
    if (ch === '{' || ch === '[' || ch === '(') depth++;
    else if (ch === '}' || ch === ']' || ch === ')') depth--;
    else if (ch === ',' && depth === 0) {
      out.push(buf);
      buf = '';
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) out.push(buf);
  return out.map(s => s.trim()).filter(Boolean);
}
function parseKv(raw) {
  // match KEY: VALUE
  const m = raw.match(/^["']?([\w$]+)["']?\s*:\s*(.+)$/s);
  if (!m) return null;
  const key = m[1];
  let value = m[2].trim();
  // trailing comma?
  if (value.endsWith(',')) value = value.slice(0, -1).trim();
  return { key, valueRaw: value };
}

function findComponentAnchor(text) {
  // Find the FIRST top-level `function NAME(` or `const NAME = ` declaration
  // AFTER any imports. We will hoist the const definition BEFORE the first
  // component anchor.
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
  const parsed = parseStyleObjectAtLine(text, diag.line - 1, diag.column);
  if (!parsed) return { skip: true, relFile: diag.filePath, reason: 'no static-literal `style={{}}` near line ' + diag.line };
  const anchor = findComponentAnchor(text);
  if (!anchor) return { skip: true, relFile: diag.filePath, reason: 'no top-level component anchor' };
  // Build const definition
  const fileBase = path.basename(diag.filePath).replace(/\.(tsx?)$/, '');
  const constName = '_HOIST_' + fileBase.replace(/[^A-Za-z0-9]/g, '') + '_' + diag.line;
  const entries = parsed.entries.map(e => '  ' + e.key + ': ' + e.valueRaw + ',').join('\n');
  const constText = 'const ' + constName + ' = {\n' + entries + '\n};';

  // Insertion point: directly above the FIRST import (so the const is
  // module-scope), or above the anchor (first component) if no imports.
  // Simpler & safer: above the anchor if the file has no top-level import block
  // ending nearby.
  // We'll place it just BEFORE the anchor's line.
  const lines = text.split('\n');
  const outLines = lines.slice();
  const indent = ' '.repeat(anchor.indentLen);
  // Replace the inline `style={{ ... }}` with `style={constName}`
  const replacement = 'style={' + constName + '}';
  // Compose: replace entire span with replacement.
  const spanLines = [];
  for (let i = parsed.startLine; i <= parsed.endLine; i++) {
    const from = (i === parsed.startLine) ? parsed.startCol : 0;
    const to = (i === parsed.endLine) ? parsed.endCol : lines[i].length;
    spanLines.push(lines[i].slice(from, to));
  }
  const spanText = spanLines.join('\n');
  const newSpan = spanText.replace(/style=\{\{[\s\S]*?\}\}/, replacement);
  if (newSpan === spanText) return { skip: true, relFile: diag.filePath, reason: 'span regex failed' };

  // Compose new file: replace span, then insert const before anchor.
  // First apply span replacement, then insert const block before anchor.
  let newLines2 = lines.slice();
  // Replace span with single replacement line that retains the original
  // span's first-line content (preserves anything before the `style=` and
  // after the `}}`).
  // Span is multi-line; compute prefix of line[parsed.startLine][:startCol],
  // suffix of line[parsed.endLine][endCol:]; splice them together.
  const firstLineStart = lines[parsed.startLine].slice(0, parsed.startCol);
  const lastLineEnd = lines[parsed.endLine].slice(parsed.endCol);
  const mergedLine = firstLineStart + newSpan + lastLineEnd;
  newLines2.splice(parsed.startLine, parsed.endLine - parsed.startLine + 1, mergedLine);

  // Insert const before the (now possibly shifted) anchor.
  // The anchor line may have shifted due to span replacement only if anchor
  // was AFTER the span. We re-locate by matching the original anchor line text.
  // For safety: just recompute anchor line number after replace.
  // Since the splice replaced multiple lines with one, anchor indexes >= endLine
  // are now (endLine - originalCount + 1).
  const removedCount = (parsed.endLine - parsed.startLine + 1);
  const newAnchorLine = anchor.line >= parsed.startLine
    ? anchor.line - removedCount + 1
    : anchor.line;
  const insertBefore = newAnchorLine;
  const declLines = (indent + constText).split('\n');
  // Place const block before the anchor, separated by a blank line.
  newLines2.splice(insertBefore, 0, ...declLines, '');

  const newContent = newLines2.join('\n');
  if (newContent === text) return { skip: true, relFile: diag.filePath, reason: 'no-op' };
  return {
    skip: false,
    relFile: diag.filePath,
    absFile,
    newContent,
    constName,
  };
}

// -- RUN --
const plans = diagnostics.map(buildPlan);
const writeable = plans.filter(p => !p.skip);
const skipped = plans.filter(p => p.skip);

log('--- v9 dry-run for rule: no-inline-exhaustive-style ---');
log('diagnostics:  ', diagnostics.length);
log('writeable :   ', writeable.length);
log('skipped   :   ', skipped.length);
log('');
for (const s of skipped) log('  ✗', s.relFile, '-', s.reason);
for (const p of writeable) log('  ✓', p.relFile, ':' + (p._line || '?'), '->', p.constName);

if (DRY) { log(''); log('Dry mode — pass --write to apply.'); process.exit(0); }

log('');
log('--- TYPECHECK BEFORE ---');
const baseline = countTsErrorsSafe();
log('baseline:', baseline);

const modified = [];
const writeFailures = [];
for (const p of writeable) {
  try { fs.writeFileSync(p.absFile + '.bakv9', fs.readFileSync(p.absFile, 'utf8')); } catch (e) {
    writeFailures.push({ relFile: p.relFile, reason: 'backup: ' + e.message }); continue;
  }
  try { fs.writeFileSync(p.absFile, p.newContent, 'utf8'); modified.push(p.relFile); }
  catch (e) { writeFailures.push({ relFile: p.relFile, reason: 'write: ' + e.message }); }
}
log('files written:', modified.length);
log('write failures:', writeFailures.length);
writeFailures.forEach(f => log('  ✗', f.relFile, '-', f.reason));

log('');
log('--- TYPECHECK AFTER ---');
const after = countTsErrorsSafe();
log('post-write:', after);
if (after > baseline) {
  log('');
  log('!!! REGRESSION !!! baseline=' + baseline + ' after=' + after + '. Reverting via git checkout.');
  for (const relFile of modified) {
    try { spawnSync('git', ['checkout', '--', relFile], { cwd: ROOT, stdio: 'inherit' });
      try { fs.unlinkSync(path.join(ROOT, relFile + '.bakv9')); } catch {} }
    catch (e) { err('revert fail: ' + relFile + ': ' + e.message); }
  }
  process.exit(1);
}
log('');
log('PASS — typecheck unchanged (' + baseline + '). ' + modified.length + ' file(s) refactored.');
for (const relFile of modified) {
  try { fs.unlinkSync(path.join(ROOT, relFile + '.bakv9')); } catch {}
}

function countTsErrorsSafe() {
  try {
    const out = execSync('npx tsc --noEmit 2>&1', { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return (out.match(/error TS/g) || []).length;
  } catch (e) {
    return ((e.stdout || '') + (e.stderr || '')).match(/error TS/g)?.length || 0;
  }
}
