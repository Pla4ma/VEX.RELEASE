/**
 * Elevation & Glow Tokens — layered premium depth
 *
 * Ready-to-spread ViewStyle objects so surfaces get consistent, tasteful
 * depth without per-component shadow guesswork. iOS gets soft multi-radius
 * shadows; Android gets matched `elevation` (kept modest to avoid the heavy
 * black box Android renders for large shadows).
 *
 * Glow tiers accept an accent color so a surface can carry a faint colored
 * halo (CTA, companion aura, active-session atmosphere) that reads premium,
 * not neon. Pair with low opacity — restraint is the point.
 */

import type { ViewStyle } from 'react-native';


const SHADOW_BLACK = '#000000';

/**
 * Neutral depth tiers. Use for cards/surfaces that float above the page.
 *
 * - flat:     no depth (resting list rows)
 * - resting:  subtle lift (default cards)
 * - raised:   clear separation (interactive / selected cards)
 * - floating: hero surfaces, sheets, modals
 * - lifted:   the most prominent surface on screen (primary CTA cluster)
 */
export const depth = {
  flat: {
    shadowColor: SHADOW_BLACK,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  resting: {
    shadowColor: SHADOW_BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 3,
  },
  raised: {
    shadowColor: SHADOW_BLACK,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.26,
    shadowRadius: 22,
    elevation: 6,
  },
  floating: {
    shadowColor: SHADOW_BLACK,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.34,
    shadowRadius: 34,
    elevation: 12,
  },
  lifted: {
    shadowColor: SHADOW_BLACK,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.42,
    shadowRadius: 44,
    elevation: 16,
  },
} as const satisfies Record<string, ViewStyle>;

export type DepthTier = keyof typeof depth;

/**
 * Colored glow. Returns a ViewStyle carrying a soft halo in the given accent.
 *
 * @param color   accent hex/rgba (e.g. theme primary, lane accent, aura)
 * @param tier    intensity tier
 *
 * Tiers:
 * - whisper: barely-there presence (resting companion, idle CTA)
 * - soft:    gentle premium halo (active CTA, focused surface)
 * - vivid:   celebratory / peak-state emphasis (perfect focus, payoff)
 */
export function glow(
  color: string,
  tier: 'whisper' | 'soft' | 'vivid' = 'soft',
): ViewStyle {
  switch (tier) {
    case 'whisper':
      return {
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.28,
        shadowRadius: 16,
        elevation: 4,
      };
    case 'vivid':
      return {
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 32,
        elevation: 14,
      };
    case 'soft':
    default:
      return {
        shadowColor: color,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 9,
      };
  }
}

/**
 * Hairline border helper for glass surfaces — a 1px inner-light edge that
 * makes elevated glass read as a real pane of frosted material.
 */
export const glassEdge = {
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.15)',
} as const satisfies ViewStyle;
