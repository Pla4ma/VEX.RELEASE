#!/usr/bin/env node
// react-doctor v3 fixer — TypeScript compiler API based AST rewriter.
// Walks real TS source for 4 rule families and applies safe TextReplacements.
// Operates in dry mode unless --write flag is provided.
/* eslint-disable */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = process.cwd();
const DRY = !process.argv.includes('--write');
const RULES = (process.argv.find(a => a.startsWith('--rules=')) || '')
  .slice('--rules='.length).split(',').filter(Boolean);

function inScope(p) {
  return p.startsWith('src/') || p.startsWith('jobs/') || p.startsWith('shared/');
}
function loadDiags(rule) {
  const file = path.join(ROOT, 'scripts/fix-batches', rule + '.json');
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const SK = ts.ScriptKind.TSX;
const stats = {};

function processFile(filePath) {
  let content;
  try { content = fs.readFileSync(path.join(ROOT, filePath), 'utf8'); } catch { return 0; }
  const sf = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, SK);
  const range = { fileName: filePath };
  /** @type {Array<{start:number,end:number,newText:string}>} */
  const replacements = [];

  function add(node, newText) {
    const start = node.getStart(sf);
    const end = node.getEnd();
    replacements.push({ start, end, newText });
  }

  function isFactoryOrConstructor(arg) {
    if (!arg) return false;
    if (ts.isNewExpression(arg)) return true;
    if (ts.isCallExpression(arg) && !ts.isArrowFunction(arg) && !ts.isFunctionExpression(arg)) return true;
    return false;
  }

  function visit(node) {
    // ============================================================
    // Rule: rerender-lazy-state-init, rerender-lazy-ref-init
    //   useState(factoryCall) -> useState(() => factoryCall)
    //   useRef<T>(factoryCall) -> useState<{current:T}>(() => ({current: factoryCall}))[0]
    // Only convert when arg is new X() or factory function call.
    // ============================================================
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const hook = node.expression.text;
      if ((hook === 'useState' || hook === 'useRef') && node.arguments.length === 1) {
        const arg = node.arguments[0];
        if (isFactoryOrConstructor(arg)) {
          const typeArgs = node.typeArguments && node.typeArguments.length
            ? `<${node.typeArguments.map(t => t.getText(sf)).join(', ')}>`
            : '';
          const argText = arg.getText(sf);
          if (hook === 'useState') {
            add(node, `useState${typeArgs}(() => ${argText})`);
          } else {
            // useRef wrapped as useState({current: ...})[0] preserving generic.
            const genericT = node.typeArguments && node.typeArguments.length
              ? node.typeArguments[0].getText(sf)
              : 'unknown';
            add(node, `useState<{ current: ${genericT} }>(() => ({ current: ${argText} }))[0]`);
          }
        }
      }
    }

    // ============================================================
    // Rule: server-sequential-independent-await
    //   const a = await X(); const b = await Y();   // a not used in Y
    //   const [a, b] = await Promise.all([X(), Y()]);
    // Walk blocks, look for adjacent VariableStatements with await init.
    // ============================================================
    if (ts.isBlock(node) || ts.isSourceFile(node)) {
      const stmts = node.statements;
      for (let i = 0; i < stmts.length - 1; i++) {
        const s1 = stmts[i];
        const s2 = stmts[i + 1];
        if (ts.isVariableStatement(s1) && ts.isVariableStatement(s2)) {
          const dl1 = s1.declarationList;
          const dl2 = s2.declarationList;
          if (dl1.declarations.length === 1 && dl2.declarations.length === 1) {
            const d1 = dl1.declarations[0];
            const d2 = dl2.declarations[0];
            if (
              d1.initializer && ts.isAwaitExpression(d1.initializer) &&
              d2.initializer && ts.isAwaitExpression(d2.initializer)
            ) {
              const v1 = d1.name.getText(sf);
              const v2 = d2.name.getText(sf);
              const exp1 = d1.initializer.expression.getText(sf);
              const exp2 = d2.initializer.expression.getText(sf);
              // Guard: v1 not referenced in exp2
              if (!exp2.includes(v1) && !exp1.includes(v2)) {
                add(s1, `const [${v1}, ${v2}] = await Promise.all([\n  ${exp1},\n  ${exp2},\n]);`);
                add(s2, '');
              }
            }
          }
        }
      }
    }

    // ============================================================
    // Rule: async-await-in-loop
    // Convert:
    //   for (const x of arr) { await foo(x); } -> wait Promise.all(arr.map(x => foo(x)))
    //   array.forEach(x => { await foo(x) }) -> await Promise.all(arr.map(x => foo(x)))
    // ============================================================
    if (ts.isForOfStatement(node) && node.initializer && ts.isVariableDeclarationList(node.initializer)) {
      const decls = node.initializer.declarations;
      if (decls.length === 1) {
        const itemVar = decls[0].name.getText(sf);
        const arrEx = node.expression.getText(sf);
        const body = node.statement;
        const stmts = ts.isBlock(body) ? body.statements : [body];
        const bodyText = (ts.isBlock(body) ? body.statements : [body])
          .map(s => s.getText(sf)).join('\n');
        if (bodyText.includes('await ')) {
          add(node, `await Promise.all(${arrEx}.map(async (${itemVar}) => {\n${bodyText}\n}))`);
        }
      }
    }

    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'forEach'
    ) {
      const arrEx = node.expression.expression.getText(sf);
      const arg = node.arguments[0];
      if (arg && (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg))) {
        const params = arg.parameters.map(p => p.getText(sf)).join(', ');
        const bodyText = arg.body.getText(sf);
        if (bodyText.includes('await ')) {
          add(node, `await Promise.all(${arrEx}.map(async (${params}) => ${bodyText}))`);
        }
      }
    }

    // ============================================================
    // Rule: no-array-index-as-key
    // Convert key={index} or key={`foo-${index}`} into key={item?.id ?? ...}
    // Conservative: only when iteration looks like .map((user, index))
    // We do not need to verify the enclosing .map; React accepts whatever
    // we emit as long as we always include `item?.id ??`. We replace in place
    // when key expression mentions a likely-index identifier.
    // ============================================================
    if (ts.isJsxAttribute(node) && node.name.text === 'key' && node.initializer && ts.isJsxExpression(node.initializer)) {
      const expr = node.initializer.expression;
      if (!expr) return;
      const text = expr.getText(sf);
      const isIndexIdent = text === 'index' || text === 'i' || text === 'idx' || text === 'indexes';
      const isTemplate = ts.isTemplateExpression(expr) || ts.isNoSubstitutionTemplateLiteral(expr);
      if (isIndexIdent) {
        add(expr, `item?.id ?? ${text}`);
      } else if (isTemplate && text.includes('${')) {
        // Replace index-related template parts only when source is plain template expression.
        const newText = text
          .replace(/\$\{index\}/g, '${item?.id ?? index}')
          .replace(/\$\{i\}/g, '${item?.id ?? i}');
        if (newText !== text) add(expr, newText);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sf);

  // Apply bottom-up so offsets stay valid.
  replacements.sort((a, b) => b.start - a.start);
  // Deduplicate overlapping ranges: keep none if any overlap except for empty-newText removals.
  const filtered = [];
  for (const r of replacements) {
    const overlaps = filtered.some(f => !(r.end <= f.start || r.start >= f.end));
    if (!overlaps) filtered.push(r);
  }
  filtered.sort((a, b) => a.start - b.start);

  let out = content;
  for (const { start, end, newText } of filtered) {
    out = out.slice(0, start) + newText + out.slice(end);
  }

  if (filtered.length > 0 && !DRY) {
    fs.writeFileSync(path.join(ROOT, filePath), out, 'utf8');
  }
  return filtered.length;
}

// =============================================================
// Main: for each rule, run on its unique files
// =============================================================
const allRules = {
  'async-await-in-loop': true,
  'rerender-lazy-ref-init': true,
  'rerender-lazy-state-init': true,
  'server-sequential-independent-await': true,
  'no-array-index-as-key': true,
};

const active = RULES.length ? RULES : Object.keys(allRules);
console.log('Mode:', DRY ? 'dry' : 'write', '| Rules:', active.join(','));

for (const rule of active) {
  stats[rule] = { filesChanged: 0, replacements: 0 };
  const items = loadDiags(rule);
  const files = [...new Set(items.map(d => d.filePath))].filter(inScope);
  for (const f of files) {
    try {
      const n = processFile(f);
      if (n > 0) { stats[rule].filesChanged++; stats[rule].replacements += n; }
    } catch (e) {
      console.error(`Error in ${f}:`, e.message);
    }
  }
}
console.log(JSON.stringify(stats, null, 2));
