import {
  getFeatureAvailability,
  type FeatureAccessMap,
  type ProductTier,
} from '../../../features/liveops-config';

export interface HomeFeatureRuntime {
  canQueryBattlePass: boolean;
  canQueryBoss: boolean;
  canQueryChallenges: boolean;
  canQueryCoach: boolean;
  canQueryComeback: boolean;
  canQueryEconomy: boolean;
  canQueryNotifications: boolean;
  canQuerySeasons: boolean;
  canQuerySquads: boolean;
  canQueryStudy: boolean;
  shouldShowExpansionSystems: boolean;
  shouldShowSecondarySystems: boolean;
}

export function buildHomeFeatureRuntime(
  features: FeatureAccessMap,
  productTier: ProductTier,
): HomeFeatureRuntime {
  const challenges = getFeatureAvailability(features.challenges);
  const study = getFeatureAvailability(features.content_study);
  const boss = getFeatureAvailability(features.boss_tab);
  const economy = getFeatureAvailability(features.economy_basic);
  const seasons = getFeatureAvailability(features.seasonal_features);
  const battlePass = getFeatureAvailability(features.battle_pass);
  const squads = getFeatureAvailability(features.squads);
  const coach = getFeatureAvailability(features.ai_coach_advanced);
  const comeback = getFeatureAvailability(features.companion_detail);

  return {
    canQueryBattlePass: battlePass.canQuery,
    canQueryBoss: boss.canQuery,
    canQueryChallenges: challenges.canQuery,
    canQueryCoach: coach.canQuery,
    canQueryComeback: comeback.canQuery,
    canQueryEconomy: economy.canQuery,
    canQueryNotifications: challenges.canQuery,
    canQuerySeasons: seasons.canQuery || battlePass.canQuery,
    canQuerySquads: squads.canQuery,
    canQueryStudy: study.canQuery,
    shouldShowExpansionSystems: productTier === 'EXPANSION',
    shouldShowSecondarySystems: productTier !== 'CORE',
  };
}
