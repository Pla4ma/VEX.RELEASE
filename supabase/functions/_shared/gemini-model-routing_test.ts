import { getGeminiModelCandidates } from './gemini-model-routing.ts';

Deno.test('Gemini flash candidates prefer configured model then current flash fallbacks', () => {
  const candidates = getGeminiModelCandidates('custom-flash', 'flash');
  if (JSON.stringify(candidates) !== JSON.stringify([
    'custom-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash',
  ])) {
    throw new Error(`Unexpected Gemini candidate order: ${JSON.stringify(candidates)}`);
  }
});

Deno.test('Gemini pro candidates fall back to flash models without duplicates', () => {
  const candidates = getGeminiModelCandidates('gemini-2.5-pro', 'pro');
  if (JSON.stringify(candidates) !== JSON.stringify([
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-flash-latest',
  ])) {
    throw new Error(`Unexpected Gemini pro candidate order: ${JSON.stringify(candidates)}`);
  }
});
