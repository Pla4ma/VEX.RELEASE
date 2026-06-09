import type { CoachRecommendationType, RecommendationContext, CoachPersona } from './CoachRecommendationService-types';
import {
  generateProtectStreakMessage,
  generateStudyBehindMessage,
  generateBossOpportunityMessage,
  generateMomentumBuildingMessage,
} from './recommendation-messages';
import {
  generateComebackMessage,
  generateStudyPlanCompleteMessage,
  generateFocusSessionMessage,
  generateStudyPlanMessage,
  generateBossBattleMessage,
} from './recommendation-messages-engaging';

export function generateMessage(
  type: CoachRecommendationType,
  context: RecommendationContext,
  persona: CoachPersona,
): { headline: string; subtext: string; coachMessage: string } {
  const generators: Record<
    CoachRecommendationType,
    (ctx: RecommendationContext, p: CoachPersona) => { headline: string; subtext: string; coachMessage: string }
  > = {
    protect_streak: generateProtectStreakMessage,
    study_behind: generateStudyBehindMessage,
    boss_opportunity: generateBossOpportunityMessage,
    momentum_building: generateMomentumBuildingMessage,
    comeback: generateComebackMessage,
    study_plan_complete: generateStudyPlanCompleteMessage,
    focus_session: generateFocusSessionMessage,
    study_plan: generateStudyPlanMessage,
    boss_battle: generateBossBattleMessage,
  };
  return generators[type](context, persona);
}
