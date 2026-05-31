/**
 * Comprehensive Onboarding Feature Tests — Completion Validation
 */

import './onboarding-mock-setup';

import {
  validateCompleteOnboarding,
} from '../utils/validation';

// ── Validation ────────────────────────────────────────────────────────────────

describe('validateCompleteOnboarding', () => {
  it('validates complete valid state', () => {
    const result = validateCompleteOnboarding({
      goal: 'WORK',
      focusDuration: 25,
      displayName: 'Alice',
    });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.goal).toBe('WORK');
    expect(result.data!.focusDuration).toBe(25);
    expect(result.data!.displayName).toBe('Alice');
  });

  it('fails with missing goal', () => {
    const result = validateCompleteOnboarding({
      focusDuration: 25,
      displayName: 'Alice',
    });
    expect(result.success).toBe(false);
  });

  it('fails with missing duration', () => {
    const result = validateCompleteOnboarding({
      goal: 'WORK',
      displayName: 'Alice',
    });
    expect(result.success).toBe(false);
  });

  it('fails with missing name', () => {
    const result = validateCompleteOnboarding({
      goal: 'WORK',
      focusDuration: 25,
    });
    expect(result.success).toBe(false);
  });

  it('warns on rapid completion', () => {
    const result = validateCompleteOnboarding({
      goal: 'WORK',
      focusDuration: 25,
      displayName: 'Alice',
      startedAt: Date.now(),
      completedAt: Date.now() + 1000,
    });
    expect(result.success).toBe(true);
    const rapidWarning = result.warnings.find(
      (w) => w.code === 'RAPID_COMPLETION',
    );
    expect(rapidWarning).toBeDefined();
  });

  it('warns on slow completion', () => {
    const now = Date.now();
    const result = validateCompleteOnboarding({
      goal: 'WORK',
      focusDuration: 25,
      displayName: 'Alice',
      startedAt: now,
      completedAt: now + 31 * 60 * 1000,
    });
    expect(result.success).toBe(true);
    const slowWarning = result.warnings.find(
      (w) => w.code === 'SLOW_COMPLETION',
    );
    expect(slowWarning).toBeDefined();
  });

  it('warns on goal-duration mismatch', () => {
    const result = validateCompleteOnboarding({
      goal: 'CREATIVE',
      focusDuration: 15,
      displayName: 'Alice',
    });
    expect(result.success).toBe(true);
    const mismatchWarning = result.warnings.find(
      (w) => w.code === 'GOAL_DURATION_MISMATCH',
    );
    expect(mismatchWarning).toBeDefined();
  });
});
