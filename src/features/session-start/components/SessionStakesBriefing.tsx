import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import type { SessionStakesBriefingProps } from './SessionStakesBriefing.types';
import { StakeCard } from './StakeCard';
import { EmptyStakesMessage } from './EmptyStakesMessage';
import { buildStakes } from './buildStakes';

export type { SessionStake, SessionStakesBriefingProps } from './SessionStakesBriefing.types';

export function SessionStakesBriefing({
  bossStake,
  streakStake,
  challengeStake,
  rivalStake,
  squadWarStake,
  onStakePress,
}: SessionStakesBriefingProps): React.ReactNode {
  const { theme } = useTheme();
  const topStakes = buildStakes(
    { bossStake, streakStake, challengeStake, rivalStake, squadWarStake },
    theme,
  );
  return (
    <Animated.View entering={FadeInUp.duration(400).delay(200)}>
      <View style={{ gap: theme.spacing[2] }}>
        {}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing[2],
          }}
        >
          <Text fontSize={16}>🎯</Text>
          <Text variant="label" color="text.tertiary">
            WHAT'S AT STAKE
          </Text>
        </View>

        {}
        <View style={{ gap: theme.spacing[2] }}>
          {topStakes.length > 0 ? (
            topStakes.map((stake) => (
              <StakeCard
                key={stake.id}
                icon={stake.icon}
                title={stake.title}
                subtitle={stake.subtitle}
                urgency={stake.urgency}
                accentColor={stake.accentColor}
                onPress={
                  onStakePress ? () => onStakePress(stake.id) : undefined
                }
              />
            ))
          ) : (
            <EmptyStakesMessage />
          )}
        </View>
      </View>
    </Animated.View>
  );
}

export default SessionStakesBriefing;
