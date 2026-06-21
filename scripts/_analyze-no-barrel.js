#!/usr/bin/env node
// Ad-hoc analyzer: for each no-barrel-import diagnostic, decide which target
// file ACTUALLY exports each imported name. Print matchability stats so we
// know how many of the 32 diagnostics are safely auto-fixable.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/fix-batches/no-barrel-import.json'), 'utf8'));

function fileAt(rel, fileDir) {
  const abs = path.normalize(path.join(fileDir, rel));
  for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
    try { fs.accessSync(abs + ext); return abs + ext; } catch { /* next */ }
  }
  return null;
}
function exportsOf(abs) {
  const set = new Set();
  if (!abs) return set;
  let c;
  try { c = fs.readFileSync(abs, 'utf8'); } catch { return set; }
  for (const m of c.matchAll(/export\s+(?:const|let|var|function\*?|class|enum|async\s+function)\s+(\w+)/g)) set.add(m[1]);
  for (const m of c.matchAll(/export\s+(?:declare\s+)?(?:type|interface)\s+(\w+)/g)) set.add(m[1]);
  for (const m of c.matchAll(/export\s*\{\s*([^}]+?)\s*\}/g)) {
    for (let p of m[1].split(',')) {
      p = p.trim();
      if (!p) continue;
      const re = p.match(/^(?:type\s+)?(\w+)(?:\s+as\s+(\w+))?$/);
      if (re) { set.add(re[1]); if (re[2]) set.add(re[2]); }
    }
  }
  for (const _ of c.matchAll(/export\s+default\s+\w+/g)) set.add('default');
  for (const _ of c.matchAll(/export\s*\*\s*from\b/g)) set.add('*');
  return set;
}

let totalNames = 0;
let okCount = 0;
let missingCount = 0;
let ambiguousCount = 0;
const results = [];

for (const x of d) {
  const text = fs.readFileSync(x.filePath, 'utf8');
  // Compute absolute offset of line x.line (1-based) start
  const lines = text.split('\n');
  const startLineIdx = x.line - 1;
  if (startLineIdx >= lines.length) {
    results.push({ file: x.filePath, line: x.line, status: 'OOBOUNDS' });
    continue;
  }
  const importLineCandidate = lines[startLineIdx];
  const fileDir = path.dirname(path.join(ROOT, x.filePath));
  let parsed = null;
  // Try multi-line: scan up to 6 lines starting at line x.line for an import statement that begins at index 0 (possibly with leading whitespace).
  let concat = '';
  for (let i = 0; i < 8 && startLineIdx + i < lines.length; i++) {
    concat += (concat ? '\n' : '') + lines[startLineIdx + i];
    const m = concat.match(/^(\s*)import\s*\{([\s\S]*?)\}\s*from\s*['"]([^'"]+)['"]\s*;?\s*(?:\/\/.*)?$/m);
    if (m) { parsed = { indent: m[1], body: m[2], source: m[3], lineCount: i + 1 }; break; }
  }
  if (!parsed) {
    results.push({ file: x.filePath, line: x.line, status: 'NOPARSE', sample: importLineCandidate.slice(0, 120) });
    continue;
  }
  const namesRawRaw = parsed.body;
  const srcRel = parsed.source;
  const namesRaw = namesRawRaw.split(',').map(s => s.trim()).filter(Boolean);
  const names = namesRaw.map(s => ({ orig: s.split(/\s+as\s+/)[0].replace(/^type\s+/, '').trim(), raw: s }));
  const targets = (x.message.match(/"([^"]+)"/g) || []).map(s => s.slice(1, -1)).filter(s => s.startsWith('.'));
  const targetExports = targets.map(t => ({ rel: t, abs: fileAt(t, fileDir), exports: exportsOf(fileAt(t, fileDir)) }));
  const mapping = [];
  let fileAmbiguous = false;
  for (const name of names) {
    totalNames++;
    if (!name.orig) continue;
    const cand = targetExports.filter(t => t.exports.has(name.orig));
    if (cand.length === 1) {
      mapping.push(name.orig + ' -> ' + cand[0].rel);
      okCount++;
    } else if (cand.length === 0) {
      // Try fallback: also check the BARREL SOURCE file's actual file basename for direct fileAt match
      // i.e., maybe the right path is `src/whatever/<Name>.ts` even though not in the targets list
      const guessAbsRel = name.orig;
      let fallback = null;
      for (const candDir of ['.', './']) {
        const directAbs = path.normalize(path.join(fileDir, candDir + guessAbsRel));
        const found = fileAt(directAbs, fileDir); // not used; we'll check by direct read
        if (found) {
          if (exportsOf(found).has(name.orig)) { fallback = path.relative(fileDir, found); break; }
        }
      }
      if (fallback) {
        mapping.push(name.orig + ' -> ' + fallback + ' (guess-from-same-dir)');
        okCount++;
      } else {
        mapping.push(name.orig + ' -> NOT-EXPORTED-BY-ANY-TARGET');
        missingCount++;
        fileAmbiguous = true;
      }
    } else {
      mapping.push(name.orig + ' -> AMBIG(' + cand.map(c => c.rel).join('|') + ')');
      ambiguousCount++;
      fileAmbiguous = true;
    }
  }
  results.push({
    file: x.filePath, line: x.line, status: fileAmbiguous ? 'AMBIG' : 'OK',
    srcWas: srcRel,
    targets: targets.map(t => t).join(', '),
    mapping: mapping.join('; '),
    lineCount: parsed.lineCount,
  });
}

for (const r of results) {
  console.log('==========');
  for (const k of Object.keys(r)) console.log('  ' + k + ':', r[k]);
}
console.log('\n========================================');
console.log('TOTAL imported names checked:', totalNames);
console.log('OK  (exactly 1 target exports the name):', okCount);
console.log('MISSING (no target exports the name)  :', missingCount);
console.log('AMBIG (multiple targets export name)  :', ambiguousCount);
console.log('Files with at least one safe match would be: ', results.filter(r => r.status === 'OK').length, ' of ', results.length);
