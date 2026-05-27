/**
 * Product Journey — Risk Coverage (Risks 1-5)
 */
import {
  experience, accessFor, HIDDEN_FEATURE_KEYS,
  assertFullyHidden, getFeatureAvailability,
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
    expect(getFeatureAvailability(accessFor(0).inventory).canNavigate).toBe(false);
    expect(getFeatureAvailability(accessFor(0).shop).canNavigate).toBe(false);
    expect(getFeatureAvailability(accessFor(100).inventory).canNavigate).toBe(false);
    expect(getFeatureAvailability(accessFor(100).shop).canNavigate).toBe(false);
  });
});

// ═══ Risk 2 — Coach Memory Depth ════════════════════════════════

describe('Risk 2 — Coach memory depth', () => {
  it('day 0 coach profile does not fabricate memory', () => {
    const exp = experience('coach_led');
    expect(exp.behaviorAdaptations).toContain('needs_more_signal');
    expect(exp.sessionDefaults.copy).toContain('default');
    expect(exp.sessionDefaults.duration).toBe(25);
    expect(exp.progressEmphasis).toBe('basic');
    expect(exp.userStage).toBe('new_user');
    expect(exp.homeSpotlight).toBe('none');
  });

  it('after session 1 coach still has limited signal', () => {
    const exp = experience('coach_led', { completedSessionDurations: [25], totalCompletedSessions: 1 });
    expect(exp.behaviorAdaptations).toContain('needs_more_signal');
    expect(exp.sessionDefaults.copy).toContain('default');
  });

  it('after 3+ sessions coach adapts to real data', () => {
    const exp = experience('coach_led', {
      completedSessionDurations: [25, 25, 30],
      totalCompletedSessions: 3,
      mostSuccessfulTimeOfDay: 'morning',
    });
    expect(exp.behaviorAdaptations).toContain('duration_pattern');
    expect(exp.behaviorAdaptations).toContain('time_of_day_pattern');
    expect(exp.sessionDefaults.copy).toContain('best rhythm');
  });

  it('coach copy adapts per motivation style', () => {
    expect(experience('study_focused', { completedSessionDurations: [30, 30, 45], studyUsageRatio: 0.7, totalCompletedSessions: 5 }).coachMessageStyle).toBe('study_tutor');
    expect(experience('intense', { completedSessionDurations: [15, 15, 10], totalCompletedSessions: 3 }).coachTone).toBe('direct');
    expect(experience('game_like').coachMessageStyle).toBe('game_guide');
    expect(experience('calm').coachMessageStyle).toBe('reflection');
  });
});

// ═══ Risk 3 — Boss HUD Display Policy ═══════════════════════════

describe('Risk 3 — Boss HUD display policy consumption', () => {
  it('display policy correctly hides BossCombatHUD for all styles', () => {
    const { resolveActiveSessionDisplayPolicy } = require('../screens/session/utils/active-session-display-policy');
    const { SessionMode } = require('../session/modes');
    const calm = resolveActiveSessionDisplayPolicy({ focusStage: 'active', motivationStyle: 'calm', primaryGoal: 'focus', sessionMode: SessionMode.FLOW });
    expect(calm.showBossHUD).toBe(false);
    const study = resolveActiveSessionDisplayPolicy({ focusStage: 'active', motivationStyle: 'study_focused', primaryGoal: 'study', sessionMode: SessionMode.STUDY });
    expect(study.showBossHUD).toBe(false);
    expect(study.showStudyTarget).toBe(true);
    const gameActive = resolveActiveSessionDisplayPolicy({ bossIntensity: 'visible', focusStage: 'active', motivationStyle: 'game_like', primaryGoal: 'work', sessionMode: SessionMode.CHALLENGE });
    expect(gameActive.showBossHUD).toBe(false);
    expect(gameActive.showBossTinyIndicator).toBe(true);
    expect(gameActive.showMomentumScore).toBe(false);
  });

  it('purity score hidden by default in all display policies', () => {
    const { resolveActiveSessionDisplayPolicy } = require('../screens/session/utils/active-session-display-policy');
    const { SessionMode } = require('../session/modes');
    const styles = ['calm', 'study_focused', 'game_like', 'intense', 'coach_led'] as const;
    for (const style of styles) {
      const policy = resolveActiveSessionDisplayPolicy({ focusStage: 'active', motivationStyle: style, primaryGoal: 'focus', sessionMode: SessionMode.FLOW });
      expect(policy.showPurityScore).toBe(false);
    }
  });
});

// ═══ Risk 4 — Route Registration Enforcement ═════════════════════

describe('Risk 4 — Route registration enforcement', () => {
  it('all progressive routes gated by FeatureAvailability', () => {
    const { FEATURE_ROUTE_REGISTRY, canRegisterFeatureRoute } = require('../navigation/feature-route-registry');
    const locked = accessFor(0);
    for (const { route } of FEATURE_ROUTE_REGISTRY) { expect(canRegisterFeatureRoute(locked, route)).toBe(false); }
    const unlocked = accessFor(999);
    const count = FEATURE_ROUTE_REGISTRY.filter((r: { feature: string }) => canRegisterFeatureRoute(unlocked, r.route)).length;
    expect(count).toBeGreaterThanOrEqual(FEATURE_ROUTE_REGISTRY.length - 1);
  });

  it('hidden features never have registered routes', () => {
    const { canNavigateToRegisteredRoute } = require('../navigation/feature-route-registry');
    const features = accessFor(0);
    for (const route of ['Boss', 'Challenges', 'AICoach', 'ContentStudy', 'Mastery', 'CompanionDetail']) {
      expect(canNavigateToRegisteredRoute(features, route)).toBe(false);
    }
  });

  it('core navigation routes always available', () => {
    const { canNavigateToRegisteredRoute } = require('../navigation/feature-route-registry');
    const features = accessFor(0);
    expect(canNavigateToRegisteredRoute(features, 'Home')).toBe(true);
    expect(canNavigateToRegisteredRoute(features, 'SettingsMain')).toBe(true);
    expect(canNavigateToRegisteredRoute(features, 'SessionStack.SessionSetup')).toBe(true);
  });
});

// ═══ Risk 5 — Privacy Inventory ↔ App Manifest ══════════════════

describe('Risk 5 — Privacy inventory ↔ app manifest', () => {
  it('privacy inventory matches app manifest metadata', () => {
    const { PRIVACY_INVENTORY, getDataCategories, getPiiFields, getTrackingFields } = require('../privacy/PrivacyInventory');
    const { PRIVACY_NUTRITION_LABEL } = require('../app-store/AppStoreSubmissionPack');
    const categories = getDataCategories();
    const inventoryCategories = categories.map((c: { category: string }) => c.category);
    expect(inventoryCategories).toContain('Identifiers');
    expect(inventoryCategories).toContain('Usage Data');
    expect(inventoryCategories).toContain('Diagnostics');
    expect(inventoryCategories).toContain('Purchases');
    expect(inventoryCategories).toContain('Contact Info');
    expect(inventoryCategories).toContain('User Content');
    const linkedFromInventory = PRIVACY_INVENTORY.filter((item: { linkedToUser: boolean }) => item.linkedToUser).map((item: { category: string }) => item.category);
    for (const label of PRIVACY_NUTRITION_LABEL.dataLinkedToUser) {
      expect(linkedFromInventory.some((cat: string) => label.toLowerCase().includes(cat.toLowerCase()))).toBe(true);
    }
    expect(getPiiFields()).toEqual(['Email address', 'Push notification token']);
    expect(getTrackingFields()).toEqual([]);
    expect(categories.some((c: { usedForTracking: boolean }) => c.usedForTracking)).toBe(false);
  });

  it('app store description excludes hidden feature names', () => {
    const { APP_STORE_METADATA } = require('../app-store/AppStoreSubmissionPack');
    const description = APP_STORE_METADATA.description.toLowerCase();
    for (const term of ['battle pass', 'shop', 'inventory', 'wagers', 'rivals', 'squads', 'guild', 'leaderboard']) {
      expect(description).not.toContain(term);
    }
  });

  it('review notes do not mention hidden features', () => {
    const { REVIEW_NOTES } = require('../app-store/AppStoreSubmissionPack');
    for (const term of ['battle pass', 'shop', 'inventory', 'wagers', 'rivals', 'squads', 'guild', 'boss combat']) {
      expect(REVIEW_NOTES.toLowerCase()).not.toContain(term);
    }
  });

  it('review notes focus on core public features only', () => {
    const { REVIEW_NOTES } = require('../app-store/AppStoreSubmissionPack');
    expect(REVIEW_NOTES).toContain('Premium');
    expect(REVIEW_NOTES).toContain('completion screen with progress proof');
    expect(REVIEW_NOTES).toContain('Delete Account');
    expect(REVIEW_NOTES).toContain('No coins');
    expect(REVIEW_NOTES).toContain('No Day 0 paywall');
    expect(REVIEW_NOTES).toContain('No login required');
  });
});
