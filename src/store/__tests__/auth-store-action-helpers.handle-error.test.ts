import {
  handleAuthCheckError,
} from '../authStoreActionHelpers';
import type { User } from '../types/models';

jest.mock('../../persistence/SecureStorage', () => ({
  getSecureStorage: () => ({
    getItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(undefined),
    setItem: jest.fn().mockResolvedValue(undefined),
  }),
  SecureStorageKeys: {
    AUTH_TOKEN: 'vex_auth_token',
    REFRESH_TOKEN: 'vex_refresh_token',
    USER_PROFILE: 'vex_user_profile',
  },
}));

jest.mock('../../persistence/MMKVStorageAdapter', () => {
  const store = new Map<string, string>();
  return {
    getMMKVStorageAdapter: () => ({
      getItem: (key: string) => Promise.resolve(store.get(key) ?? null),
      removeItem: (key: string) => { store.delete(key); return Promise.resolve(); },
      setItem: (key: string, value: string) => { store.set(key, value); return Promise.resolve(); },
      containsKey: (key: string) => store.has(key),
      getAllKeys: () => Array.from(store.keys()),
    }),
  };
});

jest.mock('../../config/sentry', () => ({
  clearSentryUser: jest.fn(),
  setSentryUser: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock('../authStoreIntegrations', () => ({
  initializeServicesAfterAuth: jest.fn(),
  deinitializeServicesAfterLogout: jest.fn(),
}));

interface MockAuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const makeValidUser = (overrides: Partial<User> = {}): User => ({
  id: '1',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  username: 'tester',
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
  displayName: 'Test User',
  squadId: null,
  avatar: undefined,
  bio: undefined,
  location: undefined,
  website: undefined,
  verified: false,
  role: 'user',
  status: 'active',
  preferences: {
    theme: 'system',
    language: 'en',
    notifications: {
      push: true,
      email: true,
      sms: false,
      inApp: true,
      digestFrequency: 'daily',
      quietHours: { enabled: false, start: '22:00', end: '08:00', timezone: 'UTC' },
    },
    privacy: {
      profileVisibility: 'public',
      activityStatus: true,
      readReceipts: true,
      allowTagging: true,
      allowMentions: true,
      dataSharing: false,
    },
    accessibility: {
      reduceMotion: false,
      highContrast: false,
      largeText: false,
      screenReaderOptimized: false,
    },
  },
  metadata: {
    loginCount: 1,
    deviceHistory: [],
  },
  onboardingCompletedAt: null,
  ...overrides,
});

const createMockState = (): MockAuthState => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
});

const createSetter = (state: MockAuthState) => {
  return (updater: (s: MockAuthState) => void) => { updater(state); };
};

describe('handleAuthCheckError', () => {
  it('sets loading false and error message', () => {
    const state = { ...createMockState(), isLoading: true };
    const setState = createSetter(state);
    handleAuthCheckError(setState, new Error('boom'));
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('boom');
  });

  it('treats non-network errors as auth failure', () => {
    const state = { ...createMockState(), isLoading: true, isAuthenticated: true, user: makeValidUser() };
    const setState = createSetter(state);
    handleAuthCheckError(setState, new Error('401 unauthorized'));
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('preserves auth state on network errors', () => {
    const state = { ...createMockState(), isLoading: true, isAuthenticated: true, user: makeValidUser() };
    const setState = createSetter(state);
    handleAuthCheckError(setState, new Error('network timeout'));
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(makeValidUser({ id: '1' }));
  });

  it('handles string errors', () => {
    const state = { ...createMockState(), isLoading: true };
    const setState = createSetter(state);
    handleAuthCheckError(setState, 'plain string');
    expect(state.error).toBe('Auth check failed');
  });

  it('detects various network error patterns', () => {
    const patterns = ['network error', 'request timeout', 'fetch failed', 'host unreachable', 'aborted'];
    for (const msg of patterns) {
      const state = { ...createMockState(), isLoading: true, isAuthenticated: true, user: makeValidUser() };
      const setState = createSetter(state);
      handleAuthCheckError(setState, new Error(msg));
      expect(state.isAuthenticated).toBe(true);
    }
  });
});