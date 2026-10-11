import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('../../features/auth/service', () => ({
  signOut: jest.fn(async () => {
    throw new Error('network unavailable');
  }),
}));
jest.mock('../../persistence/SecureStorage', () => ({
  SecureStorageKeys: { AUTH_TOKEN: 'auth', REFRESH_TOKEN: 'refresh' },
  getSecureStorage: () => ({
    removeItem: jest.fn(async () => undefined),
  }),
}));
jest.mock('../authProfileStorage', () => ({
  removeUserProfile: jest.fn(async () => undefined),
}));
jest.mock('../authStoreIntegrations', () => ({
  deinitializeServicesAfterLogout: jest.fn(),
  resetServiceSingletonsForLogout: jest.fn(),
}));

import { useAuthStore } from '../authStore';
import { queryClient } from '../../api/QueryProvider';

describe('auth logout cleanup', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: true,
      isLoading: false,
      authStatus: 'authenticated',
      error: null,
    });
  });
  it('clears local identity and query cache when remote sign out fails', async () => {
    queryClient.setQueryData(['private', 'user'], { secret: 'stale' });
    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.authStatus).toBe('signed_out');
    expect(state.user).toBeNull();
    expect(queryClient.getQueryData(['private', 'user'])).toBeUndefined();
  });
});
