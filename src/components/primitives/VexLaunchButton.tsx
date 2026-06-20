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
import { useTheme } from '../../theme/ThemeContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { getMinTouchTargetStyle } from '../../utils/touchTarget';
import { useHaptics } from '../../utils/haptics';
import { springPresets, timingPresets } from '../../theme/tokens/motion';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

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

const MINT_PRESS = [vexLightGlass.mint[600], vexLightGlass.mint[500], vexLightGlass.mint[400]] as const;
const MINT_REST = [vexLightGlass.mint[500], vexLightGlass.mint[400], vexLightGlass.mint[300]] as const;

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
}: VexLaunchButtonProps): React.ReactNode {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const { primaryAction } = useHaptics();
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.18);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glow.value,
  }));

  const handlePressIn = (): void => {
    if (isReducedMotion) {
      return;
    }
    scale.value = withSpring(0.975, springPresets.tactile);
    glow.value = withTiming(0.35, {
      duration: timingPresets.microFade.duration,
    });
  };

  const handlePressOut = (): void => {
    if (isReducedMotion) {
      return;
    }
    scale.value = withSpring(1, springPresets.settle);
    glow.value = withTiming(0.22, {
      duration: timingPresets.enter.duration,
    });
  };

  const handlePress = (): void => {
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
            borderRadius: 999,
            borderWidth: 1.2,
            borderColor: 'rgba(255, 255, 255, 0.55)',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0px 12px 20px ${vexLightGlass.mint[700]}`,
            width: '100%',
            overflow: 'hidden',
            opacity: disabled ? 0.5 : 1,
          },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={[...MINT_REST]}
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
          <Animated.View
            pointerEvents="none"
            style={[
              {
                backgroundColor: 'rgba(255, 255, 255, 0.45)',
                borderRadius: 999,
                height: 10,
                left: 20,
                position: 'absolute',
                right: 20,
                top: 4,
              },
            ]}
          />
          <Text style={{ color: vexLightGlass.text.inverse, fontSize: 16, fontWeight: '800', letterSpacing: 0.3 }}>
            {isLoading ? 'Loading' : label}
          </Text>
          {subLabel ? (
            <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 12, fontWeight: '600' }}>
              {subLabel}
            </Text>
          ) : null}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

void MINT_PRESS;
