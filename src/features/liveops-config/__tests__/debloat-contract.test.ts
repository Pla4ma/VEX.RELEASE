import {
  buildFeatureAccess,
  getFeatureAvailability,
  type FeatureAccessMap,
  type FeatureKey,
  type ProductTier,
} from '../feature-access';
import { buildHomeFeatureRuntime } from '../../../screens/home/hooks/home-feature-runtime';

function featuresAt(totalCompletedSessions: number): {
  features: FeatureAccessMap;
  productTier: ProductTier;
} {
  return buildFeatureAccess({ totalCompletedSessions });
}

describe('debloat feature contract', () => {
  it('uses execution/study/coaching/RPG/social product tiers', () => {
    expect(featuresAt(0).productTier).toBe('CORE_EXECUTION');
    expect(featuresAt(5).productTier).toBe('COACHING');
    expect(featuresAt(12).productTier).toBe('STUDY_OS');
    expect(featuresAt(20).productTier).toBe('RPG_DEPTH');
  });

  it('keeps final-release deactivated features fully unavailable at high session counts', () => {
    const { features } = featuresAt(999);
    const disabled: FeatureKey[] = [
      'battle_pass',
      'boss_bounties',
      'economy_advanced',
      'gems_prominent',
      'inventory',
      'rankings',
      'rivals',
      'seasonal_features',
      'shop',
      'social_tab',
      'squads',
      'streak_insurance',
      'wagers',
    ];

    disabled.forEach((feature) => {
      const availability = getFeatureAvailability(features[feature]);
      expect(availability.canRenderEntryPoint).toBe(false);
      expect(availability.canNavigate).toBe(false);
      expect(availability.canQuery).toBe(false);
      expect(availability.canUseBackend).toBe(false);
      expect(availability.canRegisterRoute).toBe(false);
      expect(availability.canSubscribeToEvents).toBe(false);
      expect(availability.canShowNotification).toBe(false);
    });
  });

  it('keeps home runtime queries focused on execution, study, and coach depth', () => {
    const { features, productTier } = featuresAt(999);
    const runtime = buildHomeFeatureRuntime({
      features,
      productTier,
      totalSessions: 999,
    });

    expect(runtime.canQueryStudy).toBe(true);
    expect(runtime.canQueryCoach).toBe(true);
    expect(runtime.canQueryBattlePass).toBe(false);
    expect(runtime.canQueryBoss).toBe(true);
    expect(runtime.canQueryEconomy).toBe(false);
    expect(runtime.canQuerySeasons).toBe(false);
    expect(runtime.canQuerySquads).toBe(false);
  });
});
