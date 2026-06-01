import type { ColorPalette } from '../../../theme/colorTypes';
import type { CompanionMood } from '../types';

export type MoodGlowTier = 'whisper' | 'soft' | 'vivid';
export type MoodShape = 'dim' | 'soft' | 'steady' | 'pulse' | 'radiant' | 'alert';

export interface MoodVisual {
  label: string;
  shape: MoodShape;
  glowTier: MoodGlowTier;
  toneKey: keyof ColorPalette['semantic'];
}

const MOOD_VISUALS: Record<CompanionMood, MoodVisual> = {
  SLEEPY: {
    label: 'Resting',
    shape: 'dim',
    glowTier: 'whisper',
    toneKey: 'textMuted',
  },
  CONTENT: {
    label: 'Settled',
    shape: 'soft',
    glowTier: 'whisper',
    toneKey: 'info',
  },
  FOCUSED: {
    label: 'Focused',
    shape: 'steady',
    glowTier: 'soft',
    toneKey: 'primary',
  },
  DETERMINED: {
    label: 'Determined',
    shape: 'pulse',
    glowTier: 'soft',
    toneKey: 'warning',
  },
  ECSTATIC: {
    label: 'Thriving',
    shape: 'radiant',
    glowTier: 'vivid',
    toneKey: 'success',
  },
  STRUGGLING: {
    label: 'Straining',
    shape: 'pulse',
    glowTier: 'soft',
    toneKey: 'warning',
  },
  DANGER: {
    label: 'At risk',
    shape: 'alert',
    glowTier: 'vivid',
    toneKey: 'danger',
  },
};

export function getMoodVisual(mood: CompanionMood): MoodVisual {
  return MOOD_VISUALS[mood];
}

export function resolveMoodColor(
  mood: CompanionMood,
  semantic: ColorPalette['semantic'],
): string {
  return semantic[MOOD_VISUALS[mood].toneKey];
}
