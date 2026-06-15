import React from 'react';
import { View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../theme/ThemeContext';
import { buttonTap } from '../utils/haptics';
import { Text } from './primitives/Text';
import { lightColors } from '@/theme/tokens/colors';

import { SIZE_MAP, FONT_SIZE_MAP, STATUS_COLOR_MAP } from './Avatar.types';
import { avatarStyles } from './Avatar.styles';
import type { AvatarProps, AvatarShape } from './Avatar.types';

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0]!.charAt(0).toUpperCase();
  }
  return (
    parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)
  ).toUpperCase();
}

function getBorderRadius(shape: AvatarShape, sizeValue: number): number {
  switch (shape) {
    case 'circle':
      return sizeValue / 2;
    case 'rounded':
      return sizeValue / 4;
    case 'square':
      return 4;
    default:
      return sizeValue / 2;
  }
}

export const Avatar = React.memo(({
  source,
  name = '?',
  size = 'md',
  status = 'none',
  badge,
  borderColor,
  borderWidth = 0,
  onPress,
  style,
  backgroundColor,
  shape = 'circle',
}: AvatarProps) => {
  const { theme } = useTheme();
  const sizeValue = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];

  const renderContent = () => {
    if (source) {
      const imageSource = typeof source === 'string' ? { uri: source } : source;
      return (
        <Image
          source={imageSource}
          contentFit="cover"
          style={[
            avatarStyles.image,
            {
              width: sizeValue,
              height: sizeValue,
              borderRadius: getBorderRadius(shape, sizeValue),
              borderWidth,
              borderColor: borderColor || theme.colors.border.DEFAULT,
            },
          ]}
        />
      );
    }
    const bgColor = backgroundColor || theme.colors.primary[500];
    return (
      <View
        style={[
          avatarStyles.initialsContainer,
          {
            width: sizeValue,
            height: sizeValue,
            borderRadius: getBorderRadius(shape, sizeValue),
            backgroundColor: bgColor,
            borderWidth,
            borderColor: borderColor || theme.colors.border.DEFAULT,
          },
        ]}
      >
        <Text
          style={[
            avatarStyles.initials,
            { fontSize, color: lightColors.text.inverse, fontWeight: '600' },
          ]}
        >
          {getInitials(name)}
        </Text>
      </View>
    );
  };

  const renderStatus = () => {
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
  };

  const renderBadge = () => {
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
  };

  const AvatarContent = (
    <View
      style={[avatarStyles.container, { width: sizeValue, height: sizeValue }, style]}
    >
      {renderContent()}
      {renderStatus()}
      {renderBadge()}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={() => { buttonTap(); onPress(); }}
        style={({ pressed }) => [
          avatarStyles.container,
          { width: sizeValue, height: sizeValue },
          style,
          pressed && { opacity: 0.8 },
        ]}
        accessibilityLabel={`Avatar for ${name}`}
        accessibilityRole="button"
        accessibilityHint="Double tap to view profile"
      >
        {AvatarContent}
      </Pressable>
    );
  }
  return AvatarContent;
});

Avatar.displayName = 'Avatar';

export default Avatar;
