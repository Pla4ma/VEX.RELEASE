/**
 * Avatar Component
 *
 * User avatar with support for images, initials, status indicators, and badges.
 * Part of the VEX Design System.
 */

import React from 'react';
import { View, Image, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './primitives';
import { createSheet } from '@/shared/ui/create-sheet';

export interface AvatarProps {
  /** Image source URL or require() */
  source?: string | { uri: string };
  /** User name for initials */
  name?: string;
  /** Avatar size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Online/away/offline status */
  status?: 'online' | 'away' | 'offline' | 'busy' | 'none';
  /** Notification badge count */
  badge?: number;
  /** Custom border color */
  borderColor?: string;
  /** Border width */
  borderWidth?: number;
  /** Click handler */
  onPress?: () => void;
  /** Custom styles */
  style?: StyleProp<ViewStyle>;
  /** Background color for initials */
  backgroundColor?: string;
  /** Shape variant */
  shape?: 'circle' | 'rounded' | 'square';
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
  '2xl': 96,
};

const fontSizeMap = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 24,
  '2xl': 32,
};

const statusColorMap = {
  online: '#22C55E',
  away: '#EAB308',
  offline: '#94A3B8',
  busy: '#EF4444',
  none: 'transparent',
};

export const Avatar: React.FC<AvatarProps> = ({ source, name = '?', size = 'md', status = 'none', badge, borderColor, borderWidth = 0, onPress, style, backgroundColor, shape = 'circle' }) => {
  const { theme } = useTheme();
  const sizeValue = sizeMap[size];
  const fontSize = fontSizeMap[size];

  const getInitials = () => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getBorderRadius = () => {
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
  };

  const renderContent = () => {
    if (source) {
      const imageSource = typeof source === 'string' ? { uri: source } : source;
      return (
        <Image
          source={imageSource}
          resizeMode="cover"
          style={[
            styles.image,
            {
              width: sizeValue,
              height: sizeValue,
              borderRadius: getBorderRadius(),
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
          styles.initialsContainer,
          {
            width: sizeValue,
            height: sizeValue,
            borderRadius: getBorderRadius(),
            backgroundColor: bgColor,
            borderWidth,
            borderColor: borderColor || theme.colors.border.DEFAULT,
          },
        ]}
      >
        <Text
          style={[
            styles.initials,
            {
              fontSize,
              color: '#FFFFFF',
              fontWeight: '600',
            },
          ]}
        >
          {getInitials()}
        </Text>
      </View>
    );
  };

  const renderStatus = () => {
    if (status === 'none') {
      return null;
    }

    const statusSize = Math.max(8, sizeValue / 5);
    const statusColor = statusColorMap[status];

    return (
      <View
        style={[
          styles.status,
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
          styles.badge,
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
        <Text style={[styles.badgeText, { fontSize: badgeSize / 2.5 }]}>{displayBadge}</Text>
      </View>
    );
  };

  const AvatarContent = (
    <View style={[styles.container, { width: sizeValue, height: sizeValue }, style]}>
      {renderContent()}
      {renderStatus()}
      {renderBadge()}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.container, { width: sizeValue, height: sizeValue }, style, pressed && { opacity: 0.8 }]} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
        {AvatarContent}
      </Pressable>
    );
  }

  return AvatarContent;
};

const styles = createSheet({
  container: {
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    textAlign: 'center',
  },
  status: {
    position: 'absolute',
  },
  badge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default Avatar;
