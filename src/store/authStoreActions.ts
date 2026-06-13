import { captureException, setSentryUser } from '../config/sentry';
import * as authService from '../features/auth/service';
import type { User } from '../types/models';
import { saveUserProfile } from './authProfileStorage';
import { setAuthenticatedUser, toError } from './authStoreActionHelpers';
import { initializeServicesAfterAuth } from './authStoreIntegrations';
import type { AuthState, AuthStateSetter } from './authStoreTypes';
import { checkAuthUser, logoutUser } from './authSessionActions';
import {
  beginSignup,
  canSubmitSignup,
  finishSignup,
  normalizeSignupEmail,
} from './signupGuard';

type AuthActions = Omit<
  AuthState,
  'error' | 'isAuthenticated' | 'isLoading' | 'user'
>;

async function finishLogin(set: AuthStateSetter, user: User): Promise<void> {
  setAuthenticatedUser(set, user);
  await saveUserProfile(user);
  setSentryUser(user.id, user.email, user.username);
  initializeServicesAfterAuth(user);
}

function setAuthLoading(set: AuthStateSetter): void {
  set((state) => {
    state.isLoading = true;
    state.error = null;
  });
}

function setAuthError(set: AuthStateSetter, error: string): void {
  set((state) => {
    state.isLoading = false;
    state.error = error;
  });
}

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
        setAuthLoading(set);
        const { user, error } = await authService.signIn({ email, password });
        if (error || !user) {
          setAuthError(set, error?.message ?? 'Sign in failed');
          return false;
        }
        await finishLogin(set, user);
        return true;
      } catch (err) {
        setAuthError(set, toError(err).message);
        captureException(toError(err), { tags: { feature: 'auth-login' } });
        return false;
      }
    },
    loginWithOAuth: async (provider) => {
      try {
        setAuthLoading(set);
        const { user, error } = await authService.startOAuthSignIn(provider);
        if (!error && !user) {
          set((state) => {
            state.isLoading = false;
            state.error = null;
          });
          return true;
        }
        if (error || !user) {
          setAuthError(set, error?.message ?? 'Social sign in failed');
          return false;
        }
        await finishLogin(set, user);
        return true;
      } catch (err) {
        setAuthError(set, toError(err).message);
        captureException(toError(err), { tags: { feature: 'auth-oauth-start' } });
        return false;
      }
    },
    completeOAuthCallback: async (url) => {
      try {
        setAuthLoading(set);
        const { user, error } = await authService.completeOAuthCallback(url);
        if (error || !user) {
          setAuthError(set, error?.message ?? 'Social sign in failed');
          return false;
        }
        await finishLogin(set, user);
        return true;
      } catch (err) {
        setAuthError(set, toError(err).message);
        captureException(toError(err), { tags: { feature: 'auth-oauth-callback' } });
        return false;
      }
    },
    register: async (data) => {
      const email = normalizeSignupEmail(data.email);
      let sentVerification = false;
      if (!canSubmitSignup(email)) {
        setAuthError(set, 'Verification email already sent. Check your inbox before requesting another.');
        return false;
      }
      try {
        beginSignup(email);
        setAuthLoading(set);
        const { user, error } = await authService.signUp(
          { email, password: data.password },
          { firstName: data.firstName, lastName: data.lastName },
        );
        if (error || !user) {
          const message = error?.message ?? 'Verification email sent. Check your inbox to finish setup.';
          if (!error) {
            sentVerification = true;
          }
          setAuthError(set, message);
          return false;
        }
        await finishLogin(set, user);
        return true;
      } catch (err) {
        setAuthError(set, toError(err).message);
        captureException(toError(err), { tags: { feature: 'auth-register' } });
        return false;
      } finally {
        finishSignup(email, sentVerification);
      }
    },
    logout: () => logoutUser(set),
    checkAuth: () => checkAuthUser(set, (user) => finishLogin(set, user), setAuthLoading),
  };
}
