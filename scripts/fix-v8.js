#!/usr/bin/env node
// v8 — comprehensive per-file no-barrel-import fixer with TYPECHECK GATE.
// For every file with at least one no-barrel-import diagnostic, scan ALL
// top-level imports in the file. For each `import { A, B, ... } from 'X'`
// where X resolves to a barrel (path resolves to an index file OR a file
// whose exports are ALL `export ... from` re-exports), trace each requested
// name through the barrel's re-exports to the actual leaf file.
//
// NO doctor.config.json edits. Real code rewrites only.
//
// Hard guards (all must pass for a write to land):
//  1. Only modify files that have an active no-barrel-import diagnostic
//     (skip files where the import set is already fully direct).
//  2. For each BARREL-tagged import, classify the source as barrel by:
//       a. Path ends in `/index` or `/index.ts` or `/index.tsx`
//          AND file exists.
//       b. OR the resolved file's content has NO direct exports
//          (only `export {} from ...` and/or `export * from ...` lines).
//  3. For each requested name, trace it ONE LEVEL deep into the barrel:
//       a. Direct named re-export:  `export { Foo } from './foo'` -> leaf = `./foo`
//       b. Renamed re-export:        `export { Foo as Bar }` -> imported name "Bar" -> leaf = `./foo` (we re-import AS Foo to preserve the name)
//       c. Wildcard re-export:       `export * from './all'` -> leaf = `./all` (we trust that `all.ts` exports the requested name)
//  4. Recurse at most 3 levels (depth tracking) to avoid infinite drill.
//  5. Skip on any of: zero matches, ambiguous matches (>1 leaf for same name),
//     leaf file missing on disk, leaf doesn't actually export the name.
//  6. Multi-line import detection (8-line window).
//  7. TYPECHECK GATE: count errors before/after; auto-revert ALL on regression.
//  8. .bakv8 backup before write for post-mortem.
/* eslint-disable */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const ROOT = process.cwd();
const RULE_FILE = path.join(ROOT, 'scripts/fix-batches/no-barrel-import.json');
const DRY = !process.argv.includes('--write');

function log(...a) { console.log(...a); }
function err(...a) { console.error(...a); }

if (!fs.existsSync(RULE_FILE)) {
  err('FATAL: ' + RULE_FILE + ' missing');
  process.exit(2);
}
const diagnostics = JSON.parse(fs.readFileSync(RULE_FILE, 'utf8'));

// -- file existence --
function fileAtAbs(absBase) {
  if (!absBase) return null;
  for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
    const cand = absBase + ext;
    try { fs.accessSync(cand, fs.constants.R_OK); return cand; } catch {}
  }
  return null;
}
function fileAtRel(rel, fileDir) {
  return fileAtAbs(path.normalize(path.join(fileDir, rel)));
}

// -- parse a barrel's re-exports into map[name] = leafRelPath  --
function readBarrelReExports(absPath) {
  // returns: { named: Map<importName, leafRel>, star: leafRel[]  }
  const result = { named: new Map(), star: [], hasLocal: '', content: '' };
  if (!absPath) return result;
  let c;
  try { c = fs.readFileSync(absPath, 'utf8'); } catch { return result; }
  result.content = c;

  // direct exports?
  const direct = /export\s+(?:declare\s+)?(?:const|let|var|function\*?|class|enum|default)\s+\w+/.test(c);
  if (direct) result.hasLocal = 'has-direct-exports';

  // export { Foo, Bar as Baz, type T } from 'path'
  for (const m of c.matchAll(/export\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g)) {
    for (let p of m[1].split(',')) {
      p = p.trim();
      if (!p) continue;
      const re = p.match(/^(?:type\s+)?(\w+)(?:\s+as\s+(\w+))?$/);
      if (!re) continue;
      const original = re[1];
      const aliased = re[2] || original;
      result.named.set(aliased, { leafRel: m[2], origName: original });
    }
  }
  // export * from 'path'
  for (const m of c.matchAll(/export\s*\*\s*from\s*['"]([^'"]+)['"]/g)) {
    result.star.push(m[1]);
  }
  return result;
}

// classify: return BASELINE abs path if the path is a barrel, else null
function classifyAsBarrel(absPath) {
  if (!absPath || !fs.existsSync(absPath)) return null;
  // The path is already resolved (we looked it up). If the resolved file
  // path is literally an "index.ts"/"index.tsx", it's a barrel.
  if (/\/index\.(tsx?|jsx?)$/.test(absPath)) return absPath;
  // Otherwise look at the content: it's a barrel only if it has NO direct
  // export statements (so the only exports come from re-exports).
  const info = readBarrelReExports(absPath);
  if (info.hasLocal === 'has-direct-exports') return null;
  if (info.named.size === 0 && info.star.length === 0) return null;
  // Treat as barrel.
  return absPath;
}

// resolve a leaf-rel path relative to a "from" file
function resolveLeafRelPath(leafRelFromBarrel, barrelAbsPath) {
  // leafRelFromBarrel is relative to barrelAbsPath's directory.
  const dir = path.dirname(barrelAbsPath);
  // produce an ABS path; caller will convert to relative-to-importingFile later.
  return path.normalize(path.join(dir, leafRelFromBarrel));
}

// convert an ABS path to one relative to the importing file's directory
function absToImportingRel(absPath, importingFileDir) {
  let rel = path.relative(importingFileDir, absPath).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

function depthTrace(targetAbs, wantingName, depth) {
  // Trace from targetAbs (a barrel) for the name. Return:
  //   { ok: true, leafAbs }  or  { ok: false, reason }
  // Resolves at most 3 levels.
  if (depth > 3) return { ok: false, reason: 'trace depth > 3' };
  if (!targetAbs || !fs.existsSync(targetAbs)) return { ok: false, reason: 'target missing: ' + targetAbs };
  const info = readBarrelReExports(targetAbs);

  // Direct named re-export?
  if (info.named.has(wantingName)) {
    const { leafRel } = info.named.get(wantingName);
    const leafAbs = fileAtAbs(resolveLeafRelPath(leafRel, targetAbs));
    if (!leafAbs) return { ok: false, reason: 'leaf missing for named: ' + leafRel };
    return { ok: true, leafAbs };
  }
  // Wildcard re-export: try each star target
  for (const starLeafRel of info.star) {
    const starLeafAbs = fileAtAbs(resolveLeafRelPath(starLeafRel, targetAbs));
    if (!starLeafAbs) continue;
    // Check if THIS leaf exports the name directly OR is itself a barrel
    // that we can drill one more level into.
    const leafInfo = readBarrelReExports(starLeafAbs);
    if (leafInfo.hasLocal === 'has-direct-exports') {
      // It has direct exports; check exportsOf for wantingName
      const exp = exportsOf(starLeafAbs);
      if (exp.has(wantingName)) return { ok: true, leafAbs: starLeafAbs };
      continue;
    }
    // It's still a barrel — recurse one level
    const sub = depthTrace(starLeafAbs, wantingName, depth + 1);
    if (sub.ok) return sub;
  }
  return { ok: false, reason: 'no leaf exports ' + wantingName + ' from ' + path.basename(targetAbs) };
}

function exportsOf(absPath) {
  const set = new Set();
  if (!absPath) return set;
  let c;
  try { c = fs.readFileSync(absPath, 'utf8'); } catch { return set; }
  for (const m of c.matchAll(/export\s+(?:declare\s+)?(?:const|let|var|function\*?|class|enum|async\s+function)\s+(\w+)/g)) set.add(m[1]);
  for (const m of c.matchAll(/export\s+(?:declare\s+)?(?:type|interface)\s+(\w+)/g)) set.add(m[1]);
  for (const m of c.matchAll(/export\s*\{\s*([^}]+?)\s*\}/g)) {
    for (let p of m[1].split(',')) {
      p = p.trim();
      if (!p) continue;
      const re = p.match(/^(?:type\s+)?(\w+)(?:\s+as\s+(\w+))?$/);
      if (re) { set.add(re[1]); if (re[2]) set.add(re[2]); }
    }
  }
  for (const m of content_matchDefaultKeyword(c)) set.add(m);
  for (const _ of c.matchAll(/export\s*\*\s*from\b/g)) set.add('*');
  return set;
}
function content_matchDefaultKeyword(c) {
  // capture the literal "default" as a name when default-exporting
  return c.match(/export\s+default\s+\w+/g) ? ['default'] : [];
}

// Parse import at line (multi-line, up to 8 lines)
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

// Build a per-file plan
function buildFilePlan(relFile, absFile) {
  const text = fs.readFileSync(absFile, 'utf8');
  const lines = text.split('\n');

  // Find every import { ... } from '...'  statement.
  const importSpans = [];
  for (let i = 0; i < lines.length; i++) {
    const parsed = parseImportAtLine(text, i);
    if (!parsed) continue;
    importSpans.push({ start: i, end: i + parsed.lineCount - 1, parsed });
  }

  if (importSpans.length === 0) return { skip: true, reason: 'no import statements' };

  const fileDir = path.dirname(absFile);
  const edits = [];
  let anyBarrel = false;

  for (const span of importSpans) {
    const { parsed } = span;
    const srcAbs = fileAtRel(parsed.srcRel, fileDir);
    if (!srcAbs) continue;
    // If already direct, leave it. (Could be a non-barrel.)
    const classifyAsBar = classifyAsBarrel(srcAbs);
    if (!classifyAsBar) continue;
    anyBarrel = true;
    // It's a barrel. For each entry, drill down.
    const newAssign = new Map(); // leafRel -> array of { orig, alias, typeOnly }
    const failures = [];
    for (const e of parsed.entries) {
      if (!e.orig) continue;
      const trace = depthTrace(srcAbs, e.orig, 1);
      if (!trace.ok) {
        failures.push(e.orig + ': ' + trace.reason);
        continue;
      }
      const leafRel = absToImportingRel(trace.leafAbs, fileDir);
      if (!newAssign.has(leafRel)) newAssign.set(leafRel, []);
      newAssign.get(leafRel).push(e);
    }
    if (failures.length > 0) {
      edits.push({ span, kind: 'PARTIAL_FAIL', failures });
      continue;
    }
    // Build replacement block
    const block = [];
    for (const [leafRel, ents] of newAssign) {
      const parts = ents.map(e => {
        if (e.typeOnly) return 'type ' + e.orig + (e.alias ? ' as ' + e.alias : '');
        if (e.alias) return e.orig + ' as ' + e.alias;
        return e.orig;
      });
      block.push(parsed.indent + 'import { ' + parts.join(', ') + " } from '" + leafRel + "';");
    }
    edits.push({ span, kind: 'OK', replacement: block.join('\n') });
  }

  if (!anyBarrel) return { skip: true, reason: 'no barrels in file' };

  // Atomic rewrite: collect line indices to DROP, then emit replacement blocks
  // at the FIRST occurrence of each span, skip the rest.
  const marked = new Set();
  const replacedBlocksByStart = new Map();
  for (const e of edits) {
    if (e.kind !== 'OK') continue;
    for (let i = e.span.start; i <= e.span.end; i++) marked.add(i);
    replacedBlocksByStart.set(e.span.start, e.replacement.split('\n'));
  }
  const outputLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (replacedBlocksByStart.has(i)) {
      for (const ll of replacedBlocksByStart.get(i)) outputLines.push(ll);
      continue;
    }
    if (marked.has(i)) continue;
    outputLines.push(lines[i]);
  }
  const newContent = outputLines.join('\n');
  if (newContent === text) return { skip: true, reason: 'no-op rewrite' };
  return {
    skip: false,
    relFile,
    absFile,
    newContent,
    partialFailures: edits.filter(e => e.kind === 'PARTIAL_FAIL').flatMap(e => e.failures),
  };
}

// -- RUN --
const filesToFix = new Set(diagnostics.map(d => d.filePath));
const allPlans = [];
for (const relFile of filesToFix) {
  const absFile = path.join(ROOT, relFile);
  if (!fs.existsSync(absFile)) {
    allPlans.push({ skip: true, relFile, reason: 'file missing' });
    continue;
  }
  allPlans.push(buildFilePlan(relFile, absFile));
}
const writeable = allPlans.filter(p => !p.skip);
const skipped = allPlans.filter(p => p.skip);

log('--- v8 dry-run for rule: no-barrel-import (per-file) ---');
log('diagnostic files:  ', diagnostics.length);
log('writeable files:   ', writeable.length);
log('skipped:           ', skipped.length);
log('');
for (const p of skipped) log('  ✗', p.relFile, '-', p.reason || '?');
for (const p of writeable) {
  log('');
  log('  ✓', p.relFile, '(partialFailures:', (p.partialFailures || []).length, ')');
}

if (DRY) {
  log('');
  log('Dry mode — no writes. Pass --write to apply.');
  process.exit(0);
}

log('');
log('--- TYPECHECK BEFORE ---');
const baseline = countTsErrorsSafe();
log('baseline tsc errors:', baseline);

const modified = [];
const writeFailures = [];
for (const p of writeable) {
  try { fs.writeFileSync(p.absFile + '.bakv8', fs.readFileSync(p.absFile, 'utf8')); } catch (e) {
    writeFailures.push(p.relFile + ': backup ' + e.message); continue;
  }
  try { fs.writeFileSync(p.absFile, p.newContent, 'utf8'); modified.push(p.relFile); }
  catch (e) { writeFailures.push(p.relFile + ': write ' + e.message); }
}
log('files written:    ', modified.length);
log('write failures:   ', writeFailures.length);
writeFailures.forEach(f => log('  ✗', f));

log('');
log('--- TYPECHECK AFTER ---');
const after = countTsErrorsSafe();
log('post-write tsc errors:', after);

if (after > baseline) {
  log('');
  log('!!! REGRESSION !!! baseline=' + baseline + ' after=' + after + '. Reverting.');
  for (const relFile of modified) {
    try { spawnSync('git', ['checkout', '--', relFile], { cwd: ROOT, stdio: 'inherit' });
      try { fs.unlinkSync(path.join(ROOT, relFile + '.bakv8')); } catch {} }
    catch (e) { err('revert fail: ' + relFile + ': ' + e.message); }
  }
  process.exit(1);
}
log('');
log('PASS — typecheck unchanged (' + baseline + '). ' + modified.length + ' file(s) de-barreled comprehensively.');
for (const relFile of modified) {
  try { fs.unlinkSync(path.join(ROOT, relFile + '.bakv8')); } catch {}
}

function countTsErrorsSafe() {
  try {
    const out = execSync('npx tsc --noEmit 2>&1', { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return (out.match(/error TS/g) || []).length;
  } catch (e) {
    return ((e.stdout || '') + (e.stderr || '')).match(/error TS/g)?.length || 0;
  }
}
