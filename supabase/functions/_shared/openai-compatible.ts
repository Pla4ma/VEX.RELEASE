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
  source: string;
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
const FREELLMAPI_DEFAULT_BASE_URL = 'http://167.71.255.199:3001/v1';

export function getOpenAICompatibleConfig(): OpenAICompatibleConfig | null {
  const explicitConfig =
    readConfigPair('LLM_API_KEY', 'LLM_BASE_URL') ??
    readConfigPair('FREELLMAPI_KEY', 'FREELLMAPI_BASE_URL') ??
    readConfigPair('FREE_LLM_API_KEY', 'FREE_LLM_BASE_URL');
  if (explicitConfig) {return explicitConfig;}
  const apiKey = Deno.env.get('LLM_API_KEY') ?? Deno.env.get('FREELLMAPI_KEY') ?? Deno.env.get('FREE_LLM_API_KEY');
  const baseUrl = Deno.env.get('LLM_BASE_URL') ?? Deno.env.get('FREELLMAPI_BASE_URL') ?? Deno.env.get('FREE_LLM_BASE_URL') ?? FREELLMAPI_DEFAULT_BASE_URL;
  if (!apiKey) {return null;}
  return { apiKey, baseUrl, source: 'fallback' };
}

function readConfigPair(keyName: string, baseUrlName: string): OpenAICompatibleConfig | null {
  const apiKey = Deno.env.get(keyName);
  const baseUrl = Deno.env.get(baseUrlName);
  return apiKey && baseUrl ? { apiKey, baseUrl, source: keyName + '+' + baseUrlName } : null;
}

export function getOpenAICompatibleModel(kind: 'fast' | 'pro', fallback: string): string {
  const specific = kind === 'pro' ? Deno.env.get('LLM_MODEL_PRO') : Deno.env.get('LLM_MODEL_FAST');
  const configured = specific ?? Deno.env.get('LLM_MODEL') ?? Deno.env.get('FREE_LLM_MODEL');
  return configured && configured !== 'auto' ? configured : fallback;
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
        'x-api-key': params.config.apiKey,
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
    if (!response.ok) {
      throw new Error(await buildApiError(response, params.config));
    }
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

async function buildApiError(response: Response, config: OpenAICompatibleConfig): Promise<string> {
  const body = (await response.text()).replace(/\s+/g, ' ').slice(0, 500);
  return `LLM API error: ${response.status} source=${config.source} baseUrl=${redactBaseUrl(config.baseUrl)} body=${body}`;
}

function redactBaseUrl(baseUrl: string): string {
  try {
    const url = new URL(baseUrl);
    return url.protocol + '//' + url.host + url.pathname;
  } catch {
    return 'invalid-url';
  }
}

function buildMessages(systemPrompt: string, userPrompt: string): ChatMessage[] {
  const messages: ChatMessage[] = [];
  if (systemPrompt.trim()) {messages.push({ role: 'system', content: systemPrompt });}
  messages.push({ role: 'user', content: userPrompt });
  return messages;
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
