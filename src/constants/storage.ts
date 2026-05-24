/**
 * Storage Constants
 *
 * Keys and configuration for all storage operations.
 * Centralized storage key management to prevent collisions.
 */

/**
 * Storage key namespaces to prevent collisions
 */
export const STORAGE_NAMESPACES = {
  auth: 'vex:auth',
  user: 'vex:user',
  settings: 'vex:settings',
  cache: 'vex:cache',
  analytics: 'vex:analytics',
  featureFlags: 'vex:features',
  network: 'vex:network',
  app: 'vex:app',
} as const;

/**
 * Storage keys for authentication
 */
export const STORAGE_KEYS = {
  // Auth
  AUTH_TOKEN: `${STORAGE_NAMESPACES.auth}:token`,
  REFRESH_TOKEN: `${STORAGE_NAMESPACES.auth}:refreshToken`,
  TOKEN_EXPIRY: `${STORAGE_NAMESPACES.auth}:tokenExpiry`,
  SESSION_ID: `${STORAGE_NAMESPACES.auth}:sessionId`,
  LAST_USER_EMAIL: `${STORAGE_NAMESPACES.auth}:lastEmail`,
  BIOMETRIC_ENABLED: `${STORAGE_NAMESPACES.auth}:biometricEnabled`,

  // User
  USER_PROFILE: `${STORAGE_NAMESPACES.user}:profile`,
  USER_PREFERENCES: `${STORAGE_NAMESPACES.user}:preferences`,
  USER_SETTINGS: `${STORAGE_NAMESPACES.user}:settings`,

  // Settings
  THEME: `${STORAGE_NAMESPACES.settings}:theme`,
  LANGUAGE: `${STORAGE_NAMESPACES.settings}:language`,
  NOTIFICATIONS: `${STORAGE_NAMESPACES.settings}:notifications`,
  NOTIFICATION_ONBOARDING_PROMPT: `${STORAGE_NAMESPACES.settings}:notificationOnboardingPrompt`,
  ONBOARDING_COMPLETE: `${STORAGE_NAMESPACES.settings}:onboardingComplete`,
  ONBOARDING_PROFILE: `${STORAGE_NAMESPACES.settings}:onboardingProfile`,

  // Cache
  API_CACHE: `${STORAGE_NAMESPACES.cache}:api`,
  IMAGE_CACHE: `${STORAGE_NAMESPACES.cache}:images`,
  DATA_CACHE: `${STORAGE_NAMESPACES.cache}:data`,

  // Analytics
  ANALYTICS_USER_ID: `${STORAGE_NAMESPACES.analytics}:userId`,
  ANALYTICS_SESSION: `${STORAGE_NAMESPACES.analytics}:session`,
  ANALYTICS_QUEUE: `${STORAGE_NAMESPACES.analytics}:queue`,

  // Feature Flags
  FEATURE_FLAGS: `${STORAGE_NAMESPACES.featureFlags}:flags`,
  FEATURE_FLAG_CACHE_TIME: `${STORAGE_NAMESPACES.featureFlags}:cacheTime`,

  // Network
  OFFLINE_QUEUE: `${STORAGE_NAMESPACES.network}:offlineQueue`,
  LAST_SYNC_TIME: `${STORAGE_NAMESPACES.network}:lastSync`,

  // App
  APP_VERSION: `${STORAGE_NAMESPACES.app}:version`,
  LAST_CRASH: `${STORAGE_NAMESPACES.app}:lastCrash`,
  INSTALL_DATE: `${STORAGE_NAMESPACES.app}:installDate`,
  FIRST_LAUNCH: `${STORAGE_NAMESPACES.app}:firstLaunch`,
  RATING_PROMPT_SHOWN: `${STORAGE_NAMESPACES.app}:ratingPromptShown`,
} as const;

/**
 * Storage encryption keys
 * These are the keys used for encrypting sensitive data
 */
export const ENCRYPTION_KEYS = {
  AUTH: 'vex_auth_key',
  WALLET: 'vex_wallet_key',
  USER_DATA: 'vex_user_key',
} as const;

/**
 * Storage size limits (in bytes)
 */
export const STORAGE_LIMITS = {
  MAX_ITEM_SIZE: 2 * 1024 * 1024, // 2MB per item
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB for cache
  MAX_OFFLINE_QUEUE: 100, // Max items in offline queue
} as const;

/**
 * Storage TTL values (in milliseconds)
 */
export const STORAGE_TTL = {
  TOKEN: 24 * 60 * 60 * 1000, // 24 hours
  USER_PROFILE: 60 * 60 * 1000, // 1 hour
  CACHE: 5 * 60 * 1000, // 5 minutes
  FEATURE_FLAGS: 30 * 60 * 1000, // 30 minutes
} as const;

/**
 * Storage types
 */
export const STORAGE_TYPES = {
  MMKV: 'mmkv',
  ASYNC_STORAGE: 'asyncStorage',
  ENCRYPTED: 'encrypted',
  SECURE: 'secure',
} as const;

/**
 * Storage priority for multi-tier storage
 */
export const STORAGE_PRIORITY = [
  STORAGE_TYPES.MMKV,
  STORAGE_TYPES.ASYNC_STORAGE,
] as const;
