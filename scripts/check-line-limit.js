const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const LIMIT = 200;
const auditMode = process.argv.includes('--audit');
const generatedFiles = new Set([path.join(SRC, 'types', 'supabase.ts')]);
const ignoredDirs = new Set(['__snapshots__', 'archive']);

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return ignoredDirs.has(entry.name) ? [] : walk(fullPath);
    }

    return /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });
}

function lineCount(filePath) {
  return fs.readFileSync(filePath, 'utf8').split(/\r?\n/).length;
}

const violations = walk(SRC)
  .filter((filePath) => !generatedFiles.has(filePath))
  .map((filePath) => ({ filePath, lines: lineCount(filePath) }))
  .filter((result) => result.lines > LIMIT)
  .sort((a, b) => b.lines - a.lines);

if (violations.length === 0) {
  console.log(`Line limit OK: every source file is <= ${LIMIT} lines.`);
  process.exit(0);
}

const visible = violations.slice(0, 80).map((result) => {
  const relativePath = path.relative(ROOT, result.filePath);
  return `${String(result.lines).padStart(5)} ${relativePath}`;
});

console.error(`Line limit violations: ${violations.length} files exceed ${LIMIT} lines.`);
console.error(visible.join('\n'));

if (violations.length > visible.length) {
  console.error(`... ${violations.length - visible.length} more not shown.`);
}

process.exit(auditMode ? 0 : 1);
