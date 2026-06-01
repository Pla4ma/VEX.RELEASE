export type FeatureFlagValue = boolean | string | number;

export interface FeatureFlagConfig {
  key: string;
  defaultValue: FeatureFlagValue;
  rolloutPercentage?: number;
  targetSegments?: string[];
  platform?: ('ios' | 'android' | 'web')[];
  versionConstraint?: string;
  requiresPremium?: boolean;
  description?: string;
}

export interface UserContext {
  userId: string;
  segment?: string;
  isPremium?: boolean;
  appVersion?: string;
  platform?: string;
}

export interface FlagEvaluation {
  key: string;
  value: FeatureFlagValue;
  source: 'local' | 'remote' | 'default';
  evaluatedAt: number;
}

export const STORAGE_KEY = 'feature_flags_v1';
export const CACHE_DURATION_MS = 5 * 60 * 1000;
