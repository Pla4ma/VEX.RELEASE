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
  lg: 18,
  xl: 22,
};

export const SIZE_RADIUS: Record<GlassCardSize, number> = {
  sm: 14,
  md: 18,
  lg: 22,
  xl: 26,
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
        background: 'rgba(255, 255, 255, 0.55)',
        border: 'rgba(255, 255, 255, 0.85)',
        shadowColor: 'rgba(13, 76, 65, 0.08)',
        shadowOpacity: 0.25,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
      };
    case 'hero':
      return {
        background: 'rgba(255, 255, 255, 0.48)',
        border: 'rgba(255, 255, 255, 0.78)',
        shadowColor: 'rgba(13, 76, 65, 0.06)',
        shadowOpacity: 0.22,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 10 },
        accentTopBar: '#42CFAE',
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
        background: 'rgba(255, 255, 255, 0.52)',
        border: 'rgba(121, 223, 201, 0.58)',
        shadowColor: 'rgba(18, 184, 148, 0.14)',
        shadowOpacity: 0.28,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 12 },
        accentTopBar: '#42CFAE',
      };
    case 'default':
    default:
      return {
        background: 'rgba(255, 255, 255, 0.42)',
        border: 'rgba(255, 255, 255, 0.78)',
        shadowColor: 'rgba(13, 76, 65, 0.06)',
        shadowOpacity: 0.2,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
      };
  }
}
