import { describe, expect, it } from '@jest/globals';

import { createUserScopedOnboardingStorage } from '../user-scoped-storage';

describe('user-scoped onboarding storage', () => {
  it('keeps each user state in a separate namespace', () => {
    const values = new Map<string, string>();
    let activeUserId: string | null = 'user-a';
    const storage = createUserScopedOnboardingStorage(
      {
        getItemSync: (key) => values.get(key) ?? null,
        setItemSync: (key, value) => values.set(key, value),
        removeItemSync: (key) => values.delete(key),
      },
      () => activeUserId,
    );

    storage.setItem('state', 'A');
    activeUserId = 'user-b';
    expect(storage.getItem('state')).toBeNull();

    storage.setItem('state', 'B');
    activeUserId = 'user-a';
    expect(storage.getItem('state')).toBe('A');
    activeUserId = 'user-b';
    expect(storage.getItem('state')).toBe('B');
  });

  it('does not mix signed-out state with a user namespace', () => {
    const values = new Map<string, string>();
    let activeUserId: string | null = null;
    const storage = createUserScopedOnboardingStorage(
      {
        getItemSync: (key) => values.get(key) ?? null,
        setItemSync: (key, value) => values.set(key, value),
        removeItemSync: (key) => values.delete(key),
      },
      () => activeUserId,
    );

    storage.setItem('state', 'anonymous');
    activeUserId = 'user-a';
    expect(storage.getItem('state')).toBeNull();
  });
});
