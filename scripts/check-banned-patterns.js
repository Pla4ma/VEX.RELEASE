const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const auditMode = process.argv.includes('--audit');
const ignoredDirs = new Set(['__snapshots__', 'archive']);
const ignoredFiles = new Set([path.join(SRC, 'types', 'supabase.ts')]);

const rules = [
  { id: 'ts-ignore', pattern: /@ts-ignore/ },
  { id: 'ts-nocheck', pattern: /@ts-nocheck/ },
  { id: 'console-log', pattern: /console\.log\s*\(/ },
  { id: 'stylesheet-create', pattern: /StyleSheet\.create\s*\(/ },
  { id: 'flatlist', pattern: /\bFlatList\b/ },
  { id: 'async-storage', pattern: /\bAsyncStorage\b/ },
  { id: 'raw-fetch', pattern: /\bfetch\s*\(/ },
  { id: 'expo-haptics-direct', pattern: /from ['"]expo-haptics['"]/ },
];

const allowedBoundaries = new Map([
  ['src/api/api-client.ts:raw-fetch', 'Canonical API client owns fetch.'],
  ['src/utils/haptics.ts:expo-haptics-direct', 'Canonical haptics wrapper owns expo-haptics.'],
  ['src/accessibility/checks.ts:flatlist', 'Static accessibility role map, not a FlatList import/use.'],
]);

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return ignoredDirs.has(entry.name) ? [] : walk(fullPath);
    }
    return /\.(ts|tsx)$/.test(entry.name) && !ignoredFiles.has(fullPath) ? [fullPath] : [];
  });
}

function scanFile(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  const findings = [];
  const relativePath = path.relative(ROOT, filePath).replace(/\\/g, '/');
  lines.forEach((line, index) => {
    rules.forEach((rule) => {
      if (rule.pattern.test(line) && !allowedBoundaries.has(`${relativePath}:${rule.id}`)) {
        findings.push({
          line: index + 1,
          path: relativePath,
          rule: rule.id,
        });
      }
    });
  });
  return findings;
}

const findings = walk(SRC).flatMap(scanFile);

if (findings.length === 0) {
  console.log('Banned-pattern check OK: no violations found.');
  process.exit(0);
}

const byRule = findings.reduce((acc, finding) => {
  acc[finding.rule] = (acc[finding.rule] ?? 0) + 1;
  return acc;
}, {});

console.error(`Banned-pattern violations: ${findings.length}`);
Object.entries(byRule)
  .sort(([a], [b]) => a.localeCompare(b))
  .forEach(([rule, count]) => console.error(`${rule}: ${count}`));

findings.slice(0, 120).forEach((finding) => {
  console.error(`${finding.path}:${finding.line} ${finding.rule}`);
});

if (findings.length > 120) {
  console.error(`... ${findings.length - 120} more not shown.`);
}

process.exit(auditMode ? 0 : 1);
