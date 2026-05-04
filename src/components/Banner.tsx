/**
 * Banner Component
 *
 * Promotional and informational banners with rich styling.
 * Part of the VEX Design System.
 */

import React from 'react';
import {
  View,
  Pressable,
  StyleProp,
  ViewStyle,
  Image,
  ImageSourcePropType,
} from 'react-native';

import { useTheme } from '../theme';
import { Text } from './primitives';
import { Icon } from '../icons';
import { Button } from './primitives';
import { createSheet } from '@/shared/ui/create-sheet';

export interface BannerProps {
  /** Banner title */
  title: string;
  /** Banner description */
  description?: string;
  /** Visual variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gradient';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Icon name (left side) */
  icon?: string;
  /** Background image */
  backgroundImage?: ImageSourcePropType;
  /** Primary action button text */
  actionText?: string;
  /** Primary action handler */
  onAction?: () => void;
  /** Secondary action text */
  secondaryActionText?: string;
  /** Secondary action handler */
  onSecondaryAction?: () => void;
  /** Close/dismiss handler */
  onDismiss?: () => void;
  /** Full width */
  fullWidth?: boolean;
  /** Custom styles */
  style?: StyleProp<ViewStyle>;
}

export const Banner: React.FC<BannerProps> = ({
  title,
  description,
  variant = 'default',
  size = 'md',
  icon,
  backgroundImage,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  onDismiss,
  fullWidth = true,
  style,
}) => {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary[500],
          textColor: '#FFFFFF',
          iconColor: '#FFFFFF',
          buttonVariant: 'secondary' as const,
        };
      case 'success':
        return {
          backgroundColor: theme.colors.success.DEFAULT,
          textColor: '#FFFFFF',
          iconColor: '#FFFFFF',
          buttonVariant: 'secondary' as const,
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.warning.DEFAULT,
          textColor: theme.colors.text.primary,
          iconColor: theme.colors.text.primary,
          buttonVariant: 'primary' as const,
        };
      case 'error':
        return {
          backgroundColor: theme.colors.error.DEFAULT,
          textColor: '#FFFFFF',
          iconColor: '#FFFFFF',
          buttonVariant: 'secondary' as const,
        };
      case 'info':
        return {
          backgroundColor: theme.colors.info.DEFAULT,
          textColor: '#FFFFFF',
          iconColor: '#FFFFFF',
          buttonVariant: 'secondary' as const,
        };
      case 'gradient':
        return {
          backgroundColor: `linear-gradient(135deg, ${theme.colors.primary[500]}, ${theme.colors.accent.purple})`,
          textColor: '#FFFFFF',
          iconColor: '#FFFFFF',
          buttonVariant: 'secondary' as const,
        };
      default:
        return {
          backgroundColor: theme.colors.background.secondary,
          textColor: theme.colors.text.primary,
          iconColor: theme.colors.primary[500],
          buttonVariant: 'primary' as const,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const sizeStyles = {
    sm: { padding: 12, iconSize: 20, titleSize: 'h4' as const, descSize: 'caption' as const },
    md: { padding: 16, iconSize: 24, titleSize: 'h3' as const, descSize: 'body' as const },
    lg: { padding: 20, iconSize: 32, titleSize: 'h2' as const, descSize: 'body' as const },
  };

  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.backgroundColor,
          padding: currentSize.padding,
          borderRadius: size === 'sm' ? 8 : size === 'md' ? 12 : 16,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {backgroundImage && (
        <Image
          source={backgroundImage}
          resizeMode="cover"
          style={[styles.backgroundImage, { borderRadius: size === 'sm' ? 8 : size === 'md' ? 12 : 16 }]}
        />
      )}

      <View style={styles.content}>
        {icon && (
          <View style={[
            styles.iconContainer,
            { marginRight: currentSize.padding },
          ]}>
            <Icon
              name={icon}
              size={currentSize.iconSize as number}
              color={variantStyles.iconColor}
            />
          </View>
        )}

        <View style={styles.textContainer}>
          <Text
            variant={currentSize.titleSize}
            style={{ color: variantStyles.textColor, fontWeight: '600' }}
          >
            {title}
          </Text>
          {description && (
            <Text
              variant={currentSize.descSize}
              style={{
                color: variantStyles.textColor,
                opacity: 0.9,
                marginTop: 4,
              }}
            >
              {description}
            </Text>
          )}

          {(actionText || secondaryActionText) && (
            <View style={styles.actions}>
              {actionText && onAction && (
                <Button
                  variant={variantStyles.buttonVariant}
                  size="sm"
                  onPress={onAction}
                  style={{ marginRight: secondaryActionText ? 8 : 0 }}

                accessibilityLabel="Action button"
                accessibilityRole="button"
                accessibilityHint="Activates this control">
                  {actionText}
                </Button>
              )}
              {secondaryActionText && onSecondaryAction && (
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={onSecondaryAction}

                accessibilityLabel="Action button"
                accessibilityRole="button"
                accessibilityHint="Activates this control">
                  {secondaryActionText}
                </Button>
              )}
            </View>
          )}
        </View>

        {onDismiss && (
          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [styles.dismissButton, pressed && { opacity: 0.7 }]}
            accessibilityLabel="Interactive control"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
            <Icon
              name="close"
              size={20}
              color={variantStyles.textColor}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = createSheet({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  fullWidth: {
    width: '100%',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    resizeMode: 'cover',
    opacity: 0.3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  },
  dismissButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default Banner;
