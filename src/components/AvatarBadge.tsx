import React from 'react';
import { View } from 'react-native';
import { Text } from './primitives/Text';
import { avatarStyles } from './Avatar.styles';

interface AvatarBadgeProps {
  badge: number | undefined;
  sizeValue: number;
  theme: ReturnType<typeof import('../theme/ThemeContext').useTheme>['theme'];
}

export function AvatarBadgeComponent({
  badge,
  sizeValue,
  theme,
}: AvatarBadgeProps) {
  if (!badge || badge <= 0) {
    return null;
  }
  const badgeSize = Math.max(18, sizeValue / 3);
  const displayBadge = badge > 99 ? '99+' : badge.toString();
  return (
    <View
      style={[
        avatarStyles.badge,
        {
          minWidth: badgeSize,
          height: badgeSize,
          borderRadius: badgeSize / 2,
          backgroundColor: theme.colors.error.DEFAULT,
          borderWidth: 2,
          borderColor: theme.colors.background.primary,
          top: -sizeValue / 20,
          right: -sizeValue / 20,
        },
      ]}
    >
      <Text style={[avatarStyles.badgeText, { fontSize: badgeSize / 2.5 }]}>
        {displayBadge}
      </Text>
    </View>
  );
}