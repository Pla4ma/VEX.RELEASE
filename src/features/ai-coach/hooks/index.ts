/**
 * AI Coach Hooks Barrel Export
 */

// Query keys used across hooks
export { COACH_QUERY_KEYS } from '../constants';

export {
  useCoachPersona,
  useCoachPersonas,
  useCoachUIState,
  useCoachUIActions,
  useHasDismissedMessage,
} from './useCoachPersona';
export { useCoachState, type UseCoachStateResult } from './useCoachState';
export { useNetworkStatus, type NetworkStatus } from './useNetworkStatus';
export {
  useCoachMessages,
  type UseCoachMessagesResult,
} from './useCoachMessages';
export {
  useCoachRecommendation,
  useCoachHomeRecommendation,
  type UseCoachRecommendationReturn,
} from './useCoachRecommendation';
export {
  useCreateRecommendation,
  useUpdateRecommendationStatus,
  type SessionRecommendation,
} from './useRecommendationMutations';
export {
  useCoachMemories,
  useCreateCoachMemory,
  type UseCoachMemoriesResult,
} from './useMemories';
export {
  useCoachRecommendations,
  useActiveCoachRecommendations,
  type ActiveCoachRecommendationsResult,
} from './useCoachRecommendations';
export {
  useCoachScreenState,
  useAskCoachQuestionMutation,
} from './useCoachScreen';
export {
  useActiveIntervention,
  type ActiveIntervention,
} from './useActiveIntervention';

// Offline & Realtime hooks (consolidated from root-level flat files)
export {
  useOfflineCoach,
  useOptimisticCoachAction,
  useOfflineCoachMessageActions,
  useOfflinePersonaSelection,
} from './useOfflineCoach';

export {
  useHomeRecommendations,
  type HomeRecommendationsResult,
} from './useHomeRecommendations';

export {
  useRealtimeCoachMessages,
  useRealtimeCoachState,
  useRealtimeComebackPlan,
  useRealtimeRecommendations,
  useRealtimeCoach,
} from './useRealtimeCoach';
