import {
  clearSentryUser,
  setSentryUser,
} from "../config/sentry";
import type { User } from "../types/models";
import { loadUserProfile } from "./authProfileStorage";
import { deinitializeServicesAfterLogout } from "./authStoreIntegrations";
import { initializeServicesAfterAuth } from "./authStoreIntegrations";
import type { AuthStateSetter } from "./authStoreTypes";

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
    state.error = null;
  });
}

export function setSignedOut(set: AuthStateSetter): void {
  set((state) => {
    state.user = null;
    state.isAuthenticated = false;
    state.isLoading = false;
    state.error = null;
  });
}

export async function hydrateStoredProfile(
  set: AuthStateSetter,
): Promise<void> {
  const storedProfile = await loadUserProfile();
  if (!storedProfile) {
    return;
  }
  set((state) => {
    state.user = storedProfile;
    state.isAuthenticated = true;
  });
  setSentryUser(storedProfile.id, storedProfile.email, storedProfile.username);
  initializeServicesAfterAuth(storedProfile);
}

export function handleAuthCheckError(
  set: AuthStateSetter,
  err: unknown,
): void {
  const message = err instanceof Error ? err.message : "Auth check failed";
  const isNetworkError = /network|timeout|fetch|unreachable|abort/i.test(
    message,
  );
  set((state) => {
    state.isLoading = false;
    state.error = message;
    if (!isNetworkError) {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    }
  });
  if (!isNetworkError) {
    clearSentryUser();
    deinitializeServicesAfterLogout();
  }
}
