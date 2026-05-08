/**
 * Main Store
 * Central Zustand store for global app state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './shared/storage/mmkv';

// Types
export interface AuthState {
  userId: string | null;
  user: { id: string; displayName: string } | null;
  isAuthenticated: boolean;
  sessionToken: string | null;
}

export interface AuthActions {
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
      isAuthenticated: false,
      sessionToken: null,

      // Actions
      login: (userId: string, token: string) =>
        set({
          userId,
          user: { id: userId, displayName: `User ${userId}` },
          isAuthenticated: true,
          sessionToken: token,
        }),

      logout: () =>
        set({
          userId: null,
          user: null,
          isAuthenticated: false,
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