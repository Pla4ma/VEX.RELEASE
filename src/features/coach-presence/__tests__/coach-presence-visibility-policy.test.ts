/**
 * Coach Presence — Visibility Policy Tests
 */

import { decideCoachVisibility } from '../visibility-policy';

describe('decideCoachVisibility', () => {
  test('ACTIVE_SESSION is always HIDDEN for all lanes', () => {
    for (const lane of ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const) {
      const policy = decideCoachVisibility({ lane, surface: 'ACTIVE_SESSION' });
      expect(policy.decision).toBe('HIDDEN');
    }
  });

  test('COMPLETION is always VISIBLE for all lanes', () => {
    for (const lane of ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const) {
      const policy = decideCoachVisibility({ lane, surface: 'COMPLETION' });
      expect(policy.decision).toBe('VISIBLE');
    }
  });

  test('SESSION_SETUP is HIDDEN for minimal_normal lane', () => {
    const policy = decideCoachVisibility({ lane: 'minimal_normal', surface: 'SESSION_SETUP' });
    expect(policy.decision).toBe('HIDDEN');
    expect(policy.maxMessageLength).toBe(0);
  });

  test('SESSION_SETUP is SUBTLE_ONE_LINE for non-minimal lanes', () => {
    const policy = decideCoachVisibility({ lane: 'student', surface: 'SESSION_SETUP' });
    expect(policy.decision).toBe('SUBTLE_ONE_LINE');
    expect(policy.maxMessageLength).toBe(48);
  });

  test('ONBOARDING is SUBTLE_ONE_LINE for all lanes', () => {
    for (const lane of ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const) {
      const policy = decideCoachVisibility({ lane, surface: 'ONBOARDING' });
      expect(policy.decision).toBe('SUBTLE_ONE_LINE');
    }
  });

  test('maxMessageLength is 96 for VISIBLE decisions', () => {
    const policy = decideCoachVisibility({ lane: 'student', surface: 'DAY_0_HOME' });
    expect(policy.decision).toBe('VISIBLE');
    expect(policy.maxMessageLength).toBe(96);
  });

  test('always includes a reason string', () => {
    const policy = decideCoachVisibility({ lane: 'student', surface: 'COMPLETION' });
    expect(policy.reason).toBeTruthy();
    expect(typeof policy.reason).toBe('string');
  });
});
