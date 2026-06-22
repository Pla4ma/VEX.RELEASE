import { createDebugger } from '@/utils/debug';
import { createRuntimeMMKV } from '../persistence/mmkv-runtime';
import { DEFAULT_FLAGS } from './defaults';
import { evaluateFlag } from './helpers';
import type {
  FeatureFlagConfig,
  FeatureFlagValue,
  FlagEvaluation,
  UserContext,
} from './types';
import { CACHE_DURATION_MS, STORAGE_KEY } from './types';

export type { FeatureFlagValue, FeatureFlagConfig, UserContext, FlagEvaluation };
export { DEFAULT_FLAGS } from './defaults';

const debug = createDebugger('feature-flags');

class FeatureFlagEngine {
  private flags: Map<string, FeatureFlagConfig> = new Map();
  private evaluations: Map<string, FlagEvaluation> = new Map();
  private userContext: UserContext | null = null;
  private lastSync: number = 0;
  private storage = createRuntimeMMKV({ id: 'feature-flags' });

  constructor() {
    this.loadDefaults();
    this.loadFromStorage();
  }

  private loadDefaults(): void {
    DEFAULT_FLAGS.forEach((flag) => {
      this.flags.set(flag.key, flag);
    });
    debug.info('Loaded %d default flags', DEFAULT_FLAGS.length);
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
        debug.info('Loaded %d flags from storage', parsed.length);
      }
    } catch (error) {
      debug.warn(
        'Failed to load flags from storage: %s',
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
        'Failed to save flags to storage: %s',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  setUserContext(context: UserContext): void {
    this.userContext = context;
    debug.info('User context set: %s', context.userId);
  }

  clearUserContext(): void {
    this.userContext = null;
    this.evaluations.clear();
    debug.info('User context cleared');
  }

  isEnabled(key: string): boolean {
    const flag = this.flags.get(key);
    if (!flag) {
      return false;
    }
    const evaluation = evaluateFlag(flag, this.userContext);
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
    const evaluation = evaluateFlag(flag, this.userContext);
    this.evaluations.set(key, evaluation);
    return evaluation.value as T;
  }

  async syncRemoteFlags(remoteFlags: FeatureFlagConfig[]): Promise<void> {
    debug.info('Syncing %d remote flags', remoteFlags.length);
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
    debug.info('Registered flag: %s', flag.key);
  }

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

export { FeatureFlagEngine }