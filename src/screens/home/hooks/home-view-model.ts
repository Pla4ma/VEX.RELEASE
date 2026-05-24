import type { FeatureAccessMap, ProductTier, UserExperienceStage } from '../../../features/liveops-config';
import type { HomeFeatureRuntime } from './home-feature-runtime';
import type { HomeReturnReason } from './useHomeReturnReason';
import type { SessionRecommendation } from '../../../features/ai-coach';

export interface HomeViewModel {
  userId: string;
  isOnline: boolean;
  isLoading: boolean;
  isFirstRun: boolean;
  loadError: Error | null;
  currentStreak: number;
  currentXp: number;
  todayFocusMinutes: number;
  progressPercent: number;
  primaryRecommendation: SessionRecommendation | null;
  homeSpine: unknown;
  returnReason: HomeReturnReason | null;
  stage: UserExperienceStage;
  productTier: ProductTier;
  features: FeatureAccessMap;
  runtime: HomeFeatureRuntime;
}
