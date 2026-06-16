#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ROOT = 'C:/Users/jonat/CascadeProjects/vex-app-old';

function readFile(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}
function writeFile(rel, content) {
  fs.writeFileSync(path.join(ROOT, rel), content);
}

const report = JSON.parse(fs.readFileSync(path.join(ROOT, 'doctor-report.json'), 'utf8'));
let fixCount = 0;

// Fix remaining js-combine-iterations by reading actual code
function fixCombineIterations() {
  const items = report.diagnostics.filter(d => d.rule === 'js-combine-iterations');
  const byFile = {};
  for (const item of items) {
    if (!byFile[item.filePath]) byFile[item.filePath] = [];
    byFile[item.filePath].push(item.line);
  }
  
  for (const [filePath, lines] of Object.entries(byFile)) {
    let content;
    try { content = readFile(filePath); } catch { continue; }
    const original = content;
    
    // Match multi-line .filter().map() patterns
    // Pattern: .filter(\n  (x) => cond\n)\n.map(\n  (x) => expr\n)
    content = content.replace(
      /\.filter\(\s*\n\s*\((\w+)(?:,\s*\w+)?\)\s*=>\s*\{?\s*\n\s*(.*?)\s*\n\s*\}?\s*\)\s*\n\s*\.map\(\s*\n\s*\((\w+)(?:,\s*\w+)?\)\s*=>\s*\{?\s*\n\s*(.*?)\s*\n\s*\}?\s*\)/gs,
      (match, v1, cond, v2, body) => {
        if (v1 !== v2) return match;
        return `.reduce<typeof arr>((acc, ${v1}) => {\n    if (${cond.trim()}) {\n      acc.push(${body.trim()});\n    }\n    return acc;\n  }, [])`;
      }
    );
    
    // Also try single-line patterns
    content = content.replace(
      /\.filter\(\s*\((\w+)\)\s*=>\s*(.+?)\)\s*\.map\(\s*\((\w+)\)\s*=>\s*(.+?)\)/g,
      (match, v1, cond, v2, body) => {
        if (v1 !== v2) return match;
        return `.reduce<typeof arr>((acc, ${v1}) => {\n    if (${cond}) {\n      acc.push(${body});\n    }\n    return acc;\n  }, [])`;
      }
    );
    
    if (content !== original) {
      writeFile(filePath, content);
      fixCount++;
      console.log(`Fixed combine-iterations: ${filePath}`);
    }
  }
}

// Fix remaining js-min-max-loop
function fixMinMaxLoop() {
  const items = report.diagnostics.filter(d => d.rule === 'js-min-max-loop');
  
  for (const item of items) {
    let content;
    try { content = readFile(item.filePath); } catch { continue; }
    const original = content;
    const lines = content.split('\n');
    
    for (let i = Math.max(0, item.line - 5); i < Math.min(lines.length, item.line + 5); i++) {
      const line = lines[i];
      
      // Pattern: .sort((a, b) => a[1] - b[1])[0]
      const sortArrMatch = line.match(
        /(\s*)(.*?)\.sort\(\((\w+),\s*(\w+)\)\s*=>\s*\3\[(\d+)\]\s*-\s*\4\[(\d+)\]\)\[0\](.*)/
      );
      if (sortArrMatch) {
        const [, indent, prefix, a, b, aIdx, bIdx, suffix] = sortArrMatch;
        lines[i] = `${indent}${prefix}.reduce<typeof ${prefix}[number] | undefined>((best, item) => !best || item[${bIdx}] > best[${bIdx}] ? item : best, undefined)${suffix}`;
        content = lines.join('\n');
        if (content !== original) {
          writeFile(item.filePath, content);
          fixCount++;
          console.log(`Fixed min-max: ${item.filePath}:${i + 1}`);
        }
        break;
      }
      
      // Pattern: .sort((a, b) => b.X - a.X)[0]
      const sortPropMatch = line.match(
        /(\s*)(.*?)\.sort\(\((\w+),\s*(\w+)\)\s*=>\s*\4\.(\w+)\s*-\s*\3\.(\w+)\)\[0\](.*)/
      );
      if (sortPropMatch) {
        const [, indent, prefix, a, b, bProp, aProp, suffix] = sortPropMatch;
        lines[i] = `${indent}${prefix}.reduce<typeof ${prefix}[number] | undefined>((best, item) => !best || item.${bProp} > best.${bProp} ? item : best, undefined)${suffix}`;
        content = lines.join('\n');
        if (content !== original) {
          writeFile(item.filePath, content);
          fixCount++;
          console.log(`Fixed min-max: ${item.filePath}:${i + 1}`);
        }
        break;
      }
      
      // Pattern: .sort((a, b) => a.X - b.X)[0] (min)
      const sortMinMatch = line.match(
        /(\s*)(.*?)\.sort\(\((\w+),\s*(\w+)\)\s*=>\s*\3\.(\w+)\s*-\s*\4\.(\w+)\)\[0\](.*)/
      );
      if (sortMinMatch) {
        const [, indent, prefix, a, b, aProp, bProp, suffix] = sortMinMatch;
        lines[i] = `${indent}${prefix}.reduce<typeof ${prefix}[number] | undefined>((best, item) => !best || item.${aProp} < best.${aProp} ? item : best, undefined)${suffix}`;
        content = lines.join('\n');
        if (content !== original) {
          writeFile(item.filePath, content);
          fixCount++;
          console.log(`Fixed min-max: ${item.filePath}:${i + 1}`);
        }
        break;
      }
    }
  }
}

console.log('=== Fixing js-combine-iterations ===');
fixCombineIterations();

console.log('\n=== Fixing js-min-max-loop ===');
fixMinMaxLoop();

console.log(`\nTotal fixes: ${fixCount}`);
