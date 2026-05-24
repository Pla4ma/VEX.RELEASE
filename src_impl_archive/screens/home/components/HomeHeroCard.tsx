import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import type { HomePrimaryPriority, HomeStakes } from '../../../features/home-spine/priority-schemas';
import { useTheme } from '../../../theme';
import { launchColors } from '@theme/tokens/launch-colors';

function getHeroTitle(type: HomePrimaryPriority['type']): string {
  switch (type) {
    case 'STREAK_CRITICAL':
      return 'Your streak needs one clean save';
    case 'COMPANION_PROMISE':
      return 'Keep the promise alive today';
    case 'PROMISE_RECOVERY':
      return 'Start small and rebuild the thread';
    case 'STREAK_AT_RISK':
      return 'Protect the habit before it slips';
    case 'RECOMMENDED_SESSION':
      return 'VEX already has the next session ready';
    case 'CHALLENGE_NEAR_DONE':
      return 'You are close enough to finish this today';
    case 'BOSS_ACTIVE':
      return 'The battle is already in motion';
    case 'DEFAULT_SESSION':
      return 'Start the next focus block fast';
  }
}

function getHeroEyebrow(type: HomePrimaryPriority['type']): string {
  switch (type) {
    case 'COMPANION_PROMISE':
    case 'PROMISE_RECOVERY':
      return 'Companion thread';
    case 'CHALLENGE_NEAR_DONE':
      return 'Challenge';
    case 'BOSS_ACTIVE':
      return 'Boss run';
    case 'STREAK_AT_RISK':
    case 'STREAK_CRITICAL':
      return 'Habit protection';
    default:
      return 'Primary action';
  }
}

interface HomeHeroCardProps {
  isLoading: boolean;
  onPressPrimary: () => void;
  priority: HomePrimaryPriority | null;
  stakes: HomeStakes | null;
}

export function HomeHeroCard({
  isLoading,
  onPressPrimary,
  priority,
  stakes,
}: HomeHeroCardProps): JSX.Element {
  const { theme } = useTheme();

  if (isLoading || !priority) {
    return (
      <View
        style={{
          backgroundColor: theme.colors.background.secondary,
          borderRadius: theme.borderRadius.xl,
          minHeight: 220,
          padding: theme.spacing[5],
        }}
      >
        <Text variant="label" color={theme.colors.text.secondary}>
          Primary action
        </Text>
        <Text
          variant="h4"
          color={theme.colors.text.primary}
          style={{ marginTop: theme.spacing[3] }}
        >
          Loading today&apos;s focus path...
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[theme.colors.primary[600] ?? launchColors.hex_4f46e5, theme.colors.primary[500] ?? launchColors.hex_7c3aed]}
      style={{
        borderRadius: theme.borderRadius.xl,
        gap: theme.spacing[3],
        overflow: 'hidden',
        padding: theme.spacing[5],
      }}
    >
      <Text variant="label" color={launchColors.rgb_255_255_255_0_72}>
        {getHeroEyebrow(priority.type)}
      </Text>
      <Text variant="h3" color={theme.colors.text.inverse}>
        {getHeroTitle(priority.type)}
      </Text>
      <Text variant="body" color={launchColors.rgb_255_255_255_0_9}>
        {priority.reason}
      </Text>
      {stakes ? (
        <View
          style={{
            backgroundColor: launchColors.rgb_255_255_255_0_15,
            borderRadius: theme.borderRadius.lg,
            gap: theme.spacing[2],
            padding: theme.spacing[4],
          }}
        >
          <Text variant="label" color={launchColors.rgb_255_255_255_0_72}>
            What matters now
          </Text>
          <Text variant="body" color={theme.colors.text.inverse}>
            {stakes.what}
          </Text>
          {stakes.atRisk ? (
            <Text variant="bodySmall" color={launchColors.rgb_255_255_255_0_9}>
              At risk: {stakes.atRisk}
            </Text>
          ) : null}
          {stakes.potentialGain ? (
            <Text variant="bodySmall" color={launchColors.rgb_255_255_255_0_9}>
              Gain: {stakes.potentialGain}
            </Text>
          ) : null}
        </View>
      ) : null}
      <Button
        fullWidth
        size="lg"
        variant="primary"
        onPress={onPressPrimary}
        accessibilityLabel={priority.cta.text}
        accessibilityRole="button"
        accessibilityHint="Starts the highest-priority action for today"
      >
        {priority.cta.text}
      </Button>
    </LinearGradient>
  );
}
