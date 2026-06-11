/**
 * StepTransition — wrapper for onboarding steps with subtle fade entrance.
 */
import React from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import { View, type ViewStyle } from 'react-native';

type StepTransitionProps = {
  /** Stable key per step (drives remount). */
  stepKey: string | number;
  children: React.ReactNode;
  /** Optional override for delay (ms). */
  delayMs?: number;
  style?: ViewStyle;
};

export function StepTransition({
  stepKey,
  children,
  delayMs: _delayMs = 0,
  style,
}: StepTransitionProps): React.JSX.Element {
  return (
    <View style={[style, { flex: 1 }]}>
      <Animated.View
        key={stepKey}
        entering={FadeIn.duration(300).delay(_delayMs)}
        style={{ flex: 1 }}
      >
        {children}
      </Animated.View>
    </View>
  );
}
