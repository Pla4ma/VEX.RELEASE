import React from 'react';
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { buttonTap } from '../utils/haptics';
import { Text } from './primitives/Text';
import { Icon } from '../icons/components/Icon';
import { createSheet } from '@/shared/ui/create-sheet';
import {
  type BadgeProps,
  type SizeKey,
  sizeMap,
  getVariantStyles,
} from './badge-config';

export type { BadgeProps } from './badge-config';

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  onPress,
  onRemove,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();
  const sizeConfig = sizeMap[size as SizeKey];
  const variantStyles = getVariantStyles(variant, theme);

  const BadgeContent = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          paddingVertical: sizeConfig.paddingVertical,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          borderRadius: size === 'sm' ? 4 : size === 'md' ? 6 : 8,
        },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={sizeConfig.iconSize as number}
            color={variantStyles.textColor}
            style={styles.leftIcon}
          />
        )}
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
        {rightIcon && !onRemove && (
          <Icon
            name={rightIcon}
            size={sizeConfig.iconSize as number}
            color={variantStyles.textColor}
            style={styles.rightIcon}
          />
        )}
      </View>
      {onRemove && (
        <Pressable
          onPress={onRemove}
          style={styles.removeButton}
          accessibilityLabel={`Remove ${typeof children === 'string' ? children : 'badge'}`}
          accessibilityRole="button"
          accessibilityHint="Double tap to remove badge"
        >
          <Icon
            name="close"
            size={sizeConfig.iconSize as number}
            color={variantStyles.textColor}
          />
        </Pressable>
      )}
    </View>
  );

  if (onPress || onRemove) {
    return (
      <Pressable
        onPress={() => { buttonTap(); (onPress || onRemove)?.(); }}
        disabled={disabled}
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: variantStyles.backgroundColor,
            borderColor: variantStyles.borderColor,
            borderWidth: variant === 'outline' ? 1 : 0,
            paddingVertical: sizeConfig.paddingVertical,
            paddingHorizontal: sizeConfig.paddingHorizontal,
            borderRadius: size === 'sm' ? 4 : size === 'md' ? 6 : 8,
          },
          fullWidth && styles.fullWidth,
          style,
          pressed && { opacity: 0.8 },
        ]}
        accessibilityLabel={typeof children === 'string' ? children : 'Badge'}
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <View style={styles.content}>
          {leftIcon && (
            <Icon
              name={leftIcon}
              size={sizeConfig.iconSize as number}
              color={variantStyles.textColor}
              style={styles.leftIcon}
            />
          )}
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
          {rightIcon && !onRemove && (
            <Icon
              name={rightIcon}
              size={sizeConfig.iconSize as number}
              color={variantStyles.textColor}
              style={styles.rightIcon}
            />
          )}
        </View>
        {onRemove && (
          <Pressable
            onPress={onRemove}
            style={styles.removeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={`Remove ${typeof children === 'string' ? children : 'badge'}`}
            accessibilityRole="button"
            accessibilityHint="Double tap to remove badge"
          >
            <Icon
              name="close"
              size={sizeConfig.iconSize as number}
              color={variantStyles.textColor}
            />
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
  fullWidth: { alignSelf: 'stretch', justifyContent: 'center' },
  content: { flexDirection: 'row', alignItems: 'center' },
  leftIcon: { marginRight: 4 },
  text: { textAlign: 'center' as const },
  rightIcon: { marginLeft: 4 },
  removeButton: { marginLeft: 4, padding: 2 },
  disabled: { opacity: 0.5 },
});

export default Badge;
