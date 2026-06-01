/**
 * Comprehensive Onboarding Feature Tests — Schema Tests (State & Options)
 */

import './onboarding-mock-setup';

import {
  OnboardingStateSchema,
  GoalOptionSchema,
  DurationOptionSchema,
  TooltipStateSchema,
  CoachPersonaSchema,
} from '../schemas';

// ── Schema Tests ──────────────────────────────────────────────────────────────

describe('Onboarding Schemas', () => {
  describe('OnboardingStateSchema', () => {
    it('accepts valid state', () => {
      const validState = {
        isOnboarded: false,
        currentStep: 0,
        goal: null,
        focusDuration: null,
        displayName: null,
        startedAt: null,
        completedAt: null,
        completedForUserId: null,
        persona: null,
        element: null,
        motivationProfile: null,
        explicitMotivationStyle: null,
        profileStepsCompleted: false,
        firstSessionStarted: false,
        firstSessionCompleted: false,
        homePreviewEntered: false,
        chosenLane: null,
      };
      expect(() => OnboardingStateSchema.parse(validState)).not.toThrow();
    });

    it('rejects state with out-of-range currentStep', () => {
      const invalidState = {
        isOnboarded: false,
        currentStep: 10,
        goal: null,
        focusDuration: null,
        displayName: null,
        startedAt: null,
        completedAt: null,
        completedForUserId: null,
        persona: null,
        element: null,
        motivationProfile: null,
        explicitMotivationStyle: null,
        profileStepsCompleted: false,
        firstSessionStarted: false,
        firstSessionCompleted: false,
        homePreviewEntered: false,
        chosenLane: null,
      };
      expect(() => OnboardingStateSchema.parse(invalidState)).toThrow();
    });
  });

  describe('GoalOptionSchema', () => {
    it('accepts valid goal option', () => {
      const option = {
        key: 'WORK',
        label: 'Work',
        emoji: '💼',
        description: 'Meetings and deep work',
      };
      expect(() => GoalOptionSchema.parse(option)).not.toThrow();
    });

    it('rejects goal option with empty label', () => {
      const option = { key: 'WORK', label: '', emoji: '💼', description: 'x' };
      expect(() => GoalOptionSchema.parse(option)).toThrow();
    });
  });

  describe('DurationOptionSchema', () => {
    it('accepts valid duration option', () => {
      const option = { value: 25, label: '25 min', emoji: '🍅' };
      expect(() => DurationOptionSchema.parse(option)).not.toThrow();
    });

    it('rejects duration option with invalid value', () => {
      const option = { value: 20, label: '20 min', emoji: '🍅' };
      expect(() => DurationOptionSchema.parse(option)).toThrow();
    });
  });

  describe('TooltipStateSchema', () => {
    it('accepts valid tooltip state', () => {
      const state = {
        currentTooltip: 0,
        hasShownStreakTooltip: false,
        hasShownBossTooltip: false,
        hasShownChallengeTooltip: false,
      };
      expect(() => TooltipStateSchema.parse(state)).not.toThrow();
    });
  });

  describe('CoachPersonaSchema', () => {
    it('accepts valid personas', () => {
      expect(CoachPersonaSchema.parse('cheerleader')).toBe('cheerleader');
      expect(CoachPersonaSchema.parse('mentor')).toBe('mentor');
      expect(CoachPersonaSchema.parse('drill-sergeant')).toBe(
        'drill-sergeant',
      );
    });

    it('rejects invalid persona', () => {
      expect(() => CoachPersonaSchema.parse('coach')).toThrow();
    });
  });
});
