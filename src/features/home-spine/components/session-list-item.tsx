import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { buttonTap } from '../../../utils/haptics';
import {
  type SessionListItem,
  formatDuration,
  formatTimeAgo,
  getGradeColor,
} from './session-list-utils';

export function SessionItemSkeleton(): React.ReactNode {
  const { theme } = useTheme();
  return (
    <Box flexDirection="row" alignItems="center" py="md" px="lg" gap="md">
      <Box
        width={4}
        height={40}
        borderRadius="full"
        bg={theme.colors.background.tertiary}
      />
      <Box flex={1} gap="sm">
        <Box
          width={80}
          height={16}
          borderRadius="sm"
          bg={theme.colors.background.tertiary}
        />
        <Box
          width={120}
          height={12}
          borderRadius="sm"
          bg={theme.colors.background.tertiary}
        />
      </Box>
      <Box
        width={50}
        height={20}
        borderRadius="lg"
        bg={theme.colors.background.tertiary}
      />
    </Box>
  );
}

export function RecentSessionsSkeleton(): React.ReactNode {
  return (
    <Box>
      <SessionItemSkeleton />
      <SessionItemSkeleton />
      <SessionItemSkeleton />
    </Box>
  );
}

export function EmptyState(): React.ReactNode {
  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <Box py="xl" px="lg" alignItems="center" justifyContent="center" gap="md">
        <Text fontSize={48} />
        <Text variant="h4" color="text.secondary" textAlign="center">
          No sessions yet
        </Text>
        <Text variant="body" color="text.tertiary" textAlign="center">
          Start your first focus session to begin building your streak!
        </Text>
      </Box>
    </Animated.View>
  );
}

export function SessionRow({
  session,
  onPress,
}: {
  session: SessionListItem;
  onPress?: () => void;
}): React.ReactNode {
  const { theme } = useTheme();
  const accentColor = getGradeColor(session.qualityGrade, theme);
  const hasInterruptions = session.interruptions > 0;
  return (
    <Pressable
      onPress={() => { buttonTap(); onPress?.(); }}
      accessibilityLabel={`${formatDuration(session.duration)} session, ${session.qualityGrade} grade`}
      accessibilityRole="button"
      accessibilityHint="Double tap to view session details"
    >
      <Box flexDirection="row" alignItems="center" py="md" px="lg" gap="md">
        <Box width={4} height={48} borderRadius="full" bg={accentColor} />
        <Box flex={1} gap="xs">
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Text variant="body" color="text.primary" fontWeight="600">
              {formatDuration(session.duration)}
            </Text>
            <Text variant="caption" color="text.tertiary">
              ·
            </Text>
            <Text variant="caption" color="text.tertiary">
              {formatTimeAgo(session.endedAt)}
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Box px="xs" py="xs" borderRadius="sm" bg={`${accentColor}20`}>
              <Text variant="caption" color={accentColor} fontWeight="700">
                {session.qualityGrade}
              </Text>
            </Box>
            {hasInterruptions && (
              <Text variant="caption" color="text.tertiary">
                {session.interruptions} interruption
                {session.interruptions > 1 ? 's' : ''}
              </Text>
            )}
          </Box>
        </Box>
        <Box
          flexDirection="row"
          alignItems="center"
          gap="xs"
          px="sm"
          py="xs"
          borderRadius="lg"
          bg={theme.colors.background.tertiary}
        >
          <Text fontSize={12} />
          <Text variant="caption" color="text.secondary" fontWeight="600">
            +{session.xpEarned}
          </Text>
        </Box>
      </Box>
    </Pressable>
  );
}
