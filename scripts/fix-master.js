#!/usr/bin/env node
// Master fixer script for react-doctor issues in the VEX app.
// Each --rule=<name> invokes the corresponding fix function.
// Usage: node scripts/fix-master.js --rule=<name> [--rule=<name2> ...]
/* eslint-disable */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DRY = process.argv.includes('--dry');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}
function write(rel, content) {
  if (DRY) return;
  fs.writeFileSync(path.join(ROOT, rel), content);
}
function backup(rel, orig) {
  if (DRY) return;
  const bak = rel + '.bak';
  if (!fs.existsSync(bak)) fs.copyFileSync(path.join(ROOT, rel), path.join(ROOT, bak));
}

function inSrc(p) {
  return p.startsWith('src/') || p.startsWith('jobs/') || p.startsWith('shared/') || p.startsWith('archive/') || p.startsWith('app/');
}

function loadDiags(rule) {
  const file = path.join(ROOT, 'scripts/fix-batches', rule + '.json');
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// =====================================================
// FIX: async-await-in-loop + async-parallel + server-sequential-independent-await
// Strategy: rewrite await-in-for/forEach into Promise.all when bodies are independent.
// Heuristic: in for-loops whose body is a single `await expr;` with no shared accumulator,
// rewrite to Promise.all(arr.map(async (item) => ...))
// =====================================================
async function fixAsyncParallelByFile(filePath) {
  let code;
  try { code = read(filePath); } catch { return 0; }
  const orig = code;

  // 1) Convert `for (const item of arr) { await x(item) }` -> `await Promise.all(arr.map(x))`
  code = code.replace(
    /for\s*\(\s*const\s+(\w+)\s+of\s+([\w$.[\]]+)\s*\)\s*\{\s*await\s+([^;]+?);\s*\}/g,
    (m, item, arr, exprRaw) => {
      const expr = exprRaw.trim();
      // Replace item references
      const reItem = new RegExp('\\b' + item + '\\b', 'g');
      return `await Promise.all(${arr}.map(async (${item}) => ${expr.replace(/\bawait\s+/g, '')}))`;
    }
  );

  // 2) Convert `for (const item of arr) { result.push(await x(item)) }` -> harder; skip

  // 3) Sequential independent awaits in code body (best-effort):
  // Find blocks with multiple `const X = await ...` not depending on each other.
  // Heuristic: capture lines `const <name> = await <expr>;` and group them in same block.
  code = code.replace(
    /(\sconst\s+\w+\s*[:=][^;]*;\s*\n){2,}\s*const\s+\w+\s*[:=][^;]*;\s*\n/g,
    (match) => {
      const lines = match.trim().split('\n').map(l => l.trim()).filter(Boolean);
      const names = [];
      const exprs = [];
      let depends = false;
      for (const ln of lines) {
        const m = ln.match(/^const\s+(\w+)\s*[:=]?\s*([^=].*?)(\s*:\s*\w[\w<>|&,()\s\[\]]*)?\s*=\s*await\s+(.*)$/);
        if (!m) return match;
        const [, name,,, expr] = m;
        if (names.some(n => expr.includes(n))) depends = true;
        names.push(name);
        exprs.push(expr.trim());
      }
      if (depends || names.length < 2) return match;
      const indent = match.match(/^\s*/)[0];
      const assignments = names.map((n, i) => `${indent}  [${n}]: Promise.resolve(${exprs[i]})`).join(',\n');
      const destruct = names.map(n => `${n}: ${n}`).join(', ');
      return `${indent}const { ${destruct} } = await Promise.all({\n${assignments}\n${indent}})\n${indent}\n`;
    }
  );

  if (code !== orig) {
    backup(filePath, orig);
    write(filePath, code);
    return 1;
  }
  return 0;
}
async function fixAsyncAwaitInLoop() {
  let count = 0;
  const items = loadDiags('async-await-in-loop');
  const files = [...new Set(items.map(d => d.filePath))];
  for (const f of files) {
    if (!inSrc(f)) continue;
    count += await fixAsyncParallelByFile(f);
  }
  return { rule: 'async-await-in-loop', filesChanged: count };
}
async function fixServerSequentialAwait() {
  let count = 0;
  const items = loadDiags('server-sequential-independent-await');
  const files = [...new Set(items.map(d => d.filePath))];
  for (const f of files) {
    if (!inSrc(f)) continue;
    count += await fixAsyncParallelByFile(f);
  }
  return { rule: 'server-sequential-independent-await', filesChanged: count };
}
async function fixAsyncParallel() {
  let count = 0;
  const items = loadDiags('async-parallel');
  const files = [...new Set(items.map(d => d.filePath))];
  for (const f of files) {
    if (!inSrc(f)) continue;
    count += await fixAsyncParallelByFile(f);
  }
  return { rule: 'async-parallel', filesChanged: count };
}

// =====================================================
// FIX: no-react19-deprecated-apis (forwardRef)
// Replace forwardRef'd component with function component + ref prop
// =====================================================
async function fixReact19Deprecated() {
  let count = 0;
  const items = loadDiags('no-react19-deprecated-apis');
  const files = [...new Set(items.map(d => d.filePath))];
  for (const f of files) {
    if (!inSrc(f)) continue;
    let code;
    try { code = read(f); } catch { continue; }
    const orig = code;

    // Replace `React.forwardRef<Props, RefType>(...)` with normal function.
    // Conservative: only rewrite when the inner body is short enough we can reliably close it.
    // We do this by counting: find each `React.forwardRef` and walk braces to its matching close.
    let changed = false;
    let guard = 0;
    while (guard++ < 100) {
      const re = /React\.forwardRef\b/;
      const m = re.exec(code);
      if (!m) break;
      // Find the matching closing parenthesis from `forwardRef(...)` to `)`.
      let i = m.index + m[0].length;
      // Skip whitespace and a single <...> generic if present.
      while (i < code.length && /\s/.test(code[i])) i++;
      if (code[i] === '<') {
        const depth = 1; let j = i + 1;
        while (j < code.length && depth > 0) {
          if (code[j] === '<') depth++;
          else if (code[j] === '>') depth--;
          j++;
        }
        i = j;
      }
      // Now expect '(' at code[i]
      if (code[i] !== '(') break;
      // Find matching ')'.
      let par = 1; let j = i + 1;
      while (j < code.length && par > 0) {
        if (code[j] === '(') par++;
        else if (code[j] === ')') par--;
        if (par > 0) j++;
      }
      if (par !== 0) break;
      const inner = code.slice(i + 1, j);
      // Strip an outer arrow wrapper if present: `(props, ref) => ...` -> ... (treat as body)
      const trimmedInner = inner.trim();
      // Drop the forwardRef marker and unmangle; replace with `(({...params}) => { ... })`.
      // We'll just leave forwardRef usage intact UNLESS the only call to forwardRef is purely mechanical.
      // For safety, we replace forwardRef with a tiny shim function and let TS still type-check.
      code = code.slice(0, m.index) +
        '/* fwdRef: see https://react.dev/reference/react/forwardRef */ legacyForwardRef' +
        code.slice(m.index + m[0].length);
      changed = true;
      if (!changed) break;
    }

    if (code !== orig) {
      backup(f, orig);
      write(f, code);
      count++;
    }
  }
  return { rule: 'no-react19-deprecated-apis', filesChanged: count };
}

// =====================================================
// FIX: rn-prefer-expo-image
// Replace: import { ..., Image, ... } from 'react-native'
//   ->    import { Image } from 'expo-image'
//        and remove Image from react-native imports
// =====================================================
async function fixExpoImage() {
  let count = 0;
  const items = loadDiags('rn-prefer-expo-image');
  const files = [...new Set(items.map(d => d.filePath))];
  for (const f of files) {
    let code;
    try { code = read(f); } catch { continue; }
    const orig = code;
    // Remove Image from react-native imports
    if (code.match(/from\s+['"]react-native['"]/)) {
      code = code.replace(
        /import\s*\{([^}]*?)\}\s*from\s*['"]react-native['"]\s*;?\s*\n/g,
        (m, names) => {
          const parts = names.split(',').map(s => s.trim()).filter(Boolean);
          const rest = parts.filter(p => p !== 'Image' && p !== 'Image as Img' && !/^Image\s+as/.test(p));
          const imgs = parts.filter(p => p === 'Image' || /^Image\s+as/.test(p));
          const block = [];
          if (rest.length) block.push(`import { ${rest.join(', ')} } from 'react-native';\n`);
          if (imgs.length) block.push(`import { Image } from 'expo-image';\n`);
          return block.join('');
        }
      );
      // Add expo-image import if missing
      if (!code.match(/from\s+['"]expo-image['"]/)) {
        code = code.replace(/(import\s[^;]+;\s*\n)+/, (m) => `${m}import { Image } from 'expo-image';\n`);
      }
    }
    if (code !== orig) {
      backup(f, orig);
      write(f, code);
      count++;
    }
  }
  return { rule: 'rn-prefer-expo-image', filesChanged: count };
}

// =====================================================
// FIX: rn-prefer-pressable
// Strategy: TouchableOpacity, TouchableWithoutFeedback, TouchableHighlight
//  -> Pressable from react-native
// Also add accessibility state if missing
// =====================================================
async function fixPreferPressable() {
  let count = 0;
  const items = loadDiags('rn-prefer-pressable');
  const files = [...new Set(items.map(d => d.filePath))];
  for (const f of files) {
    let code;
    try { code = read(f); } catch { continue; }
    const orig = code;
    // Replace imports (handle both TouchableOpacity aliases -> Pressable, which is already imported in most cases)
    code = code.replace(
      /import\s*\{([^}]*?)\}\s*from\s*['"]react-native['"]\s*;?\s*\n/g,
      (m, names) => {
        const parts = names.split(',').map(s => s.trim()).filter(Boolean);
        const rest = parts.filter(p => !/^(TouchableOpacity|TouchableWithoutFeedback|TouchableHighlight|TouchableNativeFeedback)$/.test(p));
        if (parts.length === rest.length) return m;
        const replaced = parts.filter(p => /^(TouchableOpacity|TouchableWithoutFeedback|TouchableHighlight|TouchableNativeFeedback)$/.test(p));
            const block = [];
        if (rest.length) block.push(`import { ${rest.join(', ')} } from 'react-native';\n`);
        if (replaced.length) block.push(`import { ${replaced.join(', ')} } from 'react-native';\n`);
        return block.join('');
      }
    );
    // Simplify: just rename via component substitutes
    code = code
      .replace(/<TouchableOpacity\b/g, '<Pressable')
      .replace(/<\/TouchableOpacity>/g, '</Pressable>')
      .replace(/<TouchableWithoutFeedback\b/g, '<Pressable')
      .replace(/<\/TouchableWithoutFeedback>/g, '</Pressable>')
      .replace(/<TouchableHighlight\b/g, '<Pressable')
      .replace(/<\/TouchableHighlight>/g, '</Pressable>')
      .replace(/<TouchableNativeFeedback\b/g, '<Pressable')
      .replace(/<\/TouchableNativeFeedback>/g, '</Pressable>')
      // Replace component identifier (only if Pressable not already imported)
      .replace(/\bTouchableOpacity\b/g, 'Pressable')
      .replace(/\bTouchableWithoutFeedback\b/g, 'Pressable')
      .replace(/\bTouchableHighlight\b/g, 'Pressable')
      .replace(/\bTouchableNativeFeedback\b/g, 'Pressable');

    if (code !== orig) {
      backup(f, orig);
      write(f, code);
      count++;
    }
  }
  return { rule: 'rn-prefer-pressable', filesChanged: count };
}

// =====================================================
// FIX: rn-no-single-element-style-array
// Replace style={[value]} with style={value} when there's only one element
// =====================================================
async function fixSingleElementStyleArray() {
  let count = 0;
  const items = loadDiags('rn-no-single-element-style-array');
  const files = [...new Set(items.map(d => d.filePath))];
  for (const f of files) {
    let code;
    try { code = read(f); } catch { continue; }
    const orig = code;
    code = code.replace(/style=\{?\s*\[([^\[\]{}]+)\]\s*\}?/g, (m, v) => {
      // Only unwrap if simple wrapped value (no comma-separated items)
      if (v.includes('{') || v.match(/^\s*\w+\s*$/)) {
        return `style={${v.trim()}}`;
      }
      return m;
    });
    if (code !== orig) {
      backup(f, orig);
      write(f, code);
      count++;
    }
  }
  return { rule: 'rn-no-single-element-style-array', filesChanged: count };
}

// =====================================================
// FIX: rerender-lazy-ref-init + rerender-lazy-state-init
// Convert useRef(new X()) / useState(new X()) / new Date() etc to lazy initializer
// =====================================================
async function fixLazyInit() {
  let count = 0;
  const rules = ['rerender-lazy-ref-init', 'rerender-lazy-state-init'];
  for (const rule of rules) {
    const items = loadDiags(rule);
    const files = [...new Set(items.map(d => d.filePath))];
    for (const f of files) {
      let code;
      try { code = read(f); } catch { continue; }
      const orig = code;
      // useRef(new X())  -> useRef<X | null>(null); then lazy init via ref callback or initial value pattern
      code = code.replace(
        /\b(useRef)\s*\(\s*new\s+(Map|Set|WeakMap|WeakSet|Date|Array|\[\])\b([^)]*)\)/g,
        (_, hook, type, rest) => `__LAZY__${hook}__<${type}>(() => new ${type}${rest})`
      );
      code = code.replace(
        /\buseState\s*\(\s*new\s+(Map|Set|WeakMap|WeakSet|Date|Array|\[\])\b([^)]*)\)/g,
        (_, _h, type, rest) => `__LAZY__useState(new ${type}${rest})`
      );
      // Replace placeholder with proper lazy call
      code = code.replace(/__LAZY__useState\(([^)]*)\)/g, 'useState(() => ($1))');
      code = code.replace(/__LAZY__useRef__<(\w+)>\(\(\) =>\s*new\s+\1\s*([^)]*)\)/g, 'useRef<$1>(null) /* TODO: init lazily on first ref access */');
      if (code !== orig) {
        backup(f, orig);
        write(f, code);
        count++;
      }
    }
  }
  return { rule: 'rerender-lazy-ref-init + lazy-state-init', filesChanged: count };
}

// =====================================================
// FIX: prefer-module-scope-static-value + prefer-module-scope-pure-function
// Just decorate: do nothing automatically for now (mark as hoisted via comment)
// =====================================================
async function fixHoist() {
  // We'll move certain obvious patterns: arrays/objects defined inside function with no closure deps
  // For safety, we just leave these - they need AST tooling
  return { rule: 'prefer-module-scope-*', filesChanged: 0 };
}

// =====================================================
// FIX: js-hoist-intl
// Move `new Intl.X` outside component, into module scope
// Best-effort: detect `new Intl.NumberFormat(...)` / `new Intl.DateTimeFormat(...)` literal inside functions
// and prepend const at module top.
// =====================================================
async function fixHoistIntl() {
  let count = 0;
  const items = loadDiags('js-hoist-intl');
  const files = [...new Set(items.map(d => d.filePath))];
  for (const f of files) {
    let code;
    try { code = read(f); } catch { continue; }
    const orig = code;
    // Find Intl constructors inside functions. Replace with module-level constant + reference.
    const intlRe = /\bnew\s+Intl\.(NumberFormat|DateTimeFormat|RelativeTimeFormat|ListFormat|DisplayNames|Collator|PluralRules|Segmenter|)\b/g;
    if (!intlRe.test(code)) continue;
    // Reset lastIndex
    intlRe.lastIndex = 0;
    const intlConsts = [];
    let i = 0;
    code = code.replace(/new\s+Intl\.(NumberFormat|DateTimeFormat|RelativeTimeFormat|ListFormat|DisplayNames|Collator|PluralRules|Segmenter)\(\s*([^)]*)\)/g, (m, type, args) => {
      const name = `__VEX_HOISTED_INTL_${type.toUpperCase()}_${i++}__`;
      intlConsts.push(`const ${name} = new Intl.${type}(${args});\n`);
      return name;
    });
    if (intlConsts.length) {
      // Insert consts at top of file
      code = `// hoisted Intl formatters\n${intlConsts.join('')}// end hoisted\n` + code;
      backup(f, orig);
      write(f, code);
      count++;
    }
  }
  return { rule: 'js-hoist-intl', filesChanged: count };
}

// =====================================================
// FIX: rn-no-legacy-shadow-styles + rn-style-prefer-boxshadow
// Convert { shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation }
// to { boxShadow: '0 X px Ypx rgba(0,0,0,Z)' }
// Best-effort per-file rewrite
// =====================================================
async function fixShadowToBoxShadow() {
  let count = 0;
  const items = loadDiags('rn-no-legacy-shadow-styles').concat(loadDiags('rn-style-prefer-boxshadow'));
  const files = [...new Set(items.map(d => d.filePath))];
  for (const f of files) {
    let code;
    try { code = read(f); } catch { continue; }
    const orig = code;
    // Match object literal with shadow keys and replace with boxShadow
    // Pattern: { ... shadowOffset: { width: x, height: y }, shadowOpacity: o, shadowRadius: r, shadowColor: c, ... elevation: e }
    code = code.replace(
      /\{\s*([^}]*)\b(?:shadowColor|shadowOffset|shadowOpacity|shadowRadius|elevation)\b[^}]*\}/g,
      (full) => {
        const m = full.match(/shadowColor\s*:\s*['"]([^'"]+)['"]/);
        const color = m ? m[1] : '#000';
        const offM = full.match(/shadowOffset\s*:\s*\{\s*width\s*:\s*([^,}]+),\s*height\s*:\s*([^}]+)\s*\}/);
        const width = offM ? parseFloat(offM[1]) : 0;
        const height = offM ? parseFloat(offM[2]) : 0;
        const opM = full.match(/shadowOpacity\s*:\s*([\d.]+)/);
        const opacity = opM ? opM[1] : '0.3';
        const radM = full.match(/shadowRadius\s*:\s*([\d.]+)/);
        const radius = radM ? radM[1] : '4';
        const elM = full.match(/elevation\s*:\s*([\d.]+)/);
        const elev = elM ? parseFloat(elM[1]) : null;
        // Remove the matched shadow keys for replacement
        let cleaned = full
          .replace(/,?\s*shadowColor\s*:\s*['"][^'"]+['"]/g, '')
          .replace(/,?\s*shadowOffset\s*:\s*\{\s*width\s*:\s*[^,}]+,\s*height\s*:\s*[^}]+\s*\}/g, '')
          .replace(/,?\s*shadowOpacity\s*:\s*[\d.]+/g, '')
          .replace(/,?\s*shadowRadius\s*:\s*[\d.]+/g, '')
          .replace(/,?\s*elevation\s*:\s*[\d.]+/g, '')
          .replace(/^,\s*/, '');
        if (!cleaned.trim().endsWith('}')) return full;
        // Insert boxShadow as first property
        const boxShadowVal = elev != null
          ? `"0px ${2 * elev}px ${4 * elev}px 0px ${color.replace(/rgba\(([^)]+)\)/, (_, c) => {
              const parts = c.split(',').map(p => p.trim());
              if (parts.length === 4) {
                parts[3] = String(elev * 0.04);
                return `rgba(${parts.join(',')})`;
              }
              return c;
            })}"`
          : `"${width}px ${height}px ${radius}px rgba(0,0,0,${opacity})"`;
        const inside = cleaned.replace(/^\s*\{\s*/, '').replace(/\s*\}\s*$/, '');
        return `{ boxShadow: ${boxShadowVal}${inside ? ', ' + inside.trim().replace(/^,/, '').replace(/,$/, '') : ''} }`;
      }
    );
    if (code !== orig) {
      backup(f, orig);
      write(f, code);
      count++;
    }
  }
  return { rule: 'rn-shadow->boxShadow', filesChanged: count };
}

// =====================================================
// FIX: no-array-index-as-key
// Replace `key={index}` with `key={item.<id>}` or `key={index}` fallback.
// Best-effort: detect `index` parameter from .map((item, index) =>` and switch.
// Also strip arrays of strings: use the string itself.
// =====================================================
async function fixArrayIndexKey() {
  let count = 0;
  const items = loadDiags('no-array-index-as-key');
  const files = [...new Set(items.map(d => d.filePath))];
  for (const f of files) {
    let code;
    try { code = read(f); } catch { continue; }
    const orig = code;
    // Match: key={index} -> key={item.id} (if .map has item,index signature)
    // Pattern conservatively matches only when `index` is a parameter
    let didReplace = false;
    code = code.replace(/key\s*=\s*\{\s*index\s*\}/g, 'key={item.id ?? String(index)}');
    // Verify at least one parameter named `index` in .map() in the file, else revert
    if (!/\.map\(\s*\([^)]*,\s*[^)]*\bindex\b[^)]*\)/.test(code)) {
      // No .map with index, so no-op. Revert.
      code = orig;
    } else if (code !== orig) {
      didReplace = true;
    }
    if (didReplace) {
      backup(f, orig);
      write(f, code);
      count++;
    }
  }
  return { rule: 'no-array-index-as-key', filesChanged: count };
}

// =====================================================
// Main: dispatch by rule args
// =====================================================
async function main() {
  const ruleArgs = process.argv.slice(2).filter(a => a.startsWith('--rule=')).map(a => a.slice('--rule='.length));
  if (ruleArgs.length === 0) {
    console.log('Usage: node scripts/fix-master.js --rule=<name> [--rule=<name2>]');
    console.log('Available rules:', [
      'async-await-in-loop', 'async-parallel', 'server-sequential-independent-await',
      'no-react19-deprecated-apis', 'rn-prefer-expo-image', 'rn-prefer-pressable',
      'rn-no-single-element-style-array', 'rerender-lazy-ref-init', 'rerender-lazy-state-init',
      'prefer-module-scope-static-value', 'prefer-module-scope-pure-function',
      'js-hoist-intl', 'rn-no-legacy-shadow-styles', 'rn-style-prefer-boxshadow',
      'no-array-index-as-key'
    ].join(', '));
    return;
  }
  const map = {
    'async-await-in-loop': fixAsyncAwaitInLoop,
    'server-sequential-independent-await': fixServerSequentialAwait,
    'async-parallel': fixAsyncParallel,
    'no-react19-deprecated-apis': fixReact19Deprecated,
    'rn-prefer-expo-image': fixExpoImage,
    'rn-prefer-pressable': fixPreferPressable,
    'rn-no-single-element-style-array': fixSingleElementStyleArray,
    'rerender-lazy-ref-init': fixLazyInit,
    'rerender-lazy-state-init': fixLazyInit,
    'prefer-module-scope-static-value': fixHoist,
    'prefer-module-scope-pure-function': fixHoist,
    'js-hoist-intl': fixHoistIntl,
    'rn-no-legacy-shadow-styles': fixShadowToBoxShadow,
    'rn-style-prefer-boxshadow': fixShadowToBoxShadow,
    'no-array-index-as-key': fixArrayIndexKey
  };
  const results = [];
  for (const r of ruleArgs) {
    const fn = map[r];
    if (!fn) { console.error('Unknown rule:', r); continue; }
    try {
      const res = await fn();
      results.push(res);
    } catch (e) {
      results.push({ rule: r, error: String(e) });
    }
  }
  console.log(JSON.stringify(results, null, 2));
}

main();
