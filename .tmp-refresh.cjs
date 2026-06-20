// Idempotent: re-run jest if any inventory file is stale or missing.
// Tolerate jest exit code 1 since failures are the whole point.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const JSON_OUT = '.tmp-jest-full.json';
const FAIL_OUT = '.tmp-failures.txt';
const TOP_OUT = '.tmp-top-failing-files.txt';

function regen() {
  try { fs.unlinkSync(JSON_OUT); } catch (_) {}
  try {
    execFileSync('npx', ['jest', '--config', 'jest.config.js', '--json', '--outputFile=./' + JSON_OUT], {
      stdio: ['ignore', 'ignore', 'pipe'],
      maxBuffer: 1024 * 1024 * 100,
      windowsHide: true,
    });
  } catch (e) {
    // jest exited non-zero (failures). That's expected. Continue only if JSON exists.
  }
  if (!fs.existsSync(JSON_OUT) || fs.statSync(JSON_OUT).size < 1000) {
    throw new Error('jest did not produce JSON output');
  }

  const data = JSON.parse(fs.readFileSync(JSON_OUT, 'utf8'));
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
          .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, 'UUID')
          .replace(/"[^"]+"/g, '""')
          .replace(/'[^']+'/g, "''")
          .trim()
          .slice(0, 240);
        lines.push(p + ' |||| ' + (t.fullName || '') + ' |||| ' + oneLine);
      });
  });
  fs.writeFileSync(FAIL_OUT, lines.join('\n'));

  const byFile = {};
  lines.forEach(l => {
    const f = l.split(' |||| ')[0].trim();
    byFile[f] = (byFile[f] || 0) + 1;
  });
  const sorted = Object.entries(byFile).sort((a, b) => b[1] - a[1]);
  fs.writeFileSync(TOP_OUT, sorted.map(([f, n]) => n + ' ||| ' + f).join('\n'));

  console.log('TOTAL_FAILURES=' + lines.length);
  console.log('FAILING_FILES=' + sorted.length);
  console.log('SUITES_PASSED=' + data.numPassedTestSuites);
  console.log('SUITES_FAILED=' + data.numFailedTestSuites);
  console.log('TESTS_PASSED=' + data.numPassedTests);
  console.log('TESTS_FAILED=' + data.numFailedTests);
}

regen();
