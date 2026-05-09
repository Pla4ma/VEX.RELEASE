/**
 * Focus Identity Hooks
 *
 * Centralized hooks for focus identity functionality
 */

import { useMemo } from 'react';
import { useFocusScore } from './hooks-focus-score';
import { FocusIdentityEngine, type ScoreBand, type FocusIdentityProfile } from './FocusIdentityEngine';
import { useTheme } from '../../theme';

/**
 * Hook for accessing focus identity data and state
 */
export function useFocusIdentity(userId: string) {
  const { score, history, status, error, refetch } = useFocusScore();

  // Transform the data to match the expected interface
  const profile: FocusIdentityProfile | null = useMemo(() => {
    if (!score) {return null;}

    return FocusIdentityEngine.createProfile(score.currentScore, {
      streakInCurrentBand: 0, // Would be calculated from actual data
      percentileRank: score.percentileRank || 0,
      isInRecovery: false, // Would be calculated from actual data
    });
  }, [score]);

  const currentBand: ScoreBand | null = useMemo(() => {
    if (!profile) {return null;}
    return FocusIdentityEngine.getScoreBand(profile.currentScore);
  }, [profile]);

  const scoreChange = useMemo(() => {
    if (!history || history.length < 2) {return 0;}
    const latest = history[0];
    const previous = history[1];
    return latest.score - previous.score;
  }, [history]);

  const loadingState = status;
  const isRetrying = status === 'loading' && !!score;

  return {
    profile,
    loadingState,
    error,
    isRetrying,
    retry: refetch,
    currentBand,
    scoreChange,
  };
}

/**
 * Hook for getting the color associated with a focus score
 */
export function useFocusScoreColor(score: number | null): string {
  const { theme } = useTheme();

  return useMemo(() => {
    if (!score) {return theme.colors.textMuted;}

    const band = FocusIdentityEngine.getScoreBand(score);

    switch (band.label) {
      case 'BRONZE':
        return '#CD7F32';
      case 'SILVER':
        return '#C0C0C0';
      case 'GOLD':
        return '#FFD700';
      case 'PLATINUM':
        return '#E5E4E2';
      case 'DIAMOND':
        return '#B9F2FF';
      case 'MASTER':
        return '#9C27B0';
      case 'GRANDMASTER':
        return '#FF1744';
      default:
        return theme.colors.textMuted;
    }
  }, [score, theme]);
}

/**
 * Hook for generating identity statements based on score band
 */
export function useIdentityStatement(currentBand: ScoreBand | null, streakInCurrentBand: number): string {
  return useMemo(() => {
    if (!currentBand) {return 'Begin your focus journey';}

    const streakText = streakInCurrentBand > 1 ? ` (${streakInCurrentBand} sessions in this band)` : '';

    switch (currentBand.label) {
      case 'BRONZE':
        return `Building the foundation${streakText}`;
      case 'SILVER':
        return `Developing consistency${streakText}`;
      case 'GOLD':
        return `Achieving mastery${streakText}`;
      case 'PLATINUM':
        return `Excelling in focus${streakText}`;
      case 'DIAMOND':
        return `Elite performer${streakText}`;
      case 'MASTER':
        return `Focus master${streakText}`;
      case 'GRANDMASTER':
        return `Legendary focus${streakText}`;
      default:
        return 'Continue your journey';
    }
  }, [currentBand, streakInCurrentBand]);
}

/**
 * Hook for monthly focus report data
 */
export function useMonthlyReport(userId: string, year: number, month: number) {
  // Import from the new monthly report system
  const { useMonthlyReport: useMonthlyReportImpl } = require('./monthly-report');
  return useMonthlyReportImpl(userId, year, month);
}
