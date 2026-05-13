import { type AppConfig, type AppEnvironment } from "../types/global";


export const SESSION = {
  tokenRefreshThreshold: 5 * 60 * 1000, // Refresh 5 minutes before expiry
  maxConcurrentSessions: 5,
  idleTimeout: 30 * 60 * 1000, // 30 minutes
  absoluteTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

export const NOTIFICATION = {
  maxRetries: 3,
  batchSize: 100,
  maxDisplayed: 5,
  autoDismissDelay: 5000,
  quickReplyTimeout: 60 * 1000, // 1 minute
} as const;

export const NETWORK = {
  offlineRetryDelay: 5000,
  maxOfflineQueue: 100,
  connectionTimeout: 10000,
  syncInterval: 30000,
} as const;

export const ERROR_CODES = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: 'AUTH001',
  AUTH_TOKEN_EXPIRED: 'AUTH002',
  AUTH_TOKEN_INVALID: 'AUTH003',
  AUTH_UNAUTHORIZED: 'AUTH004',
  AUTH_FORBIDDEN: 'AUTH005',

  // Network
  NETWORK_OFFLINE: 'NET001',
  NETWORK_TIMEOUT: 'NET002',
  NETWORK_ERROR: 'NET003',

  // Validation
  VALIDATION_ERROR: 'VAL001',
  VALIDATION_REQUIRED: 'VAL002',
  VALIDATION_FORMAT: 'VAL003',
  VALIDATION_LENGTH: 'VAL004',

  // Data
  DATA_NOT_FOUND: 'DAT001',
  DATA_CONFLICT: 'DAT002',
  DATA_TOO_LARGE: 'DAT003',

  // System
  SYSTEM_ERROR: 'SYS001',
  SYSTEM_MAINTENANCE: 'SYS002',
  SYSTEM_RATE_LIMIT: 'SYS003',
} as const;

export const FEATURE_DEFAULTS = {
  darkMode: false,
  biometrics: true,
  analytics: true,
  crashReporting: true,
  pushNotifications: true,
  inAppPurchases: true,
  experimentalFeatures: false,
  betaFeatures: false,
} as const;