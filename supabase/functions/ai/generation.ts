import {
  getAIModelCandidates,
  VERIFIED_AI_MODEL_PRIMARY,
} from '../_shared/ai-model-routing.ts';
import type { AIRequest } from '../../../src/shared/ai/ai-types.ts';
import {
  AI_TIMEOUTS,
  GENERATION_CONFIG,
  MODEL_BY_USE_CASE,
  SYSTEM_PROMPTS,
  USER_PROMPT_TEMPLATES,
} from '../../../src/shared/ai/ai-constants.ts';
import { callGemini } from './gemini.ts';
import { getGeminiModelCandidates } from '../_shared/gemini-model-routing.ts';
import {
  callOpenAICompatible,
  getOpenAICompatibleConfig,
  getOpenAICompatibleModel,
} from '../_shared/openai-compatible.ts';

export interface GeneratedAIContent {
  content: string;
  model: string;
  promptTokens?: number;
  responseTokens?: number;
}

export async function generateAIContent(
  request: AIRequest,
  geminiApiKey: string | undefined,
): Promise<GeneratedAIContent> {
  const llmConfig = getOpenAICompatibleConfig();
  const model = resolveModel(request.requestType, Boolean(llmConfig));
  const systemPrompt = resolveSystemPrompt(request.requestType);
  const userPrompt = renderPromptTemplate(request);
  const settings = resolveGenerationConfig(request.requestType);
  const timeoutMs = resolveTimeout(request.requestType);

  if (llmConfig) {
    let lastError: Error | null = null;
    for (const candidateModel of getAIModelCandidates(model)) {
      try {
        const result = await callOpenAICompatible({
          config: llmConfig,
          model: candidateModel,
          systemPrompt,
          userPrompt,
          timeoutMs,
          temperature: settings.temperature,
          maxTokens: settings.maxOutputTokens,
        });
        return {
          content: result.content,
          model: result.model,
          ...(result.promptTokens !== undefined ? { promptTokens: result.promptTokens } : {}),
          ...(result.responseTokens !== undefined ? { responseTokens: result.responseTokens } : {}),
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('LLM request failed');
      }
    }
    if (geminiApiKey) {
      return generateWithGeminiFallback(
        geminiApiKey,
        request.requestType,
        systemPrompt,
        userPrompt,
        settings,
        timeoutMs,
      );
    }
    throw lastError ?? new Error('LLM request failed');
  }

  if (!geminiApiKey) throw new Error('Missing LLM configuration');
  return generateWithGeminiFallback(
    geminiApiKey,
    request.requestType,
    systemPrompt,
    userPrompt,
    settings,
    timeoutMs,
  );
}

async function generateWithGeminiFallback(
  apiKey: string,
  requestType: AIRequest['requestType'],
  systemPrompt: string,
  userPrompt: string,
  settings: { temperature: number; maxOutputTokens: number },
  timeoutMs: number,
): Promise<GeneratedAIContent> {
  const isProRequest = requestType === 'GENERATE_SESSION_SUMMARY' ||
    requestType === 'GENERATE_WEEKLY_REFLECTION';
  const models = getGeminiModelCandidates(
    resolveGeminiModel(requestType),
    isProRequest ? 'pro' : 'flash',
  );
  let lastError: Error | null = null;
  for (const model of models) {
    try {
      return {
        content: await callGemini({
          apiKey, model, systemPrompt, userPrompt, timeoutMs,
          generationConfig: settings,
        }),
        model,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Gemini request failed');
    }
  }
  throw lastError ?? new Error('Gemini request failed');
}

function resolveModel(
  requestType: AIRequest['requestType'],
  hasCompatibleProvider: boolean,
): string {
  if (!hasCompatibleProvider) return resolveGeminiModel(requestType);
  const kind = requestType === 'GENERATE_SESSION_SUMMARY' || requestType === 'GENERATE_WEEKLY_REFLECTION'
    ? 'pro'
    : 'fast';
  return getOpenAICompatibleModel(kind, VERIFIED_AI_MODEL_PRIMARY);
}

function resolveGeminiModel(requestType: AIRequest['requestType']): string {
  const configuredName = requestType === 'GENERATE_SESSION_SUMMARY' || requestType === 'GENERATE_WEEKLY_REFLECTION'
    ? 'GEMINI_MODEL_PRO'
    : 'GEMINI_MODEL_FLASH';
  return Deno.env.get(configuredName) ?? MODEL_BY_USE_CASE[requestType] ?? 'gemini-2.5-flash';
}

function resolveTimeout(requestType: AIRequest['requestType']): number {
  const timeouts: Record<AIRequest['requestType'], number> = {
    GENERATE_COACH_MESSAGE: AI_TIMEOUTS.COACH_MESSAGE,
    GENERATE_SESSION_SUMMARY: AI_TIMEOUTS.SESSION_SUMMARY,
    GENERATE_COMEBACK_PROMPT: AI_TIMEOUTS.COMEBACK_PROMPT,
    GENERATE_STREAK_RISK_NUDGE: AI_TIMEOUTS.STREAK_RISK_NUDGE,
    GENERATE_WEEKLY_REFLECTION: AI_TIMEOUTS.WEEKLY_REFLECTION,
  };
  return timeouts[requestType];
}

function resolveGenerationConfig(
  requestType: AIRequest['requestType'],
): { temperature: number; maxOutputTokens: number } {
  const settings: Record<
    AIRequest['requestType'],
    { temperature: number; maxOutputTokens: number }
  > = {
    GENERATE_COACH_MESSAGE: GENERATION_CONFIG.COACH_MESSAGE,
    GENERATE_SESSION_SUMMARY: GENERATION_CONFIG.SESSION_SUMMARY,
    GENERATE_COMEBACK_PROMPT: GENERATION_CONFIG.COMEBACK_PROMPT,
    GENERATE_STREAK_RISK_NUDGE: GENERATION_CONFIG.STREAK_RISK_NUDGE,
    GENERATE_WEEKLY_REFLECTION: GENERATION_CONFIG.WEEKLY_REFLECTION,
  };
  return settings[requestType];
}

function resolveSystemPrompt(requestType: AIRequest['requestType']): string {
  const prompts: Record<AIRequest['requestType'], string> = {
    GENERATE_COACH_MESSAGE: SYSTEM_PROMPTS.COACH_MESSAGE,
    GENERATE_SESSION_SUMMARY: SYSTEM_PROMPTS.SESSION_SUMMARY,
    GENERATE_COMEBACK_PROMPT: SYSTEM_PROMPTS.COMEBACK_PROMPT,
    GENERATE_STREAK_RISK_NUDGE: SYSTEM_PROMPTS.STREAK_RISK_NUDGE,
    GENERATE_WEEKLY_REFLECTION: SYSTEM_PROMPTS.WEEKLY_REFLECTION,
  };
  return prompts[requestType];
}

function renderPromptTemplate(request: AIRequest): string {
  const templates: Record<AIRequest['requestType'], string> = {
    GENERATE_COACH_MESSAGE: USER_PROMPT_TEMPLATES.COACH_MESSAGE,
    GENERATE_SESSION_SUMMARY: USER_PROMPT_TEMPLATES.SESSION_SUMMARY,
    GENERATE_COMEBACK_PROMPT: USER_PROMPT_TEMPLATES.COMEBACK_PROMPT,
    GENERATE_STREAK_RISK_NUDGE: USER_PROMPT_TEMPLATES.STREAK_RISK_NUDGE,
    GENERATE_WEEKLY_REFLECTION: USER_PROMPT_TEMPLATES.WEEKLY_REFLECTION,
  };
  let rendered = templates[request.requestType];
  for (const [key, value] of Object.entries(request.context)) {
    const replacement = Array.isArray(value)
      ? value.join(', ')
      : String(value ?? '');
    rendered = rendered.replaceAll(`{{${key}}}`, replacement);
  }
  return rendered
    .replace(/\{\{#[^}]+\}\}|\{\{\/[^{]+\}\}/g, '')
    .replace(/\{\{[^}]+\}\}/g, '')
    .trim();
}
