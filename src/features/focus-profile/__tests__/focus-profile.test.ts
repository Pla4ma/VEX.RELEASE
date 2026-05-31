import { createFocusProfile, getFocusProfile } from '../service';

const mockStore = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  MMKV: class MockMMKV {
    getString(key: string): string | undefined {
      return mockStore.get(key);
    }

    set(key: string, value: string | number | boolean): void {
      mockStore.set(key, String(value));
    }

    delete(key: string): void {
      mockStore.delete(key);
    }

    contains(key: string): boolean {
      return mockStore.has(key);
    }

    getAllKeys(): string[] {
      return Array.from(mockStore.keys());
    }
  },
}));

describe('FocusProfile service', () => {
  beforeEach(() => {
    mockStore.clear();
  });

  it('creates profile from onboarding-style inputs', async () => {
    const profile = await createFocusProfile({
      userId: 'local-user',
      primaryGoal: 'study',
      preferredSessionDurationMinutes: 15,
      preferredSessionMode: 'STUDY',
      updatedAt: 1_764_000_000_000,
    });

    expect(profile.laneProfile.primaryLane).toBe('student');
    expect(profile.preferredSessionDurationMinutes).toBe(15);
    await expect(getFocusProfile('local-user')).resolves.toEqual(profile);
  });

  it('falls back safely when onboarding is missing', async () => {
    const profile = await createFocusProfile({
      userId: 'anonymous-user',
      updatedAt: 1_764_000_000_000,
    });

    expect(profile.primaryGoal).toBe('focus');
    expect(profile.laneProfile.primaryLane).toBe('minimal_normal');
    expect(profile.notificationPreference.maxPerDay).toBe(1);
  });
});
