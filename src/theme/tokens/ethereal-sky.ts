/**
 * Ethereal Sky Tokens — June 2026 visual language
 *
 * Palette, glass surface, cloud opacity, and button fills for the new
 * dawn-sky visual identity (Login + Onboarding).
 *
 * Tokens are pure data so they are import-cheap and testable. The visual
 * components in screens/auth/components/ethereal/ and
 * screens/onboarding/components/ethereal/ apply them.
 */

/** 3-stop vertical sky gradient — zenith → mid → horizon haze. */
export const etherealSkyGradient = {
  zenith: '#9BC4F0',
  mid: '#C9DFF5',
  horizon: '#F0E5DA',
} as const;

/** Optional night/warm variant for streaks + accents. */
export const etherealSkyAccents = {
  warmCloud: '#FFD9C2',
  coolCloud: '#E7F1FB',
  lightBeam: '#FFFBEF',
  starfield: '#7FA3CC',
} as const;

/** Frosted glass surface rgba values for cards/inputs. */
export const etherealGlass = {
  fill: 'rgba(255, 255, 255, 0.55)',
  fillStrong: 'rgba(255, 255, 255, 0.78)',
  border: 'rgba(255, 255, 255, 0.65)',
  borderSubtle: 'rgba(255, 255, 255, 0.35)',
  shadow: 'rgba(20, 60, 100, 0.10)',
  shadowStrong: 'rgba(20, 60, 100, 0.18)',
} as const;

/** Cloud puff opacity by parallax layer. */
export const etherealCloud = {
  layerBack: 0.12,
  layerMid: 0.16,
  layerFront: 0.20,
} as const;

/** Pill button fill tokens. */
export const etherealButton = {
  appleFill: '#0A0A0A',
  appleText: '#FFFFFF',
  googleFill: '#FFFFFF',
  googleText: '#0A0A0A',
  googleBorder: 'rgba(10, 10, 10, 0.10)',
  ghostText: 'rgba(10, 10, 10, 0.72)',
  ghostTextHover: '#0A0A0A',
} as const;

/** Medallion ring colors — luminous whites/cyans. */
export const etherealMedallion = {
  ring1: 'rgba(255, 255, 255, 0.55)',
  ring2: 'rgba(255, 255, 255, 0.35)',
  ring3: 'rgba(255, 255, 255, 0.18)',
  core: 'rgba(255, 255, 255, 0.92)',
  glow: 'rgba(255, 255, 255, 0.40)',
} as const;

/** Onboarding HeroOrb. */
export const etherealOrb = {
  core: '#FFFFFF',
  innerGlow: 'rgba(155, 196, 240, 0.55)',
  outerGlow: 'rgba(155, 196, 240, 0.20)',
  ring: 'rgba(255, 255, 255, 0.85)',
} as const;

/** Floating card surface (onboarding choices). */
export const etherealCard = {
  fill: 'rgba(255, 255, 255, 0.70)',
  fillSelected: 'rgba(255, 255, 255, 0.92)',
  border: 'rgba(255, 255, 255, 0.65)',
  borderSelected: 'rgba(10, 10, 10, 0.85)',
  shadow: 'rgba(20, 60, 100, 0.12)',
  title: '#0A0A0A',
  body: 'rgba(10, 10, 10, 0.65)',
} as const;

export type EtherealSkyGradient = typeof etherealSkyGradient;
export type EtherealGlass = typeof etherealGlass;
export type EtherealButton = typeof etherealButton;
