import {
  getAIModelCandidates,
  VERIFIED_AI_MODEL_FALLBACK,
  VERIFIED_AI_MODEL_PRIMARY,
} from './ai-model-routing.ts';

Deno.test('unreliable automatic aliases route through verified candidates', () => {
  const candidates = getAIModelCandidates('auto/best-free');
  const expected = [VERIFIED_AI_MODEL_PRIMARY, VERIFIED_AI_MODEL_FALLBACK];
  if (JSON.stringify(candidates) !== JSON.stringify(expected)) {
    throw new Error(`Unexpected model candidates: ${JSON.stringify(candidates)}`);
  }
});

Deno.test('configured models are tried before deduplicated verified fallbacks', () => {
  const candidates = getAIModelCandidates('custom-model');
  const expected = [
    'custom-model',
    VERIFIED_AI_MODEL_PRIMARY,
    VERIFIED_AI_MODEL_FALLBACK,
  ];
  if (JSON.stringify(candidates) !== JSON.stringify(expected)) {
    throw new Error(`Unexpected model candidates: ${JSON.stringify(candidates)}`);
  }
});

Deno.test('verified primary is not retried as its own fallback', () => {
  const candidates = getAIModelCandidates(VERIFIED_AI_MODEL_PRIMARY);
  const expected = [VERIFIED_AI_MODEL_PRIMARY, VERIFIED_AI_MODEL_FALLBACK];
  if (JSON.stringify(candidates) !== JSON.stringify(expected)) {
    throw new Error(`Unexpected model candidates: ${JSON.stringify(candidates)}`);
  }
});
