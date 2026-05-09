import { useMemo } from 'react';
import { useTheme } from '../../../theme';
import type { StartSessionButtonProps } from './StartSessionButton';

export function useStartSessionButtonColors(
  streakRiskLevel: StartSessionButtonProps['streakRiskLevel'],
  hasActiveSession: boolean,
  isFinalStrike: boolean = false
) {
  const { theme } = useTheme();
  return useMemo(() => {
    if (isFinalStrike) {
      return { gradient: [theme.colors.error.dark, theme.colors.error.DEFAULT] as const, shadow: theme.colors.error.DEFAULT, isFinalStrike: true };
    }
    if (hasActiveSession) {
      return { gradient: [theme.colors.accent.purple, theme.colors.primary[600]] as const, shadow: theme.colors.accent.purple, isFinalStrike: false };
    }
    if (streakRiskLevel === 'CRITICAL') {
      return { gradient: [theme.colors.error.dark, theme.colors.error.DEFAULT] as const, shadow: theme.colors.error.DEFAULT, isFinalStrike: false };
    }
    if (streakRiskLevel === 'HIGH') {
      return { gradient: [theme.colors.error.DEFAULT, theme.colors.warning[500]] as const, shadow: theme.colors.error.DEFAULT, isFinalStrike: false };
    }
    if (streakRiskLevel === 'MEDIUM') {
      return { gradient: [theme.colors.warning[500], theme.colors.accent.orange] as const, shadow: theme.colors.warning[500], isFinalStrike: false };
    }
    return { gradient: [theme.colors.primary[600], theme.colors.primary[500]] as const, shadow: theme.colors.primary[400], isFinalStrike: false };
  }, [streakRiskLevel, hasActiveSession, isFinalStrike, theme]);
}
