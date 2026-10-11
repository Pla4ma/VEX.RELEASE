import {
  getFeatureAvailability,
  getProductTier,
  getStage,
  type FeatureAccessMap,
  type ProductTier,
} from '../../../features/liveops-config';
import type { RootExposureFlags } from '../../../navigation/feature-exposure';

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

interface HomeFeatureRuntimeInput {
  exposureFlags?: RootExposureFlags;
  features: FeatureAccessMap;
  isAuthenticated?: boolean;
  isFeatureFlagEnabled?: (key: string) => boolean;
  productTier?: ProductTier;
  totalSessions?: number;
  userId?: string;
}

function resolveRuntimeInput(
  input: FeatureAccessMap | HomeFeatureRuntimeInput,
  productTier?: ProductTier,
): {
  features: FeatureAccessMap;
  productTier: ProductTier;
  totalSessions: number;
} {
  if ('features' in input) {
    const totalSessions = input.totalSessions ?? 0;
    return {
      features: input.features,
      productTier:
        productTier ??
        input.productTier ??
        getProductTier(getStage(totalSessions), totalSessions),
      totalSessions,
    };
  }

  return {
    features: input,
    productTier: productTier ?? 'CORE_EXECUTION',
    totalSessions: 0,
  };
}

export function buildHomeFeatureRuntime(
  input: FeatureAccessMap | HomeFeatureRuntimeInput,
  productTier?: ProductTier,
): HomeFeatureRuntime {
  const resolved = resolveRuntimeInput(input, productTier);
  const { features } = resolved;
  const battlePass = getFeatureAvailability(features.battle_pass);
  const boss = getFeatureAvailability(features.boss_tab);
  const challenges = getFeatureAvailability(features.challenges);
  const study = getFeatureAvailability(features.content_study);
  const coach = getFeatureAvailability(features.ai_coach_basic);
  const comeback = getFeatureAvailability(features.companion_detail);
  const economy = getFeatureAvailability(features.economy_basic);
  const seasonal = getFeatureAvailability(features.seasonal_features);
  const squads = getFeatureAvailability(features.squads);
  const notifications = getFeatureAvailability(features.companion_detail);
  const canShowStudyDepth = study.canRenderEntryPoint;

  return {
    canQueryBattlePass: battlePass.canQuery,
    canQueryBoss: boss.canQuery,
    canQueryChallenges: challenges.canQuery,
    canQueryCoach: coach.canQuery,
    canQueryComeback: comeback.canQuery,
    canQueryEconomy: economy.canQuery,
    canQueryNotifications: notifications.canQuery,
    canQuerySeasons: seasonal.canQuery,
    canQuerySquads: squads.canQuery,
    canQueryStudy: study.canQuery,
    shouldShowExpansionSystems: canShowStudyDepth,
    shouldShowSecondarySystems:
      challenges.canRenderEntryPoint ||
      coach.canRenderEntryPoint ||
      comeback.canRenderEntryPoint ||
      study.canRenderEntryPoint,
  };
}
