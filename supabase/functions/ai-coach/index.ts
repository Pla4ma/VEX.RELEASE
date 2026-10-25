import { buildCorsHeaders } from '../_shared/cors.ts';
import { verifyAuthorizedUser } from '../_shared/auth.ts';
import { AIRequestSchema, type AIRequest } from './schemas.ts';
import { checkRateLimit } from '../_shared/rate-limit.ts';
import { callOpenAICompatible, getOpenAICompatibleConfig, getOpenAICompatibleModel, type OpenAICompatibleConfig, type OpenAICompatibleResult } from '../_shared/openai-compatible.ts';
import { readCoachPayload } from './coach-output.ts';
import {
  getAIModelCandidates,
  VERIFIED_AI_MODEL_PRIMARY,
} from '../_shared/ai-model-routing.ts';
import { buildGuardrailReply } from './coach-guardrails.ts';
import { buildPrompt, type CoachPrompt } from './prompt.ts';
import { callGeminiWithFallback } from './gemini.ts';
import { requireConfig } from '../_shared/config.ts';
import { buildModelSuccessResponse } from './success-response.ts';
import {
  buildError,
  buildTextSuccess,
  hasAppUserId,
  isUuid,
  readRequestType,
  respond,
} from './response.ts';

const MAX_BODY_LENGTH = 10000;
const COACH_MODEL_TIMEOUT_MS = 9000;
const COACH_TOTAL_TIMEOUT_MS = 24000;

Deno.serve(async (request: Request) => {
  try {
    return await handleRequest(request);
  } catch (error) {
    return respond(
      buildError(
        'GENERATE_COACH_MESSAGE',
        Date.now(),
        'EDGE_UNCAUGHT',
        error instanceof Error ? error.message : 'Unhandled edge crash',
        true,
      ),
      500,
      request,
    );
  }
});

async function handleRequest(request: Request): Promise<Response> {
  const startedAt = Date.now();
  const corsHeaders = buildCorsHeaders(request);
  if (request.method === 'OPTIONS') {return new Response('ok', { headers: corsHeaders });}
  if (request.method !== 'POST') {return respond(buildError('GENERATE_COACH_MESSAGE', Date.now(), 'INVALID_REQUEST', 'Method not allowed', false), 405, request);}
  const bodyText = await request.text();
  if (bodyText.length > MAX_BODY_LENGTH) {
    return respond(buildError('GENERATE_COACH_MESSAGE', startedAt, 'INVALID_REQUEST', 'Request body too large', false), 413, request);
  }
  let body: unknown;
  try { body = JSON.parse(bodyText); } catch { body = null; }
  const auth = await verifyAuthorizedUser(
    request,
    (_payload: unknown, status: number, authRequest: Request) =>
      respond(
        buildError(readRequestType(body), startedAt, 'UNAUTHORIZED', 'Unauthorized', false),
        status,
        authRequest,
      ),
  );
  if (!auth.ok) {return auth.response;}
  if (!hasAppUserId(body)) {
    return respond(buildError(readRequestType(body), startedAt, 'INVALID_REQUEST', 'Missing app user id', false), 400, request);
  }
  const parsed = AIRequestSchema.safeParse(body);
  if (!parsed.success) {return respond(buildError(readRequestType(body), startedAt, 'INVALID_REQUEST', 'Invalid AI request payload', false), 400, request);}
  if (parsed.data.userId !== auth.user.id) {
    return respond(buildError(parsed.data.requestType, startedAt, 'USER_MISMATCH', 'User identity mismatch', false), 403, request);
  }
  const authorizedRequest = parsed.data;
  let config: ReturnType<typeof requireConfig>;
  try {
    config = requireConfig();
  } catch {
    return respond(buildError(readRequestType(body), startedAt, 'CONFIG_ERROR', 'Missing Supabase configuration', true), 500, request);
  }
  const llmConfig = getOpenAICompatibleConfig();
  const apiKey = config.GEMINI_API_KEY;
  if (!llmConfig && !apiKey) {return respond(buildError(authorizedRequest.requestType, startedAt, 'LLM_API_ERROR', 'Missing LLM configuration', true), 200, request);}
  const rateLimitBucket =
    authorizedRequest.requestType === 'GENERATE_COACH_MESSAGE'
      ? 'ai:coach'
      : authorizedRequest.requestType === 'GENERATE_AGENT_DECISION'
        ? 'ai:agent-decision'
        : null;
  if (rateLimitBucket && isUuid(auth.user.id)) {
    const rateLimit = await checkRateLimit(auth.user.id, rateLimitBucket, config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);
    if (!rateLimit.allowed) {return respond(buildError(authorizedRequest.requestType, startedAt, 'AI_COACH_RATE_LIMIT', 'Hourly AI request limit reached', true), 200, request);}
  }
  try {
    const prompt = buildPrompt(authorizedRequest);
    if (llmConfig) {
      const guardrail = readGuardrailReply(authorizedRequest);
      if (guardrail) {
        return respond(buildTextSuccess(authorizedRequest, guardrail, 'vex-guardrail', startedAt, false), 200, request);
      }
      try {
        const llm = await callCoachModelLadder(llmConfig, prompt, authorizedRequest.requestType === 'GENERATE_COACH_MESSAGE');
        return respond(buildModelSuccessResponse(authorizedRequest, llm.content, llm.model, startedAt, llm.fallbackUsed, llm.promptTokens, llm.responseTokens), 200, request);
      } catch (compatibleProviderError) {
        if (!apiKey) throw compatibleProviderError;
        const gemini = await callGeminiWithFallback(
          apiKey,
          prompt.system,
          prompt.user,
          prompt.maxOutputTokens,
          authorizedRequest.requestType === 'GENERATE_COACH_MESSAGE'
            ? readCoachPayload
            : undefined,
        );
        return respond(buildModelSuccessResponse(
          authorizedRequest,
          gemini.content,
          gemini.model,
          startedAt,
          true,
          gemini.response.usageMetadata?.promptTokenCount ?? 0,
          gemini.response.usageMetadata?.candidatesTokenCount ?? 0,
        ), 200, request);
      }
    }
    if (!apiKey) {return respond(buildError(authorizedRequest.requestType, startedAt, 'LLM_API_ERROR', 'Missing LLM configuration', true), 200, request);}
    const gemini = await callGeminiWithFallback(
      apiKey,
      prompt.system,
      prompt.user,
      prompt.maxOutputTokens,
      authorizedRequest.requestType === 'GENERATE_COACH_MESSAGE'
        ? readCoachPayload
        : undefined,
    );
    return respond(buildModelSuccessResponse(
      authorizedRequest,
      gemini.content,
      gemini.model,
      startedAt,
      false,
      gemini.response.usageMetadata?.promptTokenCount ?? 0,
      gemini.response.usageMetadata?.candidatesTokenCount ?? 0,
    ), 200, request);
  } catch (error) {
    return respond(buildError(authorizedRequest.requestType, startedAt, 'LLM_API_ERROR', error instanceof Error ? error.message : 'LLM request failed', true), 200, request);
  }
}

function readGuardrailReply(request: AIRequest): string | null {
  if (request.requestType !== 'GENERATE_COACH_MESSAGE') {return null;}
  const userMessage = typeof request.context.userMessage === 'string' ? request.context.userMessage : '';
  return buildGuardrailReply(userMessage);
}

async function callCoachModelLadder(
  config: OpenAICompatibleConfig,
  prompt: CoachPrompt,
  validateCoachPayload: boolean,
): Promise<OpenAICompatibleResult> {
  const configuredModel = Deno.env.get('LLM_MODEL_COACH') ?? getOpenAICompatibleModel('fast', VERIFIED_AI_MODEL_PRIMARY);
  const models = getAIModelCandidates(configuredModel);
  const startedAt = Date.now();
  let lastError: Error | null = null;
  for (const model of models) {
    const remainingMs = COACH_TOTAL_TIMEOUT_MS - (Date.now() - startedAt);
    if (remainingMs <= 0) {break;}
    try {
      const llm = await callOpenAICompatible({ config, model, systemPrompt: prompt.system, userPrompt: prompt.user, timeoutMs: Math.min(COACH_MODEL_TIMEOUT_MS, remainingMs), temperature: 0.45, maxTokens: prompt.maxOutputTokens, jsonMode: false });
      if (validateCoachPayload) {readCoachPayload(llm.content);}
      return { ...llm, fallbackUsed: model !== configuredModel };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('LLM request failed');
    }
  }
  throw lastError ?? new Error('LLM request failed');
}
