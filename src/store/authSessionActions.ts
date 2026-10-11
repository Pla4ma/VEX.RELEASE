import { captureException, clearSentryUser } from '../config/sentry';
import { queryClient } from '../api/QueryProvider';
import { clearQueue } from '../lib/offline/queue';
import { getSecureStorage, SecureStorageKeys } from '../persistence/SecureStorage';
import * as authService from '../features/auth/service';
import { createDebugger } from '../utils/debug';
import type { User } from '../types/models';
import { removeUserProfile } from './authProfileStorage';
import { handleAuthCheckError, setSignedOut } from './authStoreActionHelpers';
import { clearFeatureAccessMap } from '../features/liveops-config/feature-access-store';
import {
  deinitializeServicesAfterLogout,
  resetServiceSingletonsForLogout,
} from './authStoreIntegrations';
import type { AuthStateSetter } from './authStoreTypes';

const debug = createDebugger('store:auth');

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error('Unknown auth error');
}

export async function logoutUser(set: AuthStateSetter): Promise<void> {
  try {
    await authService.signOut();
  } catch (signOutError) {
    debug.error('[AuthStore] Sign out failed:', signOutError);
    captureException(toError(signOutError), { tags: { feature: 'auth-logout' } });
  }

  try {
    const secureStorage = getSecureStorage();
    await Promise.all([
      secureStorage.removeItem(SecureStorageKeys.AUTH_TOKEN),
      secureStorage.removeItem(SecureStorageKeys.REFRESH_TOKEN),
      removeUserProfile(),
    ]);
  } catch (cleanupError) {
    debug.error('[AuthStore] Local auth cleanup failed:', cleanupError);
    captureException(toError(cleanupError), {
      tags: { feature: 'auth-logout-cleanup' },
    });
  } finally {
    setSignedOut(set);
    clearQueue();
    clearFeatureAccessMap();
    queryClient.clear();
    resetServiceSingletonsForLogout();
    clearSentryUser();
    deinitializeServicesAfterLogout();
  }
}

export async function checkAuthUser(
  set: AuthStateSetter,
  finishLogin: (user: User) => Promise<void>,
  setAuthLoading: (set: AuthStateSetter) => void,
): Promise<void> {
  setAuthLoading(set);
  try {
    const user = await authService.getCurrentUser();
    if (user) {
      await finishLogin(user);
      return;
    }
    setSignedOut(set);
    queryClient.clear();
    clearSentryUser();
    deinitializeServicesAfterLogout();
  } catch (err) {
    handleAuthCheckError(set, err);
  }
}
