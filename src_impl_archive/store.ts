/**
 * Main Store
 * Central Zustand store for global app state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './store/mmkv-storage';

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
        set((state) => ({ isLoading: false, isAuthenticated: Boolean(state.sessionToken) }));
      },
      login: (userId: string, token: string) =>
        set({
          userId,
          user: { id: userId, displayName: `User ${userId}`, createdAt: new Date().toISOString() },
          isAuthenticated: true,
          isLoading: false,
          sessionToken: token,
        }),

      logout: () =>
        set({
          userId: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          sessionToken: null,
        }),

      setSessionToken: (token: string | null) =>
        set({
          sessionToken: token,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
