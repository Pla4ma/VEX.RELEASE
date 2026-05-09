/**
 * Feature Flag Engine
 *
 * Advanced feature flag system for gradual rollouts, A/B testing,
 * and dynamic feature toggling without app updates.
 *
 * Features:
 * - Percentage-based rollouts
 * - User segment targeting
 * - A/B test bucketing
 * - Real-time flag updates
 * - Offline fallback
 */

import { createDebugger } from '@/utils/debug';
import { Platform } from 'react-native';
import { MMKV } from 'react-native-mmkv';

const debug = createDebugger('feature-flags');

// ============================================================================
// Types
// ============================================================================

export type FeatureFlagValue = boolean | string | number;

interface FeatureFlagConfig {
  key: string;
  defaultValue: FeatureFlagValue;
  rolloutPercentage?: number; // 0-100
  targetSegments?: string[];
  platform?: ('ios' | 'android' | 'web')[];
  versionConstraint?: string; // semver
  requiresPremium?: boolean;
  description?: string; // Human-readable explanation
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
  source: 'local' | 'remote' | 'default';
  evaluatedAt: number;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'feature_flags_v1';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Built-in feature flags
export const DEFAULT_FLAGS: FeatureFlagConfig[] = [
  {
    key: 'new_session_ui',
    defaultValue: false,
    rolloutPercentage: 0,
    platform: ['ios', 'android'],
  },
  {
    key: 'ai_coach_v2',
    defaultValue: false,
    rolloutPercentage: 0,
    requiresPremium: true,
  },
  {
    key: 'squad_wars_enabled',
    defaultValue: false,
    rolloutPercentage: 0,
  },
  {
    key: 'battle_pass_season_2',
    defaultValue: false,
    rolloutPercentage: 0,
  },
  {
    key: 'streak_recovery_v2',
    defaultValue: true,
    rolloutPercentage: 50, // Gradual rollout
  },
  {
    key: 'premium_gifting',
    defaultValue: false,
    rolloutPercentage: 0,
    requiresPremium: false, // Free users can receive
  },
  {
    key: 'analytics_enhanced',
    defaultValue: true,
    rolloutPercentage: 100,
  },
  // ===== 10X TRANSFORMATION FLAGS =====
  // Phase 1: Core Loop Revolution
  {
    key: 'real_time_boss_combat',
    defaultValue: false,
    rolloutPercentage: 0, // Start at 0, enable for testing
    description: 'Enable real-time boss combat overlay during sessions',
  },
  {
    key: 'consolidated_session_modes',
    defaultValue: false,
    rolloutPercentage: 0,
    description: 'Use 3 modes (FLOW/CHALLENGE/RECOVERY) instead of 5',
  },
  {
    key: 'real_time_purity_feedback',
    defaultValue: false,
    rolloutPercentage: 0,
    description: 'Show live purity score during sessions',
  },
  // Phase 2: Progression Redesign
  {
    key: 'focus_score_primary',
    defaultValue: true,
    rolloutPercentage: 100,
    description: 'Make Focus Score (300-850) the primary progression metric',
  },
  {
    key: 'mastery_skill_trees',
    defaultValue: false,
    rolloutPercentage: 0,
    description: 'Enable skill tree progression (Endurance/Intensity/Social/Tactics)',
  },
  {
    key: 'prestige_system',
    defaultValue: false,
    rolloutPercentage: 0,
    description: 'Enable ascension/prestige for max-level users',
  },
  // Phase 3: Social Systems
  {
    key: 'squad_energy_system',
    defaultValue: true,
    rolloutPercentage: 100,
    description: 'Replace synergy with energy pool mechanic',
  },
  {
    key: 'help_request_system',
    defaultValue: true,
    rolloutPercentage: 100,
    description: 'Enable "Send Help" during difficult sessions',
  },
  {
    key: 'squad_tournaments',
    defaultValue: false,
    rolloutPercentage: 0,
    description: 'Enable weekly squad vs squad tournaments',
  },
  // Phase 4: Economy
  {
    key: 'consolidated_currencies',
    defaultValue: true,
    rolloutPercentage: 100,
    description: 'Remove seasonal currency, use only COINS and GEMS',
  },
  {
    key: 'focus_points_currency',
    defaultValue: true,
    rolloutPercentage: 100,
    description: 'Enable FOCUS_POINTS as simplified primary earning currency',
  },
  {
    key: 'emergency_gem_sinks',
    defaultValue: false,
    rolloutPercentage: 0,
    description: 'DISABLED: Emergency gem sinks (streak freeze, boss retry, session save) - dark pattern risk',
  },
  {
    key: 'trading_system',
    defaultValue: false,
    rolloutPercentage: 0,
    description: 'Enable item trading between users',
  },
  // Phase 5: Retention
  {
    key: 'prime_time_events',
    defaultValue: true,
    rolloutPercentage: 100,
    description: 'Enable scheduled bonus windows (Morning Rally, Power Hour, etc)',
  },
  {
    key: 'streak_creature_system',
    defaultValue: true,
    rolloutPercentage: 100,
    description: 'Replace streak numbers with evolving creature companions',
  },
  {
    key: 'weekly_boss_raids',
    defaultValue: false,
    rolloutPercentage: 0,
    description: 'Enable weekend epic boss raids for squad collaboration',
  },
  {
    key: 'boss_bounty_system',
    defaultValue: false,
    rolloutPercentage: 0,
    description: 'DISABLED: Boss bounty loot multiplier system until economy risk is resolved',
  },
  {
    key: 'squad_boss_system',
    defaultValue: false,
    rolloutPercentage: 0,
    description: 'DISABLED: Squad boss subsystem until squads are simplified',
  },
  // Phase 6: AI Coach
  {
    key: 'predictive_interventions',
    defaultValue: true,
    rolloutPercentage: 100,
    description: 'AI predicts and prevents problems vs reactive',
  },
  {
    key: 'adaptive_difficulty',
    defaultValue: true,
    rolloutPercentage: 100,
    description: 'Dynamic boss difficulty based on user performance',
  },
  // System Sunsets (gradual deprecation)
  {
    key: 'legacy_linear_leveling',
    defaultValue: true, // Start enabled, sunset gradually
    rolloutPercentage: 0, // Phase 8A: Complete sunset
    description: 'DEPRECATED: Old linear level system (being replaced by Focus Score)',
  },
  {
    key: 'legacy_squad_synergy',
    defaultValue: true, // Start enabled, sunset gradually
    rolloutPercentage: 0, // Phase 8A: Complete sunset
    description: 'DEPRECATED: Old synergy system (being replaced by Energy)',
  },
  {
    key: 'legacy_seasonal_currency',
    defaultValue: true,
    rolloutPercentage: 0, // Phase 8A: Complete sunset
    description: 'DEPRECATED: Seasonal currency (being removed)',
  },
];

// ============================================================================
// Feature Flag Engine
// ============================================================================

class FeatureFlagEngine {
  private flags: Map<string, FeatureFlagConfig> = new Map();
  private evaluations: Map<string, FlagEvaluation> = new Map();
  private userContext: UserContext | null = null;
  private lastSync: number = 0;
  private storage = new MMKV({ id: 'feature-flags' });

  constructor() {
    this.loadDefaults();
    this.loadFromStorage();
  }

  /**
   * Load default feature flags
   */
  private loadDefaults(): void {
    DEFAULT_FLAGS.forEach((flag) => {
      this.flags.set(flag.key, flag);
    });
    debug.info('Loaded %d default flags', DEFAULT_FLAGS.length);
  }

  /**
   * Load cached flags from storage
   */
  private loadFromStorage(): void {
    try {
      const cached = this.storage.getString(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as FeatureFlagConfig[];
        parsed.forEach((flag) => {
          // Merge with defaults, preferring cached values
          const existing = this.flags.get(flag.key);
          if (existing) {
            this.flags.set(flag.key, { ...existing, ...flag });
          }
        });
        debug.info('Loaded %d flags from storage', parsed.length);
      }
    } catch (error) {
      debug.warn('Failed to load flags from storage: %s', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Save flags to storage
   */
  private saveToStorage(): void {
    try {
      const flagsArray = Array.from(this.flags.values());
      this.storage.set(STORAGE_KEY, JSON.stringify(flagsArray));
    } catch (error) {
      debug.warn('Failed to save flags to storage: %s', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Set user context for flag evaluation
   */
  setUserContext(context: UserContext): void {
    this.userContext = context;
    debug.info('User context set: %s', context.userId);
  }

  /**
   * Clear user context (on logout)
   */
  clearUserContext(): void {
    this.userContext = null;
    this.evaluations.clear();
    debug.info('User context cleared');
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(key: string): boolean {
    const flag = this.flags.get(key);
    if (!flag) {
      return false;
    }
    const evaluation = this.evaluateFlag(flag);
    return evaluation.value === true;
  }

  /**
   * Get feature flag value with full evaluation
   */
  getValue<T extends FeatureFlagValue>(key: string, defaultValue: T): T {
    const flag = this.flags.get(key);
    if (!flag) {
      return defaultValue;
    }

    // Check cache
    const cached = this.evaluations.get(key);
    if (cached && Date.now() - cached.evaluatedAt < CACHE_DURATION_MS) {
      return cached.value as T;
    }

    // Evaluate flag
    const evaluation = this.evaluateFlag(flag);
    this.evaluations.set(key, evaluation);

    return evaluation.value as T;
  }

  /**
   * Evaluate a feature flag against current context
   */
  private evaluateFlag(flag: FeatureFlagConfig): FlagEvaluation {
    let value = flag.defaultValue;
    let source: FlagEvaluation['source'] = 'default';

    // Platform check
    if (flag.platform && flag.platform.length > 0) {
      const currentPlatform = Platform.OS as 'ios' | 'android' | 'web';
      if (!flag.platform.includes(currentPlatform)) {
        return {
          key: flag.key,
          value: false,
          source: 'default',
          evaluatedAt: Date.now(),
        };
      }
    }

    // Premium check
    if (flag.requiresPremium && this.userContext) {
      const isPremium = this.userContext.isPremium;
      if (isPremium !== true) {
        return {
          key: flag.key,
          value: false,
          source: 'default',
          evaluatedAt: Date.now(),
        };
      }
    }

    // Version constraint check (simplified semver)
    if (flag.versionConstraint && this.userContext?.appVersion) {
      if (!this.checkVersion(this.userContext.appVersion, flag.versionConstraint)) {
        return {
          key: flag.key,
          value: false,
          source: 'default',
          evaluatedAt: Date.now(),
        };
      }
    }

    // Segment targeting
    if (flag.targetSegments && this.userContext?.segment) {
      if (!flag.targetSegments.includes(this.userContext.segment)) {
        return {
          key: flag.key,
          value: false,
          source: 'default',
          evaluatedAt: Date.now(),
        };
      }
    }

    // Rollout percentage gates boolean flags on; it must never invert disabled flags.
    if (flag.rolloutPercentage !== undefined && this.userContext && typeof flag.defaultValue === 'boolean') {
      const userBucket = this.getUserBucket(this.userContext.userId, flag.key);
      value = flag.defaultValue === true && userBucket <= flag.rolloutPercentage;
      source = userBucket <= flag.rolloutPercentage ? 'local' : 'default';
    }

    return {
      key: flag.key,
      value,
      source,
      evaluatedAt: Date.now(),
    };
  }

  /**
   * Get user bucket for percentage rollout (consistent per user+flag)
   */
  private getUserBucket(userId: string, flagKey: string): number {
    // Simple hash function for consistent bucketing
    const str = `${userId}:${flagKey}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      // eslint-disable-next-line no-bitwise
      hash = (hash << 5) - hash + char;
      // eslint-disable-next-line no-bitwise
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash % 100) + 1; // 1-100
  }

  /**
   * Check version constraint (simplified)
   */
  private checkVersion(current: string, constraint: string): boolean {
    // Simplified version check - could use semver library
    const currentParts = current.split('.').map(Number);
    const constraintParts = constraint.replace('>=', '').split('.').map(Number);

    for (let i = 0; i < Math.max(currentParts.length, constraintParts.length); i++) {
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

  /**
   * Update feature flags from remote
   */
  async syncRemoteFlags(remoteFlags: FeatureFlagConfig[]): Promise<void> {
    debug.info('Syncing %d remote flags', remoteFlags.length);

    remoteFlags.forEach((flag) => {
      const existing = this.flags.get(flag.key);
      if (existing) {
        // Merge remote values with local config
        this.flags.set(flag.key, { ...existing, ...flag });
      } else {
        this.flags.set(flag.key, flag);
      }
    });

    this.lastSync = Date.now();
    this.saveToStorage();

    // Re-evaluate all cached evaluations
    this.evaluations.clear();
  }

  /**
   * Register a new feature flag dynamically
   */
  registerFlag(flag: FeatureFlagConfig): void {
    this.flags.set(flag.key, flag);
    debug.info('Registered flag: %s', flag.key);
  }

  /**
   * Override a flag value locally (for testing)
   */
  overrideFlag(key: string, value: FeatureFlagValue): void {
    const flag = this.flags.get(key);
    if (flag) {
      this.evaluations.set(key, {
        key,
        value,
        source: 'local',
        evaluatedAt: Date.now(),
      });
      debug.info('Overrode flag %s to %s', key, String(value));
    }
  }

  /**
   * Get all flag statuses (for debugging)
   */
  getAllFlags(): Record<string, FeatureFlagValue> {
    const result: Record<string, FeatureFlagValue> = {};
    this.flags.forEach((flag, key) => {
      result[key] = this.getValue(key, flag.defaultValue);
    });
    return result;
  }

  /**
   * Get flag evaluation details
   */
  getFlagDetails(key: string): FlagEvaluation | null {
    return this.evaluations.get(key) || null;
  }
}

// ============================================================================
// Singleton & Exports
// ============================================================================

let featureFlagEngine: FeatureFlagEngine | null = null;

export function getFeatureFlagEngine(): FeatureFlagEngine {
  if (!featureFlagEngine) {
    featureFlagEngine = new FeatureFlagEngine();
  }
  return featureFlagEngine;
}

// Convenience exports
export const featureFlags = {
  isEnabled: (key: string) => getFeatureFlagEngine().isEnabled(key),
  getValue: <T extends FeatureFlagValue>(key: string, defaultValue: T) => getFeatureFlagEngine().getValue(key, defaultValue),
  setUserContext: (context: UserContext) => getFeatureFlagEngine().setUserContext(context),
  clearUserContext: () => getFeatureFlagEngine().clearUserContext(),
  override: (key: string, value: FeatureFlagValue) => getFeatureFlagEngine().overrideFlag(key, value),
  sync: (flags: FeatureFlagConfig[]) => getFeatureFlagEngine().syncRemoteFlags(flags),
  getAll: () => getFeatureFlagEngine().getAllFlags(),
};

export default FeatureFlagEngine;
