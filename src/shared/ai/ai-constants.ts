export {
  GEMINI_MODELS,
  DEFAULT_MODEL,
  MODEL_BY_USE_CASE,
  GENERATION_CONFIG,
  SAFETY_SETTINGS,
  AI_TIMEOUTS,
  RETRY_CONFIG,
  CACHE_CONFIG,
} from './ai-models';
export {
  SYSTEM_PROMPTS,
  USER_PROMPT_TEMPLATES,
} from './ai-prompts';
export { FALLBACK_CONTENT } from './ai-fallback-content';

export const VALIDATION_RULES = {
  COACH_MESSAGE: {
    minLength: 10,
    maxLength: 1000,
    requiredKeywords: [],
    forbiddenPatterns: [
      /i am an ai/i,
      /as an ai/i,
      /i am just/i,
      /i cannot/i,
      /i do not have/i,
    ],
  },
  SESSION_SUMMARY: {
    minLength: 50,
    maxLength: 2000,
    requiredSections: ['headline', 'reflection'],
  },
  COMEBACK_PROMPT: {
    minLength: 20,
    maxLength: 500,
    requiredKeywords: ['comeback', 'streak'],
  },
  STREAK_RISK_NUDGE: {
    minLength: 10,
    maxLength: 300,
    requiredKeywords: ['streak', 'session'],
    requiredEmoji: ['🔥'],
  },
  WEEKLY_REFLECTION: {
    minLength: 100,
    maxLength: 3000,
    requiredSections: ['week', 'wins', 'reflection', 'focus'],
  },
} as const;

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
