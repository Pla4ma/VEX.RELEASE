import fs from 'fs';
import path from 'path';
import * as canonicalStore from '../index';
import * as compatibilityStore from '../../store';
import { mockUser } from './auth-canonical-store.fixtures';

jest.mock('../../config/sentry', () => ({
  setSentryUser: jest.fn(),
  clearSentryUser: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock('../../shared/monetization/revenuecat-service', () => ({
  revenueCatService: {
    setUserId: jest.fn(),
    clearUserId: jest.fn(),
  },
}));

jest.mock('../../features/auth/service', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  getCurrentUser: jest.fn(),
  getCurrentSession: jest.fn(),
  resetPassword: jest.fn(),
  updatePassword: jest.fn(),
  onAuthStateChange: jest.fn(),
}));

jest.mock('../../persistence/SecureStorage', () => ({
  getSecureStorage: jest.fn(() => ({
    removeItem: jest.fn(),
    getItem: jest.fn(),
    setItem: jest.fn(),
  })),
  SecureStorageKeys: {
    AUTH_TOKEN: 'auth-token',
    REFRESH_TOKEN: 'refresh-token',
  },
}));

jest.mock('../../persistence/mmkv-key', () => ({
  getMmkvEncryptionKey: jest.fn(async () => 'test-key'),
  getMmkvEncryptionKeySync: jest.fn(() => 'test-key'),
}));

jest.mock('../authProfileStorage', () => ({
  saveUserProfile: jest.fn(),
  removeUserProfile: jest.fn(),
  loadUserProfile: jest.fn(),
}));

jest.mock('../../utils/debug', () => ({
  createDebugger: () => ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }),
}));

const { setSentryUser, clearSentryUser } = jest.requireMock(
  '../../config/sentry',
) as { setSentryUser: jest.Mock; clearSentryUser: jest.Mock };
const { revenueCatService } = jest.requireMock(
  '../../shared/monetization/revenuecat-service',
) as { revenueCatService: { setUserId: jest.Mock; clearUserId: jest.Mock } };
const { signIn, signUp, signOut, getCurrentUser } =
  jest.requireMock('../../features/auth/service') as {
    signIn: jest.Mock;
    signUp: jest.Mock;
    signOut: jest.Mock;
    getCurrentUser: jest.Mock;
  };

describe('canonical auth store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    canonicalStore.useAuthStore.setState({
      error: null,
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  });

  it('../store resolves to the canonical store exports', () => {
    expect(compatibilityStore.useAuthStore).toBe(canonicalStore.useAuthStore);
    expect(compatibilityStore.useAppStore).toBe(canonicalStore.useAppStore);
    expect(compatibilityStore.useUIStore).toBe(canonicalStore.useUIStore);
  });

  it('src/store.ts is only a compatibility re-export, not token auth', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'src', 'store.ts'),
      'utf8',
    );

    expect(source.trim()).toBe("export * from './store/index';");
    ['sessionToken', 'setSessionToken', 'SecureStorageKeys.AUTH_TOKEN'].forEach(
      (token) => {
        expect(source).not.toContain(token);
      },
    );
  });

  it('loginWithCredentials uses Supabase auth and binds user services', async () => {
    (signIn as jest.Mock).mockResolvedValueOnce({
      error: null,
      user: mockUser,
    });

    await expect(
      canonicalStore.useAuthStore
        .getState()
        .loginWithCredentials('test@example.com', 'password'),
    ).resolves.toBe(true);

    expect(signIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
    expect(setSentryUser).toHaveBeenCalledWith(
      mockUser.id,
      mockUser.email,
      mockUser.username,
    );
    expect(revenueCatService.setUserId).toHaveBeenCalledWith(mockUser.id);
  });

  it('register uses Supabase auth', async () => {
    (signUp as jest.Mock).mockResolvedValueOnce({
      error: null,
      user: mockUser,
    });

    await expect(
      canonicalStore.useAuthStore.getState().register({
        agreeToTerms: true,
        confirmPassword: 'Password1!',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'Password1!',
      }),
    ).resolves.toBe(true);

    expect(signUp).toHaveBeenCalledWith(
      { email: 'test@example.com', password: 'Password1!' },
      { firstName: 'Test', lastName: 'User' },
    );
  });

  it('checkAuth reflects Supabase current user', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);

    await canonicalStore.useAuthStore.getState().checkAuth();

    expect(canonicalStore.useAuthStore.getState().user).toEqual(mockUser);
    expect(canonicalStore.useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('logout clears Supabase session and app auth bindings', async () => {
    canonicalStore.useAuthStore.setState({
      isAuthenticated: true,
      user: mockUser,
    });
    (signOut as jest.Mock).mockResolvedValueOnce({ error: null });

    await canonicalStore.useAuthStore.getState().logout();

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(canonicalStore.useAuthStore.getState().user).toBeNull();
    expect(canonicalStore.useAuthStore.getState().isAuthenticated).toBe(false);
    expect(clearSentryUser).toHaveBeenCalledTimes(1);
    expect(revenueCatService.clearUserId).toHaveBeenCalledTimes(1);
  });
});
