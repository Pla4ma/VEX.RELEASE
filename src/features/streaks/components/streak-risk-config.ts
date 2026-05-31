import type { useTheme } from '../../../theme';

export type StreakRiskLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface StreakRiskBannerProps {
  riskLevel: StreakRiskLevel;
  hoursRemaining: number;
  streakDays: number;
  suggestedDuration: number;
  onStartSession: (duration: number) => void;
}

export interface RiskConfig {
  bg: string;
  border: string;
  text: string;
  emoji: string;
  label: string;
  message: string;
  pulse: boolean;
}

export function getRiskConfig(
  riskLevel: StreakRiskLevel,
  theme: ReturnType<typeof useTheme>['theme'],
): RiskConfig | null {
  switch (riskLevel) {
    case 'CRITICAL':
      return {
        bg: `${theme.colors.error.DEFAULT}30`,
        border: theme.colors.error.DEFAULT,
        text: theme.colors.error.DEFAULT,
        emoji: '🚨',
        label: 'CRITICAL',
        message: 'LAST CHANCE — Start now!',
        pulse: true,
      };
    case 'HIGH':
      return {
        bg: `${theme.colors.error.DEFAULT}20`,
        border: theme.colors.error.light,
        text: theme.colors.error.DEFAULT,
        emoji: '🔥',
        label: 'HIGH RISK',
        message: 'Streak at risk — act now',
        pulse: true,
      };
    case 'MEDIUM':
      return {
        bg: `${theme.colors.warning.DEFAULT}20`,
        border: theme.colors.warning.DEFAULT,
        text: theme.colors.warning.dark,
        emoji: '⏰',
        label: 'AT RISK',
        message: 'Start a session soon',
        pulse: false,
      };
    default:
      return null;
  }
}
