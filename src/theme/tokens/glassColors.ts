/**
 * Glass Color Tokens
 *
 * Centralized color constants for Liquid Glass visual effects.
 * These are design-intrinsic values tied to glass shader math.
 * Changing them requires updating fragment shaders in LiquidGlassObject.defs.tsx.
 *
 * Migrated from hardcoded hex values scattered across glass components.
 * Usage: import { glassColors } from '@/theme/tokens/glassColors';
 */

export const glassColors = {
  /** Core glass palette */
  vexDeepTeal: '#0A5E4D',
  vexCyanSoft: '#C4FCE8',
  vexWarmWhite: '#FFFBEF',
  vexWhite: '#FFFFFF',
  vexOffWhite: '#F0FFF9',

  /** Amber progression tones */
  amber: {
    light: '#F1C575',
    mid: '#E8B85F',
    deep: '#DFA44A',
  },

  /** Accent colors used in glass components */
  accent: {
    amber: '#FF8B2A',
    amberDeep: '#9E4B16',
    teal: '#12BFA0',
    tealDeep: '#0C765F',
  },

  /** Ethereal auth colors */
  ethereal: {
    ink: '#0A0A0A',
    warmCream: '#FFFBEF',
    softPink: '#FFD9E0',
    softBlue: '#E7F1FB',
    warmGold: '#FFE9C2',
  },
} as const;

export type GlassColorKey = keyof typeof glassColors;
