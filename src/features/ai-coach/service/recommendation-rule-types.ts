import type {
  CoachPersona,
  CoachRecommendation,
  RecommendationContext,
} from './CoachRecommendationService-types';

export interface RecommendationRule {
  name: string;
  priority: number;
  condition: (context: RecommendationContext) => boolean;
  generate: (
    context: RecommendationContext,
    persona: CoachPersona,
  ) => CoachRecommendation;
}
