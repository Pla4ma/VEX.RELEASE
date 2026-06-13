import {
  setAuthenticatedUser,
  setSignedOut,
  toError,
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

describe('authStoreActionHelpers', () => {
  describe('toError', () => {
    it('returns Error as-is', () => {
      const err = new Error('test');
      expect(toError(err)).toBe(err);
    });

    it('wraps string in Error', () => {
      const result = toError('something failed');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('something failed');
    });

    it('wraps number in Error', () => {
      const result = toError(42);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('42');
    });

    it('wraps object in Error', () => {
      const result = toError({ code: 500 });
      expect(result.message).toBe('[object Object]');
    });
  });

  describe('setAuthenticatedUser', () => {
    it('sets user and authenticated state', () => {
      const state = createMockState();
      const setState = createSetter(state);
      const user = makeValidUser();
      setAuthenticatedUser(setState, user);
      expect(state.user).toBe(user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('setSignedOut', () => {
    it('clears user and auth state', () => {
      const state = { ...createMockState(), user: makeValidUser(), isAuthenticated: true };
      const setState = createSetter(state);
      setSignedOut(setState);
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});