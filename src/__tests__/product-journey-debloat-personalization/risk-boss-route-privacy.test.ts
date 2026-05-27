/**
 * Risk 3 — Boss HUD Display Policy Consumption
 * Risk 4 — Route Registration Enforcement
 * Risk 5 — Privacy Inventory ↔ App Manifest
 */

import { accessFor } from './helpers';

describe('Risk 3 — Boss HUD display policy consumption', () => {
  it('display policy correctly hides BossCombatHUD for all styles', () => {
    const { resolveActiveSessionDisplayPolicy } = require('../../screens/session/utils/active-session-display-policy');
    const { SessionMode } = require('../../session/modes');

    const calm = resolveActiveSessionDisplayPolicy({
      focusStage: 'active', motivationStyle: 'calm',
      primaryGoal: 'focus', sessionMode: SessionMode.FLOW,
    });
    expect(calm.showBossHUD).toBe(false);

    const study = resolveActiveSessionDisplayPolicy({
      focusStage: 'active', motivationStyle: 'study_focused',
      primaryGoal: 'study', sessionMode: SessionMode.STUDY,
    });
    expect(study.showBossHUD).toBe(false);
    expect(study.showStudyTarget).toBe(true);

    const gameActive = resolveActiveSessionDisplayPolicy({
      bossIntensity: 'visible', focusStage: 'active',
      motivationStyle: 'game_like', primaryGoal: 'work',
      sessionMode: SessionMode.CHALLENGE,
    });
    expect(gameActive.showBossHUD).toBe(false);
    expect(gameActive.showBossTinyIndicator).toBe(true);
    expect(gameActive.showMomentumScore).toBe(false);
  });

  it('purity score hidden by default in all display policies', () => {
    const { resolveActiveSessionDisplayPolicy } = require('../../screens/session/utils/active-session-display-policy');
    const { SessionMode } = require('../../session/modes');

    const styles = ['calm', 'study_focused', 'game_like', 'intense', 'coach_led'] as const;
    for (const style of styles) {
      const policy = resolveActiveSessionDisplayPolicy({
        focusStage: 'active', motivationStyle: style,
        primaryGoal: 'focus', sessionMode: SessionMode.FLOW,
      });
      expect(policy.showPurityScore).toBe(false);
    }
  });
});

describe('Risk 4 — Route registration enforcement', () => {
  it('all progressive routes gated by FeatureAvailability', () => {
    const {
      FEATURE_ROUTE_REGISTRY,
      canRegisterFeatureRoute,
    } = require('../../navigation/feature-route-registry');

    const locked = accessFor(0);
    for (const { route } of FEATURE_ROUTE_REGISTRY) {
      expect(canRegisterFeatureRoute(locked, route)).toBe(false);
    }

    const unlocked = accessFor(999);
    const count = FEATURE_ROUTE_REGISTRY.filter(
      (r: { feature: string }) => canRegisterFeatureRoute(unlocked, r.route),
    ).length;
    expect(count).toBeGreaterThanOrEqual(FEATURE_ROUTE_REGISTRY.length - 1);
  });

  it('hidden features never have registered routes', () => {
    const { canNavigateToRegisteredRoute } = require('../../navigation/feature-route-registry');

    const features = accessFor(0);
    expect(canNavigateToRegisteredRoute(features, 'Boss')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'Challenges')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'AICoach')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'ContentStudy')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'Mastery')).toBe(false);
    expect(canNavigateToRegisteredRoute(features, 'CompanionDetail')).toBe(false);
  });

  it('core navigation routes always available', () => {
    const { canNavigateToRegisteredRoute } = require('../../navigation/feature-route-registry');

    const features = accessFor(0);
    expect(canNavigateToRegisteredRoute(features, 'Home')).toBe(true);
    expect(canNavigateToRegisteredRoute(features, 'SettingsMain')).toBe(true);
    expect(canNavigateToRegisteredRoute(features, 'SessionStack.SessionSetup')).toBe(true);
  });
});

describe('Risk 5 — Privacy inventory ↔ app manifest', () => {
  it('privacy inventory matches app manifest metadata', () => {
    const {
      PRIVACY_INVENTORY,
      getDataCategories,
      getPiiFields,
      getTrackingFields,
    } = require('../../privacy/PrivacyInventory');
    const {
      PRIVACY_NUTRITION_LABEL,
    } = require('../../app-store/AppStoreSubmissionPack');

    const categories = getDataCategories();
    const inventoryCategories = categories.map((c: { category: string }) => c.category);

    expect(inventoryCategories).toContain('Identifiers');
    expect(inventoryCategories).toContain('Usage Data');
    expect(inventoryCategories).toContain('Diagnostics');
    expect(inventoryCategories).toContain('Purchases');
    expect(inventoryCategories).toContain('Contact Info');
    expect(inventoryCategories).toContain('User Content');

    const linkedFromInventory = PRIVACY_INVENTORY
      .filter((item: { linkedToUser: boolean }) => item.linkedToUser)
      .map((item: { category: string }) => item.category);

    for (const label of PRIVACY_NUTRITION_LABEL.dataLinkedToUser) {
      expect(linkedFromInventory.some((cat: string) =>
        label.toLowerCase().includes(cat.toLowerCase()),
      )).toBe(true);
    }

    expect(getPiiFields()).toEqual(['Email address', 'Push notification token']);
    expect(getTrackingFields()).toEqual([]);

    const hasTracking = categories.some((c: { usedForTracking: boolean }) => c.usedForTracking);
    expect(hasTracking).toBe(false);
  });

  it('app store description excludes hidden feature names', () => {
    const { APP_STORE_METADATA } = require('../../app-store/AppStoreSubmissionPack');
    const description = APP_STORE_METADATA.description.toLowerCase();
    const forbidden = ['battle pass', 'shop', 'inventory', 'wagers', 'rivals', 'squads', 'guild', 'leaderboard'];
    for (const term of forbidden) expect(description).not.toContain(term);
  });

  it('app store review notes do not mention hidden features', () => {
    const { REVIEW_NOTES } = require('../../app-store/AppStoreSubmissionPack');
    const forbidden = ['battle pass', 'shop', 'inventory', 'wagers', 'rivals', 'squads', 'guild', 'boss combat'];
    for (const term of forbidden) {
      expect(REVIEW_NOTES.toLowerCase()).not.toContain(term);
    }
  });

  it('review notes focus on core public features only', () => {
    const { REVIEW_NOTES } = require('../../app-store/AppStoreSubmissionPack');
    expect(REVIEW_NOTES).toContain('Premium');
    expect(REVIEW_NOTES).toContain('completion screen with progress proof');
    expect(REVIEW_NOTES).toContain('Delete Account');
    expect(REVIEW_NOTES).toContain('No coins');
    expect(REVIEW_NOTES).toContain('No Day 0 paywall');
    expect(REVIEW_NOTES).toContain('No login required');
  });
});
