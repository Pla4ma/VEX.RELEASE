import { useAuthStore } from '../index';
import { signInWithEmail, signUpWithEmail } from '../../services/supabaseAuth';
import { captureException } from '../../config/sentry';

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
    jest.mocked(signInWithEmail).mockRejectedValueOnce(new Error('native auth crash'));

    await expect(
      useAuthStore.getState().loginWithCredentials('user@example.com', 'password')
    ).resolves.toBe(false);

    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(useAuthStore.getState().error).toBe('native auth crash');
    expect(captureException).toHaveBeenCalledTimes(1);
  });

  it('returns false instead of rejecting when sign up throws unexpectedly', async () => {
    jest.mocked(signUpWithEmail).mockRejectedValueOnce(new Error('native signup crash'));

    await expect(
      useAuthStore.getState().register({
        agreeToTerms: true,
        confirmPassword: 'Password1!',
        email: 'user@example.com',
        firstName: 'Vex',
        lastName: 'User',
        password: 'Password1!',
      })
    ).resolves.toBe(false);

    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(useAuthStore.getState().error).toBe('native signup crash');
    expect(captureException).toHaveBeenCalledTimes(1);
  });
});
