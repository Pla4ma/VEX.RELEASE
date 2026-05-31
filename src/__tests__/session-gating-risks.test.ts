/**
 * Product Journey — Risk Coverage (Risks 1, 3, 4)
 * Session component gating, display policy, and route registration
 */
import {
  accessFor,
  getFeatureAvailability,
} from './debloat-test-helpers';

// ═══ Risk 1 — Session Component Gating ══════════════════════════

describe('Risk 1 — Session component gating', () => {
  it('battle pass must check FeatureAvailability before rendering or querying', () => {
    const bp = getFeatureAvailability(accessFor(0).battle_pass);
    expect(bp.canRenderEntryPoint).toBe(false);
    expect(bp.canQuery).toBe(false);
    const bp100 = getFeatureAvailability(accessFor(100).battle_pass);
    expect(bp100.canRenderEntryPoint).toBe(false);
    expect(bp100.canQuery).toBe(false);
  });

  it('boss combat HUD must check FeatureAvailability before rendering', () => {
    const boss = getFeatureAvailability(accessFor(0).boss_tab);
    expect(boss.canRenderEntryPoint).toBe(false);
    expect(boss.canQuery).toBe(false);
    const boss5 = getFeatureAvailability(accessFor(5).boss_tab);
    expect(boss5.canRenderEntryPoint).toBe(true);
    expect(boss5.canQuery).toBe(false);
  });

  it('active session boss combat must check boss_tab before querying', () => {
    const boss = getFeatureAvailability(accessFor(0).boss_tab);
    expect(boss.canQuery).toBe(false);
    expect(boss.canRenderEntryPoint).toBe(false);
    const boss10 = getFeatureAvailability(accessFor(10).boss_tab);
    expect(boss10.canQuery).toBe(true);
    expect(boss10.canRenderEntryPoint).toBe(true);
  });

  it('inventory and shop navigation in completion must be gated', () => {
    expect(getFeatureAvailability(accessFor(0).inventory).canNavigate).toBe(
      false,
    );
    expect(getFeatureAvailability(accessFor(0).shop).canNavigate).toBe(false);
    expect(getFeatureAvailability(accessFor(100).inventory).canNavigate).toBe(
      false,
    );
    expect(getFeatureAvailability(accessFor(100).shop).canNavigate).toBe(false);
  });
});

// ═══ Risk 3 — Boss HUD Display Policy ═══════════════════════════

describe('Risk 3 — Boss HUD display policy consumption', () => {
  it('display policy correctly hides BossCombatHUD for all styles', () => {
    const {
      resolveActiveSessionDisplayPolicy,
    } = require('../screens/session/utils/active-session-display-policy');
    const { SessionMode } = require('../session/modes');
    const calm = resolveActiveSessionDisplayPolicy({
      focusStage: 'active',
      motivationStyle: 'calm',
      primaryGoal: 'focus',
      sessionMode: SessionMode.FLOW,
    });
    expect(calm.showBossHUD).toBe(false);
    const study = resolveActiveSessionDisplayPolicy({
      focusStage: 'active',
      motivationStyle: 'study_focused',
      primaryGoal: 'study',
      sessionMode: SessionMode.STUDY,
    });
    expect(study.showBossHUD).toBe(false);
    expect(study.showStudyTarget).toBe(true);
    const gameActive = resolveActiveSessionDisplayPolicy({
      bossIntensity: 'visible',
      focusStage: 'active',
      motivationStyle: 'game_like',
      primaryGoal: 'work',
      sessionMode: SessionMode.CHALLENGE,
    });
    expect(gameActive.showBossHUD).toBe(false);
    expect(gameActive.showBossTinyIndicator).toBe(true);
    expect(gameActive.showMomentumScore).toBe(false);
  });

  it('purity score hidden by default in all display policies', () => {
    const {
      resolveActiveSessionDisplayPolicy,
    } = require('../screens/session/utils/active-session-display-policy');
    const { SessionMode } = require('../session/modes');
    const styles = [
      'calm',
      'study_focused',
      'game_like',
      'intense',
      'coach_led',
    ] as const;
    for (const style of styles) {
      const policy = resolveActiveSessionDisplayPolicy({
        focusStage: 'active',
        motivationStyle: style,
        primaryGoal: 'focus',
        sessionMode: SessionMode.FLOW,
      });
      expect(policy.showPurityScore).toBe(false);
    }
  });
});

// ═══ Risk 4 — Route Registration Enforcement ═════════════════════

describe('Risk 4 — Route registration enforcement', () => {
  it('all progressive routes gated by FeatureAvailability', () => {
    const {
      FEATURE_ROUTE_REGISTRY,
      canRegisterFeatureRoute,
    } = require('../navigation/feature-route-registry');
    const locked = accessFor(0);
    for (const { route } of FEATURE_ROUTE_REGISTRY) {
      expect(canRegisterFeatureRoute(locked, route)).toBe(false);
    }
    const unlocked = accessFor(999);
    const count = FEATURE_ROUTE_REGISTRY.filter((r: { feature: string }) =>
      canRegisterFeatureRoute(unlocked, r.route),
    ).length;
    expect(count).toBeGreaterThanOrEqual(FEATURE_ROUTE_REGISTRY.length - 1);
  });

  it('hidden features never have registered routes', () => {
    const {
      canNavigateToRegisteredRoute,
    } = require('../navigation/feature-route-registry');
    const features = accessFor(0);
    for (const route of [
      'Boss',
      'Challenges',
      'AICoach',
      'ContentStudy',
      'Mastery',
      'CompanionDetail',
    ]) {
      expect(canNavigateToRegisteredRoute(features, route)).toBe(false);
    }
  });

  it('core navigation routes always available', () => {
    const {
      canNavigateToRegisteredRoute,
    } = require('../navigation/feature-route-registry');
    const features = accessFor(0);
    expect(canNavigateToRegisteredRoute(features, 'Home')).toBe(true);
    expect(canNavigateToRegisteredRoute(features, 'SettingsMain')).toBe(true);
    expect(
      canNavigateToRegisteredRoute(features, 'SessionStack.SessionSetup'),
    ).toBe(true);
  });
});
