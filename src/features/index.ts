/**
 * Features Export
 */

// Feature Flag System
export type {
  FeatureFlagValue,
  FeatureFlag,
  FeatureFlagConfig,
} from './FeatureFlagService';

export { FeatureFlagService, getFeatureFlagService } from './FeatureFlagService';

// AI Coach Feature (Phase 7)
export * as aiCoach from './ai-coach';

// Active Feature Modules
// Note: archived features removed - see /archive for old code

// Additional Features
export * as notifications from './notifications';
export * as focusRun from './focus-run';
export * as projectFocus from './project-focus';
export * as sessionCompletion from './session-completion';
export * as sessionStart from './session-start';
export * as studyOs from './study-os';
