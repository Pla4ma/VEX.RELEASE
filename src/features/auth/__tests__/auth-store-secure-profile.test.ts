import { useAuthStore } from '../../../store';
import {
  getCurrentUser,
  signInWithEmail,
  signOut,
  signUpWithEmail,
} from '../../../services/supabaseAuth';
import { authTestUser } from './auth-test-user';

const mockSecureStorage = {
  getItem: jest.fn<Promise<string | null>, [string]>(),
  removeItem: jest.fn<Promise<void>, [string]>(),
  setItem: jest.fn<Promise<void>, [string, string]>(),
};

jest.mock('../../../services/supabaseAuth', () => ({
  getCurrentUser: jest.fn(),
  signInWithEmail: jest.fn(),
  signOut: jest.fn(),
  signUpWithEmail: jest.fn(),
}));
jest.mock('../../../persistence/SecureStorage', () => ({
  getSecureStorage: () => mockSecureStorage,
  SecureStorageKeys: {
    AUTH_TOKEN: 'vex_auth_token',
    REFRESH_TOKEN: 'vex_refresh_token',
    USER_PROFILE: 'vex_user_profile',
  },
}));
jest.mock('../../../persistence/MMKVStorageAdapter', () => ({
  getMMKVStorageAdapter: () => ({
    getItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(undefined),
    setItem: jest.fn().mockResolvedValue(undefined),
  }),
}));
jest.mock('../../../config/sentry', () => ({
  captureException: jest.fn(),
  clearSentryUser: jest.fn(),
  setSentryUser: jest.fn(),
}));
jest.mock('../../../shared/monetization/revenuecat-service', () => ({
  revenueCatService: { clearUserId: jest.fn(), setUserId: jest.fn() },
}));
jest.mock('../../../services/streakService', () => ({
  streakService: { reset: jest.fn(), setUserId: jest.fn() },
}));
jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({ error: jest.fn(), info: jest.fn(), warn: jest.fn() }),
}));

describe('auth secure profile persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecureStorage.getItem.mockResolvedValue(null);
    mockSecureStorage.removeItem.mockResolvedValue(undefined);
    mockSecureStorage.setItem.mockResolvedValue(undefined);
    useAuthStore.setState({
      error: null,
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  });

  it('writes user profile to SecureStorage after login', async () => {
    jest.mocked(signInWithEmail).mockResolvedValueOnce({
      error: null,
      user: authTestUser,
    });

    await useAuthStore
      .getState()
      .loginWithCredentials('test@example.com', 'Password1!');

    expect(mockSecureStorage.setItem).toHaveBeenCalledWith(
      'vex_user_profile',
      JSON.stringify(authTestUser),
    );
  });

  it('removes user profile from SecureStorage on logout', async () => {
    useAuthStore.setState({ isAuthenticated: true, user: authTestUser });
    jest.mocked(signOut).mockResolvedValueOnce({ error: null });

    await useAuthStore.getState().logout();

    expect(mockSecureStorage.removeItem).toHaveBeenCalledWith(
      'vex_user_profile',
    );
  });

  it('hydrates stored profile before checkAuth network validation', async () => {
    mockSecureStorage.getItem.mockResolvedValueOnce(JSON.stringify(authTestUser));
    jest.mocked(getCurrentUser).mockImplementationOnce(() => {
      expect(useAuthStore.getState().user).toEqual(authTestUser);
      return Promise.resolve({ error: null, user: authTestUser });
    });

    await useAuthStore.getState().checkAuth();

    expect(getCurrentUser).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().user).toEqual(authTestUser);
  });
});
