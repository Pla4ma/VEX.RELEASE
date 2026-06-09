import React from 'react';
import { Pressable } from 'react-native';

import { Avatar } from '../../../components/Avatar';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { CompanionMood } from '../../companion/types';
import {
  _StreakIndicator,
  _LevelBadge,
  getCompanionMoodSymbol,
} from './GreetingHeaderBadges';

export { StreakIndicator, LevelBadge } from './GreetingHeaderBadges';

export function GreetingHeaderSkeleton(): JSX.Element {
  const { theme } = useTheme();
  return (
    <Box flexDirection="row" alignItems="center" px="lg" py="md" gap="md">
      <Box
        width={48}
        height={48}
        borderRadius="full"
        bg={theme.colors.background.tertiary}
      />
      <Box gap="sm">
        <Box
          width={120}
          height={16}
          borderRadius="sm"
          bg={theme.colors.background.tertiary}
        />
        <Box
          width={80}
          height={12}
          borderRadius="sm"
          bg={theme.colors.background.tertiary}
        />
      </Box>
    </Box>
  );
}

export function ProfileAvatar({
  avatarUrl,
  displayName,
  onPressProfile,
}: {
  avatarUrl?: string;
  displayName: string;
  onPressProfile?: () => void;
}): JSX.Element {
  const { theme } = useTheme();
  return (
    <Pressable
      accessibilityHint="Opens your profile."
      accessibilityLabel="Open profile"
      accessibilityRole="button"
      onPress={onPressProfile}
    >
      <Avatar
        source={avatarUrl}
        name={displayName}
        size="lg"
        borderWidth={2}
        borderColor={theme.colors.primary[500]}
      />
    </Pressable>
  );
}

export function CompanionHeaderAvatar({
  mood,
  onPress,
}: {
  mood?: CompanionMood;
  onPress?: () => void;
}): JSX.Element | null {
  const { theme } = useTheme();
  if (!mood) {
    return null;
  }
  return (
    <Pressable
      accessibilityHint="Opens your companion details."
      accessibilityLabel={`Open companion details. Current mood ${mood.toLowerCase()}.`}
      accessibilityRole="button"
      onPress={onPress}
      style={{
        minHeight: 44,
        minWidth: 44,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        alignItems="center"
        justifyContent="center"
        width={32}
        height={32}
        borderRadius="full"
        bg={theme.colors.background.secondary}
        borderWidth={1}
        borderColor={theme.colors.primary[400]}
      >
        <Text fontSize={16}>{getCompanionMoodSymbol(mood)}</Text>
      </Box>
    </Pressable>
  );
}
