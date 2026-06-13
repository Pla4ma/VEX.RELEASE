import { captureException, clearSentryUser } from '../config/sentry';
import { getSecureStorage, SecureStorageKeys } from '../persistence/SecureStorage';
import * as authService from '../features/auth/service';
import { createDebugger } from '../utils/debug';
import type { User } from '../types/models';
import { removeUserProfile } from './authProfileStorage';
import { handleAuthCheckError, hydrateStoredProfile, setSignedOut } from './authStoreActionHelpers';
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
    return;
  }
  const secureStorage = getSecureStorage();
  await secureStorage.removeItem(SecureStorageKeys.AUTH_TOKEN);
  await secureStorage.removeItem(SecureStorageKeys.REFRESH_TOKEN);
  await removeUserProfile();
  setSignedOut(set);
  resetServiceSingletonsForLogout();
  clearSentryUser();
  deinitializeServicesAfterLogout();
}

export async function checkAuthUser(
  set: AuthStateSetter,
  finishLogin: (user: User) => Promise<void>,
  setAuthLoading: (set: AuthStateSetter) => void,
): Promise<void> {
  setAuthLoading(set);
  try {
    await hydrateStoredProfile(set);
    const user = await authService.getCurrentUser();
    if (user) {
      await finishLogin(user);
      return;
    }
    setSignedOut(set);
    clearSentryUser();
    deinitializeServicesAfterLogout();
  } catch (err) {
    handleAuthCheckError(set, err);
  }
}
