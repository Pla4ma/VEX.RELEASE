/**
 * Decorative Color Tokens
 *
 * Colors used for visual effects, confetti, particles, and game-mechanic
 * visuals that are NOT theme-dependent. These remain constant regardless
 * of light/dark mode because they represent fixed visual effects.
 */

/** Confetti celebration colors — fixed decorative palette */
export const confettiColors = {
  skyBlue: '#45B7D1',
  salmon: '#FFA07A',
  mint: '#98D8C8',
  gold: '#F7DC6F',
  lavender: '#BB8FCE',
  paleBlue: '#85C1E2',
} as const;

/** Companion element decorative colors — fixed game-mechanic visuals */
export const companionDecorative = {
  /** Wave glow — dark teal, decorative */
  waveGlow: '#00ced1',
  /** Wave particle — sky blue, decorative */
  waveParticle: '#87ceeb',
  /** Terra particle — burlywood, decorative */
  terraParticle: '#deb887',
  /** Zephyr secondary — light steel blue, decorative */
  zephyrSecondary: '#b0c4de',
} as const;
