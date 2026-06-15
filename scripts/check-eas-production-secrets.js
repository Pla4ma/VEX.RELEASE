#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const easPath = path.join(repoRoot, 'eas.json');

const requiredSecrets = [
  'EAS_APPLE_ID',
  'EAS_ASC_APP_ID',
  'EAS_APPLE_TEAM_ID',
  'EAS_GOOGLE_SERVICE_ACCOUNT_KEY_PATH',
  'SUPABASE_SERVICE_ROLE_KEY',
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_SENTRY_DSN',
  'EXPO_PUBLIC_POSTHOG_KEY',
  'EXPO_PUBLIC_REVENUECAT_IOS_KEY',
  'EXPO_PUBLIC_REVENUECAT_ANDROID_KEY',
];

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
}

function collectEnvRefs(value, refs = new Set()) {
  if (typeof value === 'string') {
    for (const match of value.matchAll(/\$\{([A-Z0-9_]+)\}/g)) {
      refs.add(match[1]);
    }
    return refs;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectEnvRefs(item, refs));
    return refs;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectEnvRefs(item, refs));
  }

  return refs;
}

function assertNoHardPlaceholders(raw) {
  ['Set your', 'path/to/'].forEach((placeholder) => {
    if (raw.includes(placeholder)) {
      fail(`eas.json contains placeholder "${placeholder}".`);
    }
  });
}

function assertProductionDoesNotEnableShims(easConfig) {
  const productionEnv = easConfig.build?.production?.env ?? {};
  if (productionEnv.EXPO_PUBLIC_ENABLE_EXPO_GO_SHIMS !== undefined) {
    fail('production build profile must not set EXPO_PUBLIC_ENABLE_EXPO_GO_SHIMS.');
  }
}

function assertSubmitRefs(easConfig) {
  const submitRefs = collectEnvRefs(easConfig.submit?.production ?? {});
  [
    'EAS_APPLE_ID',
    'EAS_ASC_APP_ID',
    'EAS_APPLE_TEAM_ID',
    'EAS_GOOGLE_SERVICE_ACCOUNT_KEY_PATH',
  ].forEach((name) => {
    if (!submitRefs.has(name)) {
      fail(`submit.production must reference ${name}.`);
    }
  });
}

function listRemoteSecrets() {
  try {
    const output = execSync('eas secret:list --scope project', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    });
    return new Set(requiredSecrets.filter((name) => output.includes(name)));
  } catch {
    fail('could not run "eas secret:list --scope project"; log in to EAS or install eas-cli.');
    return null;
  }
}

function assertRemoteSecretsPresent() {
  const presentSecrets = listRemoteSecrets();
  if (!presentSecrets) {
    return;
  }

  requiredSecrets.forEach((name) => {
    if (!presentSecrets.has(name)) {
      fail(`missing EAS project secret ${name}.`);
    }
  });
}

function main() {
  if (!fs.existsSync(easPath)) {
    console.log('eas.json not found; skipping EAS production secret check.');
    return;
  }

  const raw = fs.readFileSync(easPath, 'utf8');
  const easConfig = JSON.parse(raw);

  assertNoHardPlaceholders(raw);
  assertProductionDoesNotEnableShims(easConfig);
  assertSubmitRefs(easConfig);

  if (process.argv.includes('--remote')) {
    assertRemoteSecretsPresent();
  } else {
    console.log('Remote EAS secret presence not checked. Run with --remote before submission.');
  }

  if (!process.exitCode) {
    console.log('EAS production config checks passed.');
  }
}

main();
