import React from 'react';
import { View } from 'react-native';
import { avatarStyles } from './Avatar.styles';
import type { AvatarStatus } from './Avatar.types';
import { STATUS_COLOR_MAP } from './Avatar.types';

interface AvatarStatusProps {
  status: Exclude<AvatarStatus, undefined>;
  sizeValue: number;
  theme: ReturnType<typeof import('../theme/ThemeContext').useTheme>['theme'];
}

export function AvatarStatusComponent({
  status,
  sizeValue,
  theme,
}: AvatarStatusProps) {
  if (status === 'none') {
    return null;
  }
  const statusSize = Math.max(8, sizeValue / 5);
  const statusColor = STATUS_COLOR_MAP[status];
  return (
    <View
      style={[
        avatarStyles.status,
        {
          width: statusSize,
          height: statusSize,
          borderRadius: statusSize / 2,
          backgroundColor: statusColor,
          borderWidth: 2,
          borderColor: theme.colors.background.primary,
          right: -sizeValue / 20,
          bottom: -sizeValue / 20,
        },
      ]}
    />
  );
}