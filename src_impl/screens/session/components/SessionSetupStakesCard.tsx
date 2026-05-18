import React from 'react';
import {
  useNavigation,
  type CompositeNavigationProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box } from '../../../components/primitives/Box';
import { SessionStakesBriefing } from '../../../features/session-start/components/SessionStakesBriefing';
import { useFeatureAccess } from '../../../features/liveops-config';
import { getFeatureAvailability } from '../../../features/liveops-config/feature-availability';
import type {
  ExtendedRootStackParams,
  SessionStackParams,
} from '../../../navigation/types';
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
}: SessionSetupStakesCardProps): JSX.Element {
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
            getFeatureAvailability(disclosure.features.boss_tab).canNavigate
          ) {
            navigation.navigate('Boss');
          }
          if (stakeId === 'streak') {
            navigation.navigate('Main', { screen: 'Progress' });
          }
          if (
            stakeId === 'challenge' &&
            getFeatureAvailability(disclosure.features.challenges).canNavigate
          ) {
            navigation.navigate('Challenges');
          }
          if (stakeId === 'rival') {
            navigation.navigate('Main', { screen: 'Home' });
          }
        }}
      />
    </Box>
  );
}
