import { callGeminiWithFallback } from './gemini.ts';

Deno.test('AI Coach tries the next Gemini model after invalid output', async () => {
  const previousModel = Deno.env.get('GEMINI_MODEL_FLASH');
  const originalFetch = globalThis.fetch;
  const requestedModels: string[] = [];
  Deno.env.set('GEMINI_MODEL_FLASH', 'retired-gemini-model');
  globalThis.fetch = async (input) => {
    const url = String(input);
    const model = url.split('/models/')[1]?.split(':')[0] ?? '';
    requestedModels.push(model);
    const text = model === 'retired-gemini-model' ? 'invalid output' : 'valid coach reply';
    return new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text }] } }],
      usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 4 },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  try {
    const result = await callGeminiWithFallback(
      'test-gemini-key',
      'Coach safely.',
      'Help me focus.',
      200,
      (content) => {
        if (content !== 'valid coach reply') throw new Error('Invalid coach reply');
      },
    );
    if (JSON.stringify(requestedModels) !== JSON.stringify([
      'retired-gemini-model',
      'gemini-2.5-flash',
    ])) {
      throw new Error(`Unexpected Gemini model order: ${JSON.stringify(requestedModels)}`);
    }
    if (result.content !== 'valid coach reply' || result.model !== 'gemini-2.5-flash') {
      throw new Error('The valid fallback response was not returned with its model');
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (previousModel === undefined) Deno.env.delete('GEMINI_MODEL_FLASH');
    else Deno.env.set('GEMINI_MODEL_FLASH', previousModel);
  }
});
