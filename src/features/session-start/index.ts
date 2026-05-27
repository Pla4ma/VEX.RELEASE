/**
 * Session Start Feature
 *
 * Components and hooks for session setup and configuration.
 * @phase 1B
 */

export {
  DurationPicker,
  type DurationPickerProps,
  type DurationPreset,
} from "./components/DurationPicker";

export {
  ModeSelector,
  type ModeSelectorProps,
  type SessionMode,
} from "./components/ModeSelector";

export {
  SessionSuggestions,
  type SessionSuggestionsProps,
  type SessionSuggestion,
} from "./components/SessionSuggestions";

export { useSessionStartController } from "./hooks";

// Phase 10.6 - Live Focusing Widget
export {
  LiveFocusingWidget,
  LiveFocusingSkeleton,
  type LiveFocusingData,
} from "./components/LiveFocusingWidget";

export * from "./schemas";

// BONUS PHASE: Adaptive Difficulty
export { AdaptiveDifficultyBanner } from "./components/AdaptiveDifficultyBanner";
export { useAdaptiveDifficulty } from "./hooks/useAdaptiveDifficulty";
export * as repository from "./repository";
export * as analytics from "./analytics";
export {
  getAdaptiveDifficultySuggestion,
  shouldShowSuggestion,
} from "./service/adaptiveDifficulty";

// PHASE 7.1: Session Stakes Briefing
export {
  SessionStakesBriefing,
  type SessionStakesBriefingProps,
  type SessionStake,
} from "./components/SessionStakesBriefing";
