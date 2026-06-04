/**
 * Jest mock for expo-crypto
 *
 * Provides deterministic test-friendly implementations of
 * randomUUID and getRandomBytes.
 */

var uuidCounter = 0;

function hex(n) {
  return n.toString(16).padStart(4, '0');
}

module.exports = {
  randomUUID: jest.fn(function () {
    uuidCounter += 1;
    return hex(uuidCounter) + '0000-4000-8000-' + hex(uuidCounter) + '00000000';
  }),

  getRandomBytes: jest.fn(function (length) {
    var bytes = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
      bytes[i] = (i + 1) % 256;
    }
    return bytes;
  }),

  digestStringAsync: jest.fn(function (_algorithm, _data) {
    return Promise.resolve('mocked-hash');
  }),
};
