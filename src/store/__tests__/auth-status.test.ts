import { describe, expect, it } from '@jest/globals';


import { AuthStatusSchema } from '../../features/auth/schemas';
import {
  handleAuthCheckError,
  setSignedOut,
} from '../authStoreActionHelpers';
import type { AuthState } from '../authStoreTypes';

function createState(): AuthState {
  return {
    user: null,
    isAuthenticated: true,
    isLoading: true,
    error: 'stale',
    authStatus: 'checking',
    setUser: () => undefined,
    clearUser: () => undefined,
    setLoading: () => undefined,
    setError: () => undefined,
    clearError: () => undefined,
    login: () => undefined,
    loginWithCredentials: async () => false,
    loginWithOAuth: async () => false,
    completeOAuthCallback: async () => false,
    register: async () => false,
    logout: async () => undefined,
    checkAuth: async () => undefined,
  };
}

describe('auth status contract', () => {
  it('accepts explicit lifecycle states', () => {
    expect(AuthStatusSchema.parse('unknown')).toBe('unknown');
    expect(AuthStatusSchema.parse('checking')).toBe('checking');
    expect(AuthStatusSchema.parse('authenticated')).toBe('authenticated');
    expect(AuthStatusSchema.parse('signed_out')).toBe('signed_out');
    expect(AuthStatusSchema.parse('error')).toBe('error');
  });

  it('marks the store signed out completely', () => {
    const state = createState();
    const set = (updater: (current: AuthState) => void): void => {
      updater(state);
    };

    setSignedOut(set);

    expect(state.authStatus).toBe('signed_out');
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('marks auth checks as recoverable errors without stale identity', () => {
    const state = createState();
    const set = (updater: (current: AuthState) => void): void => {
      updater(state);
    };

    handleAuthCheckError(set, new Error('network timeout'));

    expect(state.authStatus).toBe('error');
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.error).toBe('network timeout');
  });

});
