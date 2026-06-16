#!/usr/bin/env node
/**
 * Auto-fix script for react-doctor warnings.
 * Handles: no-inline-exhaustive-style, js-combine-iterations (remaining),
 *          js-min-max-loop (remaining), no-derived-state, no-event-handler
 */
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

// ============================================================
// no-inline-exhaustive-style: Extract inline style objects to const
// ============================================================

function fixInlineStyles() {
  const items = report.diagnostics.filter(d => d.rule === 'no-inline-exhaustive-style');
  const byFile = {};
  for (const item of items) {
    if (!byFile[item.filePath]) byFile[item.filePath] = [];
    byFile[item.filePath].push(item.line);
  }
  
  for (const [filePath, flaggedLines] of Object.entries(byFile)) {
    let content;
    try { content = readFile(filePath); } catch { continue; }
    const original = content;
    const lines = content.split('\n');
    
    // For each flagged line, find the inline style object and extract it
    for (const lineNum of flaggedLines) {
      const i = lineNum - 1;
      if (i >= lines.length) continue;
      const line = lines[i];
      
      // Find style={{ ... }} patterns with many properties
      // Match: style={{ prop1: val1, prop2: val2, ... }}
      const styleMatch = line.match(/style=\{\{([^}]+)\}\}/);
      if (!styleMatch) continue;
      
      const styleContent = styleMatch[1];
      // Count commas to estimate property count (rough heuristic for 8+ props)
      const propCount = (styleContent.match(/,/g) || []).length + 1;
      if (propCount < 8) continue;
      
      // Generate a unique name based on the context
      const contextMatch = line.match(/<(\w+)/);
      const elementName = contextMatch ? contextMatch[1].toLowerCase() : 'element';
      const styleName = `${elementName}Style_${i}`;
      
      // Extract the style object
      const styleObj = `{${styleContent}}`;
      
      // Find the right place to insert the const (before the component function)
      // Look for the first function/const/export at module level
      let insertIndex = 0;
      for (let j = 0; j < lines.length; j++) {
        if (lines[j].match(/^(export\s+)?(const|function|class)\s/)) {
          insertIndex = j;
          break;
        }
      }
      
      // Insert the style const before the component
      lines.splice(insertIndex, 0, `const ${styleName} = ${styleObj};`);
      
      // Replace the inline style with the reference
      // Need to adjust the line index since we inserted a line
      const adjustedIndex = i + 1; // +1 because we inserted a line before
      if (adjustedIndex < lines.length) {
        lines[adjustedIndex] = lines[adjustedIndex].replace(
          `style={{${styleContent}}}`,
          `style={${styleName}}`
        );
      }
    }
    
    content = lines.join('\n');
    if (content !== original) {
      writeFile(filePath, content);
      fixCount++;
      console.log(`Fixed inline styles: ${filePath} (${flaggedLines.length} instances)`);
    }
  }
}

// ============================================================
// js-combine-iterations (remaining 12)
// ============================================================

function fixRemainingCombineIterations() {
  const items = report.diagnostics.filter(d => d.rule === 'js-combine-iterations');
  
  for (const item of items) {
    let content;
    try { content = readFile(item.filePath); } catch { continue; }
    const original = content;
    const lines = content.split('\n');
    const i = item.line - 1;
    
    // Look for .filter().map() patterns
    // Pattern: array.filter(x => cond).map(x => expr)
    // Find the line with .filter and the line with .map
    
    // Check if this line has .filter(
    if (i < lines.length && lines[i].includes('.filter(')) {
      // Look for .map( on the same or next line
      for (let j = i; j < Math.min(lines.length, i + 5); j++) {
        if (lines[j].includes('.map(')) {
          // Found .filter().map() chain
          // Extract the filter condition and map expression
          const filterLine = lines[i];
          const mapLine = lines[j];
          
          // Simple case: single-line .filter(x => cond).map(x => expr)
          if (i === j) {
            const match = filterLine.match(
              /(\s*)(.*?)\.filter\(\s*\((\w+)\)\s*=>\s*(.+?)\)\s*\.map\(\s*\((\w+)\)\s*=>\s*(.+?)\)\s*$/
            );
            if (match) {
              const [, indent, prefix, filterVar, filterBody, mapVar, mapBody] = match;
              if (filterVar === mapVar) {
                lines[i] = `${indent}${prefix}.reduce<typeof ${prefix}>((acc, ${filterVar}) => { if (${filterBody}) { acc.push(${mapBody}); } return acc; }, [])`;
                content = lines.join('\n');
                if (content !== original) {
                  writeFile(item.filePath, content);
                  fixCount++;
                  console.log(`Fixed combine-iteration: ${item.filePath}:${item.line}`);
                }
                break;
              }
            }
          }
          break;
        }
      }
    }
    
    // Check for .map().filter() pattern
    if (i < lines.length && lines[i].includes('.map(')) {
      for (let j = i; j < Math.min(lines.length, i + 5); j++) {
        if (lines[j].includes('.filter(')) {
          const mapLine = lines[i];
          const filterLine = lines[j];
          
          if (i === j) {
            const match = mapLine.match(
              /(\s*)(.*?)\.map\(\s*\((\w+)\)\s*=>\s*(.+?)\)\s*\.filter\(\s*\((\w+)\)\s*=>\s*(.+?)\)\s*$/
            );
            if (match) {
              const [, indent, prefix, mapVar, mapBody, filterVar, filterBody] = match;
              if (mapVar === filterVar) {
                lines[i] = `${indent}${prefix}.reduce<typeof ${prefix}>((acc, ${mapVar}) => { const mapped = ${mapBody}; if (${filterBody}) { acc.push(mapped); } return acc; }, [])`;
                content = lines.join('\n');
                if (content !== original) {
                  writeFile(item.filePath, content);
                  fixCount++;
                  console.log(`Fixed combine-iteration: ${item.filePath}:${item.line}`);
                }
                break;
              }
            }
          }
          break;
        }
      }
    }
  }
}

// ============================================================
// js-min-max-loop (remaining 10)
// ============================================================

function fixMinMaxLoop() {
  const items = report.diagnostics.filter(d => d.rule === 'js-min-max-loop');
  
  for (const item of items) {
    let content;
    try { content = readFile(item.filePath); } catch { continue; }
    const original = content;
    const lines = content.split('\n');
    
    // Look around the flagged line for .sort(...)[0] patterns
    for (let i = Math.max(0, item.line - 5); i < Math.min(lines.length, item.line + 5); i++) {
      const line = lines[i];
      
      // Pattern: .sort((a, b) => b.X - a.X)[0]
      const sortMaxMatch = line.match(
        /(\s*)(.*?)\.sort\(\((\w+),\s*(\w+)\)\s*=>\s*\4\.(\w+)\s*-\s*\3\.(\w+)\)\[0\](.*)/
      );
      if (sortMaxMatch) {
        const [, indent, prefix, a, b, bProp, aProp, suffix] = sortMaxMatch;
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

// ============================================================
// Main
// ============================================================

console.log('=== Fixing no-inline-exhaustive-style ===');
fixInlineStyles();

console.log('\n=== Fixing remaining js-combine-iterations ===');
fixRemainingCombineIterations();

console.log('\n=== Fixing js-min-max-loop ===');
fixMinMaxLoop();

console.log(`\nTotal fixes: ${fixCount}`);
