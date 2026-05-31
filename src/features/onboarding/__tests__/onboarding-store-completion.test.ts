/**
 * Comprehensive Onboarding Feature Tests — Store Helpers (Completion)
 */

import './onboarding-mock-setup';

import {
  mergeOnboardingCompletion,
  isCompletionValidForUser,
} from '../store-helpers';

// ── Store Helpers ──────────────────────────────────────────────────────────────

describe('Store Helpers', () => {
  describe('mergeOnboardingCompletion', () => {
    it('returns completed state with userId', () => {
      const result = mergeOnboardingCompletion(true, Date.now());
      expect(result.isOnboarded).toBe(true);
      expect(result.completedAt).toBeDefined();
      expect(result.completedForUserId).toBe('test-user-id');
    });

    it('returns incomplete state with null userId', () => {
      const result = mergeOnboardingCompletion(false, null);
      expect(result.isOnboarded).toBe(false);
      expect(result.completedForUserId).toBeNull();
    });
  });

  describe('isCompletionValidForUser', () => {
    it('returns true when completion matches user', () => {
      const state = {
        isOnboarded: true,
        completedAt: Date.now(),
        completedForUserId: 'user-123',
      };
      expect(isCompletionValidForUser(state, 'user-123')).toBe(true);
    });

    it('returns false when userId does not match', () => {
      const state = {
        isOnboarded: true,
        completedAt: Date.now(),
        completedForUserId: 'user-123',
      };
      expect(isCompletionValidForUser(state, 'user-456')).toBe(false);
    });

    it('returns false when not onboarded', () => {
      const state = {
        isOnboarded: false,
        completedAt: null,
        completedForUserId: null,
      };
      expect(isCompletionValidForUser(state, 'user-123')).toBe(false);
    });

    it('returns false for null userId', () => {
      const state = {
        isOnboarded: true,
        completedAt: Date.now(),
        completedForUserId: 'user-123',
      };
      expect(isCompletionValidForUser(state, null)).toBe(false);
    });

    it('returns false for undefined userId', () => {
      const state = {
        isOnboarded: true,
        completedAt: Date.now(),
        completedForUserId: 'user-123',
      };
      expect(isCompletionValidForUser(state, undefined)).toBe(false);
    });
  });
});
