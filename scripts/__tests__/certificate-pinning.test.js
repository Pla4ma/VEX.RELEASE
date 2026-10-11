const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { XML } = require('@expo/config-plugins');
const plugin = require('../../plugins/withCertificatePinning');

const leaf = `sha256/${Buffer.alloc(32, 1).toString('base64')}`;
const ca = `sha256/${Buffer.alloc(32, 2).toString('base64')}`;
const settings = { pins: [leaf, ca], caPins: [ca], includeSubdomains: true };
const configure = (domains) => plugin({ name: 'VEX', slug: 'vex-app' }, { domains });

test('iOS emits CA pins without requiring a rotating leaf certificate', async () => {
  const config = configure({ 'example.com': settings });
  const result = await config.mods.ios.infoPlist({
    modResults: { NSAppTransportSecurity: { NSPinnedDomains: { 'existing.com': {} } } },
  });
  const ats = result.modResults.NSAppTransportSecurity;
  assert.equal(ats.NSAllowsArbitraryLoads, false);
  assert.equal(ats.NSAllowsLocalNetworking, true);
  assert.deepEqual(ats.NSPinnedDomains['example.com'], {
    NSIncludesSubdomains: true,
    NSPinnedCAIdentities: [{ 'SPKI-SHA256-BASE64': ca.slice(7) }],
  });
  assert.ok(ats.NSPinnedDomains['existing.com']);
});

test('Android writes parsed pin-set elements and correctly scoped domains', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'vex-pinning-'));
  try {
    const config = configure({
      'example.com': settings,
      'api.example.org': { ...settings, includeSubdomains: false },
    });
    await config.mods.android.dangerous({
      modRequest: { platformProjectRoot: root },
      modResults: {},
    });
    const file = path.join(root, 'app/src/main/res/xml/network_security_config.xml');
    const parsed = await XML.parseXMLAsync(await fs.readFile(file, 'utf8'));
    const network = parsed['network-security-config'];
    assert.equal(network['base-config'][0].$.cleartextTrafficPermitted, 'false');
    const domains = network['domain-config'];
    assert.equal(domains[0].domain[0].$.includeSubdomains, 'true');
    assert.equal(domains[1].domain[0].$.includeSubdomains, 'false');
    assert.equal(domains[0].$, undefined);
    assert.equal(domains[0].pin, undefined);
    assert.deepEqual(domains[0]['pin-set'][0].pin.map((pin) => pin._), [
      leaf.slice(7), ca.slice(7),
    ]);
    const manifest = await config.mods.android.manifest({
      modResults: { manifest: { application: [{ $: {} }] } },
    });
    assert.equal(manifest.modResults.manifest.application[0].$['android:networkSecurityConfig'],
      '@xml/network_security_config');
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('rejects malformed hashes, XML injection, and missing backup or CA pins', () => {
  assert.throws(() => configure({ 'example.com': { ...settings, pins: ['sha256/invalid', ca] } }));
  assert.throws(() => configure({ 'example.com</domain>': settings }));
  assert.throws(() => configure({ 'example.com': { ...settings, pins: [leaf] } }));
  assert.throws(() => configure({ 'example.com': { ...settings, caPins: [] } }));
});

test('the real release configuration produces valid pinning policies', async () => {
  const app = require('../../app.json').expo;
  const entry = app.plugins.find((item) => Array.isArray(item) && item[0].includes('withCertificatePinning'));
  const config = configure(entry[1].domains);
  const result = await config.mods.ios.infoPlist({ modResults: {} });
  assert.equal(Object.keys(result.modResults.NSAppTransportSecurity.NSPinnedDomains).length, 3);
});
