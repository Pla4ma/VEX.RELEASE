import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { getMMKVStorageAdapter } from '../persistence/MMKVStorageAdapter';
import { createAuthActions } from './authStoreActions';
import type { AuthState } from './authStoreTypes';

export const useAuthStore = create<AuthState>()(
  immer(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        ...createAuthActions(set),
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => getMMKVStorageAdapter()),
        partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
      },
    ),
  ),
);
