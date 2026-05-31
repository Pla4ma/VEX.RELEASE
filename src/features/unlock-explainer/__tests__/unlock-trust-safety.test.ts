import {
  createUnlockDecision,
  isFeatureVisible,
  UnlockDecisionSchema,
  computeFeatureSafetyGates,
  canDegradedPremiumTease,
  isNeverUnlockFeature,
  NEVER_UNLOCK_FEATURES,
  NOW,
} from './unlock-trust-layer-helpers';

describe('Unlock Explainer Trust Layer — safety gates & unlock policies', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

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

  describe('degraded premium no tease', () => {
    it('degraded premium feature cannot tease', () => {
      for (const key of [
        'ai_coach_advanced',
        'streak_insurance',
        'premium_currency',
        'advanced_economy',
      ]) {
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
});
