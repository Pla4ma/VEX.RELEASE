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
// ============================================================================
// Request Validation
// ============================================================================
// ============================================================================
// Response Validation
// ============================================================================
// ============================================================================
// API Client Interface
// ============================================================================
// ============================================================================
// Error Handling Contracts
// ============================================================================
// ============================================================================
// Request Metadata
// ============================================================================
// ============================================================================
// Caching Strategy (Client-Side)
// ============================================================================
// ============================================================================
// Retry Strategy (Client-Side)
// ============================================================================
// ============================================================================
// Usage Tracking (Client-Side)
// ============================================================================
// ============================================================================
// React Native Integration Helpers
// ============================================================================
export * from "./ai-client-contracts.types";
export * from "./ai-client-contracts.part1";
export * from "./ai-client-contracts.part2";
