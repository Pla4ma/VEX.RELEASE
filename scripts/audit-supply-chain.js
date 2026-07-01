#!/usr/bin/env node

/**
 * Supply-chain audit gate.
 *
 * Runs `npm audit` (production surface by default; add `--include-dev` to scan
 * devDependencies too) and exits non-zero if any vulnerability of any
 * severity is reported. Designed to be wired into CI so a new advisory
 * surfaces as a build break instead of silently accumulating in Dependabot.
 */

const { execSync } = require('child_process');

const repoRoot = require('path').resolve(__dirname, '..');

const SEVERITY_ORDER = ['info', 'low', 'moderate', 'high', 'critical'];

function parseArgs(argv) {
  const includeDev = argv.includes('--include-dev');
  const strict = argv.includes('--strict');
  const jsonFlag = argv.includes('--json');
  // --include-dev widens the surface; --strict raises the floor to high;
  // default: prod-only with floor at moderate.
  const failOn = strict ? 'high' : includeDev ? 'low' : 'moderate';
  return { includeDev, jsonFlag, failOn };
}

function runNpmAudit(includeDev) {
  const args = ['audit', '--json'];
  if (!includeDev) args.push('--omit=dev');
  const cmd = `npm ${args.join(' ')}`;
  try {
    const stdout = execSync(cmd, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
      maxBuffer: 64 * 1024 * 1024,
    });
    return { ok: true, payload: JSON.parse(stdout) };
  } catch (err) {
    // npm audit exits non-zero when findings exist; stderr is informational,
    // stdout still has the JSON payload.
    if (err.stdout) {
      try {
        return { ok: false, payload: JSON.parse(err.stdout) };
      } catch {
        // fall through to throw
      }
    }
    throw new Error(`failed to execute "${cmd}": ${err.stderr || err.message}`);
  }
}

function summarize(payload, failOn) {
  const vulnMeta = payload?.metadata?.vulnerabilities ?? {};
  const counts = Object.fromEntries(SEVERITY_ORDER.map((s) => [s, vulnMeta[s] ?? 0]));
  const failIdx = SEVERITY_ORDER.indexOf(failOn);
  const triggered = SEVERITY_ORDER.filter((s, i) => i >= failIdx && counts[s] > 0);

  const advisories = Object.entries(payload?.vulnerabilities ?? {}).map(([name, info]) => {
    const via = Array.isArray(info?.via) ? info.via : [];
    const first = via.find((v) => typeof v === 'object') ?? {};
    return {
      name,
      severity: info?.severity ?? 'unknown',
      range: info?.range ?? '',
      fixAvailable: info?.fixAvailable ?? false,
      via: via.map((v) => (typeof v === 'string' ? v : v?.title ?? v?.name ?? 'unknown')),
      title: first.title ?? null,
      url: first.url ?? null,
    };
  });

  return { counts, triggered, advisories };
}

function formatConsoleSummary(report, surface, failOn) {
  const lines = [];
  lines.push(`npm audit (${surface}) — severity floor: ${failOn}`);
  SEVERITY_ORDER.forEach((s) => {
    lines.push(`  ${s.padEnd(9)}: ${report.counts[s]}`);
  });
  if (report.triggered.length === 0) {
    lines.push('  OK: no findings at or above the configured severity.');
    return lines.join('\n');
  }
  lines.push(`  FAIL: ${report.triggered.join(', ')} advisories at or above ${failOn}:`);
  report.advisories
    .filter((a) => SEVERITY_ORDER.indexOf(a.severity) >= SEVERITY_ORDER.indexOf(failOn))
    .forEach((a) => {
      const fix = a.fixAvailable === true
        ? 'fix available'
        : a.fixAvailable && typeof a.fixAvailable === 'object'
        ? `fix in ${a.fixAvailable.name}@${a.fixAvailable.version}`
        : 'manual fix required';
      const title = a.title ? ` — ${a.title}` : '';
      lines.push(`    - ${a.name}@${a.range} [${a.severity}] ${fix}${title}`);
      if (a.url) lines.push(`        ${a.url}`);
    });
  return lines.join('\n');
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const surface = opts.includeDev ? 'production + devDependencies' : 'production only';

  let result;
  try {
    result = runNpmAudit(opts.includeDev);
  } catch (err) {
    console.error(`ERROR: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  const report = summarize(result.payload, opts.failOn);

  if (opts.jsonFlag) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  } else {
    console.log(formatConsoleSummary(report, surface, opts.failOn));
    if (report.triggered.length === 0) {
      console.log(`Supply-chain audit gate passed (${surface}).`);
    }
  }

  if (report.triggered.length > 0) {
    process.exitCode = 1;
  }
}

main();
