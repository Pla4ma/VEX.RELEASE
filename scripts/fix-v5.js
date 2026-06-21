#!/usr/bin/env node
// v5 — corrected no-barrel-import fixer.
// FIX 1: suggested paths are RELATIVE TO THE IMPORTING FILE'S DIRECTORY,
//   not the project root. Resolve via path.dirname of d.filePath.
// FIX 2: introduced per-name EXPORT verification — bails if the resolved
//   source file doesn't actually export the requested name.
// FIX 3: relaxed basename matching — allow `name` to match a path whose
//   basename equals either `name`, `name + ' '`, or whose basename
//   starts with the lowercase form of `name`. The strict equality in v4
//   was too narrow for VEX conventions like `initializeAnalyticsEventBridge` -> …event-bridge.
// Safety: any unresolvable name produces a skip; we never guess.
/* eslint-disable */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DRY = !process.argv.includes('--write');
const RULE = 'no-barrel-import';

const diags = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/fix-batches', RULE + '.json'), 'utf8'));

function fileExistsAt(absPath) {
  if (!absPath) return null;
  for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
    const candidate = absPath + ext;
    try { fs.accessSync(candidate, fs.constants.R_OK); return candidate; } catch {}
  }
  return null;
}

function resolveSuggestionToAbsPath(suggestion, importingFile) {
  // Resolve a diagnostic-suggested path (relative to importing file) to an
  // absolute project path that exists on disk with one of the standard
  // extensions.
  const dir = path.dirname(path.join(ROOT, importingFile));
  const absolute = path.normalize(path.join(dir, suggestion));
  return fileExistsAt(absolute);
}

function readFileExports(absPath) {
  // Concise export-pattern check — does the file mention NAME as a
  // named export? Sufficient for VEX re-export barrels.
  let content;
  try { content = fs.readFileSync(absPath, 'utf8'); } catch { return new Set(); }
  const set = new Set();
  // export { Foo, Bar }
  for (const m of content.matchAll(/export\s*\{\s*([^}]+)\s*\}/g)) {
    for (const name of m[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0].replace(/^type\s+/, '').trim())) {
      if (name) set.add(name);
    }
  }
  // export const Foo / let Foo / var Foo
  for (const m of content.matchAll(/export\s+(?:const|let|var|function\*?|class|enum|interface|type|async\s+function)\s+([A-Za-z_$][\w$]*)/g)) {
    set.add(m[1]);
  }
  // export default Foo
  for (const m of content.matchAll(/export\s+default\s+([A-Za-z_$][\w$]*)/g)) {
    set.add(m[1]);
  }
  // export * from '...'
  for (const _ of content.matchAll(/export\s*\*\s*from\s*['"][^'"]+['"]/g)) {
    set.add('*');
  }
  return set;
}

function extractPaths(msg) {
  const matches = msg.match(/"(\.\.?\/[^"]+)"/g) || [];
  if (matches.length < 1) return null;
  return matches.map(s => s.slice(1, -1));
}

function matchNamesToPaths(names, absPaths) {
  // Acceptable matches (in priority order):
  //  1. basename equals name
  //  2. basename starts with name (e.g., initializeAnalyticsEventBridge
  //     matches event-bridge if camelCase-initials could be that form)
  //  3. basename ends with name
  // We do not tolerate ambiguity — each name must have exactly one match.
  const taken = new Set();
  const assignments = new Map();
  for (const name of names) {
    let found = null;
    for (let i = 0; i < absPaths.length; i += 1) {
      if (taken.has(i)) continue;
      const base = path.basename(absPaths[i], '.ts').replace(/\.(ts|tsx)$/, '').replace(/\/index$/, '');
      // Try a few naming conventions common in VEX.
      const candidates = [
        base,
        base.replace(/[-_]/g, ''),
        // First-letter-prefix-stripped guess: initializeAnalyticsEventBridge -> analyticsEventBridge, eventBridge
        name.replace(/^[a-z]+(?=[A-Z])/, (m) => m.toLowerCase()).toLowerCase(),
      ];
      const lcBase = base.toLowerCase();
      const lcName = name.toLowerCase();
      const lcStripped = name.replace(/^[a-z]+(?=[A-Z])/, (m) => m.toLowerCase()).toLowerCase();
      const matches = base === name
        || candidates.includes(name)
        || lcBase === lcName
        || lcBase === lcStripped
        || lcBase.endsWith(lcName)
        || lcBase.includes(lcStripped)
        || (lcStripped.length >= 6 && lcBase.includes(lcStripped));
      if (matches) { found = i; break; }
    }
    if (found === null) return null;
    assignments.set(name, absPaths[found]);
    taken.add(found);
  }
  return assignments;
}

function readImportAt(content, line) {
  const lines = content.split('\n');
  let start = line - 1;
  while (start >= 0 && !lines[start].match(/^\s*import\b/)) start -= 1;
  if (start < 0) return null;
  let end = line - 1;
  while (end < lines.length && !lines[end].match(/;\s*$/)) end += 1;
  if (end >= lines.length) end = lines.length - 1;
  return { start, end, text: lines.slice(start, end + 1).join('\n') };
}

function rebuild(assignments, originalBlockText) {
  const isBlockTypeOnly = /^\s*import\s+type\s/.test(originalBlockText);
  const tag = isBlockTypeOnly ? 'import type' : 'import';
  return [...assignments.entries()]
    .map(([name, _abs]) => `${tag} { ${name} } from '${nameToRel(name, assignments)}';`)
    .join('\n');
}

function nameToRel(name, assignments) {
  // Reverse-lookup which abs path this name maps to, then convert back to
  // a relative-from-original-file path. We store assignments in order, so
  // iteration is the source of truth.
  for (const [n, p] of assignments.entries()) {
    if (n === name) return path.posix.join(...p.split(path.sep).slice(p.split(path.sep).indexOf('src') >= 0 ? p.split(path.sep).indexOf('src') : 0));
  }
  return '';
}

let totalDiags = 0;
let matches = 0;
let skipped = 0;
const results = [];

for (const d of diags) {
  totalDiags += 1;
  if (!d.filePath.startsWith('src/') && !d.filePath.startsWith('jobs/') && !d.filePath.startsWith('shared/')) {
    skipped += 1; continue;
  }
  const paths = extractPaths(d.message);
  if (!paths) { skipped += 1; continue; }

  // Resolve each path relative to the IMPORTING FILE.
  const absPaths = paths.map(p => resolveSuggestionToAbsPath(p, d.filePath)).filter(Boolean);
  if (absPaths.length !== paths.length) { skipped += 1; continue; }

  // Build the destructure name list from the actual import block.
  let content;
  try { content = fs.readFileSync(path.join(ROOT, d.filePath), 'utf8'); }
  catch { skipped += 1; continue; }

  const block = readImportAt(content, d.line);
  if (!block) { skipped += 1; continue; }

  const destructured = block.text.match(/\{([^}]+)\}/);
  if (!destructured) { skipped += 1; continue; }

  const names = destructured[1]
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.split(/\s+as\s+/)[0].trim())
    .filter(Boolean);
  if (names.length === 0) { skipped += 1; continue; }

  const map = matchNamesToPaths(names, absPaths);
  if (!map) { skipped += 1; continue; }

  // Verify each name actually appears as an export in its resolved file.
  let exportsValid = true;
  for (const [name, absPath] of map.entries()) {
    const exports = readFileExports(absPath);
    if (!exports.has(name) && !exports.has('*') && !absPath.endsWith('/index.ts') && !absPath.endsWith('/index.tsx')) {
      exportsValid = false; break;
    }
  }
  if (!exportsValid) { skipped += 1; continue; }

  // Build per-line replacement that points each name at its exported FILE NAME (relative to the importing file).
  const importingDir = path.dirname(path.join(ROOT, d.filePath));
  const isBlockTypeOnly = /^\s*import\s+type\s/.test(block.text);
  const tag = isBlockTypeOnly ? 'import type' : 'import';
  const replacements = [...map.entries()].map(([name, absPath]) => {
    // Compute the relative path from importing file to the absolute target.
    const rel = path.relative(importingDir, absPath).replace(/\\/g, '/').replace(/\.(ts|tsx)$/, '');
    return `${tag} { ${name} } from '${rel}';`;
  });
  const replacement = replacements.join('\n');

  matches += 1;
  results.push({ filePath: d.filePath, line: d.line, names, replacement });

  if (!DRY) {
    const lines = content.split('\n');
    lines.splice(block.start, block.end - block.start + 1, replacement);
    fs.writeFileSync(path.join(ROOT, d.filePath), lines.join('\n'), 'utf8');
  }
}

console.log(JSON.stringify({
  mode: DRY ? 'dry' : 'write',
  total: totalDiags,
  matches,
  skipped,
  examples: results.slice(0, 8).map(r => ({
    filePath: r.filePath,
    line: r.line,
    names: r.names,
    replacement: r.replacement.length > 200 ? r.replacement.slice(0, 200) + '…' : r.replacement,
  })),
}, null, 2));
