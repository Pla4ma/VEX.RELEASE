/**
 * StepTransition — wrapper for onboarding steps. Static (motion stripped).
 */
import React from 'react';
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
  stepKey: _stepKey,
  children,
  delayMs: _delayMs = 0,
  style,
}: StepTransitionProps): React.JSX.Element {
  return (
    <View style={[style, { flex: 1 }]}>
      {children}
    </View>
  );
}
