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
  background: string;
  border: string;
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  accentTopBar?: string;
}

export function resolveVariant(variant: GlassCardVariant): VariantStyle {
  // Premium glass - very subtle, physical, restrained
  switch (variant) {
    case 'subtle':
      return {
        background: 'rgba(255, 255, 255, 0.32)',
        border: 'rgba(255, 255, 255, 0.72)',
        shadowColor: 'rgba(13, 76, 65, 0.04)',
        shadowOpacity: 0.15,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      };
    case 'strong':
      return {
        background: 'rgba(255, 255, 255, 0.64)',
        border: 'rgba(255, 255, 255, 0.94)',
        shadowColor: 'rgba(13, 76, 65, 0.1)',
        shadowOpacity: 0.2,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      };
    case 'hero':
      return {
        background: 'rgba(255, 255, 255, 0.68)',
        border: 'rgba(66, 207, 174, 0.9)',
        shadowColor: 'rgba(13, 76, 65, 0.12)',
        shadowOpacity: 0.2,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 7 },
        accentTopBar: '#18B894',
      };
    case 'selected':
      return {
        background: 'rgba(255, 255, 255, 0.52)',
        border: 'rgba(121, 223, 201, 0.48)',
        shadowColor: 'rgba(18, 184, 148, 0.12)',
        shadowOpacity: 0.28,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        accentTopBar: '#42CFAE',
      };
    case 'success':
      return {
        background: 'rgba(255, 255, 255, 0.48)',
        border: 'rgba(121, 223, 201, 0.42)',
        shadowColor: 'rgba(18, 184, 148, 0.1)',
        shadowOpacity: 0.22,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
      };
    case 'warning':
      return {
        background: 'rgba(255, 255, 255, 0.48)',
        border: 'rgba(223, 164, 74, 0.38)',
        shadowColor: 'rgba(223, 164, 74, 0.12)',
        shadowOpacity: 0.22,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
      };
    case 'premium':
      return {
        background: 'rgba(255, 255, 255, 0.66)',
        border: 'rgba(66, 207, 174, 0.94)',
        shadowColor: 'rgba(18, 184, 148, 0.14)',
        shadowOpacity: 0.22,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        accentTopBar: '#18B894',
      };
    case 'default':
    default:
      return {
        background: 'rgba(255, 255, 255, 0.64)',
        border: 'rgba(255, 255, 255, 0.92)',
        shadowColor: 'rgba(13, 76, 65, 0.08)',
        shadowOpacity: 0.18,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      };
  }
}
