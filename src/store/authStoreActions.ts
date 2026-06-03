import {
  clearSentryUser,
  captureException,
  setSentryUser,
} from '../config/sentry';
import {
  getSecureStorage,
  SecureStorageKeys,
} from '../persistence/SecureStorage';
import * as authService from '../features/auth/service';
import type { User } from '../types/models';
import { createDebugger } from '../utils/debug';
import {
  removeUserProfile,
  saveUserProfile,
} from './authProfileStorage';
import {
  handleAuthCheckError,
  hydrateStoredProfile,
  setAuthenticatedUser,
  setSignedOut,
  toError,
} from './authStoreActionHelpers';
import {
  deinitializeServicesAfterLogout,
  initializeServicesAfterAuth,
  resetServiceSingletonsForLogout,
} from './authStoreIntegrations';
import type { AuthState, AuthStateSetter } from './authStoreTypes';

const debug = createDebugger('store:auth');

type AuthActions = Omit<
  AuthState,
  'error' | 'isAuthenticated' | 'isLoading' | 'user'
>;

export function createAuthActions(set: AuthStateSetter): AuthActions {
  return {
    setUser: (user) =>
      set((state) => {
        state.user = user;
        state.isAuthenticated = true;
      }),
    clearUser: () =>
      set((state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      }),
    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),
    setError: (error) =>
      set((state) => {
        state.error = error;
      }),
    clearError: () =>
      set((state) => {
        state.error = null;
      }),
    login: (user: User) => {
      set((state) => {
        state.user = user;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      });
    },
    loginWithCredentials: async (email, password) => {
      try {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        const { user, error } = await authService.signIn({ email, password });
        if (error || !user) {
          set((state) => {
            state.isLoading = false;
            state.error = error?.message ?? 'Sign in failed';
          });
          return false;
        }
        setAuthenticatedUser(set, user);
        await saveUserProfile(user);
        setSentryUser(user.id, user.email, user.username);
        initializeServicesAfterAuth(user);
        return true;
      } catch (err) {
        set((state) => {
          state.isLoading = false;
          state.error = toError(err).message;
        });
        captureException(toError(err), { tags: { feature: 'auth-login' } });
        return false;
      }
    },
    register: async (data) => {
      try {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        const { user, error } = await authService.signUp(
          { email: data.email, password: data.password },
          { firstName: data.firstName, lastName: data.lastName },
        );
        if (error || !user) {
          set((state) => {
            state.isLoading = false;
            state.error = error?.message ?? 'Registration failed';
          });
          return false;
        }
        setAuthenticatedUser(set, user);
        await saveUserProfile(user);
        setSentryUser(user.id, user.email, user.username);
        initializeServicesAfterAuth(user);
        return true;
      } catch (err) {
        set((state) => {
          state.isLoading = false;
          state.error = toError(err).message;
        });
        captureException(toError(err), { tags: { feature: 'auth-register' } });
        return false;
      }
    },
    logout: async () => {
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
    },
    checkAuth: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        await hydrateStoredProfile(set);
        const user = await authService.getCurrentUser();
        if (user) {
          setAuthenticatedUser(set, user);
          await saveUserProfile(user);
          setSentryUser(user.id, user.email, user.username);
          initializeServicesAfterAuth(user);
          return;
        }
        setSignedOut(set);
        clearSentryUser();
        deinitializeServicesAfterLogout();
      } catch (err) {
        handleAuthCheckError(set, err);
      }
    },
  };
}
