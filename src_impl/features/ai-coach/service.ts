/**
 * AI Coach Service
 * Business logic for coaching, personalization, predictions, and interventions
 *
 * Dependencies:
 * - Sessions (data for personalization)
 * - Streaks (risk detection, encouragement)
 * - Progression (tailor advice to level)
 * - Notifications (delivery)
 * - Analytics (effectiveness tracking)
 *
 * This file serves as the public API entry point, re-exporting from focused modules:
 * - message-generator.ts: Message generation and interventions
 * - session-analyzer.ts: Behavior modeling and session analysis
 * - persona-manager.ts: Coach state and persona management
 * - reminder-scheduler.ts: Reminders, comeback, and difficulty
 * - CoachRecommendationService.ts: Phase 2.1 - Coach as Recommendation Engine
 *
 * Cross-system integration via eventBus
 */

// Re-export all public functions from focused modules
// Phase 2.1 - Coach as Recommendation Engine
export {
  CoachRecommendationService,
  createCoachRecommendationService,
  convertToHomeRecommendation,
  COACH_PERSONAS,
  type CoachRecommendation,
  type RecommendationContext,
  type CoachPersona,
  type CoachPersonaId,
  type CoachRecommendationType,
  type UrgencyLevel,
} from './services/CoachRecommendationService';

export {
  generateMessage,
  evaluateInterventions,
  activateComeback,
  detectStreakRisk,
  processBehaviorSignal,
} from './pipeline';

// Phase 2.3 - New Interventions
export {
  detectStudyBehind,
  detectBossOpportunity,
  detectMomentumBuilding,
  detectComebackReady,
  detectStudyPlanComplete,
  type StudyBehindInput,
  type BossOpportunityInput,
  type MomentumBuildingInput,
  type ComebackReadyInput,
  type StudyPlanCompleteInput,
} from './intervention-service';

export {
  markMessageAction,
  generatePerformanceSummary,
} from './message-generator';

// Repository exports for direct database operations
export {
  markMessageRead,
  dismissMessage,
  fetchRecentMessages,
} from './repository';

export {
  // Session Analyzer
  buildBehaviorProfile,
  createRecommendation,
  generateSessionSummary,
  suggestChallenges,
} from './session-analyzer';

export {
  // Persona Manager
  getCoachPersonas,
  getDefaultPersona,
  getOrCreateCoachState,
  updateCoachState,
  updateCoachState as transitionState,
  updateCoachPreferences,
  DEFAULT_PERSONA_ID,
} from './persona-manager';

export {
  // Reminder Scheduler
  scheduleReminder,
  acceptComeback,
  trackComebackSession,
  adjustDifficulty,
  COMEBACK_BONUS_MULTIPLIER,
} from './reminder-scheduler';

// Service getter for compatibility with hooks expecting service pattern
import type { CoachRecommendation } from './services/CoachRecommendationService';

export interface CoachService {
  createRecommendation: (userId: string, context: Record<string, unknown>) => Promise<CoachRecommendation | null>;
  generateMessage: (type: string, context: Record<string, unknown>) => Promise<string>;
  getSessionAdvice: (sessionData: Record<string, unknown>) => Promise<string | null>;
}

const coachServiceInstance: CoachService = {
  createRecommendation: async () => null,
  generateMessage: async () => '',
  getSessionAdvice: async () => null,
};

export function getCoachService(): CoachService {
  return coachServiceInstance;
}
