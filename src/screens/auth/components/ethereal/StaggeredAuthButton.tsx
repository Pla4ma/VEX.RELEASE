/**
 * StaggeredAuthButton — internal button primitive used by
 * EtherealAuthButtons. Handles the staggered entrance, shimmer
 * sweep, and tap ripple. Lives in its own file to keep
 * EtherealAuthButtons under the 200 LOC line limit.
 */
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../../../components/primitives/Text';
import { timingPresets } from '@/theme/tokens/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ShimmerSweep } from './ShimmerSweep';
import { TapRipple } from './TapRipple';

export type StaggeredButtonSpec = {
  provider: 'apple' | 'google' | 'email';
  label: string;
  fill: string;
  textColor: string;
  borderColor?: string;
  glyph: React.ReactNode;
  accessibilityHint: string;
  useShimmer: boolean;
  useRipple: boolean;
  rippleColor?: string;
};

type StaggeredAuthButtonProps = {
  spec: StaggeredButtonSpec;
  onPress: () => void;
  disabled: boolean;
  delay: number;
};

function AuthButtonContent({ spec }: { spec: StaggeredButtonSpec }): React.JSX.Element {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 24,
      }}
    >
      {spec.glyph}
      <Text
        fontSize={16}
        fontWeight="700"
        color={spec.textColor}
        style={{ color: spec.textColor }}
      >
        {spec.label}
      </Text>
    </View>
  );
}

export function StaggeredAuthButton({
  spec,
  onPress,
  disabled,
  delay,
}: StaggeredAuthButtonProps): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const progress = useSharedValue(isReducedMotion ? 1 : 0);

  useEffect(() => {
    if (isReducedMotion) {return;}
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration: timingPresets.enter.duration,
        easing: Easing.bezier(...timingPresets.enter.easing),
      }),
    );
  }, [progress, delay, isReducedMotion]);

  const enterStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 12 }],
  }));

  const content = <AuthButtonContent spec={spec} />;

  return (
    <Animated.View style={enterStyle}>
      {spec.useShimmer ? (
        <ShimmerSweep
          accessibilityHint={spec.accessibilityHint}
          accessibilityLabel={spec.label}
          backgroundColor={spec.fill}
          borderColor={spec.borderColor}
          borderWidth={spec.borderColor ? 1 : 0}
          disabled={disabled}
          height={56}
          onPress={onPress}
        >
          {content}
        </ShimmerSweep>
      ) : (
        <TapRipple
          accessibilityHint={spec.accessibilityHint}
          accessibilityLabel={spec.label}
          backgroundColor={spec.fill}
          disabled={disabled}
          height={56}
          onPress={onPress}
          rippleColor={spec.rippleColor ?? 'rgba(255, 255, 255, 0.55)'}
        >
          {content}
        </TapRipple>
      )}
    </Animated.View>
  );
}
