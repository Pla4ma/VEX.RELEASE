import { clearSentryUser } from '../../../config/sentry';
import {
  getDefaultStorageAdapter,
  getMMKVStorageAdapter,
} from '../../../persistence/MMKVStorageAdapter';
import { getSecureStorage } from '../../../persistence/SecureStorage';
import { revenueCatService } from '../../../shared/monetization/revenuecat-service';
import { captureAccountDeletionError } from '../analytics';
import { emitAccountDeletionCompleted } from '../events';
import { deleteCurrentUser, signOutCurrentSession } from '../repository';
import { deleteAccount } from '../service';
import {
  defaultStorageMock,
  secureStorageMock,
  zustandStorageMock,
} from './test-helpers';

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
jest.mock('../../../persistence/SecureStorage', () => ({
  SecureStorageKeys: {
    AUTH_TOKEN: 'vex_auth_token',
    REFRESH_TOKEN: 'vex_refresh_token',
    USER_CREDENTIALS: 'vex_user_credentials',
  },
  getSecureStorage: jest.fn(),
}));
jest.mock('../../../persistence/MMKVStorageAdapter', () => ({
  getDefaultStorageAdapter: jest.fn(),
  getMMKVStorageAdapter: jest.fn(),
}));

const deleteCurrentUserMock = jest.mocked(deleteCurrentUser);
const signOutCurrentSessionMock = jest.mocked(signOutCurrentSession);
const clearUserIdMock = jest.mocked(revenueCatService.clearUserId);
const getSecureStorageMock = jest.mocked(getSecureStorage);
const getDefaultStorageAdapterMock = jest.mocked(getDefaultStorageAdapter);
const getMMKVStorageAdapterMock = jest.mocked(getMMKVStorageAdapter);

const userId = '550e8400-e29b-41d4-a716-446655440008';

describe('account deletion after remote success', () => {
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

  it.each<[string, () => void, boolean, string]>([
    [
      'secure storage',
      () => {
        jest.mocked(secureStorageMock.removeItem).mockRejectedValue(new Error('secure failure'));
      },
      true,
      'clearSecureStorage',
    ],
    [
      'default storage',
      () => {
        jest.mocked(defaultStorageMock.clear).mockRejectedValue(new Error('default failure'));
      },
      true,
      'clearDefaultStorage',
    ],
    [
      'auth storage',
      () => {
        jest.mocked(zustandStorageMock.removeItem).mockRejectedValue(new Error('auth failure'));
      },
      true,
      'clearAuthStorage',
    ],
    [
      'RevenueCat',
      () => {
        clearUserIdMock.mockRejectedValue(new Error('RevenueCat failure'));
      },
      true,
      'signOutMonetization',
    ],
    [
      'session sign-out',
      () => {
        signOutCurrentSessionMock.mockRejectedValue(new Error('sign-out failure'));
      },
      false,
      'signOutCurrentSession',
    ],
  ])(
    'resolves as deleted and clears auth/Sentry when %s fails',
    async (_name, rejectCleanup, sessionSignedOut, operation) => {
      rejectCleanup();

      const result = await deleteAccount({ userId });

      expect(result.userId).toBe(userId);
      expect(result.sessionSignedOut).toBe(sessionSignedOut);
      expect(signOutCurrentSessionMock).toHaveBeenCalledTimes(1);
      expect(clearSentryUser).toHaveBeenCalledTimes(1);
      expect(emitAccountDeletionCompleted).toHaveBeenCalledWith(result);
      expect(captureAccountDeletionError).toHaveBeenCalledWith(
        expect.any(Error),
        operation,
      );
    },
  );
  it('does not claim deletion when the remote RPC rejects', async () => {
    const failure = new Error('remote deletion rejected');
    deleteCurrentUserMock.mockRejectedValue(failure);

    await expect(deleteAccount({ userId })).rejects.toThrow(
      'Account deletion failed during deleteAccount',
    );

    expect(signOutCurrentSessionMock).not.toHaveBeenCalled();
    expect(clearSentryUser).not.toHaveBeenCalled();
    expect(emitAccountDeletionCompleted).not.toHaveBeenCalled();
    expect(captureAccountDeletionError).toHaveBeenCalledWith(failure, 'deleteAccount');
  });

  it('captures Sentry identity cleanup failure without changing deletion success', async () => {
    const failure = new Error('Sentry cleanup rejected');
    jest.mocked(clearSentryUser).mockImplementation(() => {
      throw failure;
    });

    const result = await deleteAccount({ userId });

    expect(result.sentryIdentityCleared).toBe(false);
    expect(
      captureAccountDeletionError,
    ).toHaveBeenCalledWith(failure, 'clearSentryUser');
  });
  it('keeps remote deletion successful when completion notification fails', async () => {
    const notificationFailure = new Error('completion listener failed');
    jest.mocked(emitAccountDeletionCompleted).mockImplementation(() => {
      throw notificationFailure;
    });

    const result = await deleteAccount({ userId });

    expect(result.userId).toBe(userId);
    expect(captureAccountDeletionError).toHaveBeenCalledWith(
      notificationFailure,
      'emitAccountDeletionCompleted',
    );
  });
});

