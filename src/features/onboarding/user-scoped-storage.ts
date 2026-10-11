export interface SynchronousStorage {
  getItemSync: (key: string) => string | null;
  setItemSync: (key: string, value: string) => void;
  removeItemSync: (key: string) => void;
}

const SIGNED_OUT_SCOPE = 'anonymous';

function scopedKey(name: string, userId: string | null): string {
  return `onboarding:${userId ?? SIGNED_OUT_SCOPE}:${name}`;
}
export function createUserScopedOnboardingStorage(
  storage: SynchronousStorage,
  getUserId: () => string | null,
  getFallback?: () => string | null,
): {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
} {
  return {
    getItem: (name) =>
      storage.getItemSync(scopedKey(name, getUserId())) ?? getFallback?.() ?? null,
    setItem: (name, value) =>
      storage.setItemSync(scopedKey(name, getUserId()), value),
    removeItem: (name) =>
      storage.removeItemSync(scopedKey(name, getUserId())),
  };
}
