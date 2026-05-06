/**
 * Feature Flag Constants
 *
 * Default values and configuration for feature flags.
 * These control which features are available to users.
 */

/**
 * Feature flag names
 */
export const FEATURE_FLAGS = {
  // UI Features
  DARK_MODE: 'dark_mode',
  DARK_MODE_TOGGLE: 'dark_mode_toggle',
  CUSTOM_THEMES: 'custom_themes',
  REDUCED_MOTION: 'reduced_motion',

  // Navigation Features
  BOTTOM_TABS: 'bottom_tabs',
  GESTURE_NAVIGATION: 'gesture_navigation',
  QUICK_ACTIONS: 'quick_actions',

  // Auth Features
  BIOMETRIC_LOGIN: 'biometric_login',
  SOCIAL_LOGIN: 'social_login',
  MAGIC_LINK_LOGIN: 'magic_link_login',
  TWO_FACTOR_AUTH: 'two_factor_auth',

  // User Features
  PROFILE_CUSTOMIZATION: 'profile_customization',
  AVATAR_FRAME: 'avatar_frame',
  STATUS_MESSAGE: 'status_message',

  // Squad Features
  SQUAD_CREATION: 'squad_creation',
  SQUAD_EVENTS: 'squad_events',
  SQUAD_TOURNAMENTS: 'squad_tournaments',
  SQUAD_VOICE_CHAT: 'squad_voice_chat',

  // Economy Features
  WALLET: 'wallet',
  TRANSFERS: 'transfers',
  REWARDS: 'rewards',
  MARKETPLACE: 'marketplace',
  PREMIUM_CURRENCY: 'premium_currency',

  // Gamification Features
  ACHIEVEMENTS: 'achievements',
  LEADERBOARDS: 'leaderboards',
  DAILY_STREAKS: 'daily_streaks',
  MISSIONS: 'missions',
  SEASON_PASS: 'season_pass',

  // Social Features
  FRIENDS: 'friends',
  BLOCKING: 'blocking',
  DIRECT_MESSAGES: 'direct_messages',
  GROUP_MESSAGES: 'group_messages',

  // Content Features
  CONTENT_CREATION: 'content_creation',
  MEDIA_UPLOAD: 'media_upload',
  RICH_TEXT: 'rich_text',
  POLLS: 'polls',

  // Notification Features
  PUSH_NOTIFICATIONS: 'push_notifications',
  EMAIL_NOTIFICATIONS: 'email_notifications',
  SMS_NOTIFICATIONS: 'sms_notifications',
  SMART_DIGESTS: 'smart_digests',

  // AI Features
  AI_ASSISTANT: 'ai_assistant',
  SMART_SUGGESTIONS: 'smart_suggestions',
  CONTENT_MODERATION: 'content_moderation',

  // Analytics Features
  ANALYTICS: 'analytics',
  CRASH_REPORTING: 'crash_reporting',
  PERFORMANCE_MONITORING: 'performance_monitoring',

  // Beta/Experimental Features
  BETA_FEATURES: 'beta_features',
  EXPERIMENTAL_UI: 'experimental_ui',
  EARLY_ACCESS: 'early_access',
} as const;

/**
 * Feature flag default states
 */
export const FEATURE_FLAG_DEFAULTS: Record<string, boolean> = {
  // UI Features
  [FEATURE_FLAGS.DARK_MODE]: false,
  [FEATURE_FLAGS.DARK_MODE_TOGGLE]: true,
  [FEATURE_FLAGS.CUSTOM_THEMES]: false,
  [FEATURE_FLAGS.REDUCED_MOTION]: false,

  // Navigation Features
  [FEATURE_FLAGS.BOTTOM_TABS]: true,
  [FEATURE_FLAGS.GESTURE_NAVIGATION]: true,
  [FEATURE_FLAGS.QUICK_ACTIONS]: true,

  // Auth Features
  [FEATURE_FLAGS.BIOMETRIC_LOGIN]: true,
  [FEATURE_FLAGS.SOCIAL_LOGIN]: true,
  [FEATURE_FLAGS.MAGIC_LINK_LOGIN]: false,
  [FEATURE_FLAGS.TWO_FACTOR_AUTH]: false,

  // User Features
  [FEATURE_FLAGS.PROFILE_CUSTOMIZATION]: true,
  [FEATURE_FLAGS.AVATAR_FRAME]: false,
  [FEATURE_FLAGS.STATUS_MESSAGE]: true,

  // Squad Features
  [FEATURE_FLAGS.SQUAD_CREATION]: true,
  [FEATURE_FLAGS.SQUAD_EVENTS]: true,
  [FEATURE_FLAGS.SQUAD_TOURNAMENTS]: false,
  [FEATURE_FLAGS.SQUAD_VOICE_CHAT]: false,

  // Economy Features
  [FEATURE_FLAGS.WALLET]: true,
  [FEATURE_FLAGS.TRANSFERS]: true,
  [FEATURE_FLAGS.REWARDS]: true,
  [FEATURE_FLAGS.MARKETPLACE]: false,
  [FEATURE_FLAGS.PREMIUM_CURRENCY]: false,

  // Gamification Features
  [FEATURE_FLAGS.ACHIEVEMENTS]: true,
  [FEATURE_FLAGS.LEADERBOARDS]: true,
  [FEATURE_FLAGS.DAILY_STREAKS]: true,
  [FEATURE_FLAGS.MISSIONS]: false,
  [FEATURE_FLAGS.SEASON_PASS]: false,

  // Social Features
  [FEATURE_FLAGS.FRIENDS]: true,
  [FEATURE_FLAGS.BLOCKING]: true,
  [FEATURE_FLAGS.DIRECT_MESSAGES]: true,
  [FEATURE_FLAGS.GROUP_MESSAGES]: false,

  // Content Features
  [FEATURE_FLAGS.CONTENT_CREATION]: true,
  [FEATURE_FLAGS.MEDIA_UPLOAD]: true,
  [FEATURE_FLAGS.RICH_TEXT]: true,
  [FEATURE_FLAGS.POLLS]: true,

  // Notification Features
  [FEATURE_FLAGS.PUSH_NOTIFICATIONS]: true,
  [FEATURE_FLAGS.EMAIL_NOTIFICATIONS]: true,
  [FEATURE_FLAGS.SMS_NOTIFICATIONS]: false,
  [FEATURE_FLAGS.SMART_DIGESTS]: true,

  // AI Features
  [FEATURE_FLAGS.AI_ASSISTANT]: false,
  [FEATURE_FLAGS.SMART_SUGGESTIONS]: true,
  [FEATURE_FLAGS.CONTENT_MODERATION]: true,

  // Analytics Features
  [FEATURE_FLAGS.ANALYTICS]: true,
  [FEATURE_FLAGS.CRASH_REPORTING]: true,
  [FEATURE_FLAGS.PERFORMANCE_MONITORING]: true,

  // Beta/Experimental Features
  [FEATURE_FLAGS.BETA_FEATURES]: false,
  [FEATURE_FLAGS.EXPERIMENTAL_UI]: false,
  [FEATURE_FLAGS.EARLY_ACCESS]: false,
};

/**
 * Feature flag descriptions for UI display
 */
export const FEATURE_DESCRIPTIONS: Record<string, string> = {
  [FEATURE_FLAGS.DARK_MODE]: 'Enable dark mode for the app interface',
  [FEATURE_FLAGS.BIOMETRIC_LOGIN]: 'Use fingerprint or face recognition to login',
  [FEATURE_FLAGS.SQUAD_VOICE_CHAT]: 'Voice chat within squads (coming soon)',
  [FEATURE_FLAGS.MARKETPLACE]: 'Buy and sell items with other users (coming soon)',
  [FEATURE_FLAGS.AI_ASSISTANT]: 'AI-powered assistant for help and recommendations',
  [FEATURE_FLAGS.BETA_FEATURES]: 'Enable experimental features (may be unstable)',
};

/**
 * Feature groups for organization
 */
export const FEATURE_GROUPS = {
  ui: [
    FEATURE_FLAGS.DARK_MODE,
    FEATURE_FLAGS.DARK_MODE_TOGGLE,
    FEATURE_FLAGS.CUSTOM_THEMES,
    FEATURE_FLAGS.REDUCED_MOTION,
  ],
  auth: [
    FEATURE_FLAGS.BIOMETRIC_LOGIN,
    FEATURE_FLAGS.SOCIAL_LOGIN,
    FEATURE_FLAGS.TWO_FACTOR_AUTH,
  ],
  social: [
    FEATURE_FLAGS.FRIENDS,
    FEATURE_FLAGS.DIRECT_MESSAGES,
    FEATURE_FLAGS.GROUP_MESSAGES,
  ],
  economy: [
    FEATURE_FLAGS.WALLET,
    FEATURE_FLAGS.TRANSFERS,
    FEATURE_FLAGS.REWARDS,
    FEATURE_FLAGS.MARKETPLACE,
  ],
  experimental: [
    FEATURE_FLAGS.BETA_FEATURES,
    FEATURE_FLAGS.EXPERIMENTAL_UI,
    FEATURE_FLAGS.EARLY_ACCESS,
  ],
} as const;
