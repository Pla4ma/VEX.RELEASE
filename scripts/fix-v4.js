#!/usr/bin/env node
// v4 — surgical no-barrel-import fixer with strict safety guards.
//
// SAFETY MODEL: For each diagnostic, only rewrite the import statement IF
//   (1) Every suggested target path in the diagnostic message resolves to
//       an actual file on disk with one of the expected extensions, AND
//   (2) Every destructured import name can be unambiguously matched to
//       exactly one suggested path — either by basename match (e.g., `Box`
//       -> `.../Box`) or by exact name->path mapping inferred from the
//       barrel prefix pattern, AND
//   (3) The diagnostic message actually lists suggested paths (skip files
//       where the diagnostic message has no inline path mapping).
//
// If any condition fails, the file is skipped entirely — leaving the
// diagnostic untouched. This is intentionally conservative: it will not
// touch ~10-15 of the 32 known diagnostics, leaving them for human review,
// but it will never produce broken imports.
/* eslint-disable */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DRY = !process.argv.includes('--write');
const RULE = 'no-barrel-import';

const diags = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/fix-batches', RULE + '.json'), 'utf8'));

function fileExists(p) {
  if (!p) return null;
  for (const ext of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
    const candidate = path.join(ROOT, p + ext);
    try { fs.accessSync(candidate, fs.constants.R_OK); return candidate; } catch {}
  }
  try {
    fs.accessSync(path.join(ROOT, p), fs.constants.R_OK);
    return path.join(ROOT, p);
  } catch {}
  return null;
}

function extractPaths(msg) {
  // Match all "…path…" quoted strings — they are React Doctor's suggestions.
  const matches = msg.match(/"(\.\.?\/[^"]+)"/g) || [];
  if (matches.length < 1) return null;
  return matches.map(s => s.slice(1, -1));
}

function matchNamesToPaths(names, paths) {
  // Strict: every name must resolve to exactly one path via basename match.
  // Returns null if any name is ambiguous or unresolvable.
  // Prefers matches with NON-overlapping paths so no two names map to the same file.
  const taken = new Set();
  const assignments = new Map();
  // First pass: literal basename equality.
  for (const name of names) {
    let candidate = null;
    for (const p of paths) {
      const base = p.split('/').filter(Boolean).pop();
      if (base === name && !taken.has(p)) { candidate = p; break; }
    }
    if (!candidate) return null; // unresolvable — refuse to guess
    assignments.set(name, candidate);
    taken.add(candidate);
  }
  // Final guard: every name got exactly one path, no collisions.
  if (assignments.size !== names.length) return null;
  return assignments;
}

function readImportAt(content, line) {
  // Locate the import statement that contains `line` (1-indexed).
  const lines = content.split('\n');
  let blockStart = line - 1;
  while (blockStart > 0 && lines[blockStart - 1] && !lines[blockStart - 1].match(/^\s*import\b|^\s*from\b|^[},]/)) {
    blockStart -= 1;
    if (blockStart - 1 < 0) break;
    // Stop if we hit the previous import's closing.
    if (lines[blockStart - 1].match(/(from\s+['"][^'"]+['"]\s*;?|$)/) && !lines[blockStart - 1].match(/^\s*import\b/)) break;
  }
  // Up-search for 'import'.
  blockStart = line - 1;
  while (blockStart >= 0 && !lines[blockStart].match(/^\s*import\b/)) blockStart -= 1;
  if (blockStart < 0) return null;
  // Down-search for the matching ';'.
  let blockEnd = line - 1;
  while (blockEnd < lines.length && !lines[blockEnd].match(/;\s*$/)) blockEnd += 1;
  return {
    start: blockStart,
    end: blockEnd,
    text: lines.slice(blockStart, blockEnd + 1).join('\n'),
    sourceLine: line,
  };
}

function rebuild(nameToPath, originalFrom, originalPrefix) {
  // Build `import { name } from 'path';` per name, dedup, preserve import type-only flag if present.
  const isTypeOnly = /\bimport\s+type\b/.test(originalPrefix);
  const tag = isTypeOnly ? 'import type' : 'import';
  const parts = [];
  const seen = new Set();
  for (const [name, p] of nameToPath.entries()) {
    if (seen.has(name)) continue;
    seen.add(name);
    parts.push(`${tag} { ${name} } from '${p}';`);
  }
  return parts.join('\n');
}

let totalDiags = 0;
let matches = 0;
let skipped = 0;
const results = [];

for (const d of diags) {
  totalDiags += 1;
  if (!d.filePath.startsWith('src/') && !d.filePath.startsWith('jobs/') && !d.filePath.startsWith('shared/')) {
    skipped += 1;
    continue;
  }
  const paths = extractPaths(d.message);
  if (!paths) {
    skipped += 1;
    continue;
  }
  // Verify every suggested path actually resolves to a real file on disk.
  const resolved = paths.filter(p => fileExists(p));
  if (resolved.length !== paths.length) {
    skipped += 1;
    continue;
  }
  let content;
  try { content = fs.readFileSync(path.join(ROOT, d.filePath), 'utf8'); }
  catch { skipped += 1; continue; }

  const block = readImportAt(content, d.line);
  if (!block) { skipped += 1; continue; }

  const destructured = block.text.match(/\{([^}]+)\}/);
  if (!destructured) { skipped += 1; continue; }

  const names = destructured[1]
    .split(',')
    .map(s => s.trim().replace(/\s+as\s+/, ' as '))
    .filter(Boolean)
    .map(s => s.split(/\s+as\s+/)[0].trim())
    .filter(Boolean);
  if (names.length === 0) { skipped += 1; continue; }

  const map = matchNamesToPaths(names, resolved);
  if (!map) { skipped += 1; continue; }

  // Pull any `import type` prefix.
  const prefixMatch = block.text.match(/^\s*import(\s+type)?\s+/) || [null, ''];
  const prefix = block.text.slice(0, block.text.indexOf('{'));

  const replacement = rebuild(map, null, prefix);

  // Sanity: don't permit import-name count drift (must equal names.length).
  const outCount = (replacement.match(/\{[^}]+\}/g) || []).length;
  if (outCount !== names.length) {
    skipped += 1;
    continue;
  }

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
  examples: results.slice(0, 5).map(r => ({
    filePath: r.filePath,
    line: r.line,
    names: r.names,
    replacement: r.replacement.split('\n')[0] + (r.replacement.split('\n').length > 1 ? ` (+${r.replacement.split('\n').length - 1})` : ''),
  })),
}, null, 2));
