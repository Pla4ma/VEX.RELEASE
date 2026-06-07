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
  sm: { paddingH: 14, paddingV: 7, minHeight: 32, fontSize: 12 },
  md: { paddingH: 20, paddingV: 10, minHeight: 40, fontSize: 13 },
  lg: { paddingH: 24, paddingV: 12, minHeight: 46, fontSize: 15 },
};

export function resolveLiquidVariant(
  variant: LiquidButtonVariant,
  isPressed: boolean,
): LiquidVariantStyle {
  if (variant === 'primary') {
    return {
      gradientColors: isPressed
        ? [vexLightGlass.mint[600], vexLightGlass.mint[500], vexLightGlass.mint[300]]
        : [vexLightGlass.mint[300], vexLightGlass.mint[500], vexLightGlass.mint[700]],
      textColor: vexLightGlass.text.inverse,
      borderColor: 'rgba(255, 255, 255, 0.55)',
      shadowColor: vexLightGlass.mint[600],
      highlightColor: 'rgba(255, 255, 255, 0.55)',
    };
  }
  if (variant === 'outline') {
    return {
      gradientColors: isPressed
        ? ['rgba(66, 207, 174, 0.30)', 'rgba(66, 207, 174, 0.18)']
        : ['rgba(255, 255, 255, 0.78)', 'rgba(255, 255, 255, 0.50)'],
      textColor: vexLightGlass.mint[700],
      borderColor: 'rgba(66, 207, 174, 0.55)',
      background: 'rgba(255, 255, 255, 0.50)',
      shadowColor: 'rgba(13, 76, 65, 0.18)',
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
      shadowColor: 'rgba(13, 76, 65, 0.12)',
      highlightColor: 'rgba(255, 255, 255, 0.5)',
    };
  }
  return {
    gradientColors: isPressed
      ? ['rgba(255, 255, 255, 0.78)', 'rgba(255, 255, 255, 0.58)']
      : ['rgba(255, 255, 255, 0.72)', 'rgba(255, 255, 255, 0.48)'],
    textColor: vexLightGlass.text.primary,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: 'rgba(13, 76, 65, 0.20)',
    highlightColor: 'rgba(255, 255, 255, 0.92)',
  };
}
