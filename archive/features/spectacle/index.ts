/**
 * Spectacle Feature
 *
 * Centralized celebration orchestrator for magic moments in VEX.
 * Every peak moment triggers a specific, memorable visual and haptic experience.
 */

// Types
export {
  SpectacleType,
  LootRarity,
  HapticPattern,
  AnimationIntensity,
} from './types';

export type {
  SpectaclePayload,
  BossDefeatedPayload,
  StreakMilestonePayload,
  LevelUpPayload,
  LootDropPayload,
  PerfectSessionPayload,
  FirstSessionPayload,
  PrestigePayload,
  SquadWarVictoryPayload,
  RivalBeatenPayload,
  SeasonCompletedPayload,
  MonthlyReportPayload,
  SpectacleEvent,
  SpectacleListener,
  SpectacleState,
  AnimationConfig,
  TriggerSpectacleOptions,
  SpectacleQueueEntry,
  SpectaclePayloadMap,
  SpectaclePayloadUnion,
} from './types';

// Schemas
export {
  LootRaritySchema,
  SpectacleTypeSchema,
  HapticPatternSchema,
  AnimationIntensitySchema,
  SpectaclePayloadSchema,
  BossDefeatedPayloadSchema,
  StreakMilestonePayloadSchema,
  LevelUpPayloadSchema,
  LootDropPayloadSchema,
  PerfectSessionPayloadSchema,
  FirstSessionPayloadSchema,
  PrestigePayloadSchema,
  SquadWarVictoryPayloadSchema,
  RivalBeatenPayloadSchema,
  SeasonCompletedPayloadSchema,
  AnimationConfigSchema,
  TriggerSpectacleOptionsSchema,
  SpectacleEventSchema,
} from './schemas';

// Service
export { spectacleService, SpectacleService } from './service';

// Components
export {
  BossDefeatedCeremony,
  StreakMilestoneCeremony,
  LevelUpOverlay,
  RareLootDropCeremony,
  PerfectSessionBadge,
  SquadWarVictoryCeremony,
  MonthlyReportCeremony,
} from './components';

// Hooks
export {
  useSpectacle,
  useTriggerSpectacle,
  useSpectacleType,
  useIsSpectaclePlaying,
  useSpectacleHaptics,
  useSpectacleAutoDismiss,
  useOnSpectacleComplete,
  useCurrentSpectacleAnimation,
  useBossDefeatedSpectacle,
  useStreakMilestoneSpectacle,
  useLevelUpSpectacle,
  useLootDropSpectacle,
  usePerfectSessionSpectacle,
  useSquadWarVictorySpectacle,
} from './hooks';
