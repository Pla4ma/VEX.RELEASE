import * as SecureStore from 'expo-secure-store';

const KEY_NAME = 'vex.mmkv.master-key';
let cached: string | null = null;

function generateRandomHex(length: number): string {
  const getRandomValues = globalThis.crypto?.getRandomValues?.bind(globalThis.crypto);
  if (getRandomValues) {
    const bytes = new Uint8Array(length);
    getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  throw new Error(
    'MMKV encryption requires globalThis.crypto.getRandomValues. ' +
    'App cannot initialize securely on this platform. ' +
    'Ensure a secure random source is available.',
  );
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
