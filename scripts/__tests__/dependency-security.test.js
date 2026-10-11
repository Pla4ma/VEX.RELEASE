const assert = require('node:assert/strict');
const { test } = require('node:test');
const braces = require('braces');
const forge = require('node-forge');
const shellQuote = require('shell-quote');

test('shell quoting rejects a line terminator after a comment token', () => {
  assert.throws(() => shellQuote.quote(['echo', { comment: 'safe' }, 'a\nid;#']), TypeError);
});

test('brace walkers reject deep input and retain ordinary glob behavior', () => {
  const nested = '{a,'.repeat(2300) + 'b' + '}'.repeat(2300);
  for (const operation of [braces.compile, braces.expand, braces.stringify]) {
    assert.throws(() => operation(nested), /safe depth limit/);
  }
  assert.deepEqual(braces.expand('src/{hooks,service}.{ts,tsx}'), [
    'src/hooks.ts', 'src/hooks.tsx', 'src/service.ts', 'src/service.tsx',
  ]);
});

test('brace walkers reject a deeply nested supplied AST', () => {
  let ast = { nodes: [{ value: 'a' }] };
  for (let depth = 0; depth < 200; depth += 1) { ast = { nodes: [ast] }; }
  assert.throws(() => braces.compile(ast), /safe depth limit/);
  assert.throws(() => braces.stringify(ast), /safe depth limit/);
});

test('RSA verification rejects extra nested DigestAlgorithm elements', () => {
  const keys = forge.pki.rsa.generateKeyPair(1024);
  const md = forge.md.sha256.create().update('VEX regression');
  const digest = md.digest().getBytes();
  const { Class, Type, create, oidToDer, toDer } = forge.asn1;
  const info = create(Class.UNIVERSAL, Type.SEQUENCE, true, [
    create(Class.UNIVERSAL, Type.SEQUENCE, true, [
      create(Class.UNIVERSAL, Type.OID, false, oidToDer(forge.oids.sha256).getBytes()),
      create(Class.UNIVERSAL, Type.NULL, false, ''),
      create(Class.UNIVERSAL, Type.OCTETSTRING, false, 'extra'),
    ]),
    create(Class.UNIVERSAL, Type.OCTETSTRING, false, digest),
  ]);
  const invalid = keys.privateKey.sign(toDer(info).getBytes(), 'NONE');
  assert.throws(() => keys.publicKey.verify(digest, invalid), /DigestInfo/);
  const valid = keys.privateKey.sign(md);
  assert.equal(keys.publicKey.verify(digest, valid), true);
});
