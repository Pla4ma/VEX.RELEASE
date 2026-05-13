/**
 * Screen Transitions
 *
 * Predefined transition configurations for React Navigation.
 */

import { Easing } from 'react-native-reanimated';

type InterpolatedValue = string | number;
type AnimatedProgress = {
  interpolate: (config: { inputRange: number[]; outputRange: InterpolatedValue[] }) => unknown;
};

type TransitionParams = {
  current: { progress: AnimatedProgress };
  next?: { progress: AnimatedProgress };
  inverted: unknown;
  layouts: { screen: { width: number; height: number } };
};

type StackCardStyleInterpolator = (props: TransitionParams) => {
  cardStyle: {
    opacity?: unknown;
    transform?: Array<Record<string, unknown>>;
  };
};
export * from "./transitions.types";
export * from "./transitions.part1";
