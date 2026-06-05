import React from 'react';
import { Pressable, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Text } from './Text';
import { useTheme } from '../../theme';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { getMinTouchTargetStyle } from '../../utils/touchTarget';
import { useHaptics } from '../../utils/haptics';
import { lightColors } from '@/theme/tokens/colors';
import { rgbaColors } from '@/theme/tokens/rgba-colors';
import { springPresets, timingPresets } from '../../theme/tokens/motion';

export interface VexLaunchButtonProps extends ViewProps {
  label: string;
  subLabel?: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  hapticOnPress?: boolean;
  accessibilityHint?: string;
  testID?: string;
}

export function VexLaunchButton({
  label,
  subLabel,
  onPress,
  disabled,
  isLoading,
  hapticOnPress = true,
  accessibilityHint,
  style,
  testID,
  ...rest
}: VexLaunchButtonProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const { primaryAction } = useHaptics();
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.06);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glow.value,
  }));

  const handlePressIn = () => {
    if (isReducedMotion) {
      return;
    }
    scale.value = withSpring(0.975, springPresets.tactile);
    glow.value = withTiming(0.2, {
      duration: timingPresets.microFade.duration,
    });
  };

  const handlePressOut = () => {
    if (isReducedMotion) {
      return;
    }
    scale.value = withSpring(1, springPresets.settle);
    glow.value = withTiming(0.08, {
      duration: timingPresets.enter.duration,
    });
  };

  const handlePress = () => {
    if (hapticOnPress && !isReducedMotion) {
      primaryAction();
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || isLoading}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint ?? subLabel ?? 'Starts the next VEX session'}
      accessibilityState={{ disabled: disabled || isLoading, busy: isLoading }}
      style={[getMinTouchTargetStyle(), style]}
      testID={testID}
      {...rest}
    >
      <Animated.View
        style={[
          {
            borderRadius: theme.borderRadius.xl,
            borderWidth: theme.spacing[0] + 1,
            borderColor: rgbaColors.rgb_255_255_255_0_18,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: lightColors.semantic.vexCyan,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: theme.spacing[6],
            width: '100%',
            overflow: 'hidden',
            opacity: disabled ? theme.opacity[50] : theme.opacity[100],
          },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={[
            lightColors.semantic.vexCyan,
            lightColors.semantic.secondary,
            lightColors.semantic.editorialGold,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            alignItems: 'center',
            gap: theme.spacing[1],
            justifyContent: 'center',
            paddingHorizontal: theme.spacing[5],
            paddingVertical: theme.spacing[4],
            width: '100%',
          }}
        >
          <Text variant="heading3" color="text.inverse">
            {isLoading ? 'Loading' : label}
          </Text>
          {subLabel ? (
            <Text variant="caption" color="text.inverse" opacity={theme.opacity[70]}>
              {subLabel}
            </Text>
          ) : null}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}
