import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

export type LiquidButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
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

const PREMIUM_TEAL = '#0A9B8A';
const PREMIUM_TEAL_DARK = '#078274';
const PREMIUM_TEAL_LIGHT = '#0DBFA6';
const PREMIUM_TEAL_MID = '#089B8A';

export function resolveLiquidVariant(
  variant: LiquidButtonVariant,
  isPressed: boolean,
): LiquidVariantStyle {
  if (variant === 'primary') {
    return {
      gradientColors: isPressed
        ? [PREMIUM_TEAL_DARK, PREMIUM_TEAL_MID, '#065E54']
        : [PREMIUM_TEAL_LIGHT, PREMIUM_TEAL, PREMIUM_TEAL_DARK],
      textColor: '#FFFFFF',
      borderColor: 'rgba(255, 255, 255, 0.72)',
      shadowColor: 'rgba(10, 155, 138, 0.32)',
      highlightColor: 'rgba(255, 255, 255, 0.92)',
    };
  }
  if (variant === 'outline') {
    return {
      gradientColors: isPressed
        ? ['rgba(10, 155, 138, 0.12)', 'rgba(10, 155, 138, 0.06)']
        : ['rgba(255, 255, 255, 0.88)', 'rgba(255, 255, 255, 0.55)'],
      textColor: PREMIUM_TEAL,
      borderColor: 'rgba(10, 155, 138, 0.38)',
      background: 'rgba(255, 255, 255, 0.48)',
      shadowColor: 'rgba(13, 76, 65, 0.1)',
      highlightColor: 'rgba(255, 255, 255, 0.85)',
    };
  }
  if (variant === 'ghost') {
    return {
      gradientColors: isPressed
        ? ['rgba(255, 255, 255, 0.40)', 'rgba(255, 255, 255, 0.20)']
        : ['rgba(255, 255, 255, 0.0)', 'rgba(255, 255, 255, 0.0)'],
      textColor: vexLightGlass.text.primary,
      borderColor: 'rgba(255, 255, 255, 0.6)',
      shadowColor: 'rgba(13, 76, 65, 0.1)',
      highlightColor: 'rgba(255, 255, 255, 0.5)',
    };
  }
  return {
    gradientColors: isPressed
      ? ['rgba(255, 255, 255, 0.78)', 'rgba(255, 255, 255, 0.58)']
      : ['rgba(255, 255, 255, 0.72)', 'rgba(255, 255, 255, 0.48)'],
    textColor: vexLightGlass.text.primary,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: 'rgba(13, 76, 65, 0.18)',
    highlightColor: 'rgba(255, 255, 255, 0.92)',
  };
}
