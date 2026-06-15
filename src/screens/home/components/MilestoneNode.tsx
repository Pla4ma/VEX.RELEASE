import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '../../../icons';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { borderRadius } from '../../../theme/tokens';

export type MilestoneState = 'unlocked' | 'current' | 'locked';

export function MilestoneNode({ state }: { state: MilestoneState }): React.ReactNode {
  const { isReducedMotion } = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (state !== 'current' || isReducedMotion) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withTiming(1.18, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => {
      pulse.value = 1;
    };
  }, [state, isReducedMotion, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const backgroundColor =
    state === 'unlocked'
      ? vexLightGlass.mint[700]
      : state === 'current'
        ? vexLightGlass.semantic.fire
        : vexLightGlass.glass.borderSubtle;
  const iconColor =
    state === 'locked'
      ? vexLightGlass.text.disabled
      : vexLightGlass.text.inverse;

  return (
    <Animated.View
      style={[
        {
          alignItems: 'center',
          backgroundColor,
          borderRadius: borderRadius.full,
          height: 28,
          justifyContent: 'center',
          boxShadow: '0px 0px state === 'current' ? 12 : 7px backgroundColor / state === 'current' ? 0.5 : 0.28',
          width: 28,
        },
        animatedStyle,
      ]}
    >
      <Icon
        color={iconColor}
        name={state === 'unlocked' ? 'check' : 'lock'}
        size="xs"
      />
    </Animated.View>
  );
}
