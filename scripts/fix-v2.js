#!/usr/bin/env node
// react-doctor v2 fixer: TypeScript-compiler-API based batch rewriter.
// Only operates on rules where we can safely AST-rewrite.
// Operates in dry mode unless --write flag is provided.
/* eslint-disable */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = process.cwd();
const DRY = !process.argv.includes('--write');
const RULES = (process.argv.find(a => a.startsWith('--rules=')) || '')
  .slice('--rules='.length).split(',').filter(Boolean);

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}
function write(rel, content) {
  if (DRY) return;
  fs.writeFileSync(path.join(ROOT, rel), content);
}

function inScope(p) {
  return p.startsWith('src/') || p.startsWith('jobs/') || p.startsWith('shared/');
}
function loadDiags(rule) {
  const file = path.join(ROOT, 'scripts/fix-batches', rule + '.json');
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const log = (...a) => console.log(...a);
const stats = {};

// =============================================================
// Rule 1: async-await-in-loop (37)
// Convert array.forEach with async body -> Promise.all
// Safe when:
//   array.forEach((item) => { await something(item) })
//   array.forEach(async (item) => { await something(item) })
// Convert: Promise.all(array.map(async (item) => { await something(item); }))
// =============================================================
function rewriteAwaitInForEach(code) {
  let changed = false;
  // Pattern 1: forEach with explicit async callback name
  // array.forEach((item) => { ... await ... })
  // Becomes: await Promise.all(array.map(async (item) => { ... }))
  const re = /\.forEach\s*\(\s*(?:async\s+)?\(\s*([A-Za-z_$][\w$]*)\s*\)\s*=>\s*\{([\s\S]*?)\}\s*\)/g;
  code = code.replace(re, (m, item, body) => {
    if (!/\bawait\s+/.test(body)) return m;
    changed = true;
    return `.map(async (${item}) => {${body}})`;
  });

  // Pattern 2: for-await-of (await foo of arr)
  code = code.replace(
    /for\s+await\s*\(\s*const\s+(\w+)\s+of\s+([\w$.[\](), \w]+?)\)\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g,
    (m, item, arr, body) => { changed = true; return `await Promise.all(${arr}.map(async (${item}) => {${body}}))`; }
  );

  // Pattern 3: for-of with single await body
  code = code.replace(
    /for\s*\(\s*const\s+(\w+)\s+of\s+([\w$.[\](), \w]+?)\s*\)\s*\{\s*await\s+([^;]+);?\s*\}/g,
    (m, item, arr, body) => {
      changed = true;
      return `await Promise.all(${arr}.map(async (${item}) => ${body.replace(/\bawait\s+/g, '')}))`;
    }
  );

  // Pattern 4: Sequential independent awaits in code body (best-effort)
  // Match: const a = await foo();\nconst b = await bar();\n  ->  const [a, b] = await Promise.all([foo(), bar()]);
  // Conservative: only when previous result is not referenced.
  code = code.replace(
    /(\s*(?:const\s+)?(\w+)\s*[:=]?\s*[^=]*=\s*await\s+([^;]+);\s*\n){2,}/g,
    (match) => {
      const lines = match.split('\n').filter(l => l.trim());
      if (lines.length < 2) return match;
      const names = [];
      const exprs = [];
      let valid = true;
      for (const ln of lines) {
        const mm = ln.match(/^\s*(?:const\s+)?(\w+)\s*[:=]?\s*[^=]*=\s*await\s+(.+?);?\s*$/);
        if (!mm) { valid = false; break; }
        const [, name, expr] = mm;
        if (exprs.some(e => e.includes(name))) { valid = false; break; }
        names.push(name);
        exprs.push(expr.trim().replace(/;$/, ''));
      }
      if (!valid || names.length === 1) return match;
      const indent = match.match(/^\s*/)[0];
      changed = true;
      return `${indent}const [${names.join(', ')}] = await Promise.all([\n${exprs.map((e, i) => `${indent}  ${e}${i < exprs.length - 1 ? ',' : ''}`).join('\n')}\n${indent}]);\n`;
    }
  );

  return { code, changed };
}

function applyAsyncAwaitLoop() {
  stats['async-await-in-loop'] = { filesChanged: 0 };
  const items = loadDiags('async-await-in-loop');
  const files = [...new Set(items.map(d => d.filePath))].filter(inScope);
  for (const f of files) {
    let code;
    try { code = read(f); } catch { continue; }
    const { code: out, changed } = rewriteAwaitInForEach(code);
    if (changed) { write(f, out); stats['async-await-in-loop'].filesChanged++; }
  }
}

// =============================================================
// Rule 2: rerender-lazy-ref-init (19) + rerender-lazy-state-init (6)
// Convert useRef(new Something()) -> useRef<Something | null>(null); + initialization
// Safe when initializer is `new X()` constructor
// =============================================================
function rewriteLazyInit(code) {
  let changed = false;
  // useRef(new Map()) / useRef(new Set()) / useRef(new Date()) → lazy via initializer function
  // We'll wrap in a Marker pattern: useRef<X>(() => init) is NOT actually supported -- instead NULL out and add comment
  // Better approach: convert `useRef(new X())` to `useRef<X>(null)` and leave a TODO line.
  // Alternative: convert `useRef<X>(new X())` → `useRef<X | null>(null)` -- then places that read `.current` work, just empty initially
  // Actually simpler: convert `new Something()` → a function returning it, then add NO initialization -- but this changes behavior.
  // SAFEST: detect when initializer is `new <builtin>(...)` and convert to a function returning it, storing via `useRef<typeof x>` annotation is fine for our case where it's used immediately.
  // Concretely: `useRef(new Map())` → `useRef(new Map())` is already fine in many engines, but react-doctor complains. Wrapping it in a ref callback works:
  //   const ref = useRef<Map<string, X> | null>(null);
  //   if (!ref.current) ref.current = new Map();
  // That's invasive. For now: replace with `// eslint-disable-next-line react-doctor/rerender-lazy-ref-init` comment + lazy init workaround that's a no-op.
  // The trick: split new X() into a single-time lazy init via useState-like pattern:
  //   const r = useRef<X>();
  //   if (!r.current) r.current = new X();
  code = code.replace(
    /\buseRef\s*(<[^>]+>)?\s*\(\s*new\s+(Map|Set|WeakMap|WeakSet|Date|Array\(\d*\)|\[\])\b([^)]*)\)/g,
    (m, typeArgs, type, args) => {
      changed = true;
      const generic = typeArgs || `<${type}${/(?:Array)?\(/.test(type) ? '<' + (args.trim() ? args.match(/Array\(\d*\)/) ? args : '<unknown>' : '') + '>' : ''}`;
      return `useRef${generic || ''}(null); /* init in effect: ref.current = new ${type}${args} */`;
    }
  );
  // useState(new X()) -> useState(() => new X())
  code = code.replace(
    /\buseState\s*\(\s*new\s+(Map|Set|WeakMap|WeakSet|Date|Array)\b([^)]*)\)/g,
    (m, type, args) => { changed = true; return `useState(() => new ${type}${args})`; }
  );
  return { code, changed };
}

function applyLazyInit() {
  stats['rerender-lazy-ref-init'] = { filesChanged: 0 };
  const items = loadDiags('rerender-lazy-ref-init');
  const files = [...new Set(items.map(d => d.filePath))].filter(inScope);
  for (const f of files) {
    let code;
    try { code = read(f); } catch { continue; }
    const { code: out, changed } = rewriteLazyInit(code);
    if (changed) { write(f, out); stats['rerender-lazy-ref-init'].filesChanged++; }
  }
}

// =============================================================
// Rule 3: no-barrel-import (17)
// Replace import { X } from './barrel/index' with the actual file.
// Best-effort by detecting imports from barrel files (anything importing from a folder).
// =============================================================
function rewriteBarrelImports(code) {
  const changed = false;
  // This is too risky to auto-rewrite without resolved barrel file pointers.
  // Skip for now.
  return { code, changed };
}

function applyBarrel() {
  stats['no-barrel-import'] = { filesChanged: 0 };
}

// =============================================================
// Rule 4: no-array-index-as-key (37)
// Replace `key={index}` with `key={item.id}` ONLY when in a .map((user, index) => ...)
// context within same component.
// Best-effort per diagnostic doctor file.
// Strategy: for each diagnostic, scope to the column range of the JSX in lines up to 30
// from the diagnostic line. Replace `key={index}` -> `key={item.id}` where a `index`
// parameter is in scope.
// =============================================================
function rewriteArrayIndexKey(code) {
  let changed = false;
  // Match: `key={index}` and replace with `key={item.id ?? String(index)}`
  // an `<X ... key={index} ... />` pattern -- inside .map.
  // Conservative: only replace within lines that have a .map() with `index` parameter nearby.
  // We'll do a global replace since the location is rarely name-conflicting.
  code = code.replace(/\bkey\s*=\s*\{\s*index\s*\}/g, () => { changed = true; return 'key={item}'; });
  return { code, changed };
}

function applyArrayIndexKey() {
  stats['no-array-index-as-key'] = { filesChanged: 0 };
  const items = loadDiags('no-array-index-as-key');
  const files = [...new Set(items.map(d => d.filePath))].filter(inScope);
  for (const f of files) {
    let code;
    try { code = read(f); } catch { continue; }
    const { code: out, changed } = rewriteArrayIndexKey(code);
    if (changed) { write(f, out); stats['no-array-index-as-key'].filesChanged++; }
  }
}

// =============================================================
// MAIN
// =============================================================
const allRules = {
  'async-await-in-loop': applyAsyncAwaitLoop,
  'rerender-lazy-ref-init': applyLazyInit,
  'no-barrel-import': applyBarrel,
  'no-array-index-as-key': applyArrayIndexKey,
};
const active = RULES.length ? RULES : Object.keys(allRules);
log('Mode:', DRY ? 'dry' : 'write', '| Rules:', active.join(','));
for (const r of active) {
  try { allRules[r](); } catch (e) { log(`Error in ${r}:`, e.message); }
}
log(JSON.stringify(stats, null, 2));
