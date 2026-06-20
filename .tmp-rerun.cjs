// Capture full failure inventory to a durable, line-by-line format
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1) Run jest and write JSON
const out = '.tmp-jest-full.json';
try { fs.unlinkSync(out); } catch(_){}
execSync('npx jest --config jest.config.js --json --outputFile=./' + out + ' --silent', { stdio: ['ignore', 'pipe', 'pipe'] });
const data = JSON.parse(fs.readFileSync(out, 'utf8'));

// 2) Emit per-failure lines: file |||| testName |||| one-line error
const lines = [];
const failed = data.testResults.filter(r => r.status === 'failed');
failed.forEach(s => {
  const p = (s.testFilePath || '').replace(/\\/g, '/');
  (s.assertionResults || [])
    .filter(t => t.status === 'failed')
    .forEach(t => {
      const fm = (t.failureMessages || []).join(' ');
      const oneLine = fm
        .replace(/\\/g, '/')
        .replace(/\s+/g, ' ')
        .replace(/at STACK .*$/i, '')
        .replace(/at .+?:[0-9]+:[0-9]+/g, 'at LINENO')
        .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, 'UUID')
        .replace(/\b0x[0-9a-f]+\b/gi, 'HEX')
        .replace(/"[^"]+"/g, '""')
        .replace(/'[^']+'/g, "''")
        .trim()
        .slice(0, 220);
      lines.push(p + ' |||| ' + t.fullName + ' |||| ' + oneLine);
    });
});

fs.writeFileSync('.tmp-failures.txt', lines.join('\n'));
fs.writeFileSync('.tmp-top-failing-files.txt',
  Object.entries(
    lines.reduce((m, l) => {
      const f = l.split('||||')[0].trim();
      m[f] = (m[f] || 0) + 1;
      return m;
    }, {})
  ).sort((a,b) => b[1]-a[1]).map(([f,n]) => n + ' ||| ' + f).join('\n')
);

console.log('TOTAL_FAILURES=' + lines.length);
console.log('FAILING_FILES=' + Object.keys(lines.reduce((m,l)=>(m[l.split('||||')[0].trim()]||=1,m),{})).length);
