/**
 * SVG paths and gradient definitions for VexHeroSignature
 * Extracted to keep the main component under 200 lines
 */

export const FLOURISH_PATH_WAVE = 'M 0 9 Q 30 1, 60 9 T 120 9 T 180 9';
export const FLOURISH_PATH_DIAMOND = 'M 88 4 L 90 9 L 92 4';
export const FLOURISH_GRADIENT_STOPS = [
  { offset: '0%', stopColor: 'rgba(224,184,112,0)' },
  { offset: '50%', stopColor: 'rgba(224,184,112,0.9)' },
  { offset: '100%', stopColor: 'rgba(224,184,112,0)' },
] as const;

/** Deep warm ambient glow text style */
export const glowStyleDeepWarm = {
  position: 'absolute' as const,
  fontSize: 88,
  fontWeight: '300' as const,
  color: 'rgba(224,184,112,0.10)',
  textShadowColor: 'rgba(224,184,112,0.45)',
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 32,
  letterSpacing: 8,
};

/** Mid teal accent glow text style */
export const glowStyleTealAccent = {
  position: 'absolute' as const,
  fontSize: 88,
  fontWeight: '300' as const,
  color: 'rgba(94,234,212,0.10)',
  textShadowColor: 'rgba(94,234,212,0.35)',
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 18,
  letterSpacing: 8,
};
