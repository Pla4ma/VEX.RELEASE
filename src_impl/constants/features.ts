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
  // Core Features - Launch Enabled by Default
  SESSIONS: 'sessions',
  SESSION_GRADING: 'session_grading',
  FOCUS_SCORE: 'focus_score',
  DAILY_MISSION: 'daily_mission',
  COMPANION: 'companion',
  STREAKS: 'streaks',
  COMEBACK_QUEST: 'comeback_quest',
  BASIC_REWARDS: 'basic_rewards',
  XP_PROGRESSION: 'xp_progression',
  AI_COACH_BASICS: 'ai_coach_basics',
  PAYWALL: 'paywall',
  SETTINGS: 'settings',

  // Optional Features - Launch Optional
  BASIC_SOLO_BOSS: 'basic_solo_boss',
  BASIC_CHALLENGES: 'basic_challenges',
  SQUADS_ACCOUNTABILITY: 'squads_accountability',
  MONTHLY_REPORT: 'monthly_report',

  // Disabled Features - Launch Disabled
  SOCIAL_FEED: 'social_feed',
  DUELS: 'duels',
  RANKINGS: 'rankings',
  SQUAD_WARS: 'squad_wars',
  RIVALS: 'rivals',
  TRADING: 'trading',
  EMERGENCY_GEM_SINKS: 'emergency_gem_sinks',
  COMPLEX_CRAFTING: 'complex_crafting',
  AR_EXPERIMENTAL: 'ar_experimental',

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
  // Core Features - Launch Enabled by Default
  [FEATURE_FLAGS.SESSIONS]: true,
  [FEATURE_FLAGS.SESSION_GRADING]: true,
  [FEATURE_FLAGS.FOCUS_SCORE]: true,
  [FEATURE_FLAGS.DAILY_MISSION]: true,
  [FEATURE_FLAGS.COMPANION]: true,
  [FEATURE_FLAGS.STREAKS]: true,
  [FEATURE_FLAGS.COMEBACK_QUEST]: true,
  [FEATURE_FLAGS.BASIC_REWARDS]: true,
  [FEATURE_FLAGS.XP_PROGRESSION]: true,
  [FEATURE_FLAGS.AI_COACH_BASICS]: true,
  [FEATURE_FLAGS.PAYWALL]: true,
  [FEATURE_FLAGS.SETTINGS]: true,

  // Optional Features - Launch Optional (enabled by default but can be disabled)
  [FEATURE_FLAGS.BASIC_SOLO_BOSS]: false, // Start disabled, enable if stable
  [FEATURE_FLAGS.BASIC_CHALLENGES]: false, // Start disabled, enable if simple
  [FEATURE_FLAGS.SQUADS_ACCOUNTABILITY]: false, // Start disabled, enable if low-scale works
  [FEATURE_FLAGS.MONTHLY_REPORT]: false, // Start disabled, enable if data supports

  // Disabled Features - Launch Disabled
  [FEATURE_FLAGS.SOCIAL_FEED]: false,
  [FEATURE_FLAGS.DUELS]: false,
  [FEATURE_FLAGS.RANKINGS]: false,
  [FEATURE_FLAGS.SQUAD_WARS]: false,
  [FEATURE_FLAGS.RIVALS]: false,
  [FEATURE_FLAGS.TRADING]: false,
  [FEATURE_FLAGS.EMERGENCY_GEM_SINKS]: false,
  [FEATURE_FLAGS.COMPLEX_CRAFTING]: false,
  [FEATURE_FLAGS.AR_EXPERIMENTAL]: false,

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
  [FEATURE_FLAGS.SQUAD_CREATION]: false, // Disabled until squads accountability is proven
  [FEATURE_FLAGS.SQUAD_EVENTS]: false,
  [FEATURE_FLAGS.SQUAD_TOURNAMENTS]: false,
  [FEATURE_FLAGS.SQUAD_VOICE_CHAT]: false,

  // Economy Features
  [FEATURE_FLAGS.WALLET]: true,
  [FEATURE_FLAGS.TRANSFERS]: false, // Disabled until trading is re-enabled
  [FEATURE_FLAGS.REWARDS]: true,
  [FEATURE_FLAGS.MARKETPLACE]: false,
  [FEATURE_FLAGS.PREMIUM_CURRENCY]: false,

  // Gamification Features
  [FEATURE_FLAGS.ACHIEVEMENTS]: true,
  [FEATURE_FLAGS.LEADERBOARDS]: false, // Disabled until rankings system is stable
  [FEATURE_FLAGS.DAILY_STREAKS]: true,
  [FEATURE_FLAGS.MISSIONS]: true, // Daily mission is core
  [FEATURE_FLAGS.SEASON_PASS]: false,

  // Social Features
  [FEATURE_FLAGS.FRIENDS]: false, // Disabled until social features are stable
  [FEATURE_FLAGS.BLOCKING]: true,
  [FEATURE_FLAGS.DIRECT_MESSAGES]: false,
  [FEATURE_FLAGS.GROUP_MESSAGES]: false,

  // Content Features
  [FEATURE_FLAGS.CONTENT_CREATION]: false,
  [FEATURE_FLAGS.MEDIA_UPLOAD]: false,
  [FEATURE_FLAGS.RICH_TEXT]: false,
  [FEATURE_FLAGS.POLLS]: false,

  // Notification Features
  [FEATURE_FLAGS.PUSH_NOTIFICATIONS]: true,
  [FEATURE_FLAGS.EMAIL_NOTIFICATIONS]: false,
  [FEATURE_FLAGS.SMS_NOTIFICATIONS]: false,
  [FEATURE_FLAGS.SMART_DIGESTS]: false,

  // AI Features
  [FEATURE_FLAGS.AI_ASSISTANT]: false, // Only AI coach basics enabled
  [FEATURE_FLAGS.SMART_SUGGESTIONS]: true, // Part of AI coach basics
  [FEATURE_FLAGS.CONTENT_MODERATION]: false,

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
  // Core Features - Launch Enabled
  [FEATURE_FLAGS.SESSIONS]: 'Core focus sessions and timer functionality',
  [FEATURE_FLAGS.SESSION_GRADING]: 'Session performance grading and feedback',
  [FEATURE_FLAGS.FOCUS_SCORE]: 'Personal focus scoring and tracking',
  [FEATURE_FLAGS.DAILY_MISSION]: 'Daily recommended focus missions',
  [FEATURE_FLAGS.COMPANION]: 'Companion creature that grows with progress',
  [FEATURE_FLAGS.STREAKS]: 'Daily streak tracking and maintenance',
  [FEATURE_FLAGS.COMEBACK_QUEST]: 'Recovery quests after streak breaks',
  [FEATURE_FLAGS.BASIC_REWARDS]: 'Basic reward system for achievements',
  [FEATURE_FLAGS.XP_PROGRESSION]: 'Experience points and leveling system',
  [FEATURE_FLAGS.AI_COACH_BASICS]: 'Basic AI coach recommendations',
  [FEATURE_FLAGS.PAYWALL]: 'Premium features and subscriptions',
  [FEATURE_FLAGS.SETTINGS]: 'App settings and preferences',

  // Optional Features
  [FEATURE_FLAGS.BASIC_SOLO_BOSS]: 'Solo boss battles for motivation',
  [FEATURE_FLAGS.BASIC_CHALLENGES]: 'Daily and weekly challenges',
  [FEATURE_FLAGS.SQUADS_ACCOUNTABILITY]: 'Private squad accountability groups',
  [FEATURE_FLAGS.MONTHLY_REPORT]: 'Monthly progress reports',

  // Disabled Features
  [FEATURE_FLAGS.SOCIAL_FEED]: 'Social activity feed (disabled)',
  [FEATURE_FLAGS.DUELS]: 'Player vs player duels (disabled)',
  [FEATURE_FLAGS.RANKINGS]: 'Global leaderboards (disabled)',
  [FEATURE_FLAGS.SQUAD_WARS]: 'Squad vs squad competitions (disabled)',
  [FEATURE_FLAGS.RIVALS]: 'Rival system and comparisons (disabled)',
  [FEATURE_FLAGS.TRADING]: 'Item trading system (disabled)',
  [FEATURE_FLAGS.EMERGENCY_GEM_SINKS]: 'Emergency gem purchases (disabled)',
  [FEATURE_FLAGS.COMPLEX_CRAFTING]: 'Advanced crafting system (disabled)',
  [FEATURE_FLAGS.AR_EXPERIMENTAL]: 'AR and experimental features (disabled)',

  // Legacy Features
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
  // Core Launch Features (always enabled)
  core: [
    FEATURE_FLAGS.SESSIONS,
    FEATURE_FLAGS.SESSION_GRADING,
    FEATURE_FLAGS.FOCUS_SCORE,
    FEATURE_FLAGS.DAILY_MISSION,
    FEATURE_FLAGS.COMPANION,
    FEATURE_FLAGS.STREAKS,
    FEATURE_FLAGS.COMEBACK_QUEST,
    FEATURE_FLAGS.BASIC_REWARDS,
    FEATURE_FLAGS.XP_PROGRESSION,
    FEATURE_FLAGS.AI_COACH_BASICS,
    FEATURE_FLAGS.PAYWALL,
    FEATURE_FLAGS.SETTINGS,
  ],
  // Optional Launch Features (enable if stable)
  optional: [
    FEATURE_FLAGS.BASIC_SOLO_BOSS,
    FEATURE_FLAGS.BASIC_CHALLENGES,
    FEATURE_FLAGS.SQUADS_ACCOUNTABILITY,
    FEATURE_FLAGS.MONTHLY_REPORT,
  ],
  // Disabled Features (never show at launch)
  disabled: [
    FEATURE_FLAGS.SOCIAL_FEED,
    FEATURE_FLAGS.DUELS,
    FEATURE_FLAGS.RANKINGS,
    FEATURE_FLAGS.SQUAD_WARS,
    FEATURE_FLAGS.RIVALS,
    FEATURE_FLAGS.TRADING,
    FEATURE_FLAGS.EMERGENCY_GEM_SINKS,
    FEATURE_FLAGS.COMPLEX_CRAFTING,
    FEATURE_FLAGS.AR_EXPERIMENTAL,
  ],
  // Legacy Groups
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
