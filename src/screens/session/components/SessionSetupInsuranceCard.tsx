import React from 'react';
import { StreakInsurancePrompt } from '../../../features/streaks/components/StreakInsurancePrompt';

type SessionSetupInsuranceCardProps = {
  coinBalance: number;
  shouldShow: boolean;
  streakDays: number;
  onDismiss: () => void;
};

export function SessionSetupInsuranceCard({
  coinBalance,
  shouldShow,
  streakDays,
  onDismiss,
}: SessionSetupInsuranceCardProps): React.JSX.Element | null {
  if (!shouldShow) {
    return null;
  }

  return (
    <StreakInsurancePrompt
      streakDays={streakDays}
      insuranceCost={200}
      userCoins={coinBalance}
      onPurchase={onDismiss}
      onDismiss={onDismiss}
    />
  );
}
