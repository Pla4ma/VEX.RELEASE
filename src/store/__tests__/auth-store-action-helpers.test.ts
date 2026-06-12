import {
  setAuthenticatedUser,
  setSignedOut,
  toError,
  handleAuthCheckError,
} from '../authStoreActionHelpers';

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

describe('authStoreActionHelpers', () => {
  const createMockState = () => ({
    user: null as any,
    isAuthenticated: false,
    isLoading: false,
    error: null as string | null,
  });

  const createSetter = (state: ReturnType<typeof createMockState>) => {
    return (updater: (s: typeof state) => void) => { updater(state); };
  };

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
      const user = { id: '1', email: 'test@test.com', username: 'tester' } as any;
      setAuthenticatedUser(setState, user);
      expect(state.user).toBe(user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('setSignedOut', () => {
    it('clears user and auth state', () => {
      const state = { ...createMockState(), user: { id: '1' }, isAuthenticated: true };
      const setState = createSetter(state as any);
      setSignedOut(setState);
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('handleAuthCheckError', () => {
    it('sets loading false and error message', () => {
      const state = { ...createMockState(), isLoading: true };
      const setState = createSetter(state);
      handleAuthCheckError(setState, new Error('boom'));
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('boom');
    });

    it('treats non-network errors as auth failure', () => {
      const state = { ...createMockState(), isLoading: true, isAuthenticated: true, user: { id: '1' } };
      const setState = createSetter(state as any);
      handleAuthCheckError(setState, new Error('401 unauthorized'));
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });

    it('preserves auth state on network errors', () => {
      const state = { ...createMockState(), isLoading: true, isAuthenticated: true, user: { id: '1' } };
      const setState = createSetter(state as any);
      handleAuthCheckError(setState, new Error('network timeout'));
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual({ id: '1' });
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
        const state = { ...createMockState(), isLoading: true, isAuthenticated: true, user: { id: '1' } };
        const setState = createSetter(state as any);
        handleAuthCheckError(setState, new Error(msg));
        expect(state.isAuthenticated).toBe(true);
      }
    });
  });
});
