import { z } from "zod";
import { AIRequestSchema, AIResponseSchema, GenerateCoachMessageRequestSchema, GenerateCoachMessageResponseSchema, GenerateSessionSummaryRequestSchema, GenerateSessionSummaryResponseSchema, GenerateComebackPromptRequestSchema, GenerateComebackPromptResponseSchema, GenerateStreakRiskNudgeRequestSchema, GenerateStreakRiskNudgeResponseSchema, GenerateWeeklyReflectionRequestSchema, GenerateWeeklyReflectionResponseSchema, type AIRequest, type AIResponse, type GenerateCoachMessageRequest, type GenerateCoachMessageResponse, type GenerateSessionSummaryRequest, type GenerateSessionSummaryResponse, type GenerateComebackPromptRequest, type GenerateComebackPromptResponse, type GenerateStreakRiskNudgeRequest, type GenerateStreakRiskNudgeResponse, type GenerateWeeklyReflectionRequest, type GenerateWeeklyReflectionResponse } from "./ai-types";


export function generateCacheKey(request: AIRequest): string {
  // Hash the relevant parts of the request
  const keyParts = [
    request.requestType,
    request.userId,
    // Include relevant context fields based on request type
    JSON.stringify(request.context),
  ];

  // Simple hash (in production, use proper hashing)
  return keyParts.join('|');
}

export const CLIENT_RETRY_CONFIG = {
  MAX_RETRIES: 2,
  INITIAL_DELAY_MS: 1000,
  MAX_DELAY_MS: 3000,
  BACKOFF_MULTIPLIER: 1.5,

  // Which error codes are retryable
  RETRYABLE_CODES: [
    'NETWORK_ERROR',
    'TIMEOUT',
    'AI_UNAVAILABLE',
  ] as AIClientErrorCode[],
} as const;

export function shouldUseAIFallback(isOnline: boolean, isRetry: boolean): boolean {
  if (!isOnline) {return true;}
  if (isRetry) {return false;} // Allow retry attempts
  return false;
}

export function formatAIContentForDisplay(content: string): {
  text: string;
  hasMarkdown: boolean;
  emoji: string[];
} {
  // Detect markdown
  const hasMarkdown = /[#*_\[]/.test(content);

  // Extract emoji
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  const emoji = content.match(emojiRegex) || [];

  return {
    text: content.trim(),
    hasMarkdown,
    emoji: [...new Set(emoji)], // Deduplicate
  };
}

export function calculateAIRequestPriority(requestType: string): number {
  const priorities: Record<string, number> = {
    GENERATE_STREAK_RISK_NUDGE: 100, // Critical
    GENERATE_COACH_MESSAGE: 80, // High
    GENERATE_COMEBACK_PROMPT: 60, // Medium-High
    GENERATE_SESSION_SUMMARY: 40, // Medium
    GENERATE_WEEKLY_REFLECTION: 20, // Low (can be deferred)
  };

  return priorities[requestType] || 50;
}