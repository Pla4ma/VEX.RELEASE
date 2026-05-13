import { type AppConfig, type AppEnvironment } from "../types/global";


export const ENVIRONMENT: AppEnvironment = (process.env.ENVIRONMENT as AppEnvironment) || 'development';

export const IS_DEVELOPMENT = ENVIRONMENT === 'development';

export const IS_PRODUCTION = ENVIRONMENT === 'production';

export const IS_STAGING = ENVIRONMENT === 'staging';

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

export const CURRENT_CONFIG = APP_CONFIG[ENVIRONMENT];

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

export const RETRY = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
} as const;

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
  minLimit: 5,
  infiniteScrollThreshold: 0.8,
} as const;

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