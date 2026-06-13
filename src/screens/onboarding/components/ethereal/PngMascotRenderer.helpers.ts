import type { AnimatedMascotProps } from './AnimatedMascot';
import { FALLBACK_MASCOT, MOOD_ASSET_MAP } from './VexMascotGuide.tokens';

export function resolveMoodAsset(mood: AnimatedMascotProps['mood']) {
  return MOOD_ASSET_MAP[mood] ?? FALLBACK_MASCOT;
}