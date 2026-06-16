import React from 'react';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import {
  borderRadius,
  fontWeights,
  sizing,
  spacing,
  typography,
} from '../../../theme/tokens/radius';
import { useUnreadNotificationsCount as useUnreadCountQuery } from '../../../theme/tokens/radius';

interface NotificationBadgeProps {
  userId: string;
  size?: 'sm' | 'md';
}

interface BadgeMetrics {
  minWidth: number;
  height: number;
  fontSize: number;
  paddingHorizontal: number;
  borderWidth: number;
}

const badgeMetrics = {
  sm: {
    minWidth: sizing.icon.sm,
    height: sizing.icon.sm,
    fontSize: typography.ui.overline.fontSize ?? 11,
    paddingHorizontal: spacing[1],
    borderWidth: spacing[0],
  },
  md: {
    minWidth: sizing.icon.md,
    height: sizing.icon.md,
    fontSize: typography.ui.caption.fontSize ?? 12,
    paddingHorizontal: spacing[1],
    borderWidth: spacing[1],
  },
} satisfies Record<NonNullable<NotificationBadgeProps['size']>, BadgeMetrics>;

function useBadgeCount(userId: string | undefined): {
  count: number;
  hasUnread: boolean;
} {
  const query = useUnreadCountQuery(userId ?? null);
  const count = query.data ?? 0;

  return {
    count,
    hasUnread: count > 0,
  };
}

function formatBadgeCount(count: number): string {
  return count > 99 ? '99+' : String(count);
}

export function NotificationBadge({
  userId,
  size = 'md',
}: NotificationBadgeProps): JSX.Element | null {
  const { count, hasUnread } = useBadgeCount(userId);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1, { damping: 12, stiffness: 200 }) }],
  }));

  if (!hasUnread) {
    return null;
  }

  const metrics = badgeMetrics[size];

  return (
    <Animated.View style={animatedStyle}>
      <Box
        minWidth={metrics.minWidth}
        height={metrics.height}
        borderRadius={borderRadius.full}
        justifyContent="center"
        alignItems="center"
        px={metrics.paddingHorizontal}
        backgroundColor="semantic.danger"
        borderWidth={metrics.borderWidth}
        borderColor="semantic.surface"
      >
        <Text
          fontSize={metrics.fontSize}
          color="text.inverse"
          fontWeight={fontWeights.heavy}
        >
          {formatBadgeCount(count)}
        </Text>
      </Box>
    </Animated.View>
  );
}

export function NotificationDot({
  userId,
}: {
  userId: string;
}): JSX.Element | null {
  const { hasUnread } = useBadgeCount(userId);

  if (!hasUnread) {
    return null;
  }

  return (
    <Box
      width={sizing.icon.xs}
      height={sizing.icon.xs}
      borderRadius={borderRadius.full}
      backgroundColor="semantic.danger"
      borderWidth={spacing[0]}
      borderColor="semantic.surface"
    />
  );
}

export function useNotificationBadge(userId: string | undefined): {
  count: number;
  hasUnread: boolean;
} {
  return useBadgeCount(userId);
}

export default NotificationBadge;
