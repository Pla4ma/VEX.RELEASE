import { useMemo } from 'react';
import {
  FocusIdentityEngine,
  type ScoreBand,
} from './FocusIdentityEngine';
import { useTheme } from '../../theme';
import { lightColors } from '@/theme/tokens/colors';


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
        return lightColors.text.muted;
      case 'Fair':
        return lightColors.text.disabled;
      case 'Good':
        return lightColors.semantic.vexGold;
      case 'Strong':
        return lightColors.semantic.scorePlatinum;
      case 'Exceptional':
        return lightColors.semantic.scoreCelestial;
      case 'Elite':
        return lightColors.accent.purple;
      case 'Legendary':
        return lightColors.semantic.danger;
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
