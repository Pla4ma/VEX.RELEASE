import { createDebugger } from "@/utils/debug";
import { Platform } from "react-native";
import { MMKV } from "react-native-mmkv";
const debug = createDebugger("feature-flags");
export type FeatureFlagValue = boolean | string | number;
interface FeatureFlagConfig {
  key: string;
  defaultValue: FeatureFlagValue;
  rolloutPercentage?: number;
  targetSegments?: string[];
  platform?: ("ios" | "android" | "web")[];
  versionConstraint?: string;
  requiresPremium?: boolean;
  description?: string;
}
interface UserContext {
  userId: string;
  segment?: string;
  isPremium?: boolean;
  appVersion?: string;
  platform?: string;
}
interface FlagEvaluation {
  key: string;
  value: FeatureFlagValue;
  source: "local" | "remote" | "default";
  evaluatedAt: number;
}
const STORAGE_KEY = "feature_flags_v1";
const CACHE_DURATION_MS = 5 * 60 * 1000;
export const DEFAULT_FLAGS: FeatureFlagConfig[] = [
  {
    key: "new_session_ui",
    defaultValue: false,
    rolloutPercentage: 0,
    platform: ["ios", "android"],
  },
  {
    key: "ai_coach_v2",
    defaultValue: false,
    rolloutPercentage: 0,
    requiresPremium: true,
  },
  { key: "squad_wars_enabled", defaultValue: false, rolloutPercentage: 0 },
  { key: "battle_pass_season_2", defaultValue: false, rolloutPercentage: 0 },
  { key: "streak_recovery_v2", defaultValue: true, rolloutPercentage: 50 },
  {
    key: "premium_gifting",
    defaultValue: false,
    rolloutPercentage: 0,
    requiresPremium: false,
  },
  { key: "analytics_enhanced", defaultValue: true, rolloutPercentage: 100 },
  {
    key: "real_time_boss_combat",
    defaultValue: false,
    rolloutPercentage: 0,
    description: "Enable real-time boss combat overlay during sessions",
  },
  {
    key: "consolidated_session_modes",
    defaultValue: false,
    rolloutPercentage: 0,
    description: "Use 3 modes (FLOW/CHALLENGE/RECOVERY) instead of 5",
  },
  {
    key: "real_time_purity_feedback",
    defaultValue: false,
    rolloutPercentage: 0,
    description: "Show live purity score during sessions",
  },
  {
    key: "focus_score_primary",
    defaultValue: true,
    rolloutPercentage: 100,
    description: "Make Focus Score (300-850) the primary progression metric",
  },
  {
    key: "mastery_skill_trees",
    defaultValue: false,
    rolloutPercentage: 0,
    description:
      "Enable skill tree progression (Endurance/Intensity/Social/Tactics)",
  },
  {
    key: "prestige_system",
    defaultValue: false,
    rolloutPercentage: 0,
    description: "Enable ascension/prestige for max-level users",
  },
  {
    key: "squad_energy_system",
    defaultValue: true,
    rolloutPercentage: 100,
    description: "Replace synergy with energy pool mechanic",
  },
  {
    key: "help_request_system",
    defaultValue: true,
    rolloutPercentage: 100,
    description: 'Enable "Send Help" during difficult sessions',
  },
  {
    key: "squad_tournaments",
    defaultValue: false,
    rolloutPercentage: 0,
    description: "Enable weekly squad vs squad tournaments",
  },
  {
    key: "consolidated_currencies",
    defaultValue: true,
    rolloutPercentage: 100,
    description: "Remove seasonal currency, use only COINS and GEMS",
  },
  {
    key: "focus_points_currency",
    defaultValue: true,
    rolloutPercentage: 100,
    description: "Enable FOCUS_POINTS as simplified primary earning currency",
  },
  {
    key: "emergency_gem_sinks",
    defaultValue: false,
    rolloutPercentage: 0,
    description:
      "DISABLED: Emergency gem sinks (streak freeze, boss retry, session save) - dark pattern risk",
  },
  {
    key: "trading_system",
    defaultValue: false,
    rolloutPercentage: 0,
    description: "Enable item trading between users",
  },
  {
    key: "prime_time_events",
    defaultValue: true,
    rolloutPercentage: 100,
    description:
      "Enable scheduled bonus windows (Morning Rally, Power Hour, etc)",
  },
  {
    key: "streak_creature_system",
    defaultValue: true,
    rolloutPercentage: 100,
    description: "Replace streak numbers with evolving creature companions",
  },
  {
    key: "weekly_boss_raids",
    defaultValue: false,
    rolloutPercentage: 0,
    description: "Enable weekend epic boss raids for squad collaboration",
  },
  {
    key: "boss_bounty_system",
    defaultValue: false,
    rolloutPercentage: 0,
    description:
      "DISABLED: Boss bounty loot multiplier system until economy risk is resolved",
  },
  {
    key: "squad_boss_system",
    defaultValue: false,
    rolloutPercentage: 0,
    description: "DISABLED: Squad boss subsystem until squads are simplified",
  },
  {
    key: "predictive_interventions",
    defaultValue: true,
    rolloutPercentage: 100,
    description: "AI predicts and prevents problems vs reactive",
  },
  {
    key: "adaptive_difficulty",
    defaultValue: true,
    rolloutPercentage: 100,
    description: "Dynamic boss difficulty based on user performance",
  },
  {
    key: "legacy_linear_leveling",
    defaultValue: true,
    rolloutPercentage: 0,
    description:
      "DEPRECATED: Old linear level system (being replaced by Focus Score)",
  },
  {
    key: "legacy_squad_synergy",
    defaultValue: true,
    rolloutPercentage: 0,
    description: "DEPRECATED: Old synergy system (being replaced by Energy)",
  },
  {
    key: "legacy_seasonal_currency",
    defaultValue: true,
    rolloutPercentage: 0,
    description: "DEPRECATED: Seasonal currency (being removed)",
  },
];
class FeatureFlagEngine {
  private flags: Map<string, FeatureFlagConfig> = new Map();
  private evaluations: Map<string, FlagEvaluation> = new Map();
  private userContext: UserContext | null = null;
  private lastSync: number = 0;
  private storage = new MMKV({ id: "feature-flags" });
  constructor() {
    this.loadDefaults();
    this.loadFromStorage();
  }
  private loadDefaults(): void {
    DEFAULT_FLAGS.forEach((flag) => {
      this.flags.set(flag.key, flag);
    });
    debug.info("Loaded %d default flags", DEFAULT_FLAGS.length);
  }
  private loadFromStorage(): void {
    try {
      const cached = this.storage.getString(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as FeatureFlagConfig[];
        parsed.forEach((flag) => {
          const existing = this.flags.get(flag.key);
          if (existing) {
            this.flags.set(flag.key, { ...existing, ...flag });
          }
        });
        debug.info("Loaded %d flags from storage", parsed.length);
      }
    } catch (error) {
      debug.warn(
        "Failed to load flags from storage: %s",
        error instanceof Error ? error.message : String(error),
      );
    }
  }
  private saveToStorage(): void {
    try {
      const flagsArray = Array.from(this.flags.values());
      this.storage.set(STORAGE_KEY, JSON.stringify(flagsArray));
    } catch (error) {
      debug.warn(
        "Failed to save flags to storage: %s",
        error instanceof Error ? error.message : String(error),
      );
    }
  }
  setUserContext(context: UserContext): void {
    this.userContext = context;
    debug.info("User context set: %s", context.userId);
  }
  clearUserContext(): void {
    this.userContext = null;
    this.evaluations.clear();
    debug.info("User context cleared");
  }
  isEnabled(key: string): boolean {
    const flag = this.flags.get(key);
    if (!flag) {
      return false;
    }
    const evaluation = this.evaluateFlag(flag);
    return evaluation.value === true;
  }
  getValue<T extends FeatureFlagValue>(key: string, defaultValue: T): T {
    const flag = this.flags.get(key);
    if (!flag) {
      return defaultValue;
    }
    const cached = this.evaluations.get(key);
    if (cached && Date.now() - cached.evaluatedAt < CACHE_DURATION_MS) {
      return cached.value as T;
    }
    const evaluation = this.evaluateFlag(flag);
    this.evaluations.set(key, evaluation);
    return evaluation.value as T;
  }
  private evaluateFlag(flag: FeatureFlagConfig): FlagEvaluation {
    let value = flag.defaultValue;
    let source: FlagEvaluation["source"] = "default";
    if (flag.platform && flag.platform.length > 0) {
      const currentPlatform = Platform.OS as "ios" | "android" | "web";
      if (!flag.platform.includes(currentPlatform)) {
        return {
          key: flag.key,
          value: false,
          source: "default",
          evaluatedAt: Date.now(),
        };
      }
    }
    if (flag.requiresPremium && this.userContext) {
      const isPremium = this.userContext.isPremium;
      if (isPremium !== true) {
        return {
          key: flag.key,
          value: false,
          source: "default",
          evaluatedAt: Date.now(),
        };
      }
    }
    if (flag.versionConstraint && this.userContext?.appVersion) {
      if (
        !this.checkVersion(this.userContext.appVersion, flag.versionConstraint)
      ) {
        return {
          key: flag.key,
          value: false,
          source: "default",
          evaluatedAt: Date.now(),
        };
      }
    }
    if (flag.targetSegments && this.userContext?.segment) {
      if (!flag.targetSegments.includes(this.userContext.segment)) {
        return {
          key: flag.key,
          value: false,
          source: "default",
          evaluatedAt: Date.now(),
        };
      }
    }
    if (
      flag.rolloutPercentage !== undefined &&
      this.userContext &&
      typeof flag.defaultValue === "boolean"
    ) {
      const userBucket = this.getUserBucket(this.userContext.userId, flag.key);
      value =
        flag.defaultValue === true && userBucket <= flag.rolloutPercentage;
      source = userBucket <= flag.rolloutPercentage ? "local" : "default";
    }
    return { key: flag.key, value, source, evaluatedAt: Date.now() };
  }
  private getUserBucket(userId: string, flagKey: string): number {
    const str = `${userId}:${flagKey}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash % 100) + 1;
  }
  private checkVersion(current: string, constraint: string): boolean {
    const currentParts = current.split(".").map(Number);
    const constraintParts = constraint.replace(">=", "").split(".").map(Number);
    for (
      let i = 0;
      i < Math.max(currentParts.length, constraintParts.length);
      i++
    ) {
      const currentPart = currentParts[i] || 0;
      const constraintPart = constraintParts[i] || 0;
      if (currentPart > constraintPart) {
        return true;
      }
      if (currentPart < constraintPart) {
        return false;
      }
    }
    return true;
  }
  async syncRemoteFlags(remoteFlags: FeatureFlagConfig[]): Promise<void> {
    debug.info("Syncing %d remote flags", remoteFlags.length);
    remoteFlags.forEach((flag) => {
      const existing = this.flags.get(flag.key);
      if (existing) {
        this.flags.set(flag.key, { ...existing, ...flag });
      } else {
        this.flags.set(flag.key, flag);
      }
    });
    this.lastSync = Date.now();
    this.saveToStorage();
    this.evaluations.clear();
  }
  registerFlag(flag: FeatureFlagConfig): void {
    this.flags.set(flag.key, flag);
    debug.info("Registered flag: %s", flag.key);
  }
  overrideFlag(key: string, value: FeatureFlagValue): void {
    const flag = this.flags.get(key);
    if (flag) {
      this.evaluations.set(key, {
        key,
        value,
        source: "local",
        evaluatedAt: Date.now(),
      });
      debug.info("Overrode flag %s to %s", key, String(value));
    }
  }
  getAllFlags(): Record<string, FeatureFlagValue> {
    const result: Record<string, FeatureFlagValue> = {};
    this.flags.forEach((flag, key) => {
      result[key] = this.getValue(key, flag.defaultValue);
    });
    return result;
  }
  getFlagDetails(key: string): FlagEvaluation | null {
    return this.evaluations.get(key) || null;
  }
}
let featureFlagEngine: FeatureFlagEngine | null = null;
export function getFeatureFlagEngine(): FeatureFlagEngine {
  if (!featureFlagEngine) {
    featureFlagEngine = new FeatureFlagEngine();
  }
  return featureFlagEngine;
}
export const featureFlags = {
  isEnabled: (key: string) => getFeatureFlagEngine().isEnabled(key),
  getValue: <T extends FeatureFlagValue>(key: string, defaultValue: T) =>
    getFeatureFlagEngine().getValue(key, defaultValue),
  setUserContext: (context: UserContext) =>
    getFeatureFlagEngine().setUserContext(context),
  clearUserContext: () => getFeatureFlagEngine().clearUserContext(),
  override: (key: string, value: FeatureFlagValue) =>
    getFeatureFlagEngine().overrideFlag(key, value),
  sync: (flags: FeatureFlagConfig[]) =>
    getFeatureFlagEngine().syncRemoteFlags(flags),
  getAll: () => getFeatureFlagEngine().getAllFlags(),
};
export default FeatureFlagEngine;
