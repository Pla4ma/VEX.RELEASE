/**
 * AI Coach Feature - Main Export File
 *
 * Phase 7: AI COACH + PERSONALIZATION + PREDICTIONS + INTERVENTIONS
 */

// Types - from schemas.ts (which includes types inferred from Zod schemas)
export * from './schemas';
export * from './events';
export * from './memory/memory-schemas';
export * from './memory/memory-events';

// Service layer
export * as coachService from './service/service';

// Repository layer
export * as coachRepository from './repository';

// Hooks
export * from './hooks';

// Phase 2 - Coach Recommendation Hook
export {
  useCoachRecommendation,
  useCoachHomeRecommendation,
  type UseCoachRecommendationReturn,
} from './hooks/useCoachRecommendation';

// Store
export { useCoachStore, type CoachStore } from './store';

// Analytics
export * as coachAnalytics from './analytics';

// Phase 11 - AI Coach Enhancement

// Context Snapshot
export {
  ContextSnapshotSchema,
  determineInterventionPriority,
  generateCoachPrompt,
  generateContextSnapshot,
  getContextHash,
  shouldCoachIntervene,
  type ContextSnapshot,
} from './session/context-snapshot';

// Recommendation Pipeline
export {
  batchProcessRecommendations,
  CoachRecommendationSchema,
  filterActiveRecommendations,
  formatRecommendation,
  generateRecommendations,
  getTopRecommendation,
  isRecommendationRelevant,
  trackRecommendationInteraction,
  type CoachRecommendation,
} from './recommendation/recommendation-pipeline';

// Study Loop
export {
  abandonStudyPlan,
  adjustStudyDifficulty,
  calculateStudyProgress,
  compareStudyPlans,
  completeStudySession,
  createStudyPlan,
  getNextSession,
  getNextStudyReminder,
  getStudyInsights,
  getStudyStreakMessage,
  needsAttention,
  startStudyPlan,
  StudyPlanSchema,
  type StudyPlan,
  type StudySessionResult,
} from './session/study-loop';

export {
  SessionSuggestionCard,
  type SessionSuggestionCardProps,
} from './components/session-suggestion-card';
export { MemoryList } from './components/MemoryList';
