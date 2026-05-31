import {
  checkRouteSafety,
  canRegisterFeatureRouteWithSafety,
  canNavigateToRouteWithSafety,
} from '../route-safety-bridge';
import {
  buildCompletionUnlock,
  unlockDecisionToCompletion,
} from '../completion-bridge';
import { createUnlockDecision } from '../service';
import { UnlockDecisionSchema } from '../schemas';

describe('route-safety-bridge', () => {
  const unlocked = createUnlockDecision({
    featureKey: 'focus_session',
    sessionCount: 0,
  });

  const blocked = UnlockDecisionSchema.parse({
    featureKey: 'boss_tab',
    decision: 'blocked',
    reasonCode: 'lane_blocked',
    userFacingReason: 'Not available.',
    evidence: [],
    laneFit: 'blocked',
    canHide: false,
    canReconsiderAtSessionCount: 3,
  });

  const hidden = createUnlockDecision({
    featureKey: 'shop',
    sessionCount: 999,
  });

  it('unlocked + not hidden = routes allowed', () => {
    const result = checkRouteSafety(unlocked, false, false);
    expect(result.canRegisterRoute).toBe(true);
    expect(result.canNavigate).toBe(true);
    expect(result.reason).toBeNull();
  });

  it('blocked = no route registration, no navigation', () => {
    const result = checkRouteSafety(blocked, false, false);
    expect(result.canRegisterRoute).toBe(false);
    expect(result.canNavigate).toBe(false);
  });

  it('user-hidden (even if unlocked) = no routes', () => {
    const result = checkRouteSafety(unlocked, true, false);
    expect(result.canRegisterRoute).toBe(false);
    expect(result.canNavigate).toBe(false);
  });

  it('system-hidden = no routes', () => {
    const result = checkRouteSafety(hidden, false, false);
    expect(result.canRegisterRoute).toBe(false);
  });

  it('degraded premium = no navigation', () => {
    const degraded = UnlockDecisionSchema.parse({
      featureKey: 'ai_coach_advanced',
      decision: 'degraded',
      reasonCode: 'degraded_premium_blocked',
      userFacingReason: 'Premium required.',
      evidence: [],
      laneFit: 'medium',
      canHide: false,
      canReconsiderAtSessionCount: null,
    });
    const result = checkRouteSafety(degraded, false, true);
    expect(result.canNavigate).toBe(false);
  });

  it('merges with FeatureAvailability (both must pass)', () => {
    // Both true → true
    expect(
      canRegisterFeatureRouteWithSafety(unlocked, false, false, true),
    ).toBe(true);
    expect(canNavigateToRouteWithSafety(unlocked, false, false, true)).toBe(
      true,
    );

    // Safety false → false even if FA true
    expect(canRegisterFeatureRouteWithSafety(unlocked, true, false, true)).toBe(
      false,
    );
    // FA false → false even if safety true
    expect(
      canRegisterFeatureRouteWithSafety(unlocked, false, false, false),
    ).toBe(false);
  });
});

describe('completion-bridge', () => {
  it('builds completion unlock from unlock-explainer decision with evidence-based reason', () => {
    const result = buildCompletionUnlock('study_os', 3, 'student');
    expect(result.key).toBe('study_os');
    expect(result.hidden).toBe(false);
    expect(result.status).toBe('available');
    expect(result.reason).toMatch(/study block/i);
  });

  it('hidden by user → blocked with reason preserved', () => {
    const result = buildCompletionUnlock('study_os', 3, 'student', [
      'study_os',
    ]);
    expect(result.hidden).toBe(true);
    expect(result.status).toBe('blocked');
    expect(result.reason).toMatch(/study block/i);
  });

  it('unlockDecisionToCompletion maps decision to completion format', () => {
    const decision = createUnlockDecision({
      featureKey: 'run_board',
      laneProfile: 'game_like',
      sessionCount: 1,
    });
    const result = unlockDecisionToCompletion(decision, false);
    expect(result.key).toBe('run_board');
    expect(result.status).toBe('available');
    expect(result.reason).toMatch(/momentum/i);
  });

  it('hidden unlockDecisionToCompletion returns blocked', () => {
    const decision = createUnlockDecision({
      featureKey: 'run_board',
      laneProfile: 'game_like',
      sessionCount: 3,
    });
    const result = unlockDecisionToCompletion(decision, true);
    expect(result.hidden).toBe(true);
    expect(result.status).toBe('blocked');
  });
});
