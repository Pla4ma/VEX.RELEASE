#!/usr/bin/env node
// v7 — EXPORT-AWARE no-barrel-import fixer with TYPECHECK GATE.
// NO doctor.config.json edits. Real code rewrites only.
//
// v6 used EXACT basename match (too strict — found 0/32 writeable).
// v5 used FUZZY match (too loose — 7/25 written broke compilation).
// v7 uses EXPORT-AWARE MATCH: for each imported name, find which target
// path's destination file ACTUALLY EXPORTS the name. If exactly one target
// path exports the name, assign. If 0 or >1 target paths export it, skip
// (no guessing).
//
// Hard guards:
//  1. Multi-line import detection (imports spanning up to 8 lines).
//  2. Per-name export verification (handles export{}, export const, export type,
//     export interface, export default, export { default as N }, export * from).
//  3. Type-only imports preserved on the new lines (so `import { type Foo }`
//     goes to its own direct line).
//  4. Aliased imports preserved: `import { Foo as Bar } from ...` keeps the alias.
//  5. TYPECHECK GATE: tsc error count BEFORE write vs AFTER; if INCREASED,
//     auto-revert ALL writes via `git checkout -- <file>`.  Belt-and-suspenders
//     .bakv7 backups saved before write for post-mortem.
//
// Run modes:
//   node scripts/fix-v7.js            DRY (no writes, no tsc)
//   node scripts/fix-v7.js --write    apply (with tsc gate + auto-revert)
/* eslint-disable */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const ROOT = process.cwd();
const RULE_FILE = path.join(ROOT, 'scripts/fix-batches/no-barrel-import.json');
const RULE = 'no-barrel-import';
const DRY = !process.argv.includes('--write');

function log(...a) { console.log(...a); }
function err(...a) { console.error(...a); }

if (!fs.existsSync(RULE_FILE)) {
  err(`FATAL: ${RULE_FILE} missing`);
  process.exit(2);
}
const diagnostics = JSON.parse(fs.readFileSync(RULE_FILE, 'utf8'));

// -------------------- helpers --------------------
function fileAtAbs(absBase) {
  if (!absBase) return null;
  for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
    const candidate = absBase + ext;
    try { fs.accessSync(candidate, fs.constants.R_OK); return candidate; }
    catch { /* next */ }
  }
  return null;
}
function fileAtRel(rel, fileDir) {
  return fileAtAbs(path.normalize(path.join(fileDir, rel)));
}
function exportsOf(absPath) {
  const set = new Set();
  if (!absPath) return set;
  let content;
  try { content = fs.readFileSync(absPath, 'utf8'); } catch { return set; }

  for (const m of content.matchAll(/export\s+(?:declare\s+)?(?:const|let|var|function\*?|class|enum|async\s+function)\s+(\w+)/g)) set.add(m[1]);
  for (const m of content.matchAll(/export\s+(?:declare\s+)?(?:type|interface)\s+(\w+)/g)) set.add(m[1]);
  for (const m of content.matchAll(/export\s*\{\s*([^}]+?)\s*\}/g)) {
    for (let part of m[1].split(',')) {
      part = part.trim();
      if (!part) continue;
      if (/^\s*\*\s*from\b/.test(part)) { set.add('*'); continue; }
      const asMatch = part.match(/^(?:type\s+)?(\w+)(?:\s+as\s+(\w+))?$/);
      if (asMatch) { set.add(asMatch[1]); if (asMatch[2]) set.add(asMatch[2]); }
    }
  }
  // export default Foo / export default function Foo(...) / export default class Foo / export default () => ...
  for (const m of content.matchAll(/export\s+default\s+(?:async\s+)?(?:function\*?\s+|class\s+)?(\w+)?/g)) {
    if (m[1]) set.add(m[1]);
    set.add('default');
  }
  for (const _ of content.matchAll(/export\s*\*\s*from\b/g)) set.add('*');
  return set;
}

// Parse a multi-line import statement beginning at index lineIdx.
// Returns { lineCount, indent, originalNames, srcRel } or null if no match.
function parseImportAtLine(text, lineIdx) {
  const lines = text.split('\n');
  if (lineIdx >= lines.length) return null;
  let concat = '';
  for (let i = 0; i < 8 && lineIdx + i < lines.length; i++) {
    concat += (concat ? '\n' : '') + lines[lineIdx + i];
    const m = concat.match(/^(\s*)import\s*\{([\s\S]*?)\}\s*from\s*['"]([^'"]+)['"]\s*;?\s*(?:\/\/.*)?$/m);
    if (m) {
      const rawNames = m[2].split(',').map(s => s.trim()).filter(Boolean);
      return {
        lineCount: i + 1,
        indent: m[1],
        srcRel: m[3],
        entries: rawNames.map(raw => ({
          raw,
          orig: raw.split(/\s+as\s+/)[0].replace(/^type\s+/, '').trim(),
          alias: raw.includes(' as ') ? raw.split(/\s+as\s+/)[1].trim() : null,
          typeOnly: /^type\s+/.test(raw),
        })),
      };
    }
  }
  return null;
}
function extractTargetPaths(msg) {
  // Accept double-quoted, single-quoted, AND backtick-quoted paths starting with "."
  const all = (msg.match(/"([^"]+)"|'([^']+)'|`([^`]+)`/g) || []);
  const out = [];
  for (const raw of all) {
    const inner = raw.slice(1, -1);
    if (inner.startsWith('.') || inner.startsWith('/')) out.push(inner);
  }
  return out;
}
function countTsErrors() {
  try {
    const out = execSync('npx tsc --noEmit 2>&1', { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return (out.match(/error TS/g) || []).length;
  } catch (e) {
    return ((e.stdout || '') + (e.stderr || '')).match(/error TS/g)?.length || 0;
  }
}

// -------------------- per-diagnostic plan --------------------
function buildPlan(diag) {
  const relFile = diag.filePath;
  const absFile = path.join(ROOT, relFile);
  if (!fs.existsSync(absFile)) return { skip: true, reason: 'file missing: ' + relFile };
  const text = fs.readFileSync(absFile, 'utf8');
  const lineIdx = diag.line - 1;
  const parsed = parseImportAtLine(text, lineIdx);
  if (!parsed) return { skip: true, reason: `line ${diag.line} is not an import { ... } line in ${relFile}` };

  // Type-only lines are valid; mixed lists are valid too. We separate at output.
  const realEntries = parsed.entries.filter(e => e.orig);
  if (realEntries.length === 0) return { skip: true, reason: 'no non-type entries to rewrite' };

  const targets = extractTargetPaths(diag.message);
  if (targets.length === 0) return { skip: true, reason: 'no quoted target paths in diagnostic message' };

  const fileDir = path.dirname(absFile);
  const resolvedTargets = targets.map(rel => {
    const abs = fileAtRel(rel, fileDir);
    return { rel, abs, exports: exportsOf(abs) };
  });

  // For each entry, find which target file ACTUALLY EXPORTS it.
  const mappings = [];
  const ambiguous = [];
  for (const ent of realEntries) {
    const candidates = resolvedTargets.filter(t => t.exports.has(ent.orig));
    if (candidates.length === 1) {
      mappings.push({ ent, targetRel: candidates[0].rel });
    } else if (candidates.length === 0) {
      ambiguous.push(`${ent.orig}: NONE of [${targets.join(', ')}] export it`);
    } else {
      ambiguous.push(`${ent.orig}: exported by multiple targets [${candidates.map(c => c.rel).join(', ')}]`);
    }
  }

  if (ambiguous.length > 0) {
    return { skip: true, reason: `ambiguous mapping: ${ambiguous.join('; ')}` };
  }

  // Cluster by targetRel so we emit one `import { a, b } from 'p'` line per target.
  const clusters = new Map();
  for (const m of mappings) {
    if (!clusters.has(m.targetRel)) clusters.set(m.targetRel, []);
    clusters.get(m.targetRel).push(m.ent);
  }

  // Build replacement block (preserve original order via target occurrence in targets[]).
  const orderedTargets = targets.filter(t => clusters.has(t));
  const replacementLines = [];
  for (const tRel of orderedTargets) {
    const ents = clusters.get(tRel);
    const parts = ents.map(e => {
      if (e.typeOnly) return `type ${e.orig}` + (e.alias ? ` as ${e.alias}` : '');
      if (e.alias) return `${e.orig} as ${e.alias}`;
      return e.orig;
    });
    replacementLines.push(`${parsed.indent}import { ${parts.join(', ')} } from '${tRel}';`);
  }

  return {
    skip: false,
    relFile, absFile,
    lineIdx,
    lineCount: parsed.lineCount,
    originalBlockLen: parsed.lineCount,
    replacementBlock: replacementLines.join('\n'),
  };
}

// -------------------- RUN --------------------
const plans = diagnostics.map(buildPlan);
const writeable = plans.filter(p => !p.skip);
const skipped = plans.filter(p => p.skip);

log(`--- v7 dry-run for rule: ${RULE} ---`);
log(`diagnostics: ${diagnostics.length}`);
log(`writeable :  ${writeable.length}`);
log(`skipped   :  ${skipped.length}`);
log('');
log('=== SKIPPED (full reason) ===');
for (const s of skipped) {
  log('  ✗', s.reason || (s.relFile + ':' + (s.lineIdx + 1)));
}
log('');
log('=== WRITEABLE (would rewrite) ===');
for (const p of writeable) {
  log(`  ${p.relFile}:${p.lineIdx + 1} (${p.lineCount} lines → replacement below)`);
  for (const ln of p.replacementBlock.split('\n')) log('    >', ln);
}

if (DRY) {
  log('');
  log('Dry mode — no writes. Pass --write to apply.');
  process.exit(0);
}

// -------------------- WRITE PHASE --------------------
log('');
log('--- TYPECHECK BEFORE ---');
const baseline = countTsErrors();
log(`baseline tsc errors: ${baseline}`);

const changesByFile = new Map();
for (const p of writeable) {
  if (!changesByFile.has(p.relFile)) changesByFile.set(p.relFile, []);
  changesByFile.get(p.relFile).push(p);
}

const modified = [];
const writeFailures = [];

for (const [relFile, edits] of changesByFile) {
  const absFile = path.join(ROOT, relFile);
  const original = fs.readFileSync(absFile, 'utf8');
  const lines = original.split('\n');

  // Apply bottom-up so lineIdx stays valid through each apply.
  edits.sort((a, b) => b.lineIdx - a.lineIdx);
  for (const edit of edits) {
    const startIdx = edit.lineIdx;
    const endIdx = startIdx + edit.lineCount; // exclusive
    lines.splice(startIdx, edit.lineCount, ...edit.replacementBlock.split('\n'));
  }

  const newContent = lines.join('\n');
  if (newContent === original) {
    writeFailures.push({ relFile, reason: 'no-op' });
    continue;
  }

  try {
    fs.writeFileSync(absFile + '.bakv7', original, 'utf8');
  } catch (e) {
    writeFailures.push({ relFile, reason: 'backup: ' + e.message });
    continue;
  }
  try {
    fs.writeFileSync(absFile, newContent, 'utf8');
    modified.push(relFile);
  } catch (e) {
    writeFailures.push({ relFile, reason: 'write: ' + e.message });
  }
}

log(`files written: ${modified.length}`);
log(`write failures: ${writeFailures.length}`);
if (writeFailures.length) {
  for (const f of writeFailures) log('  ✗', f.relFile, '-', f.reason);
}

log('');
log('--- TYPECHECK AFTER ---');
const after = countTsErrors();
log(`post-write tsc errors: ${after}`);

if (after > baseline) {
  log('');
  log(`!!! REGRESSION !!! baseline=${baseline} after=${after}. Reverting.`);
  for (const relFile of modified) {
    try {
      spawnSync('git', ['checkout', '--', relFile], { cwd: ROOT, stdio: 'inherit' });
      try { fs.unlinkSync(path.join(ROOT, relFile + '.bakv7')); } catch {}
    } catch (e) {
      err(`revert fail: ${relFile}: ${e.message}`);
    }
  }
  log('REVERTED.');
  process.exit(1);
}

log('');
log(`PASS — typecheck unchanged (${baseline}). ${modified.length} file(s) real-code refactored.`);
for (const relFile of modified) {
  try { fs.unlinkSync(path.join(ROOT, relFile + '.bakv7')); } catch {}
}
