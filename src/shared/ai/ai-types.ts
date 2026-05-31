// Barrel file — re-exports all AI type schemas and defines shared types.
// Sub-schemas live in ai-base-schemas.ts, ai-request-schemas.ts, ai-response-schemas.ts.

import { z } from 'zod';

// Re-export base schemas and types
export {
  AIRequestTypeSchema,
  AIBaseRequestSchema,
  AIBaseResponseSchema,
  AIErrorCodeSchema,
  type AIRequestType,
  type AIBaseRequest,
  type AIBaseResponse,
  type AIErrorCode,
} from './ai-base-schemas';

// Re-export request schemas and types
export {
  GenerateCoachMessageRequestSchema,
  GenerateSessionSummaryRequestSchema,
  GenerateComebackPromptRequestSchema,
  GenerateStreakRiskNudgeRequestSchema,
  GenerateWeeklyReflectionRequestSchema,
  type GenerateCoachMessageRequest,
  type GenerateSessionSummaryRequest,
  type GenerateComebackPromptRequest,
  type GenerateStreakRiskNudgeRequest,
  type GenerateWeeklyReflectionRequest,
} from './ai-request-schemas';

// Re-export response schemas and types
export {
  GenerateCoachMessageResponseSchema,
  GenerateSessionSummaryResponseSchema,
  GenerateComebackPromptResponseSchema,
  GenerateStreakRiskNudgeResponseSchema,
  GenerateWeeklyReflectionResponseSchema,
  type GenerateCoachMessageResponse,
  type GenerateSessionSummaryResponse,
  type GenerateComebackPromptResponse,
  type GenerateStreakRiskNudgeResponse,
  type GenerateWeeklyReflectionResponse,
} from './ai-response-schemas';

// --- Discriminated unions ---

import {
  GenerateCoachMessageRequestSchema,
  GenerateSessionSummaryRequestSchema,
  GenerateComebackPromptRequestSchema,
  GenerateStreakRiskNudgeRequestSchema,
  GenerateWeeklyReflectionRequestSchema,
} from './ai-request-schemas';
import {
  GenerateCoachMessageResponseSchema,
  GenerateSessionSummaryResponseSchema,
  GenerateComebackPromptResponseSchema,
  GenerateStreakRiskNudgeResponseSchema,
  GenerateWeeklyReflectionResponseSchema,
} from './ai-response-schemas';
import type { AIRequestType, AIErrorCode } from './ai-base-schemas';

export const AIRequestSchema = z.discriminatedUnion('requestType', [
  GenerateCoachMessageRequestSchema,
  GenerateSessionSummaryRequestSchema,
  GenerateComebackPromptRequestSchema,
  GenerateStreakRiskNudgeRequestSchema,
  GenerateWeeklyReflectionRequestSchema,
]);
export type AIRequest = z.infer<typeof AIRequestSchema>;

export const AIResponseSchema = z.discriminatedUnion('requestType', [
  GenerateCoachMessageResponseSchema,
  GenerateSessionSummaryResponseSchema,
  GenerateComebackPromptResponseSchema,
  GenerateStreakRiskNudgeResponseSchema,
  GenerateWeeklyReflectionResponseSchema,
]);
export type AIResponse = z.infer<typeof AIResponseSchema>;

// --- Gemini API wire types ---

export interface GeminiAPIRequest {
  model: string;
  contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  };
  safetySettings?: Array<{ category: string; threshold: string }>;
}

export interface GeminiAPIResponse {
  candidates: Array<{
    content: { parts: Array<{ text: string }>; role: string };
    finishReason: string;
    index: number;
    safetyRatings: Array<{ category: string; probability: string }>;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export interface PromptTemplate {
  id: string;
  name: string;
  version: string;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
  outputSchema: z.ZodSchema<unknown>;
  modelConfig: { model: string; temperature: number; maxOutputTokens: number };
}

// --- Error, cache, and metrics ---

export interface AIError {
  code: AIErrorCode;
  message: string;
  retryable: boolean;
  originalError?: unknown;
  context?: Record<string, unknown>;
}

export interface AICacheEntry {
  key: string;
  request: AIRequest;
  response: AIResponse;
  timestamp: number;
  ttl: number;
}

export interface AIGenerationMetrics {
  requestType: AIRequestType;
  processingTimeMs: number;
  promptTokens: number;
  responseTokens: number;
  cacheHit: boolean;
  success: boolean;
  errorCode?: AIErrorCode;
}
