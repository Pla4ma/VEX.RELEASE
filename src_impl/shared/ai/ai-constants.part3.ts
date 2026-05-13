

export const RATE_LIMITS = {
  PER_USER_PER_MINUTE: 10,
  PER_USER_PER_HOUR: 100,
  PER_APP_PER_MINUTE: 1000,
} as const;

export const AI_FEATURE_FLAGS = {
  AI_ENABLED: 'ai_enabled',
  AI_CACHE_ENABLED: 'ai_cache_enabled',
  AI_FALLBACK_ENABLED: 'ai_fallback_enabled',
  AI_COACH_MESSAGES: 'ai_coach_messages',
  AI_SESSION_SUMMARIES: 'ai_session_summaries',
  AI_COMEBACK_PROMPTS: 'ai_comeback_prompts',
  AI_STREAK_NUDGES: 'ai_streak_nudges',
  AI_WEEKLY_REFLECTIONS: 'ai_weekly_reflections',
} as const;