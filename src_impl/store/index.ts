/**
 * State Management Store
 *
 * Central state management using Zustand with MMKV for React Native.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { getMMKVStorageAdapter } from '../persistence/MMKVStorageAdapter';

import type { User } from '../types/models';
import type { Nullable } from '../types/global';

// Track integration initialization state
let integrationsInitialized = false;
let cleanupIntegrations: (() => void) | null = null;

import { getSecureStorage, SecureStorageKeys } from '../persistence/SecureStorage';
import { signInWithEmail, signUpWithEmail, signOut, getCurrentUser } from '../services/supabaseAuth';
import { setSentryUser, clearSentryUser, captureException } from '../config/sentry';
import { revenueCatService } from '../shared/monetization/revenuecat-service';
import { progressionService } from '../services/progressionService';
import { economyService } from '../services/economyService';
import { rewardService } from '../services/rewardService';
import { streakService } from '../services/streakService';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('store');

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function resetServiceSingletonsForLogout(): void {
  try {
    progressionService.reset();
  } catch (error) {
    debug.error('Failed to reset progression service on logout', error as Error);
  }
  try {
    economyService.reset();
  } catch (error) {
    debug.error('Failed to reset economy service on logout', error as Error);
  }
  try {
    rewardService.reset();
  } catch (error) {
    debug.error('Failed to reset reward service on logout', error as Error);
  }
  try {
    streakService.reset();
  } catch (error) {
    debug.error('Failed to reset streak service on logout', error as Error);
  }
}
/**
 * Auth store state
 */
interface AuthState {
  user: Nullable<User>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Nullable<string>;

  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  login: (user: User) => void;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; confirmPassword: string; agreeToTerms: boolean; phone?: string }) => Promise<boolean>;
  devLogin: () => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

/**
 * Create auth store with persistence
 */
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
                state.error = error?.message ?? 'Sign in failed';
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

            try {
              revenueCatService.setUserId(user.id);
            } catch (revenueCatError) {
              debug.error('[AuthStore] Failed to set RevenueCat user ID:', revenueCatError);
            }

            if (!integrationsInitialized) {
              progressionService.setUserId(user.id);
              economyService.setUserId(user.id);
              rewardService.setUserId(user.id);
              streakService.setUserId(user.id);
              integrationsInitialized = true;
            }

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

            const { user, error } = await signUpWithEmail(data.email, data.password, {
              firstName: data.firstName,
              lastName: data.lastName,
            });

            if (error || !user) {
              set((state) => {
                state.isLoading = false;
                state.error = error?.message ?? 'Registration failed';
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

            try {
              revenueCatService.setUserId(user.id);
            } catch (revenueCatError) {
              debug.error('[AuthStore] Failed to set RevenueCat user ID:', revenueCatError);
            }

            if (!integrationsInitialized) {
              progressionService.setUserId(user.id);
              economyService.setUserId(user.id);
              rewardService.setUserId(user.id);
              streakService.setUserId(user.id);
              integrationsInitialized = true;
            }

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

        clearError: () =>
          set((state) => {
            state.error = null;
          }),

        devLogin: () =>
          set((state) => {
            const now = new Date().toISOString();
            state.user = {
              id: 'dev-user-1',
              email: 'dev@vex.app',
              username: 'developer',
              firstName: 'Dev',
              lastName: 'User',
              displayName: 'Developer',
              avatar: undefined,
              bio: 'VEX Developer',
              verified: true,
              role: 'admin',
              status: 'active',
              preferences: {
                theme: 'system',
                language: 'en',
                notifications: {
                  push: true,
                  email: true,
                  sms: false,
                  inApp: true,
                  digestFrequency: 'daily',
                  quietHours: { enabled: false, start: '22:00', end: '08:00', timezone: 'UTC' },
                },
                privacy: {
                  profileVisibility: 'public',
                  activityStatus: true,
                  readReceipts: true,
                  allowTagging: true,
                  allowMentions: true,
                  dataSharing: false,
                },
                accessibility: {
                  reduceMotion: false,
                  highContrast: false,
                  largeText: false,
                  screenReaderOptimized: false,
                },
              },
              metadata: {
                lastLoginAt: now,
                loginCount: 1,
                deviceHistory: [],
              },
              createdAt: now,
              updatedAt: now,
            } as User;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
          }),

        logout: async () => {
          // Sign out from Supabase
          await signOut();

          // Clear secure storage tokens
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

          // Clear Sentry user context
          clearSentryUser();

          // Clear RevenueCat user identification (with error handling)
          try {
            revenueCatService.clearUserId();
          } catch (error) {
            debug.error('[AuthStore] Failed to clear RevenueCat user ID:', error);
            // Don't fail logout due to RevenueCat issues
          }

          // Cleanup integrations
          cleanupIntegrations?.();
          cleanupIntegrations = null;
          integrationsInitialized = false;

          // Clear regular storage (handled by Zustand persist)
        },

        checkAuth: async () => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            // Check Supabase session
            const { user, error } = await getCurrentUser();

            if (error) {
              throw error;
            }

            if (user) {
              set((state) => {
                state.user = user;
                state.isAuthenticated = true;
                state.isLoading = false;
              });
              // Track user in Sentry
              setSentryUser(user.id, user.email, user.username);
              // Identify user in RevenueCat for purchases (with error handling)
              try {
                revenueCatService.setUserId(user.id);
              } catch (error) {
                debug.error('[AuthStore] Failed to set RevenueCat user ID during checkAuth:', error);
                // Don't fail auth check due to RevenueCat issues
              }
              // Initialize integrations on first successful session validation
              if (!integrationsInitialized) {
                progressionService.setUserId(user.id);
                economyService.setUserId(user.id);
                rewardService.setUserId(user.id);
                streakService.setUserId(user.id);
                integrationsInitialized = true;
              }
            } else {
              set((state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.isLoading = false;
              });
              clearSentryUser();
              // Clear RevenueCat user identification (with error handling)
              try {
                revenueCatService.clearUserId();
              } catch (error) {
                debug.error('[AuthStore] Failed to clear RevenueCat user ID during checkAuth:', error);
                // Don't fail auth check due to RevenueCat issues
              }
            }
          } catch (err) {
            set((state) => {
              state.isLoading = false;
              state.error = err instanceof Error ? err.message : 'Auth check failed';
              state.isAuthenticated = false;
              state.user = null;
            });
            clearSentryUser();
            // Clear RevenueCat user identification
            revenueCatService.clearUserId();
          }
        },
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => getMMKVStorageAdapter()),
        partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      }
    )
  )
);

/**
 * App store state
 */
interface AppState {
  isInitialized: boolean;
  isOnline: boolean;
  lastSyncTime: Nullable<number>;

  // Actions
  setInitialized: (initialized: boolean) => void;
  setOnline: (online: boolean) => void;
  setLastSyncTime: (time: number) => void;
}

/**
 * Create app store
 */
export const useAppStore = create<AppState>()(
  immer((set) => ({
    isInitialized: false,
    isOnline: true,
    lastSyncTime: null,

    setInitialized: (initialized) =>
      set((state) => {
        state.isInitialized = initialized;
      }),

    setOnline: (online) =>
      set((state) => {
        state.isOnline = online;
      }),

    setLastSyncTime: (time) =>
      set((state) => {
        state.lastSyncTime = time;
      }),
  }))
);

/**
 * UI store state
 */
interface UIState {
  // Toast/Notification
  toast: Nullable<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }>;

  // Modal
  activeModal: Nullable<string>;
  modalProps: Record<string, unknown>;

  // Actions
  showToast: (toast: Omit<NonNullable<UIState['toast']>, 'id'>) => void;
  hideToast: () => void;
  showModal: (name: string, props?: Record<string, unknown>) => void;
  hideModal: () => void;
}

/**
 * Create UI store
 */
export const useUIStore = create<UIState>()(
  immer((set) => ({
    toast: null,
    activeModal: null,
    modalProps: {},

    showToast: (toast) =>
      set((state) => {
        state.toast = {
          ...toast,
          id: `${Date.now()}-${Math.random()}`,
        };
      }),

    hideToast: () =>
      set((state) => {
        state.toast = null;
      }),

    showModal: (name, props = {}) =>
      set((state) => {
        state.activeModal = name;
        state.modalProps = props;
      }),

    hideModal: () =>
      set((state) => {
        state.activeModal = null;
        state.modalProps = {};
      }),
  }))
);

/**
 * Combined store hooks
 */
export function useStore() {
  return {
    auth: useAuthStore(),
    app: useAppStore(),
    ui: useUIStore(),
  };
}
