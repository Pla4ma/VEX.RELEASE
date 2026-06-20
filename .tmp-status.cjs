// Robust inventory status checker — and re-run if any file is missing
const fs = require('fs');
const { execSync } = require('child_process');

const files = ['.tmp-jest-full.json', '.tmp-failures.txt', '.tmp-top-failing-files.txt'];

let needReRun = false;
console.log('--- tmp status ---');
for (const f of files) {
  try {
    const s = fs.statSync(f);
    console.log(f, s.size, 'bytes', s.mtime.toISOString());
  } catch (e) {
    console.log(f, 'MISSING');
    needReRun = true;
  }
}

if (needReRun) {
  console.log('--- rerunning ---');
  try { fs.unlinkSync('.tmp-jest-full.json'); } catch (_) {}
  execSync('npx jest --config jest.config.js --json --outputFile=./.tmp-jest-full.json --silent 2>nul', {
    stdio: ['ignore', 'ignore', 'ignore'],
    maxBuffer: 1024 * 1024 * 100,
  });
  console.log('jest done');

  const data = JSON.parse(fs.readFileSync('.tmp-jest-full.json', 'utf8'));
  const lines = [];
  const failed = data.testResults.filter(r => r.status === 'failed');
  failed.forEach(s => {
    const p = (s.testFilePath || '').replace(/\\/g, '/');
    (s.assertionResults || [])
      .filter(t => t.status === 'failed')
      .forEach(t => {
        const fm = (t.failureMessages || []).join(' ');
        const oneLine = fm
          .replace(/\s+/g, ' ')
          .replace(/at .+?:[0-9]+:[0-9]+/g, '')
          .replace(/Expected X\\./g, 'EXP ')
          .replace(/Received X\\./g, 'REC ')
          .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, 'UUID')
          .replace(/"[^"]+"/g, '""')
          .replace(/'[^']+'/g, "''")
          .trim()
          .slice(0, 240);
        lines.push(p + ' |||| ' + (t.fullName || '') + ' |||| ' + oneLine);
      });
  });
  fs.writeFileSync('.tmp-failures.txt', lines.join('\n'));

  const byFile = {};
  lines.forEach(l => {
    const f = l.split(' |||| ')[0].trim();
    byFile[f] = (byFile[f] || 0) + 1;
  });
  const sorted = Object.entries(byFile).sort((a, b) => b[1] - a[1]);
  fs.writeFileSync('.tmp-top-failing-files.txt', sorted.map(([f, n]) => n + ' ||| ' + f).join('\n'));

  console.log('TOTAL_FAILURES=' + lines.length);
  console.log('FAILING_FILES=' + sorted.length);

  console.log('\n--- TOP 15 ---');
  sorted.slice(0, 15).forEach(([f, n]) => console.log(n, f));
}
