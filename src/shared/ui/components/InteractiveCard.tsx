import React, { useCallback, useState } from 'react';
import { View, AccessibilityProps, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useReducedMotion,
  withSpring,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { useTheme } from '../../../theme';
import type { InteractiveCardProps} from './InteractiveCardTypes';
import { cardStyles as styles } from './InteractiveCardStyles';
import { sizeStyles, getThemeVariantStyles } from './InteractiveCardTypes';
import {
  LoadingOverlay,
  DisabledOverlay,
  ErrorOverlay,
  SelectedOverlay,
} from './InteractiveCardOverlays';

export type { InteractiveCardProps } from './InteractiveCardTypes';
export { CardSkeleton } from './CardSkeleton';

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
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
  fullWidth = false,
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
  const isDisabled =
    propDisabled || state === 'disabled' || state === 'loading';
  const isError = state === 'error';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = useCallback(async () => {
    if (isDisabled || !onPress) {return;}
    if (hapticOnPress) {
      // haptics handled externally
    }
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

  const accessibilityState: AccessibilityProps['accessibilityState'] = {
    disabled: isDisabled,
    selected,
    busy: state === 'loading',
  };

  return (
    <Animated.View style={[animatedStyle, fullWidth && styles.fullWidth]}>
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
            styles.card,
            getThemeVariantStyles(theme)[variant],
            sizeStyles[size],
            selected && [
              styles.selected,
              { borderColor: theme.colors.primary[500] },
            ],
            isError && [
              styles.error,
              { borderColor: theme.colors.error.DEFAULT },
            ],
            aspectRatio !== undefined ? { aspectRatio } : undefined,
            style,
          ]}
        >
          {badge !== undefined && (
            <View
              style={[
                styles.badge,
                { backgroundColor: badgeColor || theme.colors.primary[500] },
              ]}
            >
              <Text
                variant="caption"
                color="text.inverse"
                style={styles.badgeText}
              >
                {typeof badge === 'number' && badge > 99 ? '99+' : badge}
              </Text>
            </View>
          )}
          {icon && (
            <View style={styles.iconContainer}>
              <Icon
                name={icon}
                size="lg"
                color={theme.colors.primary[500]}
              />
            </View>
          )}
          <View style={styles.content}>{children}</View>
          {state === 'loading' && (
            <LoadingOverlay message={loadingMessage} theme={theme} />
          )}
          {state === 'disabled' && (
            <DisabledOverlay reason={disabledReason} theme={theme} />
          )}
          {state === 'error' && (
            <ErrorOverlay
              message={errorMessage}
              onRetry={onRetry}
              theme={theme}
            />
          )}
          {selected && (
            <SelectedOverlay icon={selectionIcon} theme={theme} />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};
export default InteractiveCard;
