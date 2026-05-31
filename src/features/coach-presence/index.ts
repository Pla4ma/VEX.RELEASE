export { CoachPresenceCard } from './components/CoachPresenceCard';
export { useCoachPresence, type UseCoachPresenceInput } from './hooks';
export { fetchCoachPresenceMemorySummary } from './repository';
export {
  BANNED_COACH_PHRASES,
  ACTION_LABELS,
  FALLBACK_HOME_MESSAGES,
  PROGRESS_REACTIONS,
  STYLE_ADAPTATION,
} from './copy';
export {
  COACH_PRESENCE_MESSAGE_CONTEXTS,
  COACH_PRESENCE_MESSAGE_STYLES,
  getCoachPresenceMessage,
} from './message-library';
export {
  getCoachPresenceMessage as getCoachPresenceMessageEnriched,
  type CoachPresenceContext,
  type CoachPresenceMessageOutput,
} from './copy-service';
export {
  buildCoachPresence,
  buildCompletionCoachPresence,
  resolveCoachActionIntent,
} from './service';
export type {
  CoachActionIntent,
  CoachPresence,
  CoachPresenceMemorySummary,
  CoachPresenceMotivationStyle,
  CoachPresenceProgressInput,
  CoachPresenceSurface,
  CoachPresenceVisualState,
  CoachVisibilityDecision,
  CoachVisibilityPolicy,
  CoachVisibilitySurface,
  CompletionPresenceSummary,
} from './schemas';
export { decideCoachVisibility } from './visibility-policy';
export {
  coachMomentFromJourneyState,
  shouldShowRetentionMoment,
  type RetentionMessage,
  type RetentionMoment,
} from './day-retention';
