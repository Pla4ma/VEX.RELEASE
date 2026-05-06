/**
 * AI Client Contracts - React Native to Backend
 *
 * These contracts define how the React Native app communicates
 * with the backend for AI operations.
 *
 * CRITICAL RULES:
 * - No Gemini API keys in this file
 * - No direct Gemini API calls from client
 * - All AI requests go through our backend (Supabase Edge Functions or Trigger.dev)
 * - Client sends typed requests, receives typed responses
 * - Backend handles all AI orchestration
 */

import { z } from 'zod';
import {
  AIRequestSchema,
  AIResponseSchema,
  GenerateCoachMessageRequestSchema,
  GenerateCoachMessageResponseSchema,
  GenerateSessionSummaryRequestSchema,
  GenerateSessionSummaryResponseSchema,
  GenerateComebackPromptRequestSchema,
  GenerateComebackPromptResponseSchema,
  GenerateStreakRiskNudgeRequestSchema,
  GenerateStreakRiskNudgeResponseSchema,
  GenerateWeeklyReflectionRequestSchema,
  GenerateWeeklyReflectionResponseSchema,
  type AIRequest,
  type AIResponse,
  type GenerateCoachMessageRequest,
  type GenerateCoachMessageResponse,
  type GenerateSessionSummaryRequest,
  type GenerateSessionSummaryResponse,
  type GenerateComebackPromptRequest,
  type GenerateComebackPromptResponse,
  type GenerateStreakRiskNudgeRequest,
  type GenerateStreakRiskNudgeResponse,
  type GenerateWeeklyReflectionRequest,
  type GenerateWeeklyReflectionResponse,
} from './ai-types';

// ============================================================================
// API Endpoint Definitions
// ============================================================================

/**
 * AI API endpoints (all server-side)
 * These are called by the React Native app, which then routes to Gemini
 */
export const AI_API_ENDPOINTS = {
  // Supabase Edge Functions
  EDGE_FUNCTION_BASE: '/functions/v1',
  GENERATE_COACH_MESSAGE: '/functions/v1/ai/coach-message',
  GENERATE_SESSION_SUMMARY: '/functions/v1/ai/session-summary',
  GENERATE_COMEBACK_PROMPT: '/functions/v1/ai/comeback-prompt',
  GENERATE_STREAK_NUDGE: '/functions/v1/ai/streak-nudge',
  GENERATE_WEEKLY_REFLECTION: '/functions/v1/ai/weekly-reflection',

  // Alternative: Trigger.dev job endpoints
  TRIGGER_JOB_BASE: '/api/jobs',
} as const;

// ============================================================================
// Request Validation
// ============================================================================

/**
 * Validate AI request from client before sending to backend
 * This runs on the React Native side before the API call
 */
export function validateAIRequest(request: unknown): AIRequest {
  return AIRequestSchema.parse(request);
}

/**
 * Type-safe request builders for each use case
 * Use these to construct requests in the React Native app
 */

export function buildCoachMessageRequest(
  params: Omit<GenerateCoachMessageRequest, 'requestType'>
): GenerateCoachMessageRequest {
  return GenerateCoachMessageRequestSchema.parse({
    requestType: 'GENERATE_COACH_MESSAGE',
    ...params,
  });
}

export function buildSessionSummaryRequest(
  params: Omit<GenerateSessionSummaryRequest, 'requestType'>
): GenerateSessionSummaryRequest {
  return GenerateSessionSummaryRequestSchema.parse({
    requestType: 'GENERATE_SESSION_SUMMARY',
    ...params,
  });
}

export function buildComebackPromptRequest(
  params: Omit<GenerateComebackPromptRequest, 'requestType'>
): GenerateComebackPromptRequest {
  return GenerateComebackPromptRequestSchema.parse({
    requestType: 'GENERATE_COMEBACK_PROMPT',
    ...params,
  });
}

export function buildStreakRiskNudgeRequest(
  params: Omit<GenerateStreakRiskNudgeRequest, 'requestType'>
): GenerateStreakRiskNudgeRequest {
  return GenerateStreakRiskNudgeRequestSchema.parse({
    requestType: 'GENERATE_STREAK_RISK_NUDGE',
    ...params,
  });
}

export function buildWeeklyReflectionRequest(
  params: Omit<GenerateWeeklyReflectionRequest, 'requestType'>
): GenerateWeeklyReflectionRequest {
  return GenerateWeeklyReflectionRequestSchema.parse({
    requestType: 'GENERATE_WEEKLY_REFLECTION',
    ...params,
  });
}

// ============================================================================
// Response Validation
// ============================================================================

/**
 * Validate AI response from backend before using in React Native app
 * This ensures type safety and validates the response structure
 */
export function validateAIResponse(response: unknown): AIResponse {
  return AIResponseSchema.parse(response);
}

/**
 * Response parsers for each use case
 * These extract the specific response type from the union type
 */

export function parseCoachMessageResponse(
  response: AIResponse
): GenerateCoachMessageResponse {
  if (response.requestType !== 'GENERATE_COACH_MESSAGE') {
    throw new Error(
      `Expected GENERATE_COACH_MESSAGE response, got ${response.requestType}`
    );
  }
  return GenerateCoachMessageResponseSchema.parse(response);
}

export function parseSessionSummaryResponse(
  response: AIResponse
): GenerateSessionSummaryResponse {
  if (response.requestType !== 'GENERATE_SESSION_SUMMARY') {
    throw new Error(
      `Expected GENERATE_SESSION_SUMMARY response, got ${response.requestType}`
    );
  }
  return GenerateSessionSummaryResponseSchema.parse(response);
}

export function parseComebackPromptResponse(
  response: AIResponse
): GenerateComebackPromptResponse {
  if (response.requestType !== 'GENERATE_COMEBACK_PROMPT') {
    throw new Error(
      `Expected GENERATE_COMEBACK_PROMPT response, got ${response.requestType}`
    );
  }
  return GenerateComebackPromptResponseSchema.parse(response);
}

export function parseStreakRiskNudgeResponse(
  response: AIResponse
): GenerateStreakRiskNudgeResponse {
  if (response.requestType !== 'GENERATE_STREAK_RISK_NUDGE') {
    throw new Error(
      `Expected GENERATE_STREAK_RISK_NUDGE response, got ${response.requestType}`
    );
  }
  return GenerateStreakRiskNudgeResponseSchema.parse(response);
}

export function parseWeeklyReflectionResponse(
  response: AIResponse
): GenerateWeeklyReflectionResponse {
  if (response.requestType !== 'GENERATE_WEEKLY_REFLECTION') {
    throw new Error(
      `Expected GENERATE_WEEKLY_REFLECTION response, got ${response.requestType}`
    );
  }
  return GenerateWeeklyReflectionResponseSchema.parse(response);
}

// ============================================================================
// API Client Interface
// ============================================================================

/**
 * Interface for AI API client
 * Implementations will be in the React Native app
 * All implementations call backend, NOT Gemini directly
 */
export interface AIAPIClient {
  /**
   * Send AI request to backend
   * @param request - Validated AI request
   * @returns Promise of validated AI response
   */
  sendRequest(request: AIRequest): Promise<AIResponse>;

  /**
   * Generate coach message
   */
  generateCoachMessage(
    request: Omit<GenerateCoachMessageRequest, 'requestType'>
  ): Promise<GenerateCoachMessageResponse>;

  /**
   * Generate session summary
   */
  generateSessionSummary(
    request: Omit<GenerateSessionSummaryRequest, 'requestType'>
  ): Promise<GenerateSessionSummaryResponse>;

  /**
   * Generate comeback prompt
   */
  generateComebackPrompt(
    request: Omit<GenerateComebackPromptRequest, 'requestType'>
  ): Promise<GenerateComebackPromptResponse>;

  /**
   * Generate streak risk nudge
   */
  generateStreakRiskNudge(
    request: Omit<GenerateStreakRiskNudgeRequest, 'requestType'>
  ): Promise<GenerateStreakRiskNudgeResponse>;

  /**
   * Generate weekly reflection
   */
  generateWeeklyReflection(
    request: Omit<GenerateWeeklyReflectionRequest, 'requestType'>
  ): Promise<GenerateWeeklyReflectionResponse>;
}

// ============================================================================
// Error Handling Contracts
// ============================================================================

/**
 * Client-side error handling for AI operations
 */
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
  fallbackContent?: string; // Content to show if AI fails
}

/**
 * Default fallback content for client-side use
 * These are used when the AI backend is unavailable
 */
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
  COMEBACK_PROMPT: {
    content: "Fresh start! You've got this!",
    emoji: '💪',
  },
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

// ============================================================================
// Request Metadata
// ============================================================================

/**
 * Metadata attached to all AI requests from client
 * Helps backend with analytics and debugging
 */
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

// ============================================================================
// Caching Strategy (Client-Side)
// ============================================================================

/**
 * Client-side cache configuration
 * The backend also caches, but client-side caching reduces network calls
 */
export const CLIENT_CACHE_CONFIG = {
  // Whether to use client-side caching
  ENABLED: true,

  // Cache TTLs by request type
  TTL_MS: {
    GENERATE_COACH_MESSAGE: 2 * 60 * 1000, // 2 minutes - streak risk changes
    GENERATE_SESSION_SUMMARY: 5 * 60 * 1000, // 5 minutes
    GENERATE_COMEBACK_PROMPT: 10 * 60 * 1000, // 10 minutes
    GENERATE_STREAK_RISK_NUDGE: 30 * 1000, // 30 seconds - very time sensitive
    GENERATE_WEEKLY_REFLECTION: 60 * 60 * 1000, // 1 hour
  },

  // Max cache entries per type
  MAX_ENTRIES: {
    GENERATE_COACH_MESSAGE: 20,
    GENERATE_SESSION_SUMMARY: 5,
    GENERATE_COMEBACK_PROMPT: 3,
    GENERATE_STREAK_RISK_NUDGE: 5,
    GENERATE_WEEKLY_REFLECTION: 2,
  },
} as const;

/**
 * Cache key generator
 * Creates deterministic cache keys for requests
 */
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

// ============================================================================
// Retry Strategy (Client-Side)
// ============================================================================

/**
 * Client-side retry configuration
 */
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

// ============================================================================
// Usage Tracking (Client-Side)
// ============================================================================

/**
 * Track AI usage on the client for analytics
 * This is sent to the backend for aggregation
 */
export interface AIClientUsageMetrics {
  requestId: string;
  userId: string;
  requestType: string;
  timestamp: number;
  // Network metrics
  networkDurationMs: number;
  // Cache metrics
  cacheHit: boolean;
  // Result metrics
  success: boolean;
  fallbackUsed: boolean;
  // Error info (if failed)
  errorCode?: string;
}

// ============================================================================
// React Native Integration Helpers
// ============================================================================

/**
 * React Native specific helpers for AI integration
 */

/**
 * Check if device is online before making AI request
 * AI should never block offline users - use fallbacks
 */
export function shouldUseAIFallback(isOnline: boolean, isRetry: boolean): boolean {
  if (!isOnline) {return true;}
  if (isRetry) {return false;} // Allow retry attempts
  return false;
}

/**
 * Format AI content for React Native rendering
 * Ensures content is safe and properly formatted
 */
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

/**
 * Calculate request priority for React Native queue management
 * Higher priority = process first
 */
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
