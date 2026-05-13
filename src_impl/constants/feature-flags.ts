/**
 * Feature Flag Names
 *
 * Enumeration of all feature flag keys.
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
