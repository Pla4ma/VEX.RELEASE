/**
 * Comprehensive Onboarding Feature Tests — Step Validation
 */

import './onboarding-mock-setup';

import {
  validateOnboardingStep,
} from '../utils/validation';

// ── Validation ────────────────────────────────────────────────────────────────

describe('validateOnboardingStep', () => {
  it('validates WELCOME step (always passes)', () => {
    const result = validateOnboardingStep('WELCOME', {});
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validates GOAL_SETTING with valid goal', () => {
    const result = validateOnboardingStep('GOAL_SETTING', { goal: 'WORK' });
    expect(result.success).toBe(true);
  });

  it('validates GOAL_SETTING with invalid goal', () => {
    const result = validateOnboardingStep('GOAL_SETTING', {
      goal: 'INVALID',
    });
    expect(result.success).toBe(false);
  });

  it('validates FOCUS_TIME with valid duration', () => {
    const result = validateOnboardingStep('FOCUS_TIME', {
      focusDuration: 25,
    });
    expect(result.success).toBe(true);
  });

  it('validates FOCUS_TIME with invalid duration', () => {
    const result = validateOnboardingStep('FOCUS_TIME', {
      focusDuration: 20,
    });
    expect(result.success).toBe(false);
  });

  it('warns on non-recommended duration for goal', () => {
    const result = validateOnboardingStep('FOCUS_TIME', {
      focusDuration: 15,
      goal: 'CREATIVE',
    });
    expect(result.success).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('validates NAME_SETUP with valid name', () => {
    const result = validateOnboardingStep('NAME_SETUP', {
      displayName: 'Alice',
    });
    expect(result.success).toBe(true);
  });

  it('validates NAME_SETUP with invalid name', () => {
    const result = validateOnboardingStep('NAME_SETUP', { displayName: '' });
    expect(result.success).toBe(false);
  });

  it('validates FIRST_SESSION_CTA with warnings for missing data', () => {
    const result = validateOnboardingStep('FIRST_SESSION_CTA', {});
    expect(result.success).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('rejects unknown step', () => {
    const result = validateOnboardingStep('UNKNOWN', {});
    expect(result.success).toBe(false);
    expect(result.errors[0]!.code).toBe('UNKNOWN_STEP');
  });
});
