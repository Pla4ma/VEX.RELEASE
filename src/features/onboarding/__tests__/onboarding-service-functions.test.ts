/**
 * Comprehensive Onboarding Feature Tests — Service Functions
 */

import './onboarding-mock-setup';

import {
  getStepName,
  canGoBack,
  canSkip,
  saveDisplayName,
  getFirstSessionConfig,
  isOnboardingStalled,
  getEstimatedTimeRemaining,
  OnboardingError,
} from '../service';

// ── Service Functions ─────────────────────────────────────────────────────────

describe('Service Functions', () => {
  describe('getStepName', () => {
    it('returns WELCOME for step 0', () => {
      expect(getStepName(0)).toBe('WELCOME');
    });

    it('returns GOAL_SETTING for step 1', () => {
      expect(getStepName(1)).toBe('GOAL_SETTING');
    });

    it('returns FOCUS_TIME for step 2', () => {
      expect(getStepName(2)).toBe('FOCUS_TIME');
    });

    it('returns NAME_SETUP for step 3', () => {
      expect(getStepName(3)).toBe('NAME_SETUP');
    });

    it('returns FIRST_SESSION_CTA for step 4', () => {
      expect(getStepName(4)).toBe('FIRST_SESSION_CTA');
    });

    it('returns WELCOME for out-of-range step', () => {
      expect(getStepName(10)).toBe('WELCOME');
    });
  });

  describe('canGoBack', () => {
    it('returns false for step 0', () => {
      expect(canGoBack(0)).toBe(false);
    });

    it('returns true for step 1', () => {
      expect(canGoBack(1)).toBe(true);
    });

    it('returns true for step 4', () => {
      expect(canGoBack(4)).toBe(true);
    });
  });

  describe('canSkip', () => {
    it('returns false for step 0', () => {
      expect(canSkip(0)).toBe(false);
    });

    it('returns true for step 1', () => {
      expect(canSkip(1)).toBe(true);
    });
  });

  describe('saveDisplayName', () => {
    it('returns true for valid name', () => {
      expect(saveDisplayName('Alice')).toBe(true);
    });

    it('returns false for short name', () => {
      expect(saveDisplayName('A')).toBe(false);
    });

    it('returns false for empty name', () => {
      expect(saveDisplayName('')).toBe(false);
    });

    it('trims whitespace', () => {
      expect(saveDisplayName('  Alice  ')).toBe(true);
    });
  });

  describe('getFirstSessionConfig', () => {
    it('returns default duration when none set', () => {
      const config = getFirstSessionConfig();
      expect(config.duration).toBeGreaterThan(0);
      expect(config.isOnboardingSession).toBe(true);
    });
  });

  describe('isOnboardingStalled', () => {
    it('returns false when not started', () => {
      expect(isOnboardingStalled()).toBe(false);
    });
  });

  describe('getEstimatedTimeRemaining', () => {
    it('returns time proportional to remaining steps', () => {
      const time0 = getEstimatedTimeRemaining(0);
      const time3 = getEstimatedTimeRemaining(3);
      expect(time0).toBeGreaterThan(time3);
    });

    it('returns 0 for last step', () => {
      expect(getEstimatedTimeRemaining(4)).toBe(0);
    });
  });

  describe('OnboardingError', () => {
    it('creates error with code and message', () => {
      const error = new OnboardingError('TEST_CODE', 'Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.message).toBe('Test message');
      expect(error.name).toBe('OnboardingError');
      expect(error instanceof Error).toBe(true);
    });
  });
});
