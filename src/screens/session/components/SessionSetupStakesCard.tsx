import React from 'react';
import {
  useNavigation,
  type CompositeNavigationProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box } from '../../../components/primitives/Box';
import { SessionStakesBriefing } from '../../../features/session-start/components/SessionStakesBriefing';
import { useFeatureAccess } from '../../../features/liveops-config';
import {
  getFeatureAvailability,
  isFeatureAvailableForNavigation,
} from '../../../features/liveops-config/FeatureFlagService';
import type {
  ExtendedRootStackParams,
  SessionStackParams,
} from '../../../navigation/types';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParams } from '../../../navigation/types';
import type { MainStackParams } from '../../../navigation/types';
import { navigateToMainStackScreen, navigateToRootScreen } from '../../../navigation/navigation-helpers';
import type { useSessionSetupStakes } from '../hooks/useSessionSetupStakes';

type SessionNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<SessionStackParams>,
  NativeStackNavigationProp<ExtendedRootStackParams>
>;

interface SessionSetupStakesCardProps {
  stakes: ReturnType<typeof useSessionSetupStakes>;
}

export function SessionSetupStakesCard({
  stakes,
}: SessionSetupStakesCardProps): React.ReactNode {
  const navigation = useNavigation<SessionNavigationProp>();
  const disclosure = useFeatureAccess();

  return (
    <Box px="lg" mt="md">
      <SessionStakesBriefing
        bossStake={stakes.bossStake}
        streakStake={stakes.streakStake}
        challengeStake={stakes.challengeStake}
        rivalStake={stakes.rivalStake}
        onStakePress={(stakeId) => {
          if (
            stakeId === 'boss' &&
            isFeatureAvailableForNavigation(
              getFeatureAvailability(disclosure.features.boss_tab),
            )
          ) {
            navigateToMainStackScreen(navigation as NavigationProp<MainStackParams>, 'Boss');
          }
          if (stakeId === 'streak') {
            navigateToRootScreen(navigation as NavigationProp<RootStackParams>, 'Main', { screen: 'Progress' });
          }
          if (
            stakeId === 'challenge' &&
            isFeatureAvailableForNavigation(
              getFeatureAvailability(disclosure.features.challenges),
            )
          ) {
            navigateToMainStackScreen(navigation as NavigationProp<MainStackParams>, 'Challenges');
          }
          if (stakeId === 'rival') {
            navigateToRootScreen(navigation as NavigationProp<RootStackParams>, 'Main', { screen: 'Home' });
          }
        }}
      />
    </Box>
  );
}
