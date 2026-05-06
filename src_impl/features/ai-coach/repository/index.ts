/**
 * AI Coach Repository
 *
 * Split into domain-specific repositories for maintainability.
 * All exports maintain backward compatibility with original repository.ts
 */

// Error handling
export { RepositoryError } from './error';

// Domain repositories
export {
  fetchCoachPersonas,
  fetchCoachPersona,
  fetchMessageTemplates,
  fetchAllMessageTemplates,
} from './personas';

export {
  fetchBehaviorProfile,
  upsertBehaviorProfile,
  addBehaviorSignal,
  fetchRecentBehaviorSignals,
} from './behavior';

export {
  fetchRecommendations,
  fetchActiveRecommendations,
  fetchRecommendationsByType,
  createRecommendation,
  updateRecommendationStatus,
} from './recommendations';

export {
  createReminderPlan,
  fetchPendingReminders,
  markReminderSent,
  updateReminderDelivery,
  upsertComebackPlan,
  fetchActiveComebackPlan,
  updateComebackPlanStatus,
} from './reminders';

export {
  fetchDifficultyProfile,
  upsertDifficultyProfile,
} from './difficulty';

export {
  createCoachMessage,
  fetchUserMessages,
  fetchRecentMessages,
  fetchUndeliveredMessages,
  updateMessageStatus,
  markMessageAction,
  markMessageRead,
  dismissMessage,
  fetchCoachHistory,
} from './messages';

export {
  fetchCoachState,
  upsertCoachState,
} from './state';

export {
  fetchInterventionRules,
  fetchInterventionRulesByTrigger,
  createInterventionExecution,
  updateInterventionExecution,
  fetchTodaysInterventionExecutions,
  wasRuleTriggeredRecently,
} from './intervention';

export {
  createMemory,
  getMemoriesByUser,
  getMemoriesByType,
  markMemoryReferenced,
  deleteMemory,
  getMemoriesByTypes,
  getMostRecentMemoryByType,
  hasMemoryOfType,
} from './memories';
