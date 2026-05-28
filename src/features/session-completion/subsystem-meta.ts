import type { FeatureKey } from "../liveops-config/feature-access";

/**
 * Subsystem classification.
 *
 * - CORE_REQUIRED: Always runs. Does NOT block other subsystems if failed.
 * - REQUIRED: Always runs. Does NOT block other subsystems if failed.
 * - FEATURE_DEPENDENT: Runs only if the owning feature canSubscribeToEvents.
 * - ANALYTICS_ONLY: Always runs. Failure never degrades the ledger.
 */
export type SubsystemKind =
  | "CORE_REQUIRED"
  | "REQUIRED"
  | "FEATURE_DEPENDENT"
  | "ANALYTICS_ONLY";

export interface SubsystemMeta {
  label: string;
  kind: SubsystemKind;
  featureKey?: FeatureKey;
  canRunWhenLocked: boolean;
  blocksCompletion: boolean;
  fallbackBehavior: string;
}

export const SUBSYSTEM_META: Record<string, SubsystemMeta> = {
  "focus-identity": {
    label: "focus-identity",
    kind: "REQUIRED",
    featureKey: "focus_session",
    canRunWhenLocked: true,
    blocksCompletion: false,
    fallbackBehavior: "Score update skipped; no user-facing degradation.",
  },
  streak: {
    label: "streak",
    kind: "CORE_REQUIRED",
    canRunWhenLocked: true,
    blocksCompletion: false,
    fallbackBehavior:
      "Streak maintained at previous value; retry on next session.",
  },
  progression: {
    label: "progression",
    kind: "CORE_REQUIRED",
    canRunWhenLocked: true,
    blocksCompletion: false,
    fallbackBehavior:
      "XP queued offline and retried when connectivity returns.",
  },
  rewards: {
    label: "rewards",
    kind: "CORE_REQUIRED",
    canRunWhenLocked: true,
    blocksCompletion: false,
    fallbackBehavior:
      "XP reward not granted; marked as degraded, retry available.",
  },
  companion: {
    label: "companion",
    kind: "FEATURE_DEPENDENT",
    featureKey: "companion_detail",
    canRunWhenLocked: false,
    blocksCompletion: false,
    fallbackBehavior:
      "Companion session milestone skipped until feature unlocks.",
  },
  "daily-mission": {
    label: "daily-mission",
    kind: "FEATURE_DEPENDENT",
    featureKey: "challenges",
    canRunWhenLocked: false,
    blocksCompletion: false,
    fallbackBehavior:
      "Daily mission progress not updated until challenges unlock.",
  },
  analytics: {
    label: "analytics",
    kind: "ANALYTICS_ONLY",
    canRunWhenLocked: true,
    blocksCompletion: false,
    fallbackBehavior: "Analytics event dropped silently.",
  },
};
