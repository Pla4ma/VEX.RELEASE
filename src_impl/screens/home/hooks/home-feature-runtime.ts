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
  totalSessions?: number;
  userId?: string;
}

function resolveRuntimeInput(
  input: FeatureAccessMap | HomeFeatureRuntimeInput,
  productTier?: ProductTier,
): { features: FeatureAccessMap; productTier: ProductTier } {
  if ('features' in input) {
    const totalSessions = input.totalSessions ?? 0;
    return {
      features: input.features,
      productTier: productTier ?? getProductTier(getStage(totalSessions), totalSessions),
    };
  }

  return {
    features: input,
    productTier: productTier ?? 'CORE_EXECUTION',
  };
}

export function buildHomeFeatureRuntime(
  input: FeatureAccessMap | HomeFeatureRuntimeInput,
  productTier?: ProductTier,
): HomeFeatureRuntime {
  const resolved = resolveRuntimeInput(input, productTier);
  const { features } = resolved;
  const challenges = getFeatureAvailability(features.challenges);
  const study = getFeatureAvailability(features.content_study);
  const coach = getFeatureAvailability(features.ai_coach_advanced);
  const comeback = getFeatureAvailability(features.companion_detail);
  const canShowStudyDepth =
    resolved.productTier === 'STUDY_OS' ||
    resolved.productTier === 'RPG_DEPTH' ||
    resolved.productTier === 'SOCIAL_DEPTH';

  return {
    canQueryBattlePass: false,
    canQueryBoss: false,
    canQueryChallenges: challenges.canQuery,
    canQueryCoach: coach.canQuery,
    canQueryComeback: comeback.canQuery,
    canQueryEconomy: false,
    canQueryNotifications: challenges.canQuery,
    canQuerySeasons: false,
    canQuerySquads: false,
    canQueryStudy: study.canQuery,
    shouldShowExpansionSystems: canShowStudyDepth,
    shouldShowSecondarySystems: resolved.productTier !== 'CORE_EXECUTION',
  };
}
