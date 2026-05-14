/**
 * Application Constants
 *
 * Core application configuration and constants.
 * These values control app behavior and are used throughout.
 */

import { type AppConfig, type AppEnvironment } from '../types/global';

/**
 * Current application environment
 * Override via environment variable ENVIRONMENT
 */
export const ENVIRONMENT: AppEnvironment = (process.env.ENVIRONMENT as AppEnvironment) || 'development';

/**
 * Check if running in development mode
 */
export const IS_DEVELOPMENT = ENVIRONMENT === 'development';

/**
 * Check if running in production mode
 */
export const IS_PRODUCTION = ENVIRONMENT === 'production';

/**
 * Check if running in staging mode
 */
export const IS_STAGING = ENVIRONMENT === 'staging';

/**
 * Application metadata
 */
export const APP_METADATA = {
  name: 'VEX',
  fullName: 'VEX App',
  tagline: 'The ultimate mobile experience',
  version: '1.0.0',
  buildNumber: '100',
  bundleId: {
    ios: 'com.vex.app',
    android: 'com.vex.app',
  },
  copyright: `© ${new Date().getFullYear()} VEX Inc.`,
  supportEmail: 'support@vex.app',
  website: 'https://vex.app',
  privacyPolicy: 'https://vex.app/privacy',
  termsOfService: 'https://vex.app/terms',
} as const;

/**
 * Application configuration by environment
 */
export const APP_CONFIG: Record<AppEnvironment, AppConfig> = {
  development: {
    environment: 'development',
    apiUrl: 'https://api-dev.vex.app/v1',
    apiTimeout: 30000,
    version: APP_METADATA.version,
    buildNumber: APP_METADATA.buildNumber,
    bundleId: APP_METADATA.bundleId.ios,
  },
  staging: {
    environment: 'staging',
    apiUrl: 'https://api-staging.vex.app/v1',
    apiTimeout: 30000,
    version: APP_METADATA.version,
    buildNumber: APP_METADATA.buildNumber,
    bundleId: APP_METADATA.bundleId.ios,
  },
  production: {
    environment: 'production',
    apiUrl: 'https://api.vex.app/v1',
    apiTimeout: 30000,
    version: APP_METADATA.version,
    buildNumber: APP_METADATA.buildNumber,
    bundleId: APP_METADATA.bundleId.ios,
  },
};

/**
 * Current app configuration
 */
export const CURRENT_CONFIG = APP_CONFIG[ENVIRONMENT];

/**
 * Animation timing constants
 */
export const ANIMATION = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },
  easing: {
    default: 'easeInOut',
    linear: 'linear',
    easeIn: 'easeIn',
    easeOut: 'easeOut',
    bounce: 'bounce',
    spring: {
      stiffness: 100,
      damping: 10,
      mass: 1,
    },
  },
  delay: {
    none: 0,
    short: 100,
    medium: 250,
    long: 500,
  },
} as const;

/**
 * Retry and backoff constants
 */
export const RETRY = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
} as const;

/**
 * Pagination constants
 */
export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
  minLimit: 5,
  infiniteScrollThreshold: 0.8,
} as const;

/**
 * Cache constants
 */
export const CACHE = {
  ttl: {
    short: 5 * 60 * 1000, // 5 minutes
    medium: 30 * 60 * 1000, // 30 minutes
    long: 24 * 60 * 60 * 1000, // 24 hours
  },
  maxSize: {
    memory: 50 * 1024 * 1024, // 50MB
    disk: 100 * 1024 * 1024, // 100MB
  },
} as const;

/**
 * Debounce and throttle constants
 */
export const TIMING = {
  debounce: {
    search: 300,
    input: 150,
    scroll: 100,
    resize: 200,
  },
  throttle: {
    scroll: 16, // ~60fps
    resize: 100,
    button: 500,
  },
} as const;

/**
 * Date and time format constants
 */
export const DATE_FORMAT = {
  display: {
    date: 'MMM d, yyyy',
    dateTime: 'MMM d, yyyy h:mm a',
    time: 'h:mm a',
    shortDate: 'MM/dd/yy',
    monthYear: 'MMMM yyyy',
    dayOfWeek: 'EEEE',
  },
  api: {
    iso: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
    date: 'yyyy-MM-dd',
    time: 'HH:mm:ss',
  },
} as const;

/**
 * Content limits
 */
export const LIMITS = {
  username: {
    min: 3,
    max: 30,
  },
  displayName: {
    min: 1,
    max: 50,
  },
  bio: {
    max: 500,
  },
  password: {
    min: 8,
    max: 128,
  },
  squadName: {
    min: 3,
    max: 50,
  },
  squadDescription: {
    max: 500,
  },
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxDimensions: {
      width: 4096,
      height: 4096,
    },
  },
} as const;

/**
 * Session constants
 */
export const SESSION = {
  tokenRefreshThreshold: 5 * 60 * 1000, // Refresh 5 minutes before expiry
  maxConcurrentSessions: 5,
  idleTimeout: 30 * 60 * 1000, // 30 minutes
  absoluteTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

/**
 * Notification constants
 */
export const NOTIFICATION = {
  maxRetries: 3,
  batchSize: 100,
  maxDisplayed: 5,
  autoDismissDelay: 5000,
  quickReplyTimeout: 60 * 1000, // 1 minute
} as const;

/**
 * Network constants
 */
export const NETWORK = {
  offlineRetryDelay: 5000,
  maxOfflineQueue: 100,
  connectionTimeout: 10000,
  syncInterval: 30000,
} as const;

/**
 * Error codes
 */
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

/**
 * Feature flags default states
 */
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
