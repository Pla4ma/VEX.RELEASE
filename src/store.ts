/**
 * Main Store
 * Central Zustand store for global app state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './store/mmkv-storage';
import { getSecureStorage, SecureStorageKeys } from './persistence/SecureStorage';

// Types
export interface AuthState {
  userId: string | null;
  user: {
    id: string;
    displayName: string;
    createdAt: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionToken: string | null;
}

export interface AuthActions {
  checkAuth: () => Promise<void>;
  login: (userId: string, token: string) => void;
  logout: () => void;
  setSessionToken: (token: string | null) => void;
}

export interface AuthStore extends AuthState, AuthActions {}

const TOKEN_KEY = SecureStorageKeys.AUTH_TOKEN;

// Persist non-sensitive fields (userId, user, isAuthenticated) in MMKV.
// sessionToken is stored separately in expo-secure-store.
const sstorage = getSecureStorage();

// Create the store
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      userId: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      sessionToken: null,

      // Actions
      checkAuth: async () => {
        try {
          const token = await sstorage.getItem(TOKEN_KEY);
          set({ isLoading: false, isAuthenticated: Boolean(token), sessionToken: token });
        } catch {
          set({ isLoading: false, isAuthenticated: false, sessionToken: null });
        }
      },
      login: (userId: string, token: string) => {
        void sstorage.setItem(TOKEN_KEY, token);
        set({
          userId,
          user: { id: userId, displayName: `User ${userId}`, createdAt: new Date().toISOString() },
          isAuthenticated: true,
          isLoading: false,
          sessionToken: token,
        });
      },

      logout: () => {
        void sstorage.removeItem(TOKEN_KEY);
        set({
          userId: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          sessionToken: null,
        });
      },

      setSessionToken: (token: string | null) => {
        if (token) {
          void sstorage.setItem(TOKEN_KEY, token);
        } else {
          void sstorage.removeItem(TOKEN_KEY);
        }
        set({ sessionToken: token });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state): Partial<AuthStore> => ({
        userId: state.userId,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
