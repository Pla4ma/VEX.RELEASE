export type GlassSurfaceVariant =
  | 'subtle'
  | 'default'
  | 'strong'
  | 'hero'
  | 'premium';

export interface GlassSurfaceVariantConfig {
  fill: string;
  border: string;
  highlightTop: string;
  highlightTopStop: number;
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
  topEdgeIntensity: number;
  innerBottomTint?: string;
  innerBottomStop?: number;
}

export const GLASS_SURFACE_VARIANTS: Record<GlassSurfaceVariant, GlassSurfaceVariantConfig> = {
  subtle: {
    fill: 'rgba(255, 255, 255, 0.34)',
    border: 'rgba(255, 255, 255, 0.72)',
    highlightTop: 'rgba(255, 255, 255, 0.72)',
    highlightTopStop: 0.28,
    shadowColor: 'rgba(13, 76, 65, 0.10)',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    topEdgeIntensity: 0.7,
  },
  default: {
    fill: 'rgba(255, 255, 255, 0.46)',
    border: 'rgba(255, 255, 255, 0.86)',
    highlightTop: 'rgba(255, 255, 255, 0.98)',
    highlightTopStop: 0.34,
    shadowColor: 'rgba(13, 76, 65, 0.13)',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    topEdgeIntensity: 0.95,
    innerBottomTint: 'rgba(255, 255, 255, 0)',
    innerBottomStop: 0.82,
  },
  strong: {
    fill: 'rgba(255, 255, 255, 0.56)',
    border: 'rgba(255, 255, 255, 0.94)',
    highlightTop: 'rgba(255, 255, 255, 1.0)',
    highlightTopStop: 0.36,
    shadowColor: 'rgba(13, 76, 65, 0.22)',
    shadowOpacity: 0.20,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    topEdgeIntensity: 1.0,
  },
  hero: {
    fill: 'rgba(255, 255, 255, 0.50)',
    border: 'rgba(255, 255, 255, 0.92)',
    highlightTop: 'rgba(255, 255, 255, 1.0)',
    highlightTopStop: 0.40,
    shadowColor: 'rgba(13, 76, 65, 0.16)',
    shadowOpacity: 0.20,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    topEdgeIntensity: 1.0,
    innerBottomTint: 'rgba(95, 230, 197, 0.10)',
    innerBottomStop: 0.92,
  },
  premium: {
    fill: 'rgba(255, 255, 255, 0.54)',
    border: 'rgba(255, 255, 255, 0.95)',
    highlightTop: 'rgba(255, 255, 255, 1.0)',
    highlightTopStop: 0.38,
    shadowColor: 'rgba(18, 184, 148, 0.20)',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    topEdgeIntensity: 1.0,
    innerBottomTint: 'rgba(95, 230, 197, 0.14)',
    innerBottomStop: 0.94,
  },
};
