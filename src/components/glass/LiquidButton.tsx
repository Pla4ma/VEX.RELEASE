import React, { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { springPresets } from '../../theme/tokens/motion';
import { buttonTap, triggerHaptic } from '../../utils/haptics';
import { Text } from '../primitives/Text';
import {
  LIQUID_SIZE,
  resolveLiquidVariant,
  type LiquidButtonSize,
  type LiquidButtonVariant,
} from './LiquidButton.tokens';

export type { LiquidButtonSize, LiquidButtonVariant };

interface LiquidButtonProps {
  label: string;
  onPress: () => void;
  subLabel?: string;
  variant?: LiquidButtonVariant;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  disabled?: boolean;
  size?: LiquidButtonSize;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export function LiquidButton({
  label,
  onPress,
  subLabel,
  variant = 'primary',
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled = false,
  size = 'md',
  accessibilityLabel,
  accessibilityHint,
  testID,
}: LiquidButtonProps): JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = (): void => {
    if (!isReducedMotion) {
      scale.value = withSpring(0.97, springPresets.tactile);
    }
    buttonTap();
  };

  const onPressOut = (): void => {
    if (!isReducedMotion) {
      scale.value = withSpring(1, springPresets.settle);
    }
  };

  const onActualPress = (): void => {
    if (!disabled) {
      triggerHaptic('impactLight');
      onPress();
    }
  };

  const s = LIQUID_SIZE[size];
  const v = resolveLiquidVariant(variant, false);
  const isPrimary = variant === 'primary';

  return (
    <Animated.View
      style={[
        { borderRadius: 999, width: fullWidth ? '100%' : undefined },
        animatedStyle,
      ]}
    >
      <Pressable
        accessibilityHint={accessibilityHint ?? `Activates ${label}`}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onActualPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        testID={testID}
        style={({ pressed: isPressed }) => {
          const liveV = resolveLiquidVariant(variant, isPressed);
          return [{
            alignItems: 'center',
            alignSelf: fullWidth ? 'stretch' : 'flex-start',
            backgroundColor: liveV.background ?? 'transparent',
            borderColor: liveV.borderColor ?? 'transparent',
            borderRadius: 999,
            borderWidth: liveV.borderColor ? 1 : 0,
            elevation: isPrimary ? 5 : 2,
            flexDirection: 'row',
            gap: 8,
            justifyContent: 'center',
            minHeight: s.minHeight,
            opacity: disabled ? 0.55 : 1,
            overflow: 'hidden',
            paddingHorizontal: s.paddingH,
            paddingVertical: s.paddingV,
            shadowColor: liveV.shadowColor,
            shadowOffset: { width: 0, height: isPrimary ? 7 : 3 },
            shadowOpacity: isPrimary ? 0.22 : 0.10,
            shadowRadius: isPrimary ? 8 : 5,
          }];
        }}
      >
        <LinearGradient
          colors={v.gradientColors as readonly [string, string, ...string[]]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={{
            alignItems: 'center',
            bottom: 0,
            flexDirection: 'row',
            gap: 8,
            justifyContent: 'center',
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        />
        <LinearGradient
          colors={[v.highlightColor, 'rgba(255, 255, 255, 0)']}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.7]}
          start={{ x: 0, y: 0 }}
          style={{
            borderTopLeftRadius: 999,
            borderTopRightRadius: 999,
            height: '55%',
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        />
        {isPrimary ? (
          <View
            pointerEvents="none"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              borderRadius: 999,
              height: 1,
              left: 18,
              position: 'absolute',
              right: 18,
              top: 2,
            }}
          />
        ) : null}
        {leftIcon}
        <Text
          style={{
            color: v.textColor,
            fontSize: s.fontSize,
            fontWeight: '700',
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
        {subLabel ? (
          <Text
            style={{
              color: v.textColor,
              fontSize: 11,
              opacity: 0.78,
            }}
          >
            {subLabel}
          </Text>
        ) : null}
        {rightIcon}
      </Pressable>
    </Animated.View>
  );
}

export default LiquidButton;
