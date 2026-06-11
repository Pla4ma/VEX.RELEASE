import { captureSilentFailure } from '../../utils/silent-failure';
import { getSupabaseClient } from '../../config/supabase';
import { getMMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import * as Sentry from '@sentry/react-native';
import { checkQuota, recordAIUsage } from './ai-quota-service';
import type { AIRequestCategory } from './ai-quota-types';
import {
  resolveFallbackTier,
  buildDeterministicResponse,
  buildDegradedResponse,
  type FallbackResult,
} from './ai-fallback-tiers';
import type { AIRequest, AIResponse } from './ai-types';
import { AIResponseSchema } from './ai-types';
import { validateAIResponse } from './ai-client-contracts';

export const FUNCTION_NAME = 'ai-coach';
export const CACHE_WINDOW_MS = 300000;
export const EDGE_FUNCTION_TIMEOUT_MS = 15000;

export const REQUEST_TYPE_TO_CATEGORY: Record<string, AIRequestCategory> = {
  GENERATE_COACH_MESSAGE: 'coach_message',
  GENERATE_SESSION_SUMMARY: 'session_summary',
  GENERATE_COMEBACK_PROMPT: 'comeback_prompt',
  GENERATE_STREAK_RISK_NUDGE: 'streak_nudge',
  GENERATE_WEEKLY_REFLECTION: 'weekly_reflection',
};

export function createCacheKey(
  requestType: AIRequest['requestType'],
  userId: string,
): string {
  return `ai_cache_${requestType}_${userId}_${Math.floor(Date.now() / CACHE_WINDOW_MS)}`;
}

export async function readCachedResponse(
  requestType: AIRequest['requestType'],
  userId: string,
): Promise<AIResponse | null> {
  try {
    const raw = await getMMKVStorageAdapter().getItem(
      createCacheKey(requestType, userId),
    );
    if (!raw) {return null;}
    const parsed = validateAIResponse(JSON.parse(raw));
    return { ...parsed, metadata: { ...parsed.metadata, cached: true } };
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'shared',
      operation: 'network-fallback',
      type: 'network',
    });
    return null;
  }
}

export async function writeCachedResponse(
  requestType: AIRequest['requestType'],
  userId: string,
  response: AIResponse,
): Promise<void> {
  try {
    const serialized = AIResponseSchema.parse(response);
    await getMMKVStorageAdapter().setItem(
      createCacheKey(requestType, userId),
      JSON.stringify(serialized),
    );
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'shared',
      operation: 'network-fallback',
      type: 'network',
    });
  }
}

function buildEmptyAIResponse(
  requestType: AIRequest['requestType'],
): AIResponse {
  const base = {
    success: false as const,
    content: '',
    metadata: { model: 'fallback', processingTimeMs: 0 },
  };
  // Empty fallback response — returned when AI is unavailable.
  // All callers check success: false before accessing typed fields.
  return { ...base, requestType } as AIResponse;
}

export async function checkQuotaGate(
  userId: string,
  requestType: AIRequest['requestType'],
): Promise<FallbackResult | null> {
  const category = REQUEST_TYPE_TO_CATEGORY[requestType];
  if (!category) {return null;}
  const quotaCheck = await checkQuota(userId, category);
  if (!quotaCheck.allowed) {
    return buildDegradedResponse(
      category,
      `Quota exceeded (${quotaCheck.window})`,
    );
  }
  return null;
}

export async function invokeAIWithFallback(
  requestType: AIRequest['requestType'],
  userId: string,
  body: Record<string, unknown>,
  fallbackCategory: string,
  fallbackSubKey: string,
  fallbackContext: Record<string, unknown>,
): Promise<{ response: AIResponse; fallback: FallbackResult | null }> {
  const quotaGate = await checkQuotaGate(userId, requestType);
  if (quotaGate) {
    return { response: buildEmptyAIResponse(requestType), fallback: quotaGate };
  }

  const cached = await readCachedResponse(requestType, userId);
  if (cached) {
    return { response: cached, fallback: null };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EDGE_FUNCTION_TIMEOUT_MS);

    const { data, error } = await getSupabaseClient().functions.invoke(
      FUNCTION_NAME,
      { body },
    );
    clearTimeout(timeoutId);
    if (error) {throw new Error(error.message);}

    const response = validateAIResponse(data);
    const isFallback =
      response.error?.code === 'FALLBACK_USED' ||
      response.metadata?.model === 'fallback';

    if (isFallback) {
      const hasContext = Object.keys(fallbackContext).length > 0;
      const tier = resolveFallbackTier(false, hasContext, true);
      const fbResult =
        tier === 'deterministic_contextual'
          ? buildDeterministicResponse(
              fallbackCategory,
              fallbackSubKey,
              fallbackContext,
            )
          : buildDegradedResponse(fallbackCategory, 'AI returned fallback');
      return { response, fallback: fbResult };
    }

    const tokenEstimate =
      (response.metadata?.responseTokens ?? 0) +
      (response.metadata?.promptTokens ?? 0);
    const category = REQUEST_TYPE_TO_CATEGORY[requestType];
    if (category && tokenEstimate > 0) {
      recordAIUsage(userId, category, tokenEstimate).catch((error: unknown) => {
        Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
          tags: { feature: 'ai-quota', operation: 'consumeQuota' },
        });
      });
    }

    await writeCachedResponse(requestType, userId, response);
    return { response, fallback: null };
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'shared',
      operation: 'ai-invoke',
      type: 'network',
    });
    const hasContext = Object.keys(fallbackContext).length > 0;
    const tier = resolveFallbackTier(false, hasContext, true);
    const fbResult =
      tier === 'deterministic_contextual'
        ? buildDeterministicResponse(
            fallbackCategory,
            fallbackSubKey,
            fallbackContext,
          )
        : buildDegradedResponse(
            fallbackCategory,
            error instanceof Error ? error.message : 'AI unavailable',
          );
    return { response: buildEmptyAIResponse(requestType), fallback: fbResult };
  }
}
