import React, { useCallback, useState } from 'react';
import { View, Pressable, AccessibilityProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useReducedMotion,
  withSpring,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { useTheme } from '../../../theme/ThemeContext';
import type { InteractiveCardProps, CardVariant, CardSize } from './InteractiveCardTypes';
import {
  fullWidth as fullWidthStyle,
  card,
  selected,
  errorCard as error,
  badge as badgeStyle,
  badgeText,
  iconContainer,
  contentStyle as content,
} from './InteractiveCard.styles';
import {
  LoadingOverlay,
  DisabledOverlay,
  ErrorOverlay,
  SelectedOverlay,
} from './InteractiveCardOverlays';

export type { InteractiveCardProps } from './InteractiveCardTypes';

const variantStyleMap: Record<CardVariant, { backgroundColor: string; borderWidth: number; borderColor?: string }> = {
  default: { backgroundColor: 'transparent', borderWidth: 0 },
  elevated: { backgroundColor: 'transparent', borderWidth: 0 },
  outlined: { backgroundColor: 'transparent', borderWidth: 1 },
  ghost: { backgroundColor: 'transparent', borderWidth: 0 },
};

const sizeStyleMap: Record<CardSize, { padding: number; borderRadius: number }> = {
  sm: { padding: 12, borderRadius: 12 },
  md: { padding: 16, borderRadius: 16 },
  lg: { padding: 20, borderRadius: 20 },
};

export const InteractiveCard: React.ComponentType<InteractiveCardProps> = ({
  children,
  onPress,
  onLongPress,
  variant = 'default',
  size = 'md',
  style,
  state = 'default',
  loadingMessage,
  disabledReason,
  errorMessage,
  onRetry,
  icon,
  badge,
  badgeColor,
  selected = false,
  selectionIcon,
  accessibilityLabel,
  accessibilityHint,
  hapticOnPress = true,
  scaleOnPress = 0.98,
  fullWidth: isFullWidth = false,
  aspectRatio,
  disabled: propDisabled,
  ...pressableProps
}) => {
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const [, setIsPressed] = useState(false);
  const [, setIsLoading] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const isDisabled = propDisabled || state === 'disabled' || state === 'loading';
  const isError = state === 'error';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = useCallback(async () => {
    if (isDisabled || !onPress) {return;}
    void hapticOnPress;
    setIsLoading(true);
    try {
      await onPress();
    } finally {
      setIsLoading(false);
    }
  }, [onPress, isDisabled, hapticOnPress]);

  const handlePressIn = useCallback(() => {
    if (!isDisabled && scaleOnPress) {
      scale.value = reducedMotion ? scaleOnPress : withSpring(scaleOnPress, { damping: 15, stiffness: 300 });
      setIsPressed(true);
    }
  }, [isDisabled, scaleOnPress, scale, reducedMotion]);

  const handlePressOut = useCallback(() => {
    scale.value = reducedMotion ? 1 : withSpring(1, { damping: 15, stiffness: 300 });
    setIsPressed(false);
  }, [scale, reducedMotion]);

  const vStyle = variantStyleMap[variant];
  const sStyle = sizeStyleMap[size];

  const accessibilityState: AccessibilityProps['accessibilityState'] = {
    disabled: isDisabled,
    selected,
    busy: state === 'loading',
  };

  return (
    <Animated.View style={[animatedStyle, isFullWidth && fullWidthStyle]}>
      <Pressable
        onPress={handlePress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={accessibilityState}
        {...pressableProps}
      >
        <View
          style={[
            card,
            {
              backgroundColor: vStyle.backgroundColor,
              borderWidth: vStyle.borderWidth,
              borderColor: vStyle.borderColor,
              padding: sStyle.padding,
              borderRadius: sStyle.borderRadius,
            },
            selected && [{ borderColor: theme.colors.primary[500] }],
            isError && [{ borderColor: theme.colors.error.DEFAULT }],
            aspectRatio !== undefined ? { aspectRatio } : undefined,
            style,
          ]}
        >
          {badge !== undefined && (
            <View
              style={[
                badgeStyle,
                { backgroundColor: badgeColor || theme.colors.primary[500] },
              ]}
            >
              <Text variant="caption" color="text.inverse" style={badgeText}>
                {typeof badge === 'number' && badge > 99 ? '99+' : badge}
              </Text>
            </View>
          )}
          {icon && (
            <View style={iconContainer}>
              <Icon name={icon} size="lg" color={theme.colors.primary[500]} />
            </View>
          )}
          <View style={content}>{children}</View>
          {state === 'loading' && <LoadingOverlay message={loadingMessage} theme={theme} />}
          {state === 'disabled' && <DisabledOverlay reason={disabledReason} theme={theme} />}
          {state === 'error' && <ErrorOverlay message={errorMessage} onRetry={onRetry} theme={theme} />}
          {selected && <SelectedOverlay icon={selectionIcon} theme={theme} />}
        </View>
      </Pressable>
    </Animated.View>
  );
};
