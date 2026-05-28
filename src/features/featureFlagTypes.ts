export type FeatureFlagValue = boolean | number | string | string[];
export interface FeatureFlag {
  key: string;
  value: FeatureFlagValue;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  requiresAuth: boolean;
  createdAt: number;
  updatedAt: number;
}
export interface FeatureFlagConfig {
  storageKey?: string;
  remoteFetchInterval?: number;
  enableOverrides?: boolean;
}
