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
  CompletionPresenceSummary,
} from './schemas';
