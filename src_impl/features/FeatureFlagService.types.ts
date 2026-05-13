/**
 * Feature flag definition
 */
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

/**
 * Feature flag configuration
 */
export interface FeatureFlagConfig {
    storageKey?: string;
    remoteFetchInterval?: number;
    enableOverrides?: boolean;
}

/**
 * Feature flag value type
 */
export type FeatureFlagValue = boolean | number | string | string[];
