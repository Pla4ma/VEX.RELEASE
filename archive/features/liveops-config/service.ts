import { captureSilentFailure } from '../../utils/silent-failure';
/**
 * LiveOps Config Service
 *
 * Client-side config management with caching, sync, and feature flag checks.
 */

import { getMMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import * as Sentry from '@sentry/react-native';
import { eventBus } from '../../events';
import * as repository from './repository';
import { ClientConfigSchema, type LiveOpsConfig, type ClientConfig, type ConfigSyncOptions, type ConfigSyncResult, type ABTest, type ABVariant } from './schemas';

// ============================================================================
// Constants
// ============================================================================

const CONFIG_CACHE_KEY = '@vex:liveops:config';
const CONFIG_ETAG_KEY = '@vex:liveops:etag';
const CONFIG_FETCHED_AT_KEY = '@vex:liveops:fetched_at';
const AB_TEST_ASSIGNMENTS_KEY = '@vex:liveops:ab_assignments';

const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const STALE_WHILE_REVALIDATE_TTL = 60 * 60 * 1000; // 1 hour

// ============================================================================
// Service State
// ============================================================================

interface ServiceState {
  config: ClientConfig | null;
  etag: string | null;
  isLoading: boolean;
  lastError: Error | null;
  abTestAssignments: Map<string, string>; // testId -> variantId
}

const state: ServiceState = {
  config: null,
  etag: null,
  isLoading: false,
  lastError: null,
  abTestAssignments: new Map(),
};

// ============================================================================
// Config Initialization
// ============================================================================

/**
 * Initialize the config service from cache
 */
export async function initConfigService(): Promise<void> {
  try {
    const storage = getMMKVStorageAdapter();
    const [cachedConfig, etag, fetchedAt, abAssignments] = await Promise.all([
      storage.getItem(CONFIG_CACHE_KEY),
      storage.getItem(CONFIG_ETAG_KEY),
      storage.getItem(CONFIG_FETCHED_AT_KEY),
      storage.getItem(AB_TEST_ASSIGNMENTS_KEY),
    ]);

    if (cachedConfig && fetchedAt) {
      const parsed = JSON.parse(cachedConfig);
      const validated = ClientConfigSchema.safeParse(parsed);

      if (validated.success) {
        const config = validated.data;
        state.etag = etag;

        // Check if stale
        const age = Date.now() - parseInt(fetchedAt, 10);
        if (age > STALE_WHILE_REVALIDATE_TTL) {
          // Config is stale, don't use it
          state.config = null;
        } else {
          state.config = config;
        }
      }
    }

    if (abAssignments) {
      const parsed = JSON.parse(abAssignments);
      state.abTestAssignments = new Map(Object.entries(parsed));
    }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { service: 'liveops-config', operation: 'init' },
    });
  }
}

// ============================================================================
// Config Sync
// ============================================================================

/**
 * Sync config from server
 */
export async function syncConfig(options: Partial<ConfigSyncOptions> = {}): Promise<ConfigSyncResult> {
  const opts = {
    forceRefresh: false,
    timeoutMs: 5000,
    retryAttempts: 3,
    ...options,
  };

  // Check if we need to sync
  if (!opts.forceRefresh && state.config) {
    const age = Date.now() - state.config.fetchedAt;
    if (age < DEFAULT_CACHE_TTL) {
      return {
        success: true,
        updated: false,
        newVersion: state.config.version,
        diff: null,
        error: null,
      };
    }
  }

  state.isLoading = true;
  state.lastError = null;

  try {
    // Determine environment
    const environment = getEnvironment();

    // Fetch fresh config
    const serverConfig = await repository.fetchCurrentConfig(environment);

    if (!serverConfig) {
      throw new Error('No config found on server');
    }

    // Check if updated
    if (state.config && state.config.version >= serverConfig.version) {
      state.isLoading = false;
      return {
        success: true,
        updated: false,
        newVersion: state.config.version,
        diff: null,
        error: null,
      };
    }

    // Build client config
    const clientConfig: ClientConfig = {
      version: serverConfig.version,
      fetchedAt: Date.now(),
      expiresAt: serverConfig.expiresAt || Date.now() + STALE_WHILE_REVALIDATE_TTL,
      features: serverConfig.features,
      economy: serverConfig.economy,
      seasons: serverConfig.seasons,
      challenges: serverConfig.challenges,
      battlePass: serverConfig.battlePass,
      notifications: serverConfig.notifications,
      limits: serverConfig.limits,
    };

    // Calculate diff
    const diff = state.config ? calculateDiff(state.config, clientConfig) : null;

    // Update state
    const previousVersion = state.config?.version ?? 0;
    state.config = clientConfig;
    state.etag = serverConfig.id; // Use config ID as ETag

    // Persist to cache
    await persistConfig();

    // Record analytics
    await repository.recordConfigFetch(environment, clientConfig.version, null, false);

    // Emit event
    eventBus.publish('config:updated', {
      key: 'liveops-config',
      value: clientConfig,
      previousValue: null,
      source: 'liveops',
      version: String(clientConfig.version),
      previousVersion: previousVersion ? String(previousVersion) : undefined,
      breakingChanges: diff?.breakingChanges ?? false,
    });

    state.isLoading = false;

    return {
      success: true,
      updated: true,
      newVersion: clientConfig.version,
      diff,
      error: null,
    };
  } catch (error) {
    state.isLoading = false;
    state.lastError = error instanceof Error ? error : new Error(String(error));

    Sentry.captureException(error, {
      tags: { service: 'liveops-config', operation: 'sync' },
    });

    return {
      success: false,
      updated: false,
      newVersion: state.config?.version ?? 0,
      diff: null,
      error: state.lastError.message,
    };
  }
}

/**
 * Calculate diff between two configs
 */
function calculateDiff(oldConfig: ClientConfig, newConfig: ClientConfig) {
  const changes = [];
  let breakingChanges = false;

  // Check feature flags
  for (const [key, newValue] of Object.entries(newConfig.features)) {
    const oldValue = (oldConfig.features as Record<string, unknown>)[key];
    if (oldValue !== newValue) {
      changes.push({
        path: `features.${key}`,
        value: newValue,
        previousValue: oldValue,
        updatedAt: Date.now(),
        updatedBy: 'system',
      });

      // Disabling a feature is a breaking change
      if (oldValue === true && newValue === false) {
        breakingChanges = true;
      }
    }
  }

  // Check economy config
  if (oldConfig.economy.premiumPrice !== newConfig.economy.premiumPrice) {
    changes.push({
      path: 'economy.premiumPrice',
      value: newConfig.economy.premiumPrice,
      previousValue: oldConfig.economy.premiumPrice,
      updatedAt: Date.now(),
      updatedBy: 'system',
    });
  }

  return {
    version: newConfig.version,
    previousVersion: oldConfig.version,
    changes,
    breakingChanges,
  };
}

/**
 * Persist config to AsyncStorage
 */
async function persistConfig(): Promise<void> {
  if (!state.config) {return;}

  const storage = getMMKVStorageAdapter();
  await Promise.all([
    storage.setItem(CONFIG_CACHE_KEY, JSON.stringify(state.config)),
    storage.setItem(CONFIG_FETCHED_AT_KEY, String(state.config.fetchedAt)),
    state.etag ? storage.setItem(CONFIG_ETAG_KEY, state.etag) : Promise.resolve(),
    storage.setItem(AB_TEST_ASSIGNMENTS_KEY, JSON.stringify(Object.fromEntries(state.abTestAssignments))),
  ]);
}

// ============================================================================
// Feature Flag API
// ============================================================================

/**
 * Check if a feature is enabled
 */
export function isEnabled(featureName: keyof LiveOpsConfig['features']): boolean {
  if (!state.config) {
    // Return safe defaults if no config loaded
    return getDefaultFeatureValue(featureName);
  }

  const value = state.config.features[featureName];
  return typeof value === 'boolean' ? value : getDefaultFeatureValue(featureName);
}

/**
 * Get all feature flags
 */
export function getFeatureFlags(): LiveOpsConfig['features'] | null {
  return state.config?.features ?? null;
}

/**
 * Get default feature value
 */
function getDefaultFeatureValue(featureName: keyof LiveOpsConfig['features']): boolean {
  const defaults: Record<string, boolean> = {
    seasonsEnabled: true,
    premiumEnabled: true,
    dailyChallengesEnabled: true,
    weeklyChallengesEnabled: true,
    challengeRerollEnabled: true,
    battlePassEnabled: true,
    retroactiveClaimsEnabled: true,
    shopEnabled: true,
    tradingEnabled: false,
    squadsEnabled: true,
    leaderboardsEnabled: true,
    offlineModeEnabled: true,
    cloudSyncEnabled: true,
    aiSessionSummaryEnabled: false,
    aiChallengeGenerationEnabled: false,
    maintenanceMode: false,
    maintenanceMessage: false,
    maintenanceEndTime: false,
  };

  return defaults[featureName] ?? false;
}

// ============================================================================
// Config Section Accessors
// ============================================================================

export function getEconomyConfig(): LiveOpsConfig['economy'] | null {
  return state.config?.economy ?? null;
}

export function getSeasonConfig(): LiveOpsConfig['seasons'] | null {
  return state.config?.seasons ?? null;
}

export function getChallengeConfig(): LiveOpsConfig['challenges'] | null {
  return state.config?.challenges ?? null;
}

export function getBattlePassConfig(): LiveOpsConfig['battlePass'] | null {
  return state.config?.battlePass ?? null;
}

export function getRateLimits(): LiveOpsConfig['limits'] | null {
  return state.config?.limits ?? null;
}

export function getClientConfig(): ClientConfig | null {
  return state.config;
}

// ============================================================================
// A/B Testing
// ============================================================================

/**
 * Get variant assignment for an A/B test
 */
export async function getABTestVariant(
  userId: string,
  test: ABTest
): Promise<ABVariant | null> {
  // Check if already assigned
  const existingAssignment = state.abTestAssignments.get(test.id);
  if (existingAssignment) {
    return test.variants.find(v => v.id === existingAssignment) ?? null;
  }

  // Check server for assignment
  try {
    const serverAssignment = await repository.getUserABTestAssignment(userId, test.id);
    if (serverAssignment) {
      state.abTestAssignments.set(test.id, serverAssignment.variant_id);
      await persistABAssignments();
      return test.variants.find(v => v.id === serverAssignment.variant_id) ?? null;
    }
  } catch (error) { captureSilentFailure(error, { feature: 'liveops-config', operation: 'network-fallback', type: 'network' });
    // Continue to local assignment
  }

  // Local weighted random assignment
  const random = Math.random() * 100;
  let cumulativeWeight = 0;

  for (const variant of test.variants) {
    cumulativeWeight += variant.weight;
    if (random <= cumulativeWeight) {
      // Store assignment
      state.abTestAssignments.set(test.id, variant.id);
      await persistABAssignments();

      // Try to persist to server (best effort)
      repository.assignUserToABTest(userId, test.id, variant.id).catch(() => {
        // Silent fail
      });

      return variant;
    }
  }

  return test.variants[0] ?? null;
}

async function persistABAssignments(): Promise<void> {
  const storage = getMMKVStorageAdapter();
  await storage.setItem(
    AB_TEST_ASSIGNMENTS_KEY,
    JSON.stringify(Object.fromEntries(state.abTestAssignments))
  );
}

// ============================================================================
// Maintenance Mode
// ============================================================================

/**
 * Check if app is in maintenance mode
 */
export function isMaintenanceMode(): boolean {
  return state.config?.features.maintenanceMode ?? false;
}

/**
 * Get maintenance message if in maintenance mode
 */
export function getMaintenanceMessage(): string | null {
  return state.config?.features.maintenanceMessage ?? null;
}

/**
 * Get maintenance end time if set
 */
export function getMaintenanceEndTime(): number | null {
  return state.config?.features.maintenanceEndTime ?? null;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get current environment
 */
function getEnvironment(): 'development' | 'staging' | 'production' {
  // Check for explicit env var
  if (process.env.NODE_ENV === 'production') {return 'production';}
  if (process.env.NODE_ENV === 'staging') {return 'staging';}

  // Default to development
  return 'development';
}

/**
 * Get current config version
 */
export function getConfigVersion(): number {
  return state.config?.version ?? 0;
}

/**
 * Check if config is loading
 */
export function isConfigLoading(): boolean {
  return state.isLoading;
}

/**
 * Get last sync error
 */
export function getLastConfigError(): Error | null {
  return state.lastError;
}

/**
 * Force clear cache (for debugging/emergencies)
 */
export async function clearConfigCache(): Promise<void> {
  state.config = null;
  state.etag = null;
  state.abTestAssignments.clear();

  const storage = getMMKVStorageAdapter();
  await Promise.all([
    storage.removeItem(CONFIG_CACHE_KEY),
    storage.removeItem(CONFIG_ETAG_KEY),
    storage.removeItem(CONFIG_FETCHED_AT_KEY),
    storage.removeItem(AB_TEST_ASSIGNMENTS_KEY),
  ]);
}
