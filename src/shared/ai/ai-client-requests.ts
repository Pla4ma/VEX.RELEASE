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

export const AI_API_ENDPOINTS = {
  EDGE_FUNCTION_BASE: '/functions/v1',
  GENERATE_COACH_MESSAGE: '/functions/v1/ai/coach-message',
  GENERATE_SESSION_SUMMARY: '/functions/v1/ai/session-summary',
  GENERATE_COMEBACK_PROMPT: '/functions/v1/ai/comeback-prompt',
  GENERATE_STREAK_NUDGE: '/functions/v1/ai/streak-nudge',
  GENERATE_WEEKLY_REFLECTION: '/functions/v1/ai/weekly-reflection',
  TRIGGER_JOB_BASE: '/api/jobs',
} as const;

export function validateAIRequest(request: unknown): AIRequest {
  return AIRequestSchema.parse(request);
}

export function buildCoachMessageRequest(
  params: Omit<GenerateCoachMessageRequest, 'requestType'>,
): GenerateCoachMessageRequest {
  return GenerateCoachMessageRequestSchema.parse({
    requestType: 'GENERATE_COACH_MESSAGE',
    ...params,
  });
}

export function buildSessionSummaryRequest(
  params: Omit<GenerateSessionSummaryRequest, 'requestType'>,
): GenerateSessionSummaryRequest {
  return GenerateSessionSummaryRequestSchema.parse({
    requestType: 'GENERATE_SESSION_SUMMARY',
    ...params,
  });
}

export function buildComebackPromptRequest(
  params: Omit<GenerateComebackPromptRequest, 'requestType'>,
): GenerateComebackPromptRequest {
  return GenerateComebackPromptRequestSchema.parse({
    requestType: 'GENERATE_COMEBACK_PROMPT',
    ...params,
  });
}

export function buildStreakRiskNudgeRequest(
  params: Omit<GenerateStreakRiskNudgeRequest, 'requestType'>,
): GenerateStreakRiskNudgeRequest {
  return GenerateStreakRiskNudgeRequestSchema.parse({
    requestType: 'GENERATE_STREAK_RISK_NUDGE',
    ...params,
  });
}

export function buildWeeklyReflectionRequest(
  params: Omit<GenerateWeeklyReflectionRequest, 'requestType'>,
): GenerateWeeklyReflectionRequest {
  return GenerateWeeklyReflectionRequestSchema.parse({
    requestType: 'GENERATE_WEEKLY_REFLECTION',
    ...params,
  });
}

export function validateAIResponse(response: unknown): AIResponse {
  return AIResponseSchema.parse(response);
}

export function parseCoachMessageResponse(
  response: AIResponse,
): GenerateCoachMessageResponse {
  if (response.requestType !== 'GENERATE_COACH_MESSAGE') {
    throw new Error(
      `Expected GENERATE_COACH_MESSAGE response, got ${response.requestType}`,
    );
  }
  return GenerateCoachMessageResponseSchema.parse(response);
}

export function parseSessionSummaryResponse(
  response: AIResponse,
): GenerateSessionSummaryResponse {
  if (response.requestType !== 'GENERATE_SESSION_SUMMARY') {
    throw new Error(
      `Expected GENERATE_SESSION_SUMMARY response, got ${response.requestType}`,
    );
  }
  return GenerateSessionSummaryResponseSchema.parse(response);
}

export function parseComebackPromptResponse(
  response: AIResponse,
): GenerateComebackPromptResponse {
  if (response.requestType !== 'GENERATE_COMEBACK_PROMPT') {
    throw new Error(
      `Expected GENERATE_COMEBACK_PROMPT response, got ${response.requestType}`,
    );
  }
  return GenerateComebackPromptResponseSchema.parse(response);
}

export function parseStreakRiskNudgeResponse(
  response: AIResponse,
): GenerateStreakRiskNudgeResponse {
  if (response.requestType !== 'GENERATE_STREAK_RISK_NUDGE') {
    throw new Error(
      `Expected GENERATE_STREAK_RISK_NUDGE response, got ${response.requestType}`,
    );
  }
  return GenerateStreakRiskNudgeResponseSchema.parse(response);
}

export function parseWeeklyReflectionResponse(
  response: AIResponse,
): GenerateWeeklyReflectionResponse {
  if (response.requestType !== 'GENERATE_WEEKLY_REFLECTION') {
    throw new Error(
      `Expected GENERATE_WEEKLY_REFLECTION response, got ${response.requestType}`,
    );
  }
  return GenerateWeeklyReflectionResponseSchema.parse(response);
}
