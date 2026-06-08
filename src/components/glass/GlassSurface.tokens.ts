export type GlassSurfaceVariant =
  | 'subtle'
  | 'default'
  | 'strong'
  | 'hero'
  | 'premium';

export interface GlassSurfaceVariantConfig {
  fill: string;
  border: string;
  borderWidth: number;
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
  glowColor?: string;
  glowOpacity?: number;
  glowRadius?: number;
}

export const GLASS_SURFACE_VARIANTS: Record<GlassSurfaceVariant, GlassSurfaceVariantConfig> = {
  subtle: {
    fill: 'rgba(255, 255, 255, 0.65)',
    border: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    highlightTop: 'rgba(255, 255, 255, 0.94)',
    highlightTopStop: 0.38,
    shadowColor: 'rgba(13, 76, 65, 0.18)',
    shadowOpacity: 0.26,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
    topEdgeIntensity: 0.94,
  },
  default: {
    fill: 'rgba(255, 255, 255, 0.72)',
    border: 'rgba(255, 255, 255, 1)',
    borderWidth: 1.8,
    highlightTop: 'rgba(255, 255, 255, 1)',
    highlightTopStop: 0.50,
    shadowColor: 'rgba(13, 76, 65, 0.26)',
    shadowOpacity: 0.34,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 16 },
    elevation: 5,
    topEdgeIntensity: 1.0,
    innerBottomTint: 'rgba(95, 230, 197, 0.14)',
    innerBottomStop: 0.90,
    glowColor: 'rgba(95, 230, 197, 0.12)',
    glowOpacity: 0.3,
    glowRadius: 40,
  },
  strong: {
    fill: 'rgba(255, 255, 255, 0.80)',
    border: 'rgba(255, 255, 255, 1)',
    borderWidth: 2.0,
    highlightTop: 'rgba(255, 255, 255, 1)',
    highlightTopStop: 0.52,
    shadowColor: 'rgba(13, 76, 65, 0.32)',
    shadowOpacity: 0.40,
    shadowRadius: 38,
    shadowOffset: { width: 0, height: 18 },
    elevation: 6,
    topEdgeIntensity: 1.0,
    glowColor: 'rgba(95, 230, 197, 0.16)',
    glowOpacity: 0.4,
    glowRadius: 48,
  },
  hero: {
    fill: 'rgba(255, 255, 255, 0.78)',
    border: 'rgba(255, 255, 255, 1)',
    borderWidth: 2.2,
    highlightTop: 'rgba(255, 255, 255, 1)',
    highlightTopStop: 0.54,
    shadowColor: 'rgba(13, 76, 65, 0.32)',
    shadowOpacity: 0.42,
    shadowRadius: 44,
    shadowOffset: { width: 0, height: 20 },
    elevation: 7,
    topEdgeIntensity: 1.0,
    innerBottomTint: 'rgba(95, 230, 197, 0.28)',
    innerBottomStop: 0.96,
    glowColor: 'rgba(95, 230, 197, 0.22)',
    glowOpacity: 0.48,
    glowRadius: 52,
  },
  premium: {
    fill: 'rgba(255, 255, 255, 0.82)',
    border: 'rgba(255, 255, 255, 1)',
    borderWidth: 2.2,
    highlightTop: 'rgba(255, 255, 255, 1)',
    highlightTopStop: 0.54,
    shadowColor: 'rgba(18, 184, 148, 0.38)',
    shadowOpacity: 0.44,
    shadowRadius: 46,
    shadowOffset: { width: 0, height: 20 },
    elevation: 7,
    topEdgeIntensity: 1.0,
    innerBottomTint: 'rgba(95, 230, 197, 0.34)',
    innerBottomStop: 0.98,
    glowColor: 'rgba(66, 207, 174, 0.28)',
    glowOpacity: 0.52,
    glowRadius: 56,
  },
};
