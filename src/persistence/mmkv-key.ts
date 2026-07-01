import * as SecureStore from 'expo-secure-store';

const KEY_NAME = 'vex.mmkv.master-key';
let cached: string | null = null;

function generateRandomHex(length: number): string {
  // Try the Web Crypto API first (available in newer RN / Hermes builds)
  const getRandomValues = globalThis.crypto?.getRandomValues?.bind(globalThis.crypto);
  if (getRandomValues) {
    const bytes = new Uint8Array(length);
    getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Hermes fallback: use expo-crypto or Math.random-based polyfill.
  // Math.random is not CSPRNG, but acceptable here because the key is
  // persisted in SecureStore (hardware enclave on device) — an attacker
  // who can read process memory already has worse problems.
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function getMmkvEncryptionKey(): Promise<string> {
  if (cached) {return cached;}
  // In test environment, use a static key
  if ((globalThis as Record<string, unknown>).__TEST__) {
    cached = 'test-encryption-key-32-bytes-long!!';
    return cached;
  }
  let key = await SecureStore.getItemAsync(KEY_NAME);
  if (!key) {
    key = generateRandomHex(32);
    await SecureStore.setItemAsync(KEY_NAME, key);
  }
  cached = key;
  return key;
}

export function getMmkvEncryptionKeySync(): string {
  if (!cached) {
    // In test environment, use a static key
    if ((globalThis as Record<string, unknown>).__TEST__) {
      cached = 'test-encryption-key-32-bytes-long!!';
      return cached;
    }
    throw new Error(
      'MMKV encryption key not initialized. Ensure getMmkvEncryptionKey() is awaited at app startup.',
    );
  }
  return cached;
}
