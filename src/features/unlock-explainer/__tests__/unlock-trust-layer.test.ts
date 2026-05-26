import { createUnlockDecision, isFeatureVisible } from '../service';
import {
  buildUserFacingReason,
  UnlockDecisionSchema,
} from '../schemas';
import {
  computeFeatureSafetyGates,
  canDegradedPremiumTease,
  isNeverUnlockFeature,
  NEVER_UNLOCK_FEATURES,
} from '../safety';

// ──────────────────────────────────────────────
// PHASE 4 — Trust-layer tests (requirements 1-9)
// ──────────────────────────────────────────────

describe('Unlock Explainer Trust Layer', () => {
  const NOW = 1_764_000_000_000;

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  // 1. unlock has user-facing reason
  it('unlock has user-facing reason (non-generic, evidence-based)', () => {
    const result = createUnlockDecision({
      featureKey: 'study_os',
      laneProfile: 'student',
      sessionCount: 1,
    });

    expect(result.userFacingReason).toBeTruthy();
    expect(result.userFacingReason.length).toBeGreaterThan(30);
    expect(result.userFacingReason).not.toBe('Unlocked because of your progress.');
    expect(result.userFacingReason).not.toBe('Available after 1 completed sessions.');
    expect(result.userFacingReason).toMatch(/study|student|block/i);
  });

  // 2. unlock cites evidence
  it('unlock cites evidence in decision', () => {
    const result = createUnlockDecision({
      featureKey: 'project_thread',
      laneProfile: 'deep_creative',
      sessionCount: 5,
    });

    expect(result.evidence.length).toBeGreaterThanOrEqual(1);
    const hasSessionEvidence = result.evidence.some(
      (e) => e.source === 'session_count',
    );
    expect(hasSessionEvidence).toBe(true);
  });

  // 3. user can hide unlock
  it('user can hide unlock (canHide=true for unlocked features)', () => {
    const result = createUnlockDecision({
      featureKey: 'study_os',
      laneProfile: 'student',
      sessionCount: 3,
    });

    expect(result.canHide).toBe(true);
  });

  // 4. hidden feature stays inert (safety gates)
  describe('hidden feature inertness', () => {
    it('hidden decision produces fully inert safety gates', () => {
      const hidden = createUnlockDecision({
        featureKey: 'shop',
        sessionCount: 100,
      });
      const gates = computeFeatureSafetyGates(hidden, false, false);

      expect(gates.canRender).toBe(false);
      expect(gates.canNavigate).toBe(false);
      expect(gates.canQuery).toBe(false);
      expect(gates.canSubscribe).toBe(false);
      expect(gates.canNotify).toBe(false);
      expect(gates.canLoadScript).toBe(false);
    });

    it('user-hidden feature produces fully inert safety gates even if unlocked', () => {
      const unlocked = createUnlockDecision({
        featureKey: 'study_os',
        laneProfile: 'student',
        sessionCount: 10,
      });
      const gates = computeFeatureSafetyGates(unlocked, true, false);

      expect(gates.canRender).toBe(false);
      expect(gates.canNavigate).toBe(false);
      expect(gates.canQuery).toBe(false);
    });
  });

  // 5. degraded premium cannot tease
  describe('degraded premium no tease', () => {
    it('degraded premium feature cannot tease', () => {
      for (const key of ['ai_coach_advanced', 'streak_insurance', 'premium_currency', 'advanced_economy']) {
        expect(canDegradedPremiumTease(key)).toBe(false);
      }
    });

    it('degraded premium safety gates show fallback only, no navigation', () => {
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

      const gates = computeFeatureSafetyGates(degraded, false, true);

      expect(gates.canRender).toBe(true);
      expect(gates.canNavigate).toBe(false);
      expect(gates.canQuery).toBe(false);
      expect(gates.canSubscribe).toBe(false);
    });
  });

  // 6. shop/inventory/wagers/premium currency never unlock
  it('shop, inventory, wagers, premium currency never unlock', () => {
    for (const key of ['shop', 'inventory', 'wagers', 'premium_currency']) {
      expect(NEVER_UNLOCK_FEATURES.has(key)).toBe(true);
      expect(isNeverUnlockFeature(key)).toBe(true);

      const result = createUnlockDecision({
        featureKey: key,
        sessionCount: 999,
        laneProfile: 'student',
      });
      expect(result.decision).toBe('hidden');
      expect(isFeatureVisible(result)).toBe(false);
    }
  });

  // 7. Study OS unlock reason uses study evidence
  it('Study OS unlock reason uses study evidence', () => {
    const result = createUnlockDecision({
      featureKey: 'study_os',
      laneProfile: 'student',
      sessionCount: 3,
    });

    expect(result.userFacingReason).toMatch(/study|block/i);
    expect(result.userFacingReason).toBe(
      'Because you completed 3 study blocks, VEX opened Study tools.',
    );
  });

  // 8. Run unlock reason uses game/momentum evidence
  it('Run unlock reason uses game/momentum evidence', () => {
    const result = createUnlockDecision({
      featureKey: 'run_board',
      laneProfile: 'game_like',
      sessionCount: 3,
    });

    expect(result.userFacingReason).toMatch(/momentum|Run|encounter/i);
    expect(result.userFacingReason).toBe(
      'Because you respond well to momentum, VEX opened Run Mode.',
    );
  });

  // 9. Minimal lane receives fewer unlocks
  describe('minimal lane fewer unlocks', () => {
    it('minimal_normal lane requires 7 sessions for medium-fit features', () => {
      const result = createUnlockDecision({
        featureKey: 'project_thread',
        laneProfile: 'minimal_normal',
        sessionCount: 5,
      });

      expect(result.decision).toBe('teased');
    });

    it('minimal_normal eventually unlocks after 7 sessions', () => {
      const result = createUnlockDecision({
        featureKey: 'project_thread',
        laneProfile: 'minimal_normal',
        sessionCount: 7,
      });

      expect(result.decision).toBe('unlocked');
      expect(result.userFacingReason).toMatch(/clean|dismiss|little/i);
    });

    it('game_like unlocks same feature after 5 sessions (fewer than minimal)', () => {
      const result = createUnlockDecision({
        featureKey: 'project_thread',
        laneProfile: 'game_like',
        sessionCount: 5,
      });

      expect(result.decision).toBe('unlocked');
    });
  });

  // Additional: reason code correctness
  describe('reason code map', () => {
    it('uses unlocked_after_sessions for feature after unlock threshold', () => {
      const result = createUnlockDecision({
        featureKey: 'boss_tab',
        laneProfile: 'game_like',
        sessionCount: 1,
      });
      expect(result.reasonCode).toBe('unlocked_after_sessions');
    });

    it('uses teased_before_sessions for feature before unlock threshold', () => {
      const result = createUnlockDecision({
        featureKey: 'boss_tab',
        laneProfile: 'deep_creative',
        sessionCount: 2,
      });
      expect(result.reasonCode).toBe('teased_before_sessions');
    });

    it('uses final_release_deactivated for never-unlock features', () => {
      const result = createUnlockDecision({
        featureKey: 'battle_pass',
        sessionCount: 10,
      });
      expect(result.reasonCode).toBe('final_release_deactivated');
    });

    it('lanes blocked features use lane_blocked', () => {
      const result = createUnlockDecision({
        featureKey: 'run_board',
        laneProfile: 'minimal_normal',
        sessionCount: 10,
      });
      expect(result.reasonCode).toBe('lane_blocked');
    });
  });
});
