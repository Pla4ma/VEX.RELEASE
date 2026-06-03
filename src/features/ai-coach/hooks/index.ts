/**
 * AI Coach Hooks Barrel Export
 */

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
