import { deleteAccount } from '../service';
import { deleteCurrentUser, signOutCurrentSession } from '../repository';
import { revenueCatService } from '../../../shared/monetization/revenuecat-service';
import {
  getDefaultStorageAdapter,
  getMMKVStorageAdapter,
  getSecureStorage,
  SecureStorageKeys,
} from '../../../persistence';
import {
  captureAccountDeletionError,
  trackAccountDeletionCompleted,
  trackAccountDeletionStarted,
} from '../analytics';
import { emitAccountDeletionCompleted } from '../events';

jest.mock('../repository');
jest.mock('../analytics', () => ({
  captureAccountDeletionError: jest.fn(),
  trackAccountDeletionCompleted: jest.fn(),
  trackAccountDeletionStarted: jest.fn(),
}));
jest.mock('../events', () => ({ emitAccountDeletionCompleted: jest.fn() }));
jest.mock('../../../config/sentry', () => ({ clearSentryUser: jest.fn() }));
jest.mock('../../../shared/monetization/revenuecat-service', () => ({
  revenueCatService: { clearUserId: jest.fn() },
}));
jest.mock('../../../persistence', () => ({
  SecureStorageKeys: {
    AUTH_TOKEN: 'vex_auth_token',
    REFRESH_TOKEN: 'vex_refresh_token',
    USER_CREDENTIALS: 'vex_user_credentials',
  },
  getDefaultStorageAdapter: jest.fn(),
  getMMKVStorageAdapter: jest.fn(),
  getSecureStorage: jest.fn(),
}));

const deleteCurrentUserMock = jest.mocked(deleteCurrentUser);
const signOutCurrentSessionMock = jest.mocked(signOutCurrentSession);
const clearUserIdMock = jest.mocked(revenueCatService.clearUserId);
const getDefaultStorageAdapterMock = jest.mocked(getDefaultStorageAdapter);
const getMMKVStorageAdapterMock = jest.mocked(getMMKVStorageAdapter);
const getSecureStorageMock = jest.mocked(getSecureStorage);

const secureStorageMock: ReturnType<typeof getSecureStorage> = {
  clear: jest.fn(),
  clearCredentials: jest.fn(),
  containsKey: jest.fn(),
  getAllKeys: jest.fn(),
  getCredentials: jest.fn(),
  getItem: jest.fn(),
  getSize: jest.fn(),
  removeItem: jest.fn(),
  setCredentials: jest.fn(),
  setItem: jest.fn(),
};

const defaultStorageMock: ReturnType<typeof getDefaultStorageAdapter> = {
  clear: jest.fn(),
  containsKey: jest.fn(),
  getAllKeys: jest.fn(),
  getItem: jest.fn(),
  getItemSync: jest.fn(),
  getJSON: jest.fn(),
  getJSONSync: jest.fn(),
  getSize: jest.fn(),
  removeItem: jest.fn(),
  removeItemSync: jest.fn(),
  setItem: jest.fn(),
  setItemSync: jest.fn(),
  setJSON: jest.fn(),
  setJSONSync: jest.fn(),
};

const zustandStorageMock: ReturnType<typeof getMMKVStorageAdapter> = {
  getItem: jest.fn(),
  removeItem: jest.fn(),
  setItem: jest.fn(),
};

describe('account deletion — comprehensive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    deleteCurrentUserMock.mockResolvedValue(undefined);
    signOutCurrentSessionMock.mockResolvedValue(undefined);
    clearUserIdMock.mockResolvedValue(true);
    jest.mocked(secureStorageMock.removeItem).mockResolvedValue(undefined);
    jest.mocked(defaultStorageMock.clear).mockResolvedValue(undefined);
    jest.mocked(zustandStorageMock.removeItem).mockResolvedValue(undefined);
    getSecureStorageMock.mockReturnValue(secureStorageMock);
    getDefaultStorageAdapterMock.mockReturnValue(defaultStorageMock);
    getMMKVStorageAdapterMock.mockReturnValue(zustandStorageMock);
  });

  it('deletes Supabase auth and clears all local state', async () => {
    const result = await deleteAccount({
      userId: '550e8400-e29b-41d4-a716-446655440001',
    });

    expect(deleteCurrentUserMock).toHaveBeenCalledTimes(1);
    expect(deleteCurrentUserMock).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440001');
    expect(clearUserIdMock).toHaveBeenCalledTimes(1);
    expect(getDefaultStorageAdapter().clear).toHaveBeenCalledTimes(1);
    expect(getMMKVStorageAdapter().removeItem).toHaveBeenCalledWith(
      'auth-storage',
    );
    expect(result).toMatchObject({
      userId: '550e8400-e29b-41d4-a716-446655440001',
      localStorageCleared: true,
      secureStorageCleared: true,
      monetizationSignedOut: true,
    });
    expect(result.deletedAt).toBeGreaterThan(0);
  });

  it('clears all secure storage keys', async () => {
    await deleteAccount({
      userId: '550e8400-e29b-41d4-a716-446655440002',
    });

    expect(secureStorageMock.removeItem).toHaveBeenCalledWith('vex_auth_token');
    expect(secureStorageMock.removeItem).toHaveBeenCalledWith(
      'vex_refresh_token',
    );
    expect(secureStorageMock.removeItem).toHaveBeenCalledWith(
      'vex_user_credentials',
    );
  });

  it('tracks deletion start and completion analytics', async () => {
    const userId = '550e8400-e29b-41d4-a716-446655440003';
    await deleteAccount({ userId });

    expect(trackAccountDeletionStarted).toHaveBeenCalledWith(userId);
    expect(trackAccountDeletionCompleted).toHaveBeenCalledWith(userId);
  });

  it('emits deletion completed event', async () => {
    const userId = '550e8400-e29b-41d4-a716-446655440004';
    await deleteAccount({ userId });

    expect(emitAccountDeletionCompleted).toHaveBeenCalledTimes(1);
    const emittedResult = jest.mocked(emitAccountDeletionCompleted).mock
      .calls[0]![0];
    expect(emittedResult.userId).toBe(userId);
    expect(emittedResult.localStorageCleared).toBe(true);
  });

  it('throws AccountDeletionServiceError when Supabase deletion fails', async () => {
    deleteCurrentUserMock.mockRejectedValue(new Error('Supabase RPC error'));

    await expect(
      deleteAccount({
        userId: '550e8400-e29b-41d4-a716-446655440005',
      }),
    ).rejects.toThrow('Account deletion failed during deleteAccount');
    expect(captureAccountDeletionError).toHaveBeenCalled();
  });

  it('continues even if monetization sign out fails', async () => {
    clearUserIdMock.mockRejectedValue(new Error('RevenueCat error'));

    const result = await deleteAccount({
      userId: '550e8400-e29b-41d4-a716-446655440006',
    });

    expect(result.monetizationSignedOut).toBe(false);
    expect(result.localStorageCleared).toBe(true);
    expect(result.secureStorageCleared).toBe(true);
  });

  it('continues even if session sign out fails', async () => {
    signOutCurrentSessionMock.mockRejectedValue(new Error('Sign out error'));

    const result = await deleteAccount({
      userId: '550e8400-e29b-41d4-a716-446655440007',
    });

    expect(result.localStorageCleared).toBe(true);
    expect(captureAccountDeletionError).toHaveBeenCalledWith(
      expect.any(Error),
      'signOutCurrentSession',
    );
  });

  it('rejects invalid input', async () => {
    await expect(
      deleteAccount({ userId: 'not-a-uuid' }),
    ).rejects.toThrow();
  });
});

describe('deleteCurrentUser — confirmation token validation', () => {
  it('rejects empty confirmation token', async () => {
    const { deleteCurrentUser: realDeleteCurrentUser } = jest.requireActual<
      typeof import('../repository')
    >('../repository');

    await expect(realDeleteCurrentUser('')).rejects.toThrow(
      'Confirmation token must be a non-empty string',
    );
  });
});
