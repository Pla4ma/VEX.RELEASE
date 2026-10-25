export const VERIFIED_AI_MODEL_PRIMARY =
  'nvidia/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning';
export const VERIFIED_AI_MODEL_FALLBACK =
  'nvidia/nvidia/nemotron-3.5-lightning-30b-a3b';

const UNRELIABLE_MODEL_ALIASES: Record<string, true> = {
  'auto/best-free': true,
  'auto/best-chat': true,
};

export function getAIModelCandidates(configuredModel: string): string[] {
  const preferredModel = Object.hasOwn(UNRELIABLE_MODEL_ALIASES, configuredModel)
    ? VERIFIED_AI_MODEL_PRIMARY
    : configuredModel;
  const candidates = [preferredModel];
  for (const model of [VERIFIED_AI_MODEL_PRIMARY, VERIFIED_AI_MODEL_FALLBACK]) {
    if (!candidates.includes(model)) candidates.push(model);
  }
  return candidates;
}
