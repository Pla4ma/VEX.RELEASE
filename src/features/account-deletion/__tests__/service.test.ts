import { deleteAccount } from '../service';
import { deleteCurrentUser, signOutCurrentSession } from '../repository';
import { revenueCatService } from '../../../shared/monetization/revenuecat-service';
import { getDefaultStorageAdapter, getMMKVStorageAdapter, getSecureStorage } from '../../../persistence';

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

describe('account deletion service', () => {
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

  it('deletes Supabase auth and clears local secure monetization state', async () => {
    const result = await deleteAccount({ userId: '550e8400-e29b-41d4-a716-446655440001' });

    expect(deleteCurrentUserMock).toHaveBeenCalledTimes(1);
    expect(clearUserIdMock).toHaveBeenCalledTimes(1);
    expect(getDefaultStorageAdapter().clear).toHaveBeenCalledTimes(1);
    expect(getMMKVStorageAdapter().removeItem).toHaveBeenCalledWith('auth-storage');
    expect(getSecureStorage().removeItem).toHaveBeenCalledWith('vex_auth_token');
    expect(result).toMatchObject({
      userId: '550e8400-e29b-41d4-a716-446655440001',
      localStorageCleared: true,
      secureStorageCleared: true,
      monetizationSignedOut: true,
    });
  });
});
