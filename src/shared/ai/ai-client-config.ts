import { z } from 'zod';
import type {
  AIRequest,
  AIResponse,
  GenerateCoachMessageRequest,
  GenerateSessionSummaryRequest,
  GenerateComebackPromptRequest,
  GenerateStreakRiskNudgeRequest,
  GenerateWeeklyReflectionRequest,
  GenerateCoachMessageResponse,
  GenerateSessionSummaryResponse,
  GenerateComebackPromptResponse,
  GenerateStreakRiskNudgeResponse,
  GenerateWeeklyReflectionResponse,
} from './ai-types';

export const AIClientErrorCodeSchema = z.enum([
  'NETWORK_ERROR',
  'TIMEOUT',
  'INVALID_REQUEST',
  'SERVER_ERROR',
  'AI_UNAVAILABLE',
  'FALLBACK_USED',
  'UNKNOWN_ERROR',
]);

export type AIClientErrorCode = z.infer<typeof AIClientErrorCodeSchema>;

export interface AIClientError {
  code: AIClientErrorCode;
  message: string;
  requestId?: string;
  retryable: boolean;
  fallbackContent?: string;
}

export interface AIAPIClient {
  sendRequest(request: AIRequest): Promise<AIResponse>;
  generateCoachMessage(
    request: Omit<GenerateCoachMessageRequest, 'requestType'>,
  ): Promise<GenerateCoachMessageResponse>;
  generateSessionSummary(
    request: Omit<GenerateSessionSummaryRequest, 'requestType'>,
  ): Promise<GenerateSessionSummaryResponse>;
  generateComebackPrompt(
    request: Omit<GenerateComebackPromptRequest, 'requestType'>,
  ): Promise<GenerateComebackPromptResponse>;
  generateStreakRiskNudge(
    request: Omit<GenerateStreakRiskNudgeRequest, 'requestType'>,
  ): Promise<GenerateStreakRiskNudgeResponse>;
  generateWeeklyReflection(
    request: Omit<GenerateWeeklyReflectionRequest, 'requestType'>,
  ): Promise<GenerateWeeklyReflectionResponse>;
}

export const CLIENT_FALLBACKS = {
  COACH_MESSAGE: {
    category: 'MOTIVATION_BOOST',
    content: "You're doing great! Keep showing up for yourself.",
    emoji: '✨',
  },
  SESSION_SUMMARY: {
    headline: 'Session Summary',
    content: 'Great work on your focus sessions! Consistency is key.',
  },
  COMEBACK_PROMPT: { content: "Fresh start! You've got this!", emoji: '💪' },
  STREAK_RISK_NUDGE: {
    content: 'Save your streak with a quick session!',
    emoji: '🔥',
    urgency: 'high',
  },
  WEEKLY_REFLECTION: {
    headline: 'Weekly Reflection',
    content: "Another week of progress! You're building strong habits.",
  },
} as const;

export const AIRequestMetadataSchema = z.object({
  timestamp: z.number(),
  appVersion: z.string().optional(),
  platform: z.enum(['ios', 'android']).optional(),
  deviceModel: z.string().optional(),
  osVersion: z.string().optional(),
  screenSize: z.string().optional(),
  locale: z.string().optional(),
});

export type AIRequestMetadata = z.infer<typeof AIRequestMetadataSchema>;

export const CLIENT_CACHE_CONFIG = {
  ENABLED: true,
  TTL_MS: {
    GENERATE_COACH_MESSAGE: 2 * 60 * 1000,
    GENERATE_SESSION_SUMMARY: 5 * 60 * 1000,
    GENERATE_COMEBACK_PROMPT: 10 * 60 * 1000,
    GENERATE_STREAK_RISK_NUDGE: 30 * 1000,
    GENERATE_WEEKLY_REFLECTION: 60 * 60 * 1000,
  },
  MAX_ENTRIES: {
    GENERATE_COACH_MESSAGE: 20,
    GENERATE_SESSION_SUMMARY: 5,
    GENERATE_COMEBACK_PROMPT: 3,
    GENERATE_STREAK_RISK_NUDGE: 5,
    GENERATE_WEEKLY_REFLECTION: 2,
  },
} as const;

export function generateCacheKey(request: AIRequest): string {
  const keyParts = [
    request.requestType,
    request.userId,
    JSON.stringify(request.context),
  ];
  return keyParts.join('|');
}

export const CLIENT_RETRY_CONFIG = {
  MAX_RETRIES: 2,
  INITIAL_DELAY_MS: 1000,
  MAX_DELAY_MS: 3000,
  BACKOFF_MULTIPLIER: 1.5,
  RETRYABLE_CODES: [
    'NETWORK_ERROR',
    'TIMEOUT',
    'AI_UNAVAILABLE',
  ] as AIClientErrorCode[],
} as const;

export interface AIClientUsageMetrics {
  requestId: string;
  userId: string;
  requestType: string;
  timestamp: number;
  networkDurationMs: number;
  cacheHit: boolean;
  success: boolean;
  fallbackUsed: boolean;
  errorCode?: string;
}

export function shouldUseAIFallback(
  isOnline: boolean,
  isRetry: boolean,
): boolean {
  if (!isOnline) {
    return true;
  }
  if (isRetry) {
    return false;
  }
  return false;
}

export function formatAIContentForDisplay(content: string): {
  text: string;
  hasMarkdown: boolean;
  emoji: string[];
} {
  const hasMarkdown = /[#*_\[]/.test(content);
  const emojiRegex =
    /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  const emoji = content.match(emojiRegex) || [];
  return { text: content.trim(), hasMarkdown, emoji: [...new Set(emoji)] };
}

export function calculateAIRequestPriority(requestType: string): number {
  const priorities: Record<string, number> = {
    GENERATE_STREAK_RISK_NUDGE: 100,
    GENERATE_COACH_MESSAGE: 80,
    GENERATE_COMEBACK_PROMPT: 60,
    GENERATE_SESSION_SUMMARY: 40,
    GENERATE_WEEKLY_REFLECTION: 20,
  };
  return priorities[requestType] || 50;
}
