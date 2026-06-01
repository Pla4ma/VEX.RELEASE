import { useMemo } from 'react';
import {
  FocusIdentityEngine,
  type ScoreBand,
} from './FocusIdentityEngine';
import { useTheme } from '../../theme';
import { launchColors } from '@theme/tokens/launch-colors';

/**
 * Hook for getting the color associated with a focus score
 */
export function useFocusScoreColor(score: number | null): string {
  const { theme } = useTheme();

  return useMemo(() => {
    if (!score) {
      return theme.colors.text.secondary;
    }

    const engine = new FocusIdentityEngine();
    const band = engine.getScoreBand(score);

    switch (band.label) {
      case 'Building':
        return launchColors.hex_cd7f32;
      case 'Fair':
        return launchColors.hex_c0c0c0;
      case 'Good':
        return launchColors.hex_ffd700;
      case 'Strong':
        return launchColors.hex_e5e4e2;
      case 'Exceptional':
        return launchColors.hex_b9f2ff;
      case 'Elite':
        return launchColors.hex_9c27b0;
      case 'Legendary':
        return launchColors.hex_ff1744;
      default:
        return theme.colors.text.secondary;
    }
  }, [score, theme]);
}

/**
 * Hook for generating identity statements based on score band
 */
export function useIdentityStatement(
  currentBand: ScoreBand | null,
  streakInCurrentBand: number,
): string {
  return useMemo(() => {
    if (!currentBand) {
      return 'Begin your focus journey';
    }

    const streakText =
      streakInCurrentBand > 1
        ? ` (${streakInCurrentBand} sessions in this band)`
        : '';

    switch (currentBand.label) {
      case 'Building':
        return `Building the foundation${streakText}`;
      case 'Fair':
        return `Developing consistency${streakText}`;
      case 'Good':
        return `Achieving mastery${streakText}`;
      case 'Strong':
        return `Excelling in focus${streakText}`;
      case 'Exceptional':
        return `Elite performer${streakText}`;
      case 'Elite':
        return `Focus master${streakText}`;
      case 'Legendary':
        return `Legendary focus${streakText}`;
      default:
        return 'Continue your journey';
    }
  }, [currentBand, streakInCurrentBand]);
}
