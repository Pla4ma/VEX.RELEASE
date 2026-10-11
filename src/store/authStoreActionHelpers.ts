import { clearSentryUser } from '../config/sentry';
import { queryClient } from '../api/QueryProvider';
import type { User } from '../types/models';
import type { AuthStateSetter } from './authStoreTypes';

export function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export function setAuthenticatedUser(
  set: AuthStateSetter,
  user: User,
): void {
  set((state) => {
    state.user = user;
    state.isAuthenticated = true;
    state.isLoading = false;
    state.authStatus = 'authenticated';
    state.error = null;
  });
}

export function setSignedOut(set: AuthStateSetter): void {
  set((state) => {
    state.user = null;
    state.isAuthenticated = false;
    state.isLoading = false;
    state.authStatus = 'signed_out';
    state.error = null;
  });
}


export function handleAuthCheckError(
  set: AuthStateSetter,
  err: unknown,
): void {
  const message = err instanceof Error ? err.message : 'Auth check failed';
  const normalizedMessage = message.toLowerCase();
  const isTransient = [
    'network',
    'timeout',
    'fetch failed',
    'host unreachable',
    'aborted',
    'offline',
  ].some((pattern) => normalizedMessage.includes(pattern));

  if (isTransient) {
    set((state) => {
      state.isLoading = false;
      if (state.isAuthenticated && state.user) {
        state.authStatus = 'authenticated';
        state.error = null;
        return;
      }
      state.authStatus = 'error';
      state.isAuthenticated = false;
      state.user = null;
      state.error = message;
    });
    return;
  }

  set((state) => {
    state.isLoading = false;
    state.authStatus = 'error';
    state.isAuthenticated = false;
    state.user = null;
    state.error = message;
  });
  queryClient.clear();
  clearSentryUser();
}
