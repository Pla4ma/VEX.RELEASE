import type { ViewStyle } from 'react-native';
import type { useTheme } from '@/theme';
import type { StreakRiskAssessment } from '@/features/streaks/streak-insurance';

export type { StreakRiskAssessment };
export type Theme = ReturnType<typeof useTheme>['theme'];

export type GambleType = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';

export interface StreakInsuranceModalProps {
  visible: boolean;
  assessment: StreakRiskAssessment | null;
  userCoins: number;
  onClose: () => void;
  onPurchaseInsurance: () => void;
  onStartGamble: (type: GambleType) => void;
  onUseComebackToken: () => void;
  availableTokens: number;
}

export interface GambleOptionProps {
  type: GambleType;
  description: string;
  xpBonus: string;
  onPress: () => void;
  theme: Theme;
}

export const GAMBLE_COLORS: Record<GambleType, (t: Theme) => string> = {
  CONSERVATIVE: (t) => t.colors.success.dark,
  MODERATE: (t) => t.colors.warning[500],
  AGGRESSIVE: (t) => t.colors.error.dark,
};
