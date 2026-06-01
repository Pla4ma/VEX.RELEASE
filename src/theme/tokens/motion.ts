/**
 * Motion Tokens — June 2026 cinematic motion language
 *
 * Pure data only (no runtime coupling to the animation library) so these
 * tokens stay testable and import-cheap. Components apply them with
 * Reanimated's withSpring/withTiming/Easing.bezier.
 *
 * Spring presets describe physical feel; bezier tuples describe timed reveals.
 * Use these instead of ad-hoc damping/stiffness values so motion is consistent
 * and unmistakably VEX across every screen.
 */

export interface SpringPreset {
  damping: number;
  stiffness: number;
  mass: number;
}

export interface TimingPreset {
  duration: number;
  /** Cubic-bezier control points for Easing.bezier(...args) */
  easing: readonly [number, number, number, number];
}

/**
 * Physical spring presets for transform/opacity animations.
 *
 * - tactile:   instant, crisp press feedback (buttons, cards)
 * - settle:    smooth arrival with the faintest overshoot (entrances)
 * - lively:    expressive pop for rewards / celebratory beats
 * - calm:      slow, weighty motion for ambient / focus surfaces
 * - precise:   no overshoot, snappy commit (toggles, selection)
 */
export const springPresets = {
  tactile: { damping: 18, stiffness: 420, mass: 1 },
  settle: { damping: 16, stiffness: 180, mass: 1 },
  lively: { damping: 11, stiffness: 240, mass: 1 },
  calm: { damping: 22, stiffness: 90, mass: 1.1 },
  precise: { damping: 30, stiffness: 360, mass: 1 },
} as const satisfies Record<string, SpringPreset>;

export type SpringPresetName = keyof typeof springPresets;

/**
 * Timed reveal presets. Durations in ms, easing as bezier control points.
 *
 * - microFade:      hairline state changes (chips, labels)
 * - enter:          standard surface/card entrance
 * - cinematicReveal:staged hero / completion reveals (slow-out)
 * - breath:         one half-cycle of an ambient breathing loop
 * - dramatic:       grade / payoff flourish
 */
export const timingPresets = {
  microFade: { duration: 160, easing: [0.4, 0, 0.2, 1] },
  enter: { duration: 320, easing: [0.22, 1, 0.36, 1] },
  cinematicReveal: { duration: 620, easing: [0.16, 1, 0.3, 1] },
  breath: { duration: 2600, easing: [0.37, 0, 0.63, 1] },
  dramatic: { duration: 820, easing: [0.16, 1, 0.3, 1] },
} as const satisfies Record<string, TimingPreset>;

export type TimingPresetName = keyof typeof timingPresets;

/**
 * Stagger step (ms) for sequencing lists / phased reveals.
 * Keep small — premium motion reads as "together, a hair apart", not a wave.
 */
export const motionStagger = {
  tight: 40,
  normal: 64,
  loose: 96,
} as const;

/**
 * Ambient loop durations (ms) for breathing / drift atmospheres.
 * Long and slow so they read as "alive", never busy.
 */
export const ambientLoop = {
  breathing: 5200,
  drift: 11000,
  shimmer: 2400,
} as const;
