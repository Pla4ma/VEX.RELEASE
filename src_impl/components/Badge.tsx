/**
 * Badge Component
 *
 * Status badges, labels, and tags with multiple variants.
 * Part of the VEX Design System.
 */

import React from 'react';
import { View, StyleSheet, Pressable, StyleProp, ViewStyle, TextStyle } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './primitives';
import { Icon } from '../icons';
import { createSheet } from '@/shared/ui/create-sheet';
const sizeMap = {
  sm: { paddingVertical: 2, paddingHorizontal: 6, fontSize: 10, iconSize: 10 },
  md: { paddingVertical: 4, paddingHorizontal: 8, fontSize: 12, iconSize: 12 },
  lg: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 14, iconSize: 14 },
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'md', leftIcon, rightIcon, onPress, onRemove, disabled = false, fullWidth = false, style, textStyle }) => {
  const { theme } = useTheme();
  const sizeConfig = sizeMap[size];

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary[100],
          borderColor: theme.colors.primary[200],
          textColor: theme.colors.primary[700],
        };
      case 'success':
        return {
          backgroundColor: theme.colors.success.light + '30',
          borderColor: theme.colors.success.DEFAULT + '40',
          textColor: theme.colors.success.dark,
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.warning.light + '30',
          borderColor: theme.colors.warning.DEFAULT + '40',
          textColor: theme.colors.warning.dark,
        };
      case 'error':
        return {
          backgroundColor: theme.colors.error.light + '30',
          borderColor: theme.colors.error.DEFAULT + '40',
          textColor: theme.colors.error.dark,
        };
      case 'info':
        return {
          backgroundColor: theme.colors.info.light + '30',
          borderColor: theme.colors.info.DEFAULT + '40',
          textColor: theme.colors.info.dark,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.background.tertiary,
          borderColor: theme.colors.border.DEFAULT,
          textColor: theme.colors.text.secondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.colors.border.strong,
          textColor: theme.colors.text.primary,
        };
      default:
        return {
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.border.light,
          textColor: theme.colors.text.primary,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const BadgeContent = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          paddingVertical: sizeConfig.paddingVertical,
          paddingHorizontal: onRemove ? sizeConfig.paddingHorizontal : sizeConfig.paddingHorizontal,
          borderRadius: size === 'sm' ? 4 : size === 'md' ? 6 : 8,
        },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {leftIcon && <Icon name={leftIcon} size={sizeConfig.iconSize as number} color={variantStyles.textColor} style={styles.leftIcon} />}
        <Text
          variant="caption"
          style={[
            styles.text,
            {
              fontSize: sizeConfig.fontSize,
              color: variantStyles.textColor,
              fontWeight: '600',
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
        {rightIcon && !onRemove && <Icon name={rightIcon} size={sizeConfig.iconSize as number} color={variantStyles.textColor} style={styles.rightIcon} />}
      </View>
      {onRemove && (
        <Pressable onPress={onRemove} style={styles.removeButton} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
          <Icon name="close" size={sizeConfig.iconSize as number} color={variantStyles.textColor} />
        </Pressable>
      )}
    </View>
  );

  if (onPress || onRemove) {
    return (
      <Pressable
        onPress={onPress || onRemove}
        disabled={disabled}
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: variantStyles.backgroundColor,
            borderColor: variantStyles.borderColor,
            borderWidth: variant === 'outline' ? 1 : 0,
            paddingVertical: sizeConfig.paddingVertical,
            paddingHorizontal: onRemove ? sizeConfig.paddingHorizontal : sizeConfig.paddingHorizontal,
            borderRadius: size === 'sm' ? 4 : size === 'md' ? 6 : 8,
          },
          fullWidth && styles.fullWidth,
          style,
          pressed && { opacity: 0.8 },
        ]}
        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control"
      >
        <View style={styles.content}>
          {leftIcon && <Icon name={leftIcon} size={sizeConfig.iconSize as number} color={variantStyles.textColor} style={styles.leftIcon} />}
          <Text
            variant="caption"
            style={[
              styles.text,
              {
                fontSize: sizeConfig.fontSize,
                color: variantStyles.textColor,
                fontWeight: '600',
              },
              textStyle,
            ]}
          >
            {children}
          </Text>
          {rightIcon && !onRemove && <Icon name={rightIcon} size={sizeConfig.iconSize as number} color={variantStyles.textColor} style={styles.rightIcon} />}
        </View>
        {onRemove && (
          <Pressable onPress={onRemove} style={styles.removeButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
            <Icon name="close" size={sizeConfig.iconSize as number} color={variantStyles.textColor} />
          </Pressable>
        )}
      </Pressable>
    );
  }

  return BadgeContent;
};

const styles = createSheet({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIcon: {
    marginRight: 4,
  },
  text: {
    textAlign: 'center' as const,
  },
  rightIcon: {
    marginLeft: 4,
  },
  removeButton: {
    marginLeft: 4,
    padding: 2,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Badge;

export * from "./Badge.types";
