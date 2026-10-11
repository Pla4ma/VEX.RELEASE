import { AIRequestSchema } from '../../../src/shared/ai/ai-types.ts';
import { generateAIContent } from './generation.ts';

Deno.test('configured OpenAI-compatible provider generates shared AI output', async () => {
  const envNames = [
    'LLM_API_KEY',
    'LLM_BASE_URL',
    'LLM_MODEL_FAST',
    'LLM_ALLOW_INSECURE_HTTP',
  ];
  const previousEnv = new Map(
    envNames.map((name) => [name, Deno.env.get(name)]),
  );
  const originalFetch = globalThis.fetch;
  const requestedModels: string[] = [];

  for (const name of envNames) Deno.env.delete(name);
  Deno.env.set('LLM_API_KEY', 'test-provider-key');
  Deno.env.set('LLM_BASE_URL', 'https://llm.example/v1');
  Deno.env.set('LLM_MODEL_FAST', 'configured-fast-model');
  globalThis.fetch = async (_input, init) => {
    if (typeof init?.body !== 'string') throw new Error('Missing model request');
    const body: unknown = JSON.parse(init.body);
    if (typeof body !== 'object' || body === null || !('model' in body)) {
      throw new Error('Malformed model request');
    }
    const model = body.model;
    if (typeof model !== 'string') throw new Error('Missing model name');
    requestedModels.push(model);
    return new Response(
      JSON.stringify({
        model: 'provider-response-model',
        choices: [{ message: { content: 'Generated through the configured provider.' } }],
        usage: { prompt_tokens: 12, completion_tokens: 8 },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };

  try {
    const request = AIRequestSchema.parse({
      requestType: 'GENERATE_COACH_MESSAGE',
      userId: '550e8400-e29b-41d4-a716-446655440000',
      context: { category: 'MOTIVATION_BOOST' },
    });
    const result = await generateAIContent(request, 'unused-gemini-key');
    if (result.model !== 'provider-response-model') {
      throw new Error('Response model did not come from the configured provider');
    }
    if (requestedModels[0] !== 'configured-fast-model') {
      throw new Error('Configured LLM model was not requested');
    }
    if (result.promptTokens !== 12 || result.responseTokens !== 8) {
      throw new Error('Provider token usage was not preserved');
    }
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of previousEnv) {
      if (value === undefined) Deno.env.delete(name);
      else Deno.env.set(name, value);
    }
  }
});
