export const GEMINI_MODELS = {
  FLASH: "gemini-2.5-flash",
  PRO: "gemini-2.5-pro",
  FLASH_LATEST: "gemini-flash-latest",
} as const;
export const DEFAULT_MODEL = GEMINI_MODELS.FLASH;
export const MODEL_BY_USE_CASE: Record<string, string> = {
  GENERATE_COACH_MESSAGE: GEMINI_MODELS.FLASH,
  GENERATE_SESSION_SUMMARY: GEMINI_MODELS.PRO,
  GENERATE_COMEBACK_PROMPT: GEMINI_MODELS.FLASH,
  GENERATE_STREAK_RISK_NUDGE: GEMINI_MODELS.FLASH,
  GENERATE_WEEKLY_REFLECTION: GEMINI_MODELS.PRO,
  GENERATE_PERSONALIZED_TIP: GEMINI_MODELS.FLASH,
};
export const GENERATION_CONFIG = {
  COACH_MESSAGE: {
    temperature: 0.7,
    maxOutputTokens: 200,
    topP: 0.9,
    topK: 40,
  },
  SESSION_SUMMARY: {
    temperature: 0.8,
    maxOutputTokens: 500,
    topP: 0.9,
    topK: 40,
  },
  COMEBACK_PROMPT: {
    temperature: 0.8,
    maxOutputTokens: 300,
    topP: 0.9,
    topK: 40,
  },
  STREAK_RISK_NUDGE: {
    temperature: 0.9,
    maxOutputTokens: 150,
    topP: 0.95,
    topK: 60,
  },
  WEEKLY_REFLECTION: {
    temperature: 0.8,
    maxOutputTokens: 800,
    topP: 0.9,
    topK: 40,
  },
} as const;
export const SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
];
export const AI_TIMEOUTS = {
  DEFAULT: 10000,
  COACH_MESSAGE: 5000,
  SESSION_SUMMARY: 15000,
  COMEBACK_PROMPT: 8000,
  STREAK_RISK_NUDGE: 5000,
  WEEKLY_REFLECTION: 20000,
} as const;
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY_MS: 1000,
  MAX_DELAY_MS: 5000,
  BACKOFF_MULTIPLIER: 2,
} as const;
export const CACHE_CONFIG = {
  ENABLED: true,
  DEFAULT_TTL_MS: 5 * 60 * 1000,
  COACH_MESSAGE_TTL_MS: 2 * 60 * 1000,
  SESSION_SUMMARY_TTL_MS: 60 * 60 * 1000,
  COMEBACK_PROMPT_TTL_MS: 10 * 60 * 1000,
  STREAK_RISK_TTL_MS: 60 * 1000,
  WEEKLY_REFLECTION_TTL_MS: 24 * 60 * 60 * 1000,
} as const;
