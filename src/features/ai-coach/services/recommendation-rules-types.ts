import type { RecommendationContext, CoachPersona, CoachRecommendation } from "./CoachRecommendationService-types";

export interface RecommendationRule {
  name: string;
  priority: number;
  condition: (ctx: RecommendationContext) => boolean;
  generate: (ctx: RecommendationContext, persona: CoachPersona) => CoachRecommendation;
}
