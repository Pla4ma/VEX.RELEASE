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

export const SIZE_PADDING: Record<GlassCardSize, number> = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

export const SIZE_RADIUS: Record<GlassCardSize, number> = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

export interface VariantStyle {
  borderColor: string;
  accentTopBar?: string;
}

export function resolveVariant(variant: GlassCardVariant): VariantStyle {
  switch (variant) {
    case 'hero':
      return {
        borderColor: 'rgba(114, 224, 197, 0.28)',
        accentTopBar: '#18B894',
      };
    case 'selected':
      return { borderColor: 'rgba(114, 224, 197, 0.24)' };
    case 'success':
      return { borderColor: 'rgba(66, 207, 174, 0.22)' };
    case 'warning':
      return { borderColor: 'rgba(223, 164, 74, 0.22)' };
    case 'premium':
      return {
        borderColor: 'rgba(114, 224, 197, 0.30)',
        accentTopBar: '#18B894',
      };
    case 'subtle':
      return { borderColor: 'rgba(255, 255, 255, 0.18)' };
    case 'strong':
      return { borderColor: 'rgba(255, 255, 255, 0.24)' };
    case 'default':
    default:
      return { borderColor: 'rgba(255, 255, 255, 0.20)' };
  }
}
