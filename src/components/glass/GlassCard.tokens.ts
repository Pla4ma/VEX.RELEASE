export type GlassCardVariant =
  | 'subtle'
  | 'default'
  | 'strong'
  | 'hero'
  | 'selected'
  | 'success'
  | 'warning'
  | 'premium';

export type GlassCardSize = 'sm' | 'md' | 'lg' | 'xl';

import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

export const SIZE_PADDING: Record<GlassCardSize, number> = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

export const SIZE_RADIUS: Record<GlassCardSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
};

export interface VariantStyle {
  background: string;
  border: string;
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
  accentTopBar?: string;
}

export function resolveVariant(variant: GlassCardVariant): VariantStyle {
  switch (variant) {
    case 'subtle':
      return {
        background: vexLightGlass.glass.fillSubtle,
        border: vexLightGlass.glass.borderSubtle,
        shadowColor: vexLightGlass.glass.innerShadow,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      };
    case 'strong':
      return {
        background: vexLightGlass.glass.fillStrong,
        border: vexLightGlass.glass.border,
        shadowColor: vexLightGlass.glass.shadowStrong,
        shadowOpacity: 0.16,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 5,
      };
    case 'hero':
      return {
        background: vexLightGlass.glass.fillHero,
        border: vexLightGlass.glass.border,
        shadowColor: vexLightGlass.mint[700],
        shadowOpacity: 0.14,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
      };
    case 'selected':
      return {
        background: vexLightGlass.glass.fillStrong,
        border: vexLightGlass.mint[400],
        shadowColor: vexLightGlass.mint[500],
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 5,
        accentTopBar: vexLightGlass.mint[400],
      };
    case 'success':
      return {
        background: vexLightGlass.glass.fill,
        border: vexLightGlass.mint[200],
        shadowColor: vexLightGlass.mint[500],
        shadowOpacity: 0.18,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 12 },
        elevation: 6,
      };
    case 'warning':
      return {
        background: vexLightGlass.glass.fill,
        border: 'rgba(223, 164, 74, 0.45)',
        shadowColor: 'rgba(223, 164, 74, 0.30)',
        shadowOpacity: 0.22,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 12 },
        elevation: 6,
      };
    case 'premium':
      return {
        background: vexLightGlass.glass.fillStrong,
        border: 'rgba(121, 223, 201, 0.7)',
        shadowColor: 'rgba(18, 184, 148, 0.30)',
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
        accentTopBar: vexLightGlass.mint[500],
      };
    case 'default':
    default:
      return {
        background: vexLightGlass.glass.fill,
        border: vexLightGlass.glass.border,
        shadowColor: vexLightGlass.glass.shadow,
        shadowOpacity: 0.16,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 12 },
        elevation: 5,
      };
  }
}
