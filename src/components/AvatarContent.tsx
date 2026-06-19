import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from './primitives/Text';
import { lightColors } from '@/theme/tokens/colors';
import type { AvatarProps, AvatarShape } from './Avatar.types';
import { avatarStyles } from './Avatar.styles';
import { getBorderRadius } from './Avatar.utils';

interface AvatarContentProps {
  source?: AvatarProps['source'];
  name: string;
  sizeValue: number;
  fontSize: number;
  shape: AvatarShape;
  borderWidth: number;
  borderColor?: string;
  backgroundColor?: string;
  theme: ReturnType<typeof import('../theme/ThemeContext').useTheme>['theme'];
}

export function AvatarContentComponent({
  source,
  name,
  sizeValue,
  fontSize,
  shape,
  borderWidth,
  borderColor,
  backgroundColor,
  theme,
}: AvatarContentProps) {
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
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0]?.charAt(0).toUpperCase() ?? '';
  }
  return (
    (parts[0]?.charAt(0) ?? '') + (parts[parts.length - 1]?.charAt(0) ?? '')
  ).toUpperCase();
}