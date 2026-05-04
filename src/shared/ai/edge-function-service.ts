import { captureSilentFailure } from '../../utils/silent-failure';
import {
  type AIRequest,
  type AIResponse,
  type GenerateCoachMessageRequest,
  type GenerateCoachMessageResponse,
  type GenerateComebackPromptRequest,
  type GenerateComebackPromptResponse,
  type GenerateSessionSummaryRequest,
  type GenerateSessionSummaryResponse,
  type GenerateStreakRiskNudgeRequest,
  type GenerateStreakRiskNudgeResponse,
  type GenerateWeeklyReflectionRequest,
  type GenerateWeeklyReflectionResponse,
} from './ai-types';
import {
  buildCoachMessageRequest,
  buildComebackPromptRequest,
  buildSessionSummaryRequest,
  buildStreakRiskNudgeRequest,
  buildWeeklyReflectionRequest,
  parseCoachMessageResponse,
  parseComebackPromptResponse,
  parseSessionSummaryResponse,
  parseStreakRiskNudgeResponse,
  parseWeeklyReflectionResponse,
  validateAIResponse,
  type AIAPIClient,
} from './ai-client-contracts';
import { getSupabaseClient } from '../../config/supabase';
import { getMMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';

const FUNCTION_NAME = 'ai-coach';
const CACHE_WINDOW_MS = 300000;

type CoachExtraContext = {
  sessionDurationMinutes?: number;
  purityScore?: number;
  subjectHint?: string;
};

type SummaryExtraContext = CoachExtraContext;

function createCacheKey(requestType: AIRequest['requestType'], userId: string): string {
  return `ai_cache_${requestType}_${userId}_${Math.floor(Date.now() / CACHE_WINDOW_MS)}`;
}

async function readCachedResponse<T extends AIResponse>(
  requestType: AIRequest['requestType'],
  userId: string,
  parser: (response: AIResponse) => T
): Promise<T | null> {
  try {
    const raw = await getMMKVStorageAdapter().getItem(createCacheKey(requestType, userId));
    if (!raw) {
      return null;
    }
    const parsed = parser(validateAIResponse(JSON.parse(raw) as unknown));
    return { ...parsed, metadata: { ...parsed.metadata, cached: true } };
  } catch (error) { captureSilentFailure(error, { feature: 'shared', operation: 'network-fallback', type: 'network' });
    return null;
  }
}

async function writeCachedResponse(requestType: AIRequest['requestType'], userId: string, response: AIResponse): Promise<void> {
  try {
    await getMMKVStorageAdapter().setItem(
      createCacheKey(requestType, userId),
      JSON.stringify(response)
    );
  } catch (error) { captureSilentFailure(error, { feature: 'shared', operation: 'network-fallback', type: 'network' });
    return;
  }
}

async function invokeAI<T extends AIResponse>(
  requestType: AIRequest['requestType'],
  userId: string,
  body: Record<string, unknown>,
  parser: (response: AIResponse) => T
): Promise<T> {
  const cached = await readCachedResponse(requestType, userId, parser);
  if (cached) {
    return cached;
  }

  const { data, error } = await getSupabaseClient().functions.invoke(FUNCTION_NAME, { body });
  if (error) {
    throw new Error(error.message);
  }

  const response = parser(validateAIResponse(data));
  await writeCachedResponse(requestType, userId, response);
  return response;
}

export async function sendAIRequest(request: AIRequest): Promise<AIResponse> {
  return invokeAI(request.requestType, request.userId, request, (response) => response);
}

export async function generateCoachMessage(
  request: Omit<GenerateCoachMessageRequest, 'requestType'> & {
    context: GenerateCoachMessageRequest['context'] & CoachExtraContext;
  }
): Promise<GenerateCoachMessageResponse> {
  const validated = buildCoachMessageRequest(request);
  const body = { ...validated, context: { ...validated.context, ...pickCoachExtras(request.context) } };
  return invokeAI(validated.requestType, validated.userId, body, parseCoachMessageResponse);
}

export async function generateSessionSummary(
  request: Omit<GenerateSessionSummaryRequest, 'requestType'> & {
    context: GenerateSessionSummaryRequest['context'] & SummaryExtraContext;
  }
): Promise<GenerateSessionSummaryResponse> {
  const validated = buildSessionSummaryRequest(request);
  const body = { ...validated, context: { ...validated.context, ...pickSummaryExtras(request.context) } };
  return invokeAI(validated.requestType, validated.userId, body, parseSessionSummaryResponse);
}

export async function generateComebackPrompt(
  request: Omit<GenerateComebackPromptRequest, 'requestType'>
): Promise<GenerateComebackPromptResponse> {
  const validated = buildComebackPromptRequest(request);
  return invokeAI(validated.requestType, validated.userId, validated, parseComebackPromptResponse);
}

export async function generateStreakRiskNudge(
  request: Omit<GenerateStreakRiskNudgeRequest, 'requestType'>
): Promise<GenerateStreakRiskNudgeResponse> {
  const validated = buildStreakRiskNudgeRequest(request);
  return invokeAI(validated.requestType, validated.userId, validated, parseStreakRiskNudgeResponse);
}

export async function generateWeeklyReflection(
  request: Omit<GenerateWeeklyReflectionRequest, 'requestType'>
): Promise<GenerateWeeklyReflectionResponse> {
  const validated = buildWeeklyReflectionRequest(request);
  return invokeAI(validated.requestType, validated.userId, validated, parseWeeklyReflectionResponse);
}

function pickCoachExtras(context: CoachExtraContext): CoachExtraContext {
  return {
    ...(typeof context.sessionDurationMinutes === 'number' ? { sessionDurationMinutes: context.sessionDurationMinutes } : {}),
    ...(typeof context.purityScore === 'number' ? { purityScore: context.purityScore } : {}),
    ...(typeof context.subjectHint === 'string' ? { subjectHint: context.subjectHint } : {}),
  };
}

function pickSummaryExtras(context: SummaryExtraContext): SummaryExtraContext {
  return pickCoachExtras(context);
}

export const edgeAIClient: AIAPIClient = {
  sendRequest: sendAIRequest,
  generateCoachMessage,
  generateSessionSummary,
  generateComebackPrompt,
  generateStreakRiskNudge,
  generateWeeklyReflection,
};
