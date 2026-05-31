/**
 * Comprehensive Onboarding Feature Tests — Step Navigation
 */

import './onboarding-mock-setup';

import {
  getNextRecommendedStep,
  canSkipStep,
} from '../utils/step-navigation';

// ── Step Navigation ───────────────────────────────────────────────────────────

describe('Step Navigation', () => {
  describe('getNextRecommendedStep', () => {
    it('returns GOAL_SETTING after WELCOME', () => {
      const next = getNextRecommendedStep('WELCOME', {});
      expect(next).not.toBeNull();
      expect(next!.step).toBe('GOAL_SETTING');
    });

    it('returns FOCUS_TIME after GOAL_SETTING with goal set', () => {
      const next = getNextRecommendedStep('GOAL_SETTING', { goal: 'WORK' });
      expect(next).not.toBeNull();
      expect(next!.step).toBe('FOCUS_TIME');
    });

    it('returns null after GOAL_SETTING without goal', () => {
      const next = getNextRecommendedStep('GOAL_SETTING', {});
      expect(next).toBeNull();
    });

    it('returns NAME_SETUP after FOCUS_TIME with duration set', () => {
      const next = getNextRecommendedStep('FOCUS_TIME', {
        focusDuration: 25,
      });
      expect(next).not.toBeNull();
      expect(next!.step).toBe('NAME_SETUP');
    });

    it('skips NAME_SETUP when skipName is set', () => {
      const next = getNextRecommendedStep('FOCUS_TIME', {
        focusDuration: 25,
        skipName: true,
      });
      expect(next).not.toBeNull();
      expect(next!.step).toBe('FIRST_SESSION_CTA');
    });

    it('returns FIRST_SESSION_CTA after NAME_SETUP', () => {
      const next = getNextRecommendedStep('NAME_SETUP', {});
      expect(next).not.toBeNull();
      expect(next!.step).toBe('FIRST_SESSION_CTA');
    });

    it('returns null after FIRST_SESSION_CTA', () => {
      const next = getNextRecommendedStep('FIRST_SESSION_CTA', {});
      expect(next).toBeNull();
    });

    it('returns null for unknown step', () => {
      const next = getNextRecommendedStep('UNKNOWN', {});
      expect(next).toBeNull();
    });
  });

  describe('canSkipStep', () => {
    it('allows skipping WELCOME', () => {
      const result = canSkipStep('WELCOME', {});
      expect(result.canSkip).toBe(true);
    });

    it('disallows skipping GOAL_SETTING', () => {
      const result = canSkipStep('GOAL_SETTING', {});
      expect(result.canSkip).toBe(false);
    });

    it('disallows skipping FOCUS_TIME', () => {
      const result = canSkipStep('FOCUS_TIME', {});
      expect(result.canSkip).toBe(false);
    });

    it('allows skipping NAME_SETUP', () => {
      const result = canSkipStep('NAME_SETUP', {});
      expect(result.canSkip).toBe(true);
    });

    it('allows skipping FIRST_SESSION_CTA', () => {
      const result = canSkipStep('FIRST_SESSION_CTA', {});
      expect(result.canSkip).toBe(true);
    });

    it('disallows skipping unknown steps', () => {
      const result = canSkipStep('UNKNOWN', {});
      expect(result.canSkip).toBe(false);
    });
  });
});
