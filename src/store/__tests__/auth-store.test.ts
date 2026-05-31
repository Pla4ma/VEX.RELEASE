import { useAuthStore } from '../index';
import {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getCurrentUser,
} from '../../services/supabaseAuth';
import {
  captureException,
  clearSentryUser,
  setSentryUser,
} from '../../config/sentry';
import { revenueCatService } from '../../shared/monetization/revenuecat-service';

jest.mock('../../services/supabaseAuth', () => ({
  getCurrentUser: jest.fn(),
  onAuthStateChange: jest.fn(),
  signInWithEmail: jest.fn(),
  signOut: jest.fn(),
  signUpWithEmail: jest.fn(),
}));

jest.mock('../../config/sentry', () => ({
  clearSentryUser: jest.fn(),
  captureException: jest.fn(),
  setSentryUser: jest.fn(),
}));

jest.mock('../../shared/monetization/revenuecat-service', () => ({
  revenueCatService: {
    clearUserId: jest.fn(),
    setUserId: jest.fn(),
  },
}));

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
      removeItem: (key: string) => {
        store.delete(key);
        return Promise.resolve();
      },
      setItem: (key: string, value: string) => {
        store.set(key, value);
        return Promise.resolve();
      },
    }),
  };
});

jest.mock('../../utils/debug', () => ({
  createDebugger: () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  }),
}));

const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  username: 'testuser',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('useAuthStore auth actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      error: null,
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  });

  it('returns false instead of rejecting when sign in throws unexpectedly', async () => {
    jest
      .mocked(signInWithEmail)
      .mockRejectedValueOnce(new Error('native auth crash'));

    await expect(
      useAuthStore
        .getState()
        .loginWithCredentials('user@example.com', 'password'),
    ).resolves.toBe(false);

    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(useAuthStore.getState().error).toBe('native auth crash');
    expect(captureException).toHaveBeenCalledTimes(1);
  });

  it('returns false instead of rejecting when sign up throws unexpectedly', async () => {
    jest
      .mocked(signUpWithEmail)
      .mockRejectedValueOnce(new Error('native signup crash'));

    await expect(
      useAuthStore.getState().register({
        agreeToTerms: true,
        confirmPassword: 'Password1!',
        email: 'user@example.com',
        firstName: 'Vex',
        lastName: 'User',
        password: 'Password1!',
      }),
    ).resolves.toBe(false);

    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(useAuthStore.getState().error).toBe('native signup crash');
    expect(captureException).toHaveBeenCalledTimes(1);
  });

  describe('checkAuth', () => {
    it('preserves user state on network error during checkAuth', async () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true });
      jest
        .mocked(getCurrentUser)
        .mockRejectedValueOnce(new Error('network timeout'));

      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(clearSentryUser).not.toHaveBeenCalled();
    });

    it('clears user state on auth-specific error during checkAuth', async () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true });
      jest
        .mocked(getCurrentUser)
        .mockRejectedValueOnce(new Error('Auth session missing'));

      await useAuthStore.getState().checkAuth();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(clearSentryUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout', () => {
    it('does not clear state when signOut fails', async () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true });
      jest
        .mocked(signOut)
        .mockResolvedValueOnce({ error: new Error('sign out failed') });

      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(captureException).toHaveBeenCalledTimes(1);
    });

    it('clears state when signOut succeeds', async () => {
      useAuthStore.setState({ user: mockUser, isAuthenticated: true });
      jest.mocked(signOut).mockResolvedValueOnce({ error: null });
      jest.mocked(revenueCatService.clearUserId).mockResolvedValue(true);

      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });
});
