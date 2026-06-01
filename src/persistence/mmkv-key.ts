import * as SecureStore from 'expo-secure-store';

const KEY_NAME = 'vex.mmkv.master-key';
let cached: string | null = null;

export async function getMmkvEncryptionKey(): Promise<string> {
  if (cached) {return cached;}
  let key = await SecureStore.getItemAsync(KEY_NAME);
  if (!key) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    key = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
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
