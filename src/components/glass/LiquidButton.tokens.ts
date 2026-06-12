import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

export type LiquidButtonVariant = 'primary' | 'fire' | 'secondary' | 'outline' | 'ghost';
export type LiquidButtonSize = 'sm' | 'md' | 'lg';

export interface LiquidVariantStyle {
  gradientColors: readonly [string, string, ...string[]];
  textColor: string;
  borderColor?: string;
  background?: string;
  shadowColor: string;
  highlightColor: string;
}

export const LIQUID_SIZE: Record<LiquidButtonSize, {
  paddingH: number; paddingV: number; minHeight: number; fontSize: number;
}> = {
  sm: { paddingH: 16, paddingV: 5, minHeight: 30, fontSize: 12 },
  md: { paddingH: 20, paddingV: 8, minHeight: 38, fontSize: 13 },
  lg: { paddingH: 24, paddingV: 10, minHeight: 44, fontSize: 15 },
};

// Less saturated, more glassy mint-teal gradient for premium liquid feel
const GLASS_MINT = '#4DD4B8';
const GLASS_MINT_MID = '#3DBFA5';
const GLASS_MINT_DARK = '#2A9B8A';
const GLASS_MINT_DEEP = '#1A7A6E';
const GLASS_FIRE = '#F5A13A';
const GLASS_FIRE_MID = '#EA7D22';
const GLASS_FIRE_DARK = '#B85B18';

export function resolveLiquidVariant(
  variant: LiquidButtonVariant,
  isPressed: boolean,
): LiquidVariantStyle {
  if (variant === 'primary') {
    // Less saturated, more glassy mint-teal with transparent edges
    return {
      gradientColors: isPressed
        ? [GLASS_MINT_DARK, GLASS_MINT_MID, GLASS_MINT_DEEP]
        : [GLASS_MINT, GLASS_MINT_MID, GLASS_MINT_DARK],
      textColor: '#FFFFFF',
      borderColor: 'rgba(255, 255, 255, 0.55)',
      shadowColor: 'rgba(10, 155, 138, 0.18)',
      highlightColor: 'rgba(255, 255, 255, 0.92)',
    };
  }
  if (variant === 'fire') {
    return {
      gradientColors: isPressed
        ? [GLASS_FIRE_DARK, GLASS_FIRE_MID, '#8F3F13']
        : [GLASS_FIRE, GLASS_FIRE_MID, GLASS_FIRE_DARK],
      textColor: '#FFFFFF',
      borderColor: 'rgba(255, 255, 255, 0.58)',
      shadowColor: 'rgba(213, 111, 28, 0.24)',
      highlightColor: 'rgba(255, 255, 255, 0.94)',
    };
  }
  if (variant === 'outline') {
    return {
      gradientColors: isPressed
        ? ['rgba(10, 155, 138, 0.08)', 'rgba(10, 155, 138, 0.04)']
        : ['rgba(255, 255, 255, 0.72)', 'rgba(255, 255, 255, 0.42)'],
      textColor: GLASS_MINT_DARK,
      borderColor: 'rgba(10, 155, 138, 0.28)',
      background: 'rgba(255, 255, 255, 0.38)',
      shadowColor: 'rgba(13, 76, 65, 0.08)',
      highlightColor: 'rgba(255, 255, 255, 0.78)',
    };
  }
  if (variant === 'ghost') {
    return {
      gradientColors: isPressed
        ? ['rgba(255, 255, 255, 0.32)', 'rgba(255, 255, 255, 0.14)']
        : ['rgba(255, 255, 255, 0.0)', 'rgba(255, 255, 255, 0.0)'],
      textColor: vexLightGlass.text.primary,
      borderColor: 'rgba(255, 255, 255, 0.45)',
      shadowColor: 'rgba(13, 76, 65, 0.08)',
      highlightColor: 'rgba(255, 255, 255, 0.42)',
    };
  }
  return {
    gradientColors: isPressed
      ? ['rgba(255, 255, 255, 0.68)', 'rgba(255, 255, 255, 0.48)']
      : ['rgba(255, 255, 255, 0.62)', 'rgba(255, 255, 255, 0.38)'],
    textColor: vexLightGlass.text.primary,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    shadowColor: 'rgba(13, 76, 65, 0.14)',
    highlightColor: 'rgba(255, 255, 255, 0.88)',
  };
}
