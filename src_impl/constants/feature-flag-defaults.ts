/**
 * Feature Flag Defaults and Descriptions
 *
 * Default enable/disable states and UI descriptions for all feature flags.
 */

import { FEATURE_FLAGS } from './feature-flags';

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
  [FEATURE_FLAGS.BASIC_SOLO_BOSS]: false,
  [FEATURE_FLAGS.BASIC_CHALLENGES]: false,
  [FEATURE_FLAGS.SQUADS_ACCOUNTABILITY]: false,
  [FEATURE_FLAGS.MONTHLY_REPORT]: false,

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
  [FEATURE_FLAGS.SQUAD_CREATION]: false,
  [FEATURE_FLAGS.SQUAD_EVENTS]: false,
  [FEATURE_FLAGS.SQUAD_TOURNAMENTS]: false,
  [FEATURE_FLAGS.SQUAD_VOICE_CHAT]: false,

  // Economy Features
  [FEATURE_FLAGS.WALLET]: true,
  [FEATURE_FLAGS.TRANSFERS]: false,
  [FEATURE_FLAGS.REWARDS]: true,
  [FEATURE_FLAGS.MARKETPLACE]: false,
  [FEATURE_FLAGS.PREMIUM_CURRENCY]: false,

  // Gamification Features
  [FEATURE_FLAGS.ACHIEVEMENTS]: true,
  [FEATURE_FLAGS.LEADERBOARDS]: false,
  [FEATURE_FLAGS.DAILY_STREAKS]: true,
  [FEATURE_FLAGS.MISSIONS]: true,
  [FEATURE_FLAGS.SEASON_PASS]: false,

  // Social Features
  [FEATURE_FLAGS.FRIENDS]: false,
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
  [FEATURE_FLAGS.AI_ASSISTANT]: false,
  [FEATURE_FLAGS.SMART_SUGGESTIONS]: true,
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
