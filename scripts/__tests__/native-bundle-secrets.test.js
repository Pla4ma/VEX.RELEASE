const { test } = require('node:test');
const { Buffer } = require('node:buffer');
const assert = require('node:assert/strict');
const { readHermesStrings, inspectBundleStrings } = require('../native-bundle-secrets');

test('resolves separate Hermes strings rather than matching adjacent storage bytes', () => {
  const strings = readHermesStrings('s1[ASCII, 0..9]: sb_secret_\ns2[ASCII, 10..35]: next_string_in_the_table\n    LoadConstString r1, "sb_secret_"');
  assert.deepEqual(strings, ['sb_secret_', 'next_string_in_the_table']);
  assert.equal(inspectBundleStrings(strings).safe, true);
});

test('rejects an actual server secret key without exposing its value', () => {
  const key = 'sb_secret_' + 'synthetic_test_key'.repeat(2);
  const result = inspectBundleStrings([key]);
  assert.equal(result.safe, false);
  assert.equal(result.serverKeys, 1);
  assert.equal(JSON.stringify(result).includes(key), false);
});

test('rejects service-role JWTs while allowing public anon tokens', () => {
  const token = (role) => `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.signature`;
  assert.equal(inspectBundleStrings([token('anon')]).safe, true);
  assert.equal(inspectBundleStrings([token('service_role')]).safe, false);
});

test('reports public publishable keys separately', () => {
  const result = inspectBundleStrings(['sb_publishable_' + 'public_test_key'.repeat(2)]);
  assert.equal(result.publicKeys, 1);
  assert.equal(result.safe, true);
});

test('rejects native release bundles that contain development-only SDK shims', () => {
  const result = inspectBundleStrings(['Production build cannot use the Sentry shim.']);
  assert.equal(result.releaseShims, 1);
  assert.equal(result.safe, false);
});
