const fs = require('node:fs');
const { Buffer } = require('node:buffer');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function readHermesStrings(dump) {
  return dump.split('\n').filter((line) => /^[si]\d+\[/.test(line))
    .map((line) => line.slice(line.indexOf(']: ') + 3));
}

function inspectBundleStrings(strings) {
  let serviceRoleTokens = 0;
  let serverKeys = 0;
  let publicKeys = 0;
  let releaseShims = 0;
  for (const value of strings) {
    if (/^Production build cannot use the .+ shim\.$/.test(value)) { releaseShims += 1; }
    if (/^sb_secret_[A-Za-z0-9_-]{20,}$/.test(value)) { serverKeys += 1; }
    if (/^sb_publishable_[A-Za-z0-9_-]{20,}$/.test(value)) { publicKeys += 1; }
    if (/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)) {
      try {
        const payload = JSON.parse(Buffer.from(value.split('.')[1], 'base64url').toString('utf8'));
        if (payload.role === 'service_role') { serviceRoleTokens += 1; }
      } catch { /* Not a valid JWT payload. */ }
    }
  }
  return { stringsChecked: strings.length, publicKeys, serverKeys, serviceRoleTokens, releaseShims,
    safe: serverKeys === 0 && serviceRoleTokens === 0 && releaseShims === 0 };
}

function inspectHermesBundle(bundlePath) {
  const packageRoot = path.dirname(require.resolve('hermes-compiler/package.json'));
  const platform = process.platform === 'darwin' ? 'osx-bin' : process.platform === 'win32' ? 'win64-bin' : 'linux64-bin';
  const compiler = path.join(packageRoot, 'hermesc', platform, process.platform === 'win32' ? 'hermesc.exe' : 'hermesc');
  const dump = execFileSync(compiler, ['-dump-bytecode', bundlePath],
    { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  const strings = readHermesStrings(dump);
  if (strings.length === 0) { throw new Error('No Hermes strings decoded; native bundle was not checked'); }
  return inspectBundleStrings(strings);
}

if (require.main === module) {
  const bundlePath = process.argv[2];
  if (!bundlePath || !fs.existsSync(bundlePath)) { throw new Error('Pass the extracted native Hermes bundle path'); }
  const result = inspectHermesBundle(bundlePath);
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (!result.safe) { process.exitCode = 1; }
}

module.exports = { readHermesStrings, inspectBundleStrings, inspectHermesBundle };
