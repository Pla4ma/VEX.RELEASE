import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '../../../components/primitives';
import { useTheme } from '../../../theme';
import type { RivalMatchResult } from '../schemas';

interface SuggestedRivalCardProps {
  rival: RivalMatchResult;
  isLoading?: boolean;
  onAddAsRival: () => void;
}

export function SuggestedRivalCard({
  rival,
  isLoading = false,
  onAddAsRival,
}: SuggestedRivalCardProps): JSX.Element {
  const { theme } = useTheme();
  const matchPercent = Math.round(rival.matchScore * 100);

  return (
    <Animated.View
      entering={FadeInUp.duration(400)}
      style={{
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing[4],
        marginBottom: theme.spacing[3],
      }}
    >
      <Animated.View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] }}>
        <Animated.View
          style={{
            width: 48,
            height: 48,
            borderRadius: theme.borderRadius.full,
            backgroundColor: theme.colors.background.tertiary,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text fontWeight="700" color={theme.colors.text.primary}>
            {rival.name.charAt(0).toUpperCase()}
          </Text>
        </Animated.View>
        <Animated.View style={{ flex: 1 }}>
          <Text variant="body" fontWeight="700" color={theme.colors.text.primary}>
            {rival.name}
          </Text>
          <Text variant="caption" color={theme.colors.text.tertiary}>
            Level {rival.level} - {rival.sessionsPerWeek} sessions/week
          </Text>
        </Animated.View>
        <Text variant="label" color={theme.colors.primary[500]}>
          {matchPercent}%
        </Text>
      </Animated.View>

      <Pressable
        accessibilityLabel={`Challenge ${rival.name}`}
        accessibilityRole="button"
        accessibilityHint="Sends a focus duel challenge"
        disabled={isLoading}
        onPress={onAddAsRival}
        style={{
          marginTop: theme.spacing[3],
          minHeight: 44,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: isLoading ? theme.colors.background.tertiary : theme.colors.primary[500],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text color={theme.colors.text.inverse} fontWeight="700">
          {isLoading ? 'Sending...' : 'Challenge'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
