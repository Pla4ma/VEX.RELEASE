import React from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StreakInsurancePrompt } from '../../../features/streaks/components/StreakInsurancePrompt';
import type { ExtendedRootStackParams } from '../../../navigation/types';

type SessionSetupInsuranceCardProps = {
  coinBalance: number;
  navigation: NativeStackNavigationProp<ExtendedRootStackParams>;
  setShopTheme: (theme: null) => void;
  shouldShow: boolean;
  streakDays: number;
  onDismiss: () => void;
};

export function SessionSetupInsuranceCard({
  coinBalance,
  navigation,
  setShopTheme,
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
      onPurchase={() => {
        setShopTheme(null);
        navigation.navigate('Shop');
      }}
      onDismiss={onDismiss}
    />
  );
}
