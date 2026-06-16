const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = 'C:/Users/jonat/CascadeProjects/vex-app-old';

function runDoctor() {
  try {
    const out = execSync('npx --yes react-doctor@latest --json --no-telemetry', {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return out;
  } catch (e) {
    if (e.stdout) return e.stdout;
    if (e.stderr) return e.stderr;
    throw e;
  }
}

const out = runDoctor();
const target = path.join(root, 'doctor-report.json');
const tmp = path.join(root, 'doctor-report-new.json');
fs.writeFileSync(tmp, out);
try {
  fs.copyFileSync(tmp, target);
  fs.unlinkSync(tmp);
} catch (e) {
  console.log('copy failed:', e.message);
}
console.log('Wrote', out.length, 'bytes');
