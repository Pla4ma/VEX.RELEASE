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
  zenith: '#F8FCFC',
  mid: '#DDF5F3',
  horizon: '#F7FFFF',
} as const;

/** Optional night/warm variant for streaks + accents. */
export const etherealSkyAccents = {
  warmCloud: '#FFD9C2',
  coolCloud: '#E7F1FB',
  lightBeam: '#FFFBEF',
  starfield: '#7FA3CC',
} as const;

/** Dark text tokens on light ethereal sky background. */
export const etherealText = {
  /** Primary heading text — #0A0A0A */
  heading: '#0A0A0A',
  /** Subtitle / strong text — rgba(10, 10, 10, 0.78) */
  subtitle: 'rgba(10, 10, 10, 0.78)',
  /** Body text — rgba(10, 10, 10, 0.62) */
  body: 'rgba(10, 10, 10, 0.62)',
  /** Muted / caption text — rgba(10, 10, 10, 0.55) */
  muted: 'rgba(10, 10, 10, 0.55)',
  /** Faint divider / subtle line — rgba(10, 10, 10, 0.12) */
  faintDivider: 'rgba(10, 10, 10, 0.12)',
  /** Google brand blue for sign-in glyph */
  googleBlue: '#4285F4',
  googleRed: '#EA4335',
  googleYellow: '#FBBC05',
  googleGreen: '#34A853',
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
  googleFill: 'rgba(7, 31, 32, 0.94)',
  googleText: '#FFFFFF',
  googleBorder: 'rgba(126, 235, 225, 0.38)',
  appleFill: 'rgba(255, 255, 255, 0.88)',
  appleText: '#071F20',
  appleBorder: 'rgba(255, 255, 255, 0.82)',
  emailFill: 'rgba(255, 255, 255, 0.18)',
  emailBorder: 'rgba(84, 163, 164, 0.58)',
  emailText: '#4F999A',
  buttonShadow: 'rgba(21, 113, 112, 0.24)',
  ghostText: 'rgba(79, 153, 154, 0.92)',
  ghostTextHover: '#235F61',
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
  aqua: 'rgba(125, 238, 228, 0.62)',
  teal: 'rgba(31, 137, 139, 0.52)',
  crystal: '#92F4EE',
  crystalDeep: '#1F898B',
  glint: 'rgba(255, 255, 255, 0.95)',
  mist: 'rgba(255, 255, 255, 0.68)',
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
export type EtherealText = typeof etherealText;
export type EtherealGlass = typeof etherealGlass;
export type EtherealButton = typeof etherealButton;
