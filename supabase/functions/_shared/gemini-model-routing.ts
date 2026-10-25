import { GEMINI_MODELS } from '../../../src/shared/ai/ai-constants.ts';

export type GeminiModelTier = 'flash' | 'pro';

export function getGeminiModelCandidates(
  preferredModel: string | undefined,
  tier: GeminiModelTier,
): string[] {
  const defaultModel = tier === 'pro' ? GEMINI_MODELS.PRO : GEMINI_MODELS.FLASH;
  const fallbackModels = tier === 'pro'
    ? [GEMINI_MODELS.FLASH, GEMINI_MODELS.FLASH_LATEST]
    : [GEMINI_MODELS.FLASH_LATEST, GEMINI_MODELS.FLASH];
  return [...new Set([preferredModel?.trim() || defaultModel, ...fallbackModels])];
}
