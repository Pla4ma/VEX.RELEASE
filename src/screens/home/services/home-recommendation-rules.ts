import { CRITICAL_RECOMMENDATION_RULES } from './home-recommendation-rules-critical';
import { FALLBACK_RECOMMENDATION_RULES } from './home-recommendation-rules-fallback';
import { STUDY_RECOMMENDATION_RULES } from './home-recommendation-rules-study';
import type { RecommendationRule } from './home-recommendation-types';

export const RECOMMENDATION_RULES: RecommendationRule[] = [
  ...CRITICAL_RECOMMENDATION_RULES,
  ...STUDY_RECOMMENDATION_RULES,
  ...FALLBACK_RECOMMENDATION_RULES,
];
