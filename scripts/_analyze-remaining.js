#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'doctor-new.json'), 'utf8'));
const items = d.projects[0].diagnostics.filter(x => x.rule === 'no-barrel-import');

function readImports(relFile, line) {
  const lines = fs.readFileSync(path.join(ROOT, relFile), 'utf8').split('\n');
  let concat = '';
  for (let i = 0; i < 8 && line - 1 + i < lines.length; i++) {
    concat += (concat ? '\n' : '') + lines[line - 1 + i];
    const m = concat.match(/^\s*import\s*\{([\s\S]*?)\}\s*from\s*['"]([^'"]+)['"];?/);
    if (m) return { names: m[1].split(',').map(s => s.trim()), src: m[2] };
  }
  return null;
}
function classify(absPath) {
  if (!absPath || !fs.existsSync(absPath)) return 'MISSING';
  const c = fs.readFileSync(absPath, 'utf8');
  // any non-re-export export (named const/let/var/function/class/interface/type/default)
  const direct = [...c.matchAll(/export\s+(?:declare\s+)?(?:const|let|var|function\s*\*?|class|enum|interface|type)\s+\w+/g)];
  const hasDefault = /export\s+default\s/.test(c);
  const reExports = [...c.matchAll(/export\s*(?:\*|\{[^}]*\})\s*from\b/g)];
  if (direct.length === 0 && !hasDefault && reExports.length > 0) return 'BARREL_REEXPORTER';
  if (reExports.length === 0 && (direct.length > 0 || hasDefault)) return 'LEAF';
  return 'MIXED';
}
function exportsOf(absPath) {
  const set = new Set();
  if (!absPath) return set;
  let content;
  try { content = fs.readFileSync(absPath, 'utf8'); } catch { return set; }
  for (const m of content.matchAll(/export\s+(?:declare\s+)?(?:const|let|var|function\*?|class|enum|async\s+function)\s+(\w+)/g)) set.add(m[1]);
  for (const m of content.matchAll(/export\s+(?:declare\s+)?(?:type|interface)\s+(\w+)/g)) set.add(m[1]);
  for (const m of content.matchAll(/export\s*\{\s*([^}]+?)\s*\}/g)) {
    for (let p of m[1].split(',')) {
      p = p.trim();
      if (!p) continue;
      const re = p.match(/^(?:type\s+)?(\w+)(?:\s+as\s+(\w+))?$/);
      if (re) { set.add(re[1]); if (re[2]) set.add(re[2]); }
    }
  }
  for (const _ of content.matchAll(/export\s+default\s+\w+/g)) set.add('default');
  for (const _ of content.matchAll(/export\s*\*\s*from\b/g)) set.add('*');
  return set;
}

const buckets = { BARREL: [], LEAF: [], MISSING: [], MIXED: [] };

items.forEach((x, idx) => {
  const imp = readImports(x.filePath, x.line);
  if (!imp) { console.log((idx + 1) + '. NO_PARSE  ' + x.filePath + ':' + x.line); return; }
  const targets = (x.message.match(/"([^"]+)"|'([^']+)'|`([^`]+)`/g) || [])
    .map(s => s.slice(1, -1)).filter(s => s.startsWith('.'));
  const fileDir = path.dirname(path.join(ROOT, x.filePath));

  console.log('========== ' + (idx + 1) + '. ==========');
  console.log('  file:', x.filePath + ':' + x.line);
  console.log('  imports:', imp.names.join(', '));
  console.log('  src:', imp.src);
  console.log('  targets from diag message:', targets);
  for (const t of targets) {
    let absFound = null;
    for (const ext of ['', '.ts', '.tsx']) {
      const abs = path.normalize(path.join(fileDir, t)) + ext;
      try { fs.accessSync(abs); absFound = abs; break; } catch {}
    }
    if (!absFound) {
      console.log('    ' + t + '  MISSING');
      buckets.MISSING.push(x.filePath + ':' + x.line);
      continue;
    }
    const cls = classify(absFound);
    const exp = exportsOf(absFound);
    console.log('    ' + t + '  -> ' + path.relative(ROOT, absFound) + '  CLASS=' + cls + '  EXP=' + JSON.stringify([...exp]));
    const target = { rel: t, absPath: absFound, cls, exps: exp };
    if (cls === 'BARREL_REEXPORTER' || cls === 'MIXED') buckets.BARREL.push({ ...x, target });
    else buckets.LEAF.push({ ...x, target });
  }
});

console.log('\n\n=== SUMMARY ===');
console.log('LEAF cases (target IS the importer):', buckets.LEAF.length);
console.log('BARREL/MIXED cases (target is itself a re-exporter, cascade needed):', buckets.BARREL.length);
console.log('MISSING cases:', buckets.MISSING.length);

console.log('\n=== BARREL/MIXED TARGETS (cascade candidates) ===');
buckets.BARREL.forEach(b => console.log('  ', b.filePath + ':' + b.line, '->', b.target.rel));
console.log('\n=== REASONING ===');
console.log('If ALL remaining cases are LEAF (terminal), the issue is that react-doctor STILL flags the file because it sees the original CONTAINER being referenced by similar patterns. Need to inspect why.');
console.log('If BARREL count > 0, those need fix-v8 to drill down to actual leaf through re-exporters.');
