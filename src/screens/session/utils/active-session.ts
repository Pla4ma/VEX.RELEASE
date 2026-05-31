import { launchColors } from '@theme/tokens/launch-colors';
export type PurityLabel = 'Elite' | 'Good' | 'Okay' | 'Distracted';
export type GradientState = { top: string; middle: string; bottom: string };

export const DAILY_GOAL_SECONDS = 2 * 60 * 60;
export const PERFECT_PARTICLE_COUNT = 8;
const WARNING_GRADIENT = [
  launchColors.hex_140e11,
  launchColors.hex_231817,
  launchColors.hex_090b12,
] as const;
const FOCUS_GRADIENT = [
  launchColors.hex_111827,
  launchColors.hex_172033,
  launchColors.hex_0a0f1a,
] as const;
const ELITE_GRADIENT = [
  launchColors.hex_091427,
  launchColors.hex_101a31,
  launchColors.hex_050914,
] as const;
const BREAK_GRADIENT = [
  launchColors.hex_072226,
  launchColors.hex_0e2a2e,
  launchColors.hex_051417,
] as const;

export const formatTime = (seconds: number): string =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${Math.max(seconds % 60, 0)
    .toString()
    .padStart(2, '0')}`;

export const formatMultiplier = (value: number): string =>
  value.toFixed(value % 1 === 0 ? 1 : 2).replace(/\.0$/, '');

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const withAlpha = (color: string, alpha: number): string =>
  color.startsWith('#')
    ? `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${alpha})`
    : color;

export const getVisualStateIndex = (
  phase: string | undefined,
  label: PurityLabel,
): number =>
  phase === 'SHORT_BREAK' || phase === 'LONG_BREAK'
    ? 3
    : label === 'Distracted'
      ? 0
      : label === 'Okay'
        ? 1
        : 2;

export const getGradientPalette = (value: number): GradientState => {
  if (value >= 2.5) {
    return {
      top: BREAK_GRADIENT[0],
      middle: BREAK_GRADIENT[1],
      bottom: BREAK_GRADIENT[2],
    };
  }

  if (value >= 1.5) {
    return {
      top: ELITE_GRADIENT[0],
      middle: ELITE_GRADIENT[1],
      bottom: ELITE_GRADIENT[2],
    };
  }

  if (value >= 0.5) {
    return {
      top: FOCUS_GRADIENT[0],
      middle: FOCUS_GRADIENT[1],
      bottom: FOCUS_GRADIENT[2],
    };
  }

  return {
    top: WARNING_GRADIENT[0],
    middle: WARNING_GRADIENT[1],
    bottom: WARNING_GRADIENT[2],
  };
};

export const getPhaseInfo = (phase: string | undefined) =>
  phase === 'SHORT_BREAK'
    ? { label: 'Reset Window', icon: 'clock' as const }
    : phase === 'LONG_BREAK'
      ? { label: 'Long Reset', icon: 'clock' as const }
      : { label: 'Locked In', icon: 'target' as const };
