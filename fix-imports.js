// Fix all broken import paths in test files
const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const resultsPath = path.join(projectRoot, 'test-results.json');

if (!fs.existsSync(resultsPath)) {
  console.error('test-results.json not found');
  process.exit(1);
}

const d = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

// Extract all "Cannot find module" failures
const importFixes = [];
d.testResults.filter(r => r.status === 'failed').forEach(f => {
  const msg = f.message || '';
  const match = msg.match(/Cannot find module '([^']+)' from '([^']+)'/);
  if (match) {
    importFixes.push({
      missingModule: match[1],
      fromFile: match[2],
      testFile: f.name,
    });
  }
});

console.log(`Found ${importFixes.length} broken imports to fix\n`);

// Helper: check if a directory or file exists
function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

// Helper: find actual module location by searching common patterns
function findActualModule(importPath, fromFile) {
  // Convert to absolute
  const fromDir = path.dirname(fromFile);
  const resolved = path.resolve(fromDir, importPath);
  
  // If the resolved path exists as a file or directory, it's not broken
  if (exists(resolved + '.ts') || exists(resolved + '.tsx') || exists(resolved + '/index.ts')) {
    return null; // Not actually broken at this level
  }
  
  // The import is targeting a relative module. Try to figure out what was intended.
  const parts = importPath.replace(/\\/g, '/').split('/');
  const base = parts[parts.length - 1];
  
  // Search for this module in common locations
  const searchPaths = [
    path.join(projectRoot, 'src', base),
    path.join(projectRoot, 'src', 'features', base),
    path.join(projectRoot, 'src', 'shared', base),
    path.join(projectRoot, 'src', 'utils', base),
    path.join(projectRoot, 'src', 'events'),
    path.join(projectRoot, 'src', 'persistence', base),
  ];
  
  // Also try with intermediate path components
  if (parts.length >= 2) {
    const subPath = parts.slice(parts.length - 2).join('/');
    searchPaths.push(
      path.join(projectRoot, 'src', subPath),
      path.join(projectRoot, 'src', 'features', subPath),
    );
  }
  if (parts.length >= 3) {
    const subPath = parts.slice(parts.length - 3).join('/');
    searchPaths.push(
      path.join(projectRoot, 'src', subPath),
      path.join(projectRoot, 'src', 'features', subPath),
    );
  }
  
  for (const sp of searchPaths) {
    if (exists(sp + '.ts') || exists(sp + '.tsx') || exists(sp + '/index.ts')) {
      // Found it! Compute relative path from fromFile to this module
      let rel = path.relative(fromDir, sp).replace(/\\/g, '/');
      if (!rel.startsWith('.')) rel = './' + rel;
      return rel;
    }
  }
  
  return null; // Couldn't find it
}

// Alternative: direct search using glob-like pattern
function searchModule(moduleName) {
  // Search in src/ for the module
  const searchDirs = [
    path.join(projectRoot, 'src'),
    path.join(projectRoot, 'src', 'features'),
    path.join(projectRoot, 'src', 'shared'),
    path.join(projectRoot, 'src', 'utils'),
  ];
  
  for (const dir of searchDirs) {
    const found = searchRecursive(dir, moduleName, 4);
    if (found) return found;
  }
  return null;
}

function searchRecursive(dir, moduleName, depth) {
  if (depth <= 0) return null;
  if (!exists(dir)) return null;
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Check for index file
        if (exists(path.join(full, 'index.ts'))) {
          if (entry.name === moduleName) {
            return path.join(full, 'index.ts');
          }
        }
        const found = searchRecursive(full, moduleName, depth - 1);
        if (found) return found;
      } else if (entry.isFile()) {
        const baseName = entry.name.replace(/\.(ts|tsx)$/, '');
        if (baseName === moduleName) {
          return full;
        }
      }
    }
  } catch {}
  return null;
}

// Build the fix map: { testFile: [{ oldImport, newImport }] }
const fixes = {};
let fixedCount = 0;
let notFoundCount = 0;

importFixes.forEach(f => {
  const mod = f.missingModule;
  const fromFile = f.fromFile;
  
  // First try direct search
  const modName = path.basename(mod);
  let actual = searchModule(modName);
  
  if (!actual) {
    // Try with the full relative path pattern
    actual = findActualModule(mod, fromFile);
  }
  
  // Also try to guess: if old path was '../../events', events is likely at src/events/
  if (!actual) {
    const fromDir = path.dirname(fromFile);
    const relFromSrc = path.relative(path.join(projectRoot, 'src'), fromDir);
    const depth = relFromSrc.split(path.sep).length;
    
    // Try to construct the right number of '../' to reach src/, then the module
    const prefix = '../'.repeat(depth);
    const candidate = prefix + mod.replace(/^(\.\.\/)+/, '').replace(/\\/g, '/');
    const candidateAbs = path.resolve(fromDir, candidate);
    
    if (exists(candidateAbs + '.ts') || exists(candidateAbs + '.tsx') || exists(candidateAbs + '/index.ts')) {
      actual = candidateAbs;
    }
  }
  
  if (actual) {
    const fromDir = path.dirname(fromFile);
    let relPath = path.relative(fromDir, actual).replace(/\\/g, '/');
    // Remove extension
    relPath = relPath.replace(/\.(ts|tsx)$/, '');
    if (!relPath.startsWith('.')) relPath = './' + relPath;
    
    if (relPath !== mod) {
      if (!fixes[fromFile]) fixes[fromFile] = [];
      fixes[fromFile].push({ oldImport: mod, newImport: relPath });
      console.log(`FIX: ${path.relative(projectRoot, fromFile)}`);
      console.log(`     '${mod}' → '${relPath}'`);
      fixedCount++;
    }
  } else {
    console.log(`NOT FOUND: ${mod} from ${path.relative(projectRoot, fromFile)}`);
    notFoundCount++;
  }
});

console.log(`\n=== Summary ===`);
console.log(`Fixed: ${fixedCount}, Not found: ${notFoundCount}`);

// Apply the fixes
let appliedCount = 0;
for (const [filePath, replacements] of Object.entries(fixes)) {
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (file missing): ${filePath}`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const { oldImport, newImport } of replacements) {
    // Match the import statement: import ... from 'oldImport'
    // or jest.mock('oldImport', ...)
    // or require('oldImport')
    const escaped = oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(['"])${escaped}\\1`, 'g');
    
    const before = content;
    content = content.replace(regex, `'${newImport}'`);
    if (content !== before) changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    appliedCount++;
  }
}

console.log(`\nApplied fixes to ${appliedCount} files`);
