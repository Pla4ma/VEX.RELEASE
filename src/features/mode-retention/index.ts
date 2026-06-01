export type {
  ModeRetentionScore,
  ModeReturnHook,
  ModeDayCopy,
  ModeRescueCopy,
  ModeNotificationCopy,
  ModePremiumBridge,
  ModeRetentionManifest,
} from './schemas';

export {
  ModeRetentionScoreSchema,
  ModeReturnHookSchema,
  ModeRetentionManifestSchema,
} from './schemas';

export {
  MODE_RETURN_HOOK,
  MODE_RETURN_REASON,
  MODE_DAY1_COPY,
  MODE_DAY3_MEMORY,
  MODE_DAY7_INTELLIGENCE,
  MODE_RESCUE_COPY,
  MODE_NOTIFICATION_COPY,
  MODE_PREMIUM_BRIDGE,
  MODE_RETENTION_MANIFEST,
} from './copy';

export {
  getModeRetentionManifest,
  getModeReturnHook,
  getModeDayCopy,
  getModeRescueCopy,
  getModeNotificationCopy,
  getModePremiumBridge,
  scoreModeRetention,
  scoreAllModes,
  buildDefaultAuditScores,
} from './service';

export type { RetentionScoreInput } from './service';

export {
  useModeReturnHook,
  useModeDayCopy,
  useModeRescueCopy,
  useModeNotificationCopy,
  useModePremiumBridge,
  useModeRetentionScore,
} from './hooks';
