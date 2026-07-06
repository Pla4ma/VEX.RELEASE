import type { BossTier } from './BossPreviewCard.types';
import { lightColors } from '@/theme/tokens/colors';

interface TierConfig {
  color: string;
  bg: string;
  label: string;
}

export function getTierConfig(tier: BossTier, fallbackColor: string, fallbackBg: string): TierConfig {
  if (tier === 'LEGENDARY') {
    return { color: lightColors.semantic.warning, bg: 'rgba(245,158,11,0.2)', label: 'LEGENDARY' };
  }
  if (tier === 'EPIC') {
    return { color: lightColors.accent.purple, bg: 'rgba(168,85,247,0.2)', label: 'EPIC' };
  }
  if (tier === 'RARE') {
    return { color: lightColors.accent.blue, bg: 'rgba(59,130,246,0.2)', label: 'RARE' };
  }
  if (tier === 'UNCOMMON') {
    return { color: lightColors.semantic.success, bg: 'rgba(34,197,94,0.2)', label: 'UNCOMMON' };
  }
  return { color: fallbackColor, bg: fallbackBg, label: 'COMMON' };
}
