export { trackVexExperienceResolved } from './analytics';
export { validatePersonalizationEvent } from './events';
export {
  useResolvedVexExperience,
  useResolvedVexExperienceRuntime,
} from './hooks';
export type { VexExperienceRuntimeInput } from './hooks';
export { resolveFirstWeekExperience } from './first-week-service';
export { useFirstWeekExperience } from './useFirstWeekExperience';
export { resolveVexExperience } from './service';
export {
  recordBehaviorSignal,
  getBehaviorSignals,
  clearBehaviorSignals,
} from './behavior-signal-store';
export { resolveUserBehaviorSignals } from './behavior-resolver';
export {
  useVexRuntimeExperience,
  computeVexRuntimeExperience,
} from './vex-runtime-experience';
export type {
  VexRuntimeExperience,
  VexRuntimeInput,
} from './vex-runtime-experience';
export type {
  BehaviorSignal,
  BehaviorSignalType,
  BehaviorSignalSource,
  BehaviorSignalSummary,
  BehaviorResolverInput,
} from './behavior-signal-schemas';
export type { PersonalizationEvent } from './events';
export type {
  FirstWeekExperience,
  FirstWeekResolverInput,
  FirstWeekStage,
} from './first-week-schemas';
export type {
  BehaviorStats,
  BossIntensity,
  CompletionStep,
  FeatureAvailabilitySnapshot,
  HomeSection,
  MotivationStyle,
  VexExperience,
  VexPersonalizationProfile,
  VexSystemToDisable,
} from './types';
