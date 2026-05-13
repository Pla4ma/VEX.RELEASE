/**
 * Feature flags hook state
 */
export interface FeatureFlagsState {
    flags: Record<string, FeatureFlag>;
    loading: boolean;
    error: Error | null;
    initialized: boolean;
}

/**
 * Feature flags hook return value
 */
export interface UseFeatureFlagsReturn extends FeatureFlagsState {
    isEnabled: (key: string) => boolean;
    get: (key: string) => FeatureFlagValue | null;
    setOverride: (key: string, value: FeatureFlagValue) => Promise<void>;
    clearOverride: (key: string) => Promise<void>;
    refresh: () => Promise<void>;
}

/**
 * Feature flag check hook return value
 */
export interface UseFeatureFlagReturn {
    enabled: boolean;
    value: FeatureFlagValue | null;
    loading: boolean;
}
