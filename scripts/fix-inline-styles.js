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
    
    // Process from bottom to top to avoid index shifting
    const sortedLines = [...flaggedLines].sort((a, b) => b - a);
    
    for (const lineNum of sortedLines) {
      const i = lineNum - 1;
      if (i >= lines.length) continue;
      
      // Find style={{ on this line
      if (!lines[i].includes('style={{')) continue;
      
      // Find the matching }}
      let braceCount = 0;
      let startLine = i;
      let endLine = i;
      let styleContent = '';
      
      for (let j = i; j < lines.length; j++) {
        for (const ch of lines[j]) {
          if (ch === '{') braceCount++;
          if (ch === '}') braceCount--;
        }
        if (braceCount === 0) {
          endLine = j;
          break;
        }
      }
      
      // Extract the style content between {{ and }}
      const styleLines = lines.slice(startLine, endLine + 1);
      const styleText = styleLines.join('\n');
      
      // Extract content between {{ and }}
      const styleMatch = styleText.match(/style=\{\{([\s\S]*?)\}\}/);
      if (!styleMatch) continue;
      
      const styleBody = styleMatch[1].trim();
      
      // Count properties (rough heuristic: count commas + 1)
      const propCount = (styleBody.match(/,/g) || []).length + 1;
      if (propCount < 8) continue;
      
      // Generate a unique name
      const contextMatch = lines[i].match(/<(\w+)/);
      const elementName = contextMatch ? contextMatch[1].toLowerCase() : 'element';
      const styleName = `${elementName}Style_${i}`;
      
      // Find the right place to insert the const (before the component function)
      let insertIndex = 0;
      for (let j = 0; j < lines.length; j++) {
        if (lines[j].match(/^(export\s+)?(const|function|class)\s/)) {
          insertIndex = j;
          break;
        }
      }
      
      // Build the style const
      const indent = lines[i].match(/^(\s*)/)[1];
      const styleConst = `${indent.slice(0, Math.max(0, indent.length - 2))}const ${styleName} = {\n${styleBody.split('\n').map(l => '  ' + l.trim()).join('\n')}\n};`;
      
      // Replace the inline style with the reference
      if (startLine === endLine) {
        // Single-line style
        lines[i] = lines[i].replace(
          `style={{${styleBody}}}`,
          `style={${styleName}}`
        );
      } else {
        // Multi-line style - replace the range
        const firstLine = lines[startLine];
        const lastLine = lines[endLine];
        
        // Find the style={{ on the first line and }} on the last line
        const styleStart = firstLine.indexOf('style={{');
        const styleEnd = lastLine.indexOf('}}');
        
        if (styleStart >= 0 && styleEnd >= 0) {
          lines[startLine] = firstLine.substring(0, styleStart) + `style={${styleName}}` + lastLine.substring(styleEnd + 2);
          // Remove the intermediate lines
          lines.splice(startLine + 1, endLine - startLine);
        }
      }
      
      // Insert the style const (adjust index for the removed lines)
      const adjustedInsertIndex = insertIndex > startLine ? insertIndex - (endLine - startLine) : insertIndex;
      lines.splice(adjustedInsertIndex, 0, styleConst);
    }
    
    content = lines.join('\n');
    if (content !== original) {
      writeFile(filePath, content);
      fixCount++;
      console.log(`Fixed inline styles: ${filePath} (${flaggedLines.length} instances)`);
    }
  }
}

console.log('=== Fixing no-inline-exhaustive-style ===');
fixInlineStyles();
console.log(`\nTotal fixes: ${fixCount}`);
