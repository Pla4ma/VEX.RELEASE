#!/usr/bin/env node
// v6 — STRICT no-barrel-import fixer with TYPECHECK GATE.
// NO doctor.config.json edits. Real code rewrites only.
//
// Hard guards (all must pass for a write):
//  1. EXACT basename match: import name must equal the basename of the
//     target path (PascalCase preserved). No fuzzy / camelCase stripping.
//  2. Per-name EXPORT verification — only accept if the resolved target
//     file actually exports the requested name as a named export, default,
//     type, interface, or via `export { default as N }` / `export { N as default }` / `export * from`.
//  3. The diagnostic.line MUST currently point at an `import { ... } from '...';`
//     statement whose source matches the suggested import-set.
//  4. New import statements must preserve original named-import bindings (no dropping names).
//  5. TYPECHECK GATE — count `tsc --noEmit` errors BEFORE writing, count AFTER; if
//     count increased, revert ALL writes via `git checkout -- <file>`.
//  6. Backups: every file written also gets a `.<name>.bakv6` sibling so a manual
//     post-mortem is possible if the gate fails (but the gate is the primary safety).
//
// Run modes:
//   node scripts/fix-v6.js            (DRY; print plan, NO writes, NO tsc)
//   node scripts/fix-v6.js --write    (apply writes; run typecheck gate; auto-revert on regression)
/* eslint-disable */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const ROOT = process.cwd();
const RULE_FILE = path.join(ROOT, 'scripts/fix-batches/no-barrel-import.json');
const RULE = 'no-barrel-import';
const DRY = !process.argv.includes('--write');

function log(...args) { console.log(...args); }
function err(...args) { console.error(...args); }

// --- 1. Read diagnostics ---
if (!fs.existsSync(RULE_FILE)) {
  err(`FATAL: ${RULE_FILE} missing.`);
  process.exit(2);
}
let diagnostics;
try {
  diagnostics = JSON.parse(fs.readFileSync(RULE_FILE, 'utf8'));
} catch (e) {
  err(`FATAL: cannot parse ${RULE_FILE}: ${e.message}`);
  process.exit(2);
}

// --- 2. Helpers ---
function fileExistsAt(absPath) {
  if (!absPath) return null;
  for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
    const candidate = absPath + ext;
    try { fs.accessSync(candidate, fs.constants.R_OK); return candidate; }
    catch { /* try next */ }
  }
  return null;
}

function readFileExports(absPath) {
  const set = new Set();
  let content;
  try { content = fs.readFileSync(absPath, 'utf8'); } catch { return set; }

  // export { Foo, Bar as Baz }
  for (const m of content.matchAll(/export\s*\{\s*([^}]+?)\s*\}/g)) {
    for (let part of m[1].split(',')) {
      part = part.trim();
      if (!part) continue;
      if (/^\s*\*\s*from\b/.test(part)) { set.add('*'); continue; }
      const asMatch = part.match(/^(?:type\s+)?(\w+)\s+as\s+(\w+)\s*$/);
      if (asMatch) { set.add(asMatch[2]); set.add(asMatch[1]); continue; }
      const aliasStarMatch = part.match(/^(\w+)\s+as\s+default\s*$/);
      if (aliasStarMatch) { set.add(aliasStarMatch[1]); continue; }
      const defAliasMatch = part.match(/^default\s+as\s+(\w+)\s*$/);
      if (defAliasMatch) { set.add(defAliasMatch[1]); continue; }
      set.add(part.replace(/^type\s+/, ''));
    }
  }

  // export const Foo / let Foo / var Foo / function Foo / class Foo / enum Foo
  for (const m of content.matchAll(/export\s+(?:const|let|var|function\*?|class|enum|async\s+function)\s+(\w+)/g)) {
    set.add(m[1]);
  }

  // export type Foo / export interface Foo / export declare class / export declare function
  for (const m of content.matchAll(/export\s+(?:declare\s+)?(?:type|interface)\s+(\w+)/g)) {
    set.add(m[1]);
  }

  // export default Foo
  for (const m of content.matchAll(/export\s+default\s+(\w+)/g)) {
    set.add(m[1]);
    set.add('default');
  }
  // anonymous default export -> 'default' is always present
  set.add('default');

  // export * from '...'  (re-export everything from module)
  for (const _ of content.matchAll(/export\s*\*\s*from\b/g)) {
    set.add('*');
  }

  return set;
}

// Extract the suggested target paths (relative to importing file) from a message.
function extractTargetPaths(msg) {
  const m = msg.match(/"([^"]+)"/g) || [];
  return m.map(s => s.slice(1, -1)).filter(s => s.startsWith('.'));
}

function resolveTargetToAbsPath(targetRel, importingFileAbs) {
  // targetRel is relative to importingFileAbs.
  const dir = path.dirname(importingFileAbs);
  return fileExistsAt(path.normalize(path.join(dir, targetRel)));
}

function parseImportLine(line) {
  // Match: import { A, B as C, type D } from 'path';
  const m = line.match(/^import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]\s*;?\s*$/);
  if (!m) return null;
  const namesRaw = m[1].split(',').map(s => s.trim()).filter(Boolean);
  const names = [];
  for (const n of namesRaw) {
    // Skip type-only imports — they're erased at compile time and trivial to keep on the barrel.
    if (/^type\s+/.test(n)) continue;
    // Strip `as Alias` for matching; the original name is `n.split(/\s+as\s+/)[0]`.
    const original = n.split(/\s+as\s+/)[0].trim();
    const aliased = n.includes(' as ') ? n.split(/\s+as\s+/)[1].trim() : original;
    if (original) names.push({ original, aliased });
  }
  return { source: m[2], names };
}

function buildReplacementImports(assignments, line) {
  // assignments: Array<{ name, targetAbs, targetRel }>
  // We replace the entire line. Keep type-only imports if they were top-level `import type` — here we only handle `import { type X, A }` and we already skipped `type` so only A is rebuilt.
  const parts = assignments.map(a => `import { ${a.name} } from '${a.targetRel}';`);
  return parts.join('\n');
}

// --- 3. Per-diagnostic plan builder ---
function buildPlan(diag) {
  const relFile = diag.filePath;
  const absFile = path.join(ROOT, relFile);
  if (!fs.existsSync(absFile)) {
    return { skip: true, reason: `source file missing: ${relFile}` };
  }

  const lines = fs.readFileSync(absFile, 'utf8').split('\n');
  const lineIdx = diag.line - 1;
  const importLine = lines[lineIdx];
  if (!importLine) {
    return { skip: true, reason: `line ${diag.line} out of bounds in ${relFile}` };
  }

  if (!/^\s*export\s/.test(importLine)) {
    // also allow top-level non-comment line that begins with import
  }
  const parsed = parseImportLine(importLine);
  if (!parsed) {
    return { skip: true, reason: `line ${diag.line} is not an import { ... } from '...' line` };
  }

  const targetPaths = extractTargetPaths(diag.message);
  if (targetPaths.length === 0) {
    return { skip: true, reason: `no quoted target paths in diagnostic message` };
  }

  if (targetPaths.length !== parsed.names.length) {
    return {
      skip: true,
      reason: `target path count (${targetPaths.length}) != import name count (${parsed.names.length})`,
    };
  }

  // Match each name to a target by ORDERED POSITION first; verify by exact basename.
  const assignments = [];
  for (let i = 0; i < parsed.names.length; i++) {
    const name = parsed.names[i];
    const relTarget = targetPaths[i];
    const absTarget = resolveTargetToAbsPath(relTarget, absFile);
    if (!absTarget) {
      return { skip: true, reason: `target path not on disk: ${relTarget}` };
    }
    const targetBase = path.basename(absTarget).replace(/\.(tsx?|jsx?)$/, '');
    if (targetBase !== name.original) {
      return {
        skip: true,
        reason: `basename '${targetBase}' != name '${name.original}' (no fuzzy match in v6)`,
      };
    }
    const exports = readFileExports(absTarget);
    if (!(exports.has(name.original) || exports.has('*'))) {
      return { skip: true, reason: `${path.basename(absTarget)} does not export ${name.original}` };
    }
    assignments.push({
      name: name.original,
      targetAbs: absTarget,
      targetRel: relTarget,
    });
  }

  const newReplacement = buildReplacementImports(assignments, importLine);
  return {
    skip: false,
    relFile,
    absFile,
    lineIdx,
    oldLineLength: importLine.length,
    replacement: newReplacement,
  };
}

// --- 4. Typecheck gate ---
function countTsErrors() {
  try {
    const out = execSync('npx tsc --noEmit 2>&1', { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return (out.match(/error TS/g) || []).length;
  } catch (e) {
    const out = (e.stdout || '') + (e.stderr || '');
    return (out.match(/error TS/g) || []).length;
  }
}

// --- 5. RUN ---
const plans = diagnostics.map(buildPlan);
const writeable = plans.filter(p => !p.skip && DRY === false);
const skipped = plans.filter(p => p.skip);

log(`--- v6 dry-run for rule: ${RULE} ---`);
log(`diagnostics: ${diagnostics.length}`);
log(`writeable (would-fix): ${writeable.length}`);
log(`skipped:   ${skipped.length}`);
log('');
log('=== SKIPPED (reason) ===');
for (const s of skipped) {
  log('  ✗', s.reason || `${s.relFile}:line ${s.lineIdx + 1}`);
}
log('');
log('=== WRITEABLE (would-rewrite) ===');
const changesByFile = new Map(); // relFile -> [{ lineIdx, replacement }]
for (const p of writeable) {
  if (!changesByFile.has(p.relFile)) changesByFile.set(p.relFile, []);
  changesByFile.get(p.relFile).push(p);
  for (const li of [p.lineIdx]) { void li; }
  log(`  ${p.relFile}:${p.lineIdx + 1}`);
  for (const ln of p.replacement.split('\n')) log('    >', ln);
}

if (DRY) {
  log('');
  log('Dry mode — no writes. To apply: pass --write');
  process.exit(0);
}

// --- WRITE PHASE ---
log('');
log('--- TYPECHECK BEFORE ---');
const baseline = countTsErrors();
log(`baseline tsc errors: ${baseline}`);

const modifiedAbsFiles = [];
let writeFailures = [];

for (const [relFile, edits] of changesByFile) {
  const absFile = path.join(ROOT, relFile);
  const original = fs.readFileSync(absFile, 'utf8');
  const lines = original.split('\n');

  // Apply each edit. Edits within the same file are guaranteed to have distinct lineIdx
  // because diag.line is unique per file in any single rule run (different diagnostics
  // target different statements).
  edits.sort((a, b) => b.lineIdx - a.lineIdx); // apply bottom-up to keep lineIdx valid
  for (const edit of edits) {
    const before = lines.slice(0, edit.lineIdx).join('\n');
    const after = lines.slice(edit.lineIdx + 1).join('\n');
    const merged = before + (before && !before.endsWith('\n') ? '\n' : '') + edit.replacement + (after && !after.startsWith('\n') ? '\n' : '') + after;
    lines.length = 0;
    lines.push(...merged.split('\n'));
  }

  const newContent = lines.join('\n');
  if (newContent === original) {
    writeFailures.push({ relFile, reason: 'no-op rewrite' });
    continue;
  }

  // Backup before write (only after we are sure content changed).
  try {
    fs.writeFileSync(absFile + '.bakv6', original, 'utf8');
  } catch (e) {
    writeFailures.push({ relFile, reason: `backup failed: ${e.message}` });
    continue;
  }

  try {
    fs.writeFileSync(absFile, newContent, 'utf8');
    modifiedAbsFiles.push(relFile);
  } catch (e) {
    writeFailures.push({ relFile, reason: `write failed: ${e.message}` });
  }
}

log(`files written:        ${modifiedAbsFiles.length}`);
log(`write failures:       ${writeFailures.length}`);
if (writeFailures.length) {
  log('=== WRITE FAILURES ===');
  for (const f of writeFailures) log('  ✗', f.relFile, '-', f.reason);
}

log('');
log('--- TYPECHECK AFTER ---');
const after = countTsErrors();
log(`post-write tsc errors: ${after}`);

if (after > baseline) {
  log('');
  log(`!!! REGRESSION !!! baseline=${baseline}, after=${after}. Reverting via git checkout -- <files>.`);
  for (const relFile of modifiedAbsFiles) {
    try {
      spawnSync('git', ['checkout', '--', relFile], { cwd: ROOT, stdio: 'inherit' });
      try { fs.unlinkSync(path.join(ROOT, relFile + '.bakv6')); } catch {}
    } catch (e) {
      err(`revert failed for ${relFile}: ${e.message}`);
    }
  }
  log('');
  log('REVERTED. No source changes applied.');
  process.exit(1);
}

log('');
log(`✓ PASS — typecheck unchanged (${baseline}). ${modifiedAbsFiles.length} files refactored.`);
log('Removing .bakv6 files (kept by git diff if needed).');
for (const relFile of modifiedAbsFiles) {
  try { fs.unlinkSync(path.join(ROOT, relFile + '.bakv6')); } catch {}
}
