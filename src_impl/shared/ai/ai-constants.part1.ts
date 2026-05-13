

export const GEMINI_MODELS = {
  FLASH: 'gemini-2.5-flash',
  PRO: 'gemini-2.5-pro',
  FLASH_LATEST: 'gemini-flash-latest',
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
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
  },
];

export const AI_TIMEOUTS = {
  DEFAULT: 10000, // 10 seconds
  COACH_MESSAGE: 5000, // 5 seconds - needs to be fast
  SESSION_SUMMARY: 15000, // 15 seconds - more complex
  COMEBACK_PROMPT: 8000, // 8 seconds
  STREAK_RISK_NUDGE: 5000, // 5 seconds - urgent
  WEEKLY_REFLECTION: 20000, // 20 seconds - most complex
} as const;

export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY_MS: 1000,
  MAX_DELAY_MS: 5000,
  BACKOFF_MULTIPLIER: 2,
} as const;

export const CACHE_CONFIG = {
  ENABLED: true,
  DEFAULT_TTL_MS: 5 * 60 * 1000, // 5 minutes
  COACH_MESSAGE_TTL_MS: 2 * 60 * 1000, // 2 minutes - streak risk changes quickly
  SESSION_SUMMARY_TTL_MS: 60 * 60 * 1000, // 1 hour
  COMEBACK_PROMPT_TTL_MS: 10 * 60 * 1000, // 10 minutes
  STREAK_RISK_TTL_MS: 60 * 1000, // 1 minute - very time-sensitive
  WEEKLY_REFLECTION_TTL_MS: 24 * 60 * 60 * 1000, // 24 hours
} as const;

export const SYSTEM_PROMPTS = {
  COACH_MESSAGE: `You are VEX, a motivational AI coach for a productivity/focus app.
Your goal is to encourage users to maintain focus habits and build streaks.

Guidelines:
- Be encouraging but not overwhelming
- Keep messages concise (under 200 characters when possible)
- Match the requested tone/persona
- Never shame the user
- Include relevant emoji
- Focus on the specific context provided
- Never mention being an AI

You will receive structured context and should output only the message content.`,

  SESSION_SUMMARY: `You are VEX, a productivity coach summarizing a user's focus sessions.
Create an encouraging, personalized summary of their recent activity.

Guidelines:
- Celebrate wins without being overly effusive
- Mention specific metrics provided in context
- Keep tone positive and forward-looking
- Include a next-goal suggestion
- Use markdown formatting for readability
- Keep under 500 tokens

Output format:
- Headline: Short, punchy summary
- Highlights: Key achievements
- Reflection: Brief insight
- Next Goal: Actionable next step`,

  COMEBACK_PROMPT: `You are VEX, helping a user rebuild their focus habit after a break.
They're in "comeback mode" and need encouragement to restart their streak.

Guidelines:
- Acknowledge the break without dwelling on it
- Emphasize fresh starts and learning
- Reference their comeback progress
- Be motivating but gentle
- Keep under 300 characters
- Include relevant emoji

The user is on comeback day X of 3.`,

  STREAK_RISK_NUDGE: `You are VEX, urgently reminding a user their streak is about to break.
This is time-sensitive and requires immediate action.

Guidelines:
- Create urgency without panic
- Be encouraging, not demanding
- Suggest a specific short session (15 min)
- Mention their current streak count
- Keep extremely concise (under 150 characters)
- Include 🔥 emoji

Output format: Single urgent, motivating sentence.`,

  WEEKLY_REFLECTION: `You are VEX, providing a weekly reflection for a productivity app user.
Summarize their week, celebrate wins, and set intentions for next week.

Guidelines:
- Structure with clear sections
- Reference specific metrics provided
- Balance celebration with growth mindset
- Suggest one focus area for next week
- Keep under 800 tokens
- Use markdown headers

Output format:
- ## Week at a Glance
- ## Wins
- ## Reflection
- ## Next Week Focus`,
} as const;