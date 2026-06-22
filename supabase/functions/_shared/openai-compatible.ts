type ChatMessage = {
  role: 'system' | 'user';
  content: string;
};

type OpenAIChoice = {
  message?: { content?: string };
  text?: string;
};

type OpenAIUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
};

type OpenAIResponse = {
  choices?: OpenAIChoice[];
  output_text?: string;
  model?: string;
  usage?: OpenAIUsage;
};

export type OpenAICompatibleConfig = {
  apiKey: string;
  baseUrl: string;
};

export type OpenAICompatibleResult = {
  content: string;
  model: string;
  provider: 'freellmapi';
  fallbackUsed: boolean;
  promptTokens?: number;
  responseTokens?: number;
};

const httpRequest = globalThis.fetch.bind(globalThis);
const FREELLMAPI_DEFAULT_BASE_URL = 'https://api.freellmapi.com/v1';

export function getOpenAICompatibleConfig(): OpenAICompatibleConfig | null {
  const apiKey =
    Deno.env.get('FREELLMAPI_KEY') ??
    Deno.env.get('LLM_API_KEY') ??
    Deno.env.get('FREE_LLM_API_KEY');
  const baseUrl =
    Deno.env.get('FREELLMAPI_BASE_URL') ??
    (Deno.env.get('FREELLMAPI_KEY') ? FREELLMAPI_DEFAULT_BASE_URL : undefined) ??
    Deno.env.get('LLM_BASE_URL') ??
    Deno.env.get('FREE_LLM_BASE_URL') ??
    (apiKey ? FREELLMAPI_DEFAULT_BASE_URL : undefined);
  if (!apiKey || !baseUrl) {return null;}
  return { apiKey, baseUrl };
}

export function getOpenAICompatibleModel(kind: 'fast' | 'pro', fallback: string): string {
  const specific = kind === 'pro' ? Deno.env.get('LLM_MODEL_PRO') : Deno.env.get('LLM_MODEL_FAST');
  return specific ?? Deno.env.get('LLM_MODEL') ?? Deno.env.get('FREE_LLM_MODEL') ?? fallback;
}

export async function callOpenAICompatible(params: {
  config: OpenAICompatibleConfig;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  timeoutMs: number;
  temperature: number;
  maxTokens: number;
  jsonMode?: boolean;
}): Promise<OpenAICompatibleResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), params.timeoutMs);
  try {
    const response = await httpRequest(`${params.config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.config.apiKey}`,
      },
      body: JSON.stringify({
        model: params.model,
        messages: buildMessages(params.systemPrompt, params.userPrompt),
        temperature: params.temperature,
        max_tokens: params.maxTokens,
        ...(params.jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
      signal: controller.signal,
    });
    if (!response.ok) {throw new Error(`LLM API error: ${response.status}`);}
    const payload = parseOpenAIResponse(await response.json());
    const content = payload.choices?.[0]?.message?.content ?? payload.choices?.[0]?.text ?? payload.output_text ?? '';
    if (!content) {throw new Error('LLM returned no content');}
    return {
      content: content.replace(/\s+/g, ' ').trim(),
      model: payload.model ?? params.model,
      provider: 'freellmapi',
      fallbackUsed: false,
      promptTokens: payload.usage?.prompt_tokens,
      responseTokens: payload.usage?.completion_tokens,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function buildMessages(systemPrompt: string, userPrompt: string): ChatMessage[] {
  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}

function parseOpenAIResponse(value: unknown): OpenAIResponse {
  if (!isRecord(value)) {return {};}
  const choices = Array.isArray(value.choices) ? value.choices.map(parseChoice) : undefined;
  const usage = isRecord(value.usage) ? {
    prompt_tokens: readNumber(value.usage.prompt_tokens),
    completion_tokens: readNumber(value.usage.completion_tokens),
  } : undefined;
  return {
    choices,
    output_text: typeof value.output_text === 'string' ? value.output_text : undefined,
    model: typeof value.model === 'string' ? value.model : undefined,
    usage,
  };
}

function parseChoice(value: unknown): OpenAIChoice {
  if (!isRecord(value)) {return {};}
  return {
    message: isRecord(value.message) && typeof value.message.content === 'string'
      ? { content: value.message.content }
      : undefined,
    text: typeof value.text === 'string' ? value.text : undefined,
  };
}

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
