/**
 * AI Coach Service — Public API Barrel
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
 * - coach-service.ts: CoachService interface, singleton, fetchActiveRecommendations
 * - CoachRecommendationService.ts: Phase 2.1 - Coach as Recommendation Engine
 * - pipeline.ts: Message generation and interventions pipeline
 * - intervention-service.ts: Phase 2.3 - New Interventions
 * - message-generator.ts: Message actions and performance summaries
 * - repository.ts: Direct database operations (read-only exports)
 * - session-analyzer.ts: Behavior modeling and session analysis
 * - persona-manager.ts: Coach state and persona management
 * - reminder-scheduler.ts: Reminders, comeback, and difficulty
 * - input-contract.ts: Phase 7 - Input validation and PII protection
 *
 * Cross-system integration via eventBus
 *
 * ARCHITECTURE NOTE: This file is the PUBLIC API barrel for the ai-coach feature.
 * All implementation logic lives in either:
 * - Sibling modules in the feature root (pipeline.ts, session-analyzer.ts, etc.)
 * - services/ directory (sub-engines, sub-services, CoachService interface)
 * Do NOT add implementation logic here — only re-exports.
 */

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
} from './CoachRecommendationService';

export {
  generateMessage,
  evaluateInterventions,
  activateComeback,
  detectStreakRisk,
  processBehaviorSignal,
} from '../pipeline';

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
} from '../intervention-service';

export {
  markMessageAction,
  generatePerformanceSummary,
} from '../message-generator';

// Repository exports for direct database operations
export {
  markMessageRead,
  dismissMessage,
  fetchRecentMessages,
} from '../repository';

export {
  // Session Analyzer
  buildBehaviorProfile,
  createRecommendation,
  generateSessionSummary,
  suggestChallenges,
} from '../session-analyzer';

export {
  // Persona Manager
  getCoachPersonas,
  getDefaultPersona,
  getOrCreateCoachState,
  updateCoachState,
  updateCoachState as transitionState,
  updateCoachPreferences,
  DEFAULT_PERSONA_ID,
} from '../persona-manager';

export {
  // Reminder Scheduler
  scheduleReminder,
  acceptComeback,
  trackComebackSession,
  adjustDifficulty,
  COMEBACK_BONUS_MULTIPLIER,
} from '../reminder-scheduler';

// Phase 7 - Input Contract Integration
export {
  validateCoachInput,
  createFallbackInsight,
  containsForbiddenPII,
  CoachInputContractSchema,
  type CoachInputContract,
} from '../input-contract';

// CoachService interface, singleton, and fetchActiveRecommendations
// (moved from this file to coach-service.ts for clean separation)
export {
  fetchActiveRecommendations,
  getCoachService,
} from './coach-service';
export type { CoachService } from './coach-service';
