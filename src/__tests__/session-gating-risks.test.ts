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

  it('keeps boss combat hidden until the full route unlocks', () => {
    const bossDay0 = getFeatureAvailability(accessFor(0).boss_tab);
    expect(bossDay0.canRenderEntryPoint).toBe(false);
    expect(bossDay0.canQuery).toBe(false);
    expect(bossDay0.canNavigate).toBe(false);

    const bossTeaser = getFeatureAvailability(accessFor(5).boss_tab);
    expect(bossTeaser.state).toBe('teased');
    expect(bossTeaser.canRenderEntryPoint).toBe(true);
    expect(bossTeaser.canQuery).toBe(false);
    expect(bossTeaser.canNavigate).toBe(false);

    const bossUnlocked = getFeatureAvailability(accessFor(7).boss_tab);
    expect(bossUnlocked.canRenderEntryPoint).toBe(true);
    expect(bossUnlocked.canQuery).toBe(true);
    expect(bossUnlocked.canNavigate).toBe(true);
  });

  it('does not query active-session boss data before the boss unlock', () => {
    expect(getFeatureAvailability(accessFor(0).boss_tab).canQuery).toBe(false);
    expect(getFeatureAvailability(accessFor(6).boss_tab).canQuery).toBe(false);
    expect(getFeatureAvailability(accessFor(7).boss_tab).canQuery).toBe(true);
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
  it('registers day-one routes and keeps the Boss route gated until unlock', () => {
    const {
      FEATURE_ROUTE_REGISTRY,
      canRegisterFeatureRoute,
    } = require('../navigation/feature-route-registry');
    const dayZero = accessFor(0);
    expect(canRegisterFeatureRoute(dayZero, 'Boss')).toBe(false);
    expect(canRegisterFeatureRoute(dayZero, 'ContentStudy')).toBe(true);
    expect(canRegisterFeatureRoute(dayZero, 'Challenges')).toBe(true);

    const gatedRoutes = FEATURE_ROUTE_REGISTRY.filter(
      (route: { route: string }) => !canRegisterFeatureRoute(dayZero, route.route),
    ).map((route: { route: string }) => route.route);
    expect(gatedRoutes).toContain('Boss');
    expect(canRegisterFeatureRoute(accessFor(7), 'Boss')).toBe(true);

    const unlocked = accessFor(999);
    const count = FEATURE_ROUTE_REGISTRY.filter((route: { route: string }) =>
      canRegisterFeatureRoute(unlocked, route.route),
    ).length;
    expect(count).toBeGreaterThanOrEqual(FEATURE_ROUTE_REGISTRY.length - 1);
  });

  it('archived features never have registered routes', () => {
    const {
      canNavigateToRegisteredRoute,
    } = require('../navigation/feature-route-registry');
    const features = accessFor(0);
    for (const route of ['Shop', 'Inventory', 'Guild', 'PostSessionStory']) {
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
