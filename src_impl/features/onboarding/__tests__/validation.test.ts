/**
 * Onboarding Validation Tests
 *
 * Comprehensive test coverage for onboarding validation utilities.
 *
 * @phase 2 - Deepening: Test coverage
 */

import { GoalValidators, DurationValidators, NameValidators, validateOnboardingStep, validateCompleteOnboarding, getNextRecommendedStep, canSkipStep } from '../utils/validation';

describe('Onboarding Validation', () => {
  describe('GoalValidators', () => {
    it('should validate valid goals', () => {
      const validGoals = ['WORK', 'STUDY', 'CREATIVE', 'PERSONAL'];

      validGoals.forEach((goal) => {
        const result = GoalValidators.validate(goal);
        expect(result.success).toBe(true);
        expect(result.data).toBe(goal);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject invalid goals', () => {
      const invalidGoals = ['INVALID', '', null, undefined, 123];

      invalidGoals.forEach((goal) => {
        const result = GoalValidators.validate(goal);
        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should provide goal suggestions', () => {
      expect(GoalValidators.getSuggestions('wor')).toContain('WORK');
      expect(GoalValidators.getSuggestions('stu')).toContain('STUDY');
      expect(GoalValidators.getSuggestions('cre')).toContain('CREATIVE');
      expect(GoalValidators.getSuggestions('per')).toContain('PERSONAL');
    });

    it('should return empty suggestions for no match', () => {
      expect(GoalValidators.getSuggestions('xyz')).toHaveLength(0);
    });
  });

  describe('DurationValidators', () => {
    it('should validate valid durations', () => {
      const validDurations = [15, 25, 45, 60];

      validDurations.forEach((duration) => {
        const result = DurationValidators.validate(duration);
        expect(result.success).toBe(true);
        expect(result.data).toBe(duration);
      });
    });

    it('should reject invalid durations', () => {
      const invalidDurations = [0, 10, 30, 90, null, '25'];

      invalidDurations.forEach((duration) => {
        const result = DurationValidators.validate(duration);
        expect(result.success).toBe(false);
      });
    });

    it('should provide suggestions for invalid duration', () => {
      const result = DurationValidators.validate(20);
      expect(result.success).toBe(false);
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions).toContain('15 minutes');
      expect(result.suggestions).toContain('25 minutes');
    });

    it('should warn about short duration', () => {
      const result = DurationValidators.validate(15);
      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].code).toBe('SHORT_DURATION_WARNING');
    });

    it('should warn about long duration', () => {
      const result = DurationValidators.validate(60);
      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].code).toBe('LONG_DURATION_WARNING');
    });

    it('should recommend durations for goals', () => {
      expect(DurationValidators.recommendForGoal('WORK')).toContain(25);
      expect(DurationValidators.recommendForGoal('STUDY')).toContain(25);
      expect(DurationValidators.recommendForGoal('CREATIVE')).toContain(45);
      expect(DurationValidators.recommendForGoal('PERSONAL')).toContain(25);
    });
  });

  describe('NameValidators', () => {
    it('should validate valid names', () => {
      const validNames = ['John', 'Jane Doe', 'User-123', 'Test_User'];

      validNames.forEach((name) => {
        const result = NameValidators.validate(name);
        expect(result.success).toBe(true);
        expect(result.data).toBe(name.trim());
      });
    });

    it('should reject names that are too short', () => {
      const result = NameValidators.validate('A');
      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe('NAME_TOO_SHORT');
    });

    it('should reject names that are too long', () => {
      const result = NameValidators.validate('A'.repeat(31));
      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe('NAME_TOO_LONG');
    });

    it('should reject names with invalid characters', () => {
      const result = NameValidators.validate('John@Doe!');
      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe('NAME_INVALID_CHARACTERS');
    });

    it('should reject non-string values', () => {
      const result = NameValidators.validate(123);
      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_NAME_TYPE');
    });

    it('should reject empty names', () => {
      const result = NameValidators.validate('   ');
      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBe('NAME_REQUIRED');
    });

    it('should warn about very short names', () => {
      const result = NameValidators.validate('Jo');
      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].code).toBe('NAME_VERY_SHORT');
    });

    it('should warn about test-like names', () => {
      const result = NameValidators.validate('testuser');
      expect(result.success).toBe(true);
      expect(result.warnings.some((w) => w.code === 'NAME_LIKE_TEST_DATA')).toBe(true);
    });

    it('should generate name suggestions', () => {
      const suggestions = NameValidators.generateSuggestions('ab');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toContain('ab');
    });
  });

  describe('validateOnboardingStep', () => {
    it('should validate WELCOME step', () => {
      const result = validateOnboardingStep('WELCOME', {});
      expect(result.success).toBe(true);
    });

    it('should validate GOAL_SETTING step', () => {
      const result = validateOnboardingStep('GOAL_SETTING', { goal: 'WORK' });
      expect(result.success).toBe(true);
    });

    it('should reject GOAL_SETTING without goal', () => {
      const result = validateOnboardingStep('GOAL_SETTING', {});
      expect(result.success).toBe(false);
    });

    it('should validate FOCUS_TIME step', () => {
      const result = validateOnboardingStep('FOCUS_TIME', {
        focusDuration: 25,
        goal: 'WORK',
      });
      expect(result.success).toBe(true);
    });

    it('should reject FOCUS_TIME without duration', () => {
      const result = validateOnboardingStep('FOCUS_TIME', {});
      expect(result.success).toBe(false);
    });

    it('should validate NAME_SETUP step', () => {
      const result = validateOnboardingStep('NAME_SETUP', { displayName: 'John' });
      expect(result.success).toBe(true);
    });

    it('should reject NAME_SETUP with invalid name', () => {
      const result = validateOnboardingStep('NAME_SETUP', { displayName: 'A' });
      expect(result.success).toBe(false);
    });

    it('should warn about mismatched goal-duration', () => {
      const result = validateOnboardingStep('FOCUS_TIME', {
        focusDuration: 15,
        goal: 'WORK',
      });
      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('validateCompleteOnboarding', () => {
    it('should validate complete onboarding', () => {
      const result = validateCompleteOnboarding({
        goal: 'WORK',
        focusDuration: 25,
        displayName: 'John',
        startedAt: Date.now() - 60000,
        completedAt: Date.now(),
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.goal).toBe('WORK');
      expect(result.data?.focusDuration).toBe(25);
      expect(result.data?.displayName).toBe('John');
    });

    it('should reject incomplete onboarding', () => {
      const result = validateCompleteOnboarding({
        goal: 'WORK',
        // Missing duration and name
      });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn about rapid completion', () => {
      const now = Date.now();
      const result = validateCompleteOnboarding({
        goal: 'WORK',
        focusDuration: 25,
        displayName: 'John',
        startedAt: now - 1000,
        completedAt: now,
      });

      expect(result.success).toBe(true);
      expect(result.warnings.some((w) => w.code === 'RAPID_COMPLETION')).toBe(true);
    });

    it('should warn about slow completion', () => {
      const now = Date.now();
      const result = validateCompleteOnboarding({
        goal: 'WORK',
        focusDuration: 25,
        displayName: 'John',
        startedAt: now - 31 * 60 * 1000,
        completedAt: now,
      });

      expect(result.success).toBe(true);
      expect(result.warnings.some((w) => w.code === 'SLOW_COMPLETION')).toBe(true);
    });
  });

  describe('getNextRecommendedStep', () => {
    it('should recommend GOAL_SETTING after WELCOME', () => {
      const result = getNextRecommendedStep('WELCOME', {});
      expect(result?.step).toBe('GOAL_SETTING');
    });

    it('should recommend FOCUS_TIME after GOAL_SETTING', () => {
      const result = getNextRecommendedStep('GOAL_SETTING', { goal: 'WORK' });
      expect(result?.step).toBe('FOCUS_TIME');
    });

    it('should not recommend step without required data', () => {
      const result = getNextRecommendedStep('GOAL_SETTING', {});
      expect(result).toBeNull();
    });

    it('should skip NAME_SETUP if skipName flag is set', () => {
      const result = getNextRecommendedStep('FOCUS_TIME', {
        focusDuration: 25,
        goal: 'WORK',
        skipName: true,
      });
      expect(result?.step).toBe('FIRST_SESSION_CTA');
    });
  });

  describe('canSkipStep', () => {
    it('should allow skipping WELCOME', () => {
      const result = canSkipStep('WELCOME', {});
      expect(result.canSkip).toBe(true);
    });

    it('should not allow skipping GOAL_SETTING', () => {
      const result = canSkipStep('GOAL_SETTING', {});
      expect(result.canSkip).toBe(false);
    });

    it('should not allow skipping FOCUS_TIME', () => {
      const result = canSkipStep('FOCUS_TIME', {});
      expect(result.canSkip).toBe(false);
    });

    it('should allow skipping NAME_SETUP', () => {
      const result = canSkipStep('NAME_SETUP', {});
      expect(result.canSkip).toBe(true);
    });
  });
});
