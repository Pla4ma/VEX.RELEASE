// Compact one-line failure inventory: <repo-rel file> |||| <test> |||| <first error line>
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('.tmp-jest-full.json', 'utf8'));
const projRoot = 'C:/Users/jonat/CascadeProjects/vex-app-old/';
const lines = [];
const fileCounts = {};
data.testResults.filter(r => r.status === 'failed').forEach(s => {
  const raw = (s.testFilePath || '').replace(/\\/g, '/');
  const rel = raw.startsWith(projRoot) ? raw.slice(projRoot.length) : raw.split('/src/').pop() ? 'src/' + raw.split('/src/').pop() : raw;
  fileCounts[rel] = (fileCounts[rel] || 0) + ((s.assertionResults || []).filter(t => t.status === 'failed').length);
  (s.assertionResults || []).filter(t => t.status === 'failed').forEach(t => {
    const fm = (t.failureMessages || []).join(' ');
    const first = fm
      .replace(/at .+?:[0-9]+:[0-9]+/g, '')
      .replace(/at .+?\(node_modules[^\)]+\)/g, '')
      .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, 'UUID')
      .replace(/"[^"]+"/g, '""')
      .replace(/'[^']+'/g, "''")
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200);
    lines.push(rel + ' |||| ' + (t.fullName || t.title || '') + ' |||| ' + first);
  });
});
// Group by source file under test (if same dir); keep one line per test-file with up to 3 representative tests
const byFile = {};
lines.forEach(l => {
  const [pathPart] = l.split(' |||| ');
  byFile[pathPart] = byFile[pathPart] || [];
  byFile[pathPart].push(l);
});
const groups = Object.entries(byFile).map(([f, ls]) => ({ file: f, count: ls.length, examples: ls.slice(0, 3) }));
groups.sort((a, b) => b.count - a.count);

const header = '=== SUITE+TEST FAILURE COUNTS ===\n' +
  'Total failing tests: ' + lines.length + '\n' +
  'Total failing suites: ' + groups.length + '\n\n';

const perFile = '=== FAILING SUITE LIST (count ||| file) ===\n' +
  groups.map(g => g.count + ' ||| ' + g.file).join('\n') + '\n\n';

const perFailure = '=== PER-FAILURE LINES (file |||| test |||| first-line err) ===\n' +
  lines.join('\n') + '\n';

fs.writeFileSync('.tmp-inventory.txt', header + perFile + perFailure);
console.log('FAILURES=' + lines.length);
console.log('SUITES=' + groups.length);
console.log('FILES_LINES=' + lines.length);
