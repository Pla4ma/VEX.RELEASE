/**
 * BossScreenSections — Barrel re-export
 *
 * Utility functions and types split into boss-screen-utils.ts
 */

export { BossScreenSections } from './BossScreenSectionsInner';
export {
  getBossScreenCopy,
  estimateDamage,
  formatDuration,
  ATTACK_PRESETS,
  type BossIntensity,
  type BossScreenSectionsProps,
} from './boss-screen-utils';
