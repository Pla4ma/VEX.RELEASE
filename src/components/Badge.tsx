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
  type SizeConfig,
  sizeMap,
  getVariantStyles,
} from './badge-config';
import { getAccessibilityLabel } from './badge-helpers';

export type { BadgeProps } from './badge-config';

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

interface BadgeContentProps {
  children: React.ReactNode;
  variantStyles: ReturnType<typeof getVariantStyles>;
  sizeConfig: SizeConfig;
  leftIcon?: string;
  rightIcon?: string;
  onRemove?: () => void;
  removeAccessibilityLabel?: string;
  disabled?: boolean;
}

function BadgeContent({
  children,
  variantStyles,
  sizeConfig,
  leftIcon,
  rightIcon,
  onRemove,
  removeAccessibilityLabel,
  disabled,
}: BadgeContentProps) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: variantStyles.borderWidth ?? 0,
          paddingVertical: sizeConfig.paddingVertical,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          borderRadius: sizeConfig.borderRadius ?? 6,
        },
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.content}>
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={sizeConfig.iconSize}
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
          ]}
        >
          {children}
        </Text>
        {rightIcon && !onRemove && (
          <Icon
            name={rightIcon}
            size={sizeConfig.iconSize}
            color={variantStyles.textColor}
            style={styles.rightIcon}
          />
        )}
      </View>
      {onRemove && (
        <Pressable
          onPress={onRemove}
          style={styles.removeButton}
          accessibilityLabel={removeAccessibilityLabel}
          accessibilityRole="button"
          accessibilityHint="Double tap to remove badge"
        >
          <Icon
            name="close"
            size={sizeConfig.iconSize}
            color={variantStyles.textColor}
          />
        </Pressable>
      )}
    </View>
  );
}

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

  const accessibilityLabel = getAccessibilityLabel(children, 'Badge');
  const removeAccessibilityLabel = `Remove ${getAccessibilityLabel(children, 'badge')}`;

  const content = (
    <BadgeContent
      variantStyles={variantStyles}
      sizeConfig={sizeConfig}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      onRemove={onRemove}
      removeAccessibilityLabel={removeAccessibilityLabel}
      disabled={disabled}
    >
      {children}
    </BadgeContent>
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
            borderWidth: variantStyles.borderWidth ?? 0,
            paddingVertical: sizeConfig.paddingVertical,
            paddingHorizontal: sizeConfig.paddingHorizontal,
            borderRadius: sizeConfig.borderRadius ?? 6,
          },
          fullWidth && styles.fullWidth,
          style,
          pressed && { opacity: 0.8 },
        ]}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <BadgeContent
          variantStyles={variantStyles}
          sizeConfig={sizeConfig}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          onRemove={onRemove}
          removeAccessibilityLabel={removeAccessibilityLabel}
          disabled={disabled}
        >
          {children}
        </BadgeContent>
      </Pressable>
    );
  }
  return content;
};

export default Badge;
