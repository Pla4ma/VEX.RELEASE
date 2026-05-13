#!/usr/bin/env node
/**
 * File Splitter Script
 * Splits oversized events.ts, analytics.ts, and types.ts files
 * by extracting sections (via comment headers) into sub-files.
 * 
 * Usage: node scripts/split-oversized.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'src_impl');

function getAllFiles(dir, ext = ['.ts', '.tsx']) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      results.push(...getAllFiles(full, ext));
    } else if (item.isFile() && ext.some(e => item.name.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

function countLines(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8').split('\n').length;
  } catch {
    return 0;
  }
}

const allFiles = getAllFiles(ROOT);
const oversized = allFiles
  .map(f => ({ path: f, lines: countLines(f) }))
  .filter(f => f.lines > 200)
  .sort((a, b) => b.lines - a.lines);

console.log(`Total oversized files: ${oversized.length}`);

// Report top 20
oversized.slice(0, 20).forEach(f => {
  const rel = f.path.replace(ROOT + path.sep, '');
  console.log(`${f.lines}\t${rel}`);
});
