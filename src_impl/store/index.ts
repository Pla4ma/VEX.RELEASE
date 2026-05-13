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

export * from "./index.types";
export * from "./index.types";
export * from "./index.part1";
export * from "./index.part2";
