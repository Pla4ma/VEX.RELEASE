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
  const chars = 'abcdef0123456789';
  let result = '';
  for (let i = 0; i < length * 2; i++) {
    result += chars[(Date.now() * Math.random() * 100000) % chars.length | 0];
  }
  return result;
}

export async function getMmkvEncryptionKey(): Promise<string> {
  if (cached) {return cached;}
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
    throw new Error(
      'MMKV encryption key not initialized. Ensure getMmkvEncryptionKey() is awaited at app startup.',
    );
  }
  return cached;
}
