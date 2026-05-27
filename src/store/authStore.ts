import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { getMMKVStorageAdapter } from "../persistence/MMKVStorageAdapter";
import type { User } from "../types/models";
import type { Nullable } from "../types/global";
import {
  getSecureStorage,
  SecureStorageKeys,
} from "../persistence/SecureStorage";
import {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getCurrentUser,
} from "../services/supabaseAuth";
import {
  setSentryUser,
  clearSentryUser,
  captureException,
} from "../config/sentry";
import { revenueCatService } from "../shared/monetization/revenuecat-service";
import { progressionService } from "../services/progressionService";
import { streakService } from "../services/streakService";
import { createDebugger } from "../utils/debug";

const debug = createDebugger("store:auth");

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

let integrationsInitializedForUserId: string | null = null;
let cleanupIntegrations: (() => void) | null = null;

function resetServiceSingletonsForLogout(): void {
  try {
    progressionService.reset();
  } catch (error) {
    debug.error(
      "Failed to reset progression service on logout",
      error as Error,
    );
  }
  try {
    streakService.reset();
  } catch (error) {
    debug.error("Failed to reset streak service on logout", error as Error);
  }
}

interface AuthState {
  user: Nullable<User>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Nullable<string>;
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  login: (user: User) => void;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    confirmPassword: string;
    agreeToTerms: boolean;
    phone?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  immer(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
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
        login: (user: User) => {
          set((state) => {
            state.user = user;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
          });
        },
        loginWithCredentials: async (email: string, password: string) => {
          try {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });
            const { user, error } = await signInWithEmail(email, password);
            if (error || !user) {
              set((state) => {
                state.isLoading = false;
                state.error = error?.message ?? "Sign in failed";
              });
              return false;
            }
            set((state) => {
              state.user = user;
              state.isAuthenticated = true;
              state.isLoading = false;
              state.error = null;
            });
            setSentryUser(user.id, user.email, user.username);
            initializeServicesAfterAuth(user);
            return true;
          } catch (err) {
            set((state) => {
              state.isLoading = false;
              state.error = toError(err).message;
            });
            captureException(toError(err), { tags: { feature: "auth-login" } });
            return false;
          }
        },
        register: async (data) => {
          try {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });
            const { user, error } = await signUpWithEmail(
              data.email,
              data.password,
              { firstName: data.firstName, lastName: data.lastName },
            );
            if (error || !user) {
              set((state) => {
                state.isLoading = false;
                state.error = error?.message ?? "Registration failed";
              });
              return false;
            }
            set((state) => {
              state.user = user;
              state.isAuthenticated = true;
              state.isLoading = false;
              state.error = null;
            });
            setSentryUser(user.id, user.email, user.username);
            initializeServicesAfterAuth(user);
            return true;
          } catch (err) {
            set((state) => {
              state.isLoading = false;
              state.error = toError(err).message;
            });
            captureException(toError(err), {
              tags: { feature: "auth-register" },
            });
            return false;
          }
        },
        clearError: () =>
          set((state) => {
            state.error = null;
          }),
        logout: async () => {
          const { error: signOutError } = await signOut();
          if (signOutError) {
            debug.error("[AuthStore] Sign out failed:", signOutError);
            captureException(signOutError, {
              tags: { feature: "auth-logout" },
            });
            return;
          }
          const secureStorage = getSecureStorage();
          await secureStorage.removeItem(SecureStorageKeys.AUTH_TOKEN);
          await secureStorage.removeItem(SecureStorageKeys.REFRESH_TOKEN);
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
          });
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
            const { user, error: authError } = await getCurrentUser();
            if (authError) {
              throw authError;
            }
            if (user) {
              set((state) => {
                state.user = user;
                state.isAuthenticated = true;
                state.isLoading = false;
              });
              setSentryUser(user.id, user.email, user.username);
              initializeServicesAfterAuth(user);
            } else {
              set((state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.isLoading = false;
              });
              clearSentryUser();
              deinitializeServicesAfterLogout();
            }
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Auth check failed";
            const isNetworkError =
              /network|timeout|fetch|unreachable|abort/i.test(message);
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
        },
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => getMMKVStorageAdapter()),
        partialize: (state) =>
          state.user?.role === "admin"
            ? { user: null, isAuthenticated: false }
            : { user: state.user, isAuthenticated: state.isAuthenticated },
      },
    ),
  ),
);

function initializeServicesAfterAuth(user: User): void {
  try {
    revenueCatService.setUserId(user.id);
  } catch (revenueCatError) {
    debug.error(
      "[AuthStore] Failed to set RevenueCat user ID:",
      revenueCatError,
    );
  }
  if (integrationsInitializedForUserId !== user.id) {
    progressionService.setUserId(user.id);
    streakService.setUserId(user.id);
    integrationsInitializedForUserId = user.id;
  }
}

function deinitializeServicesAfterLogout(): void {
  try {
    revenueCatService.clearUserId();
  } catch (error) {
    debug.error(
      "[AuthStore] Failed to clear RevenueCat user ID:",
      error,
    );
  }
  if (cleanupIntegrations) {
    cleanupIntegrations();
    cleanupIntegrations = null;
  }
  integrationsInitializedForUserId = null;
}
