import { Easing } from "react-native-reanimated";
type InterpolatedValue = string | number;
type AnimatedProgress = {
  interpolate: (config: {
    inputRange: number[];
    outputRange: InterpolatedValue[];
  }) => unknown;
};
type TransitionParams = {
  current: { progress: AnimatedProgress };
  next?: { progress: AnimatedProgress };
  inverted: unknown;
  layouts: { screen: { width: number; height: number } };
};
type StackCardStyleInterpolator = (props: TransitionParams) => {
  cardStyle: { opacity?: unknown; transform?: Array<Record<string, unknown>> };
};
export const slideFromRight: StackCardStyleInterpolator = ({
  current,
  next,
  layouts: { screen },
}: TransitionParams) => {
  const translateX = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [screen.width, 0],
  });
  const progress = next?.progress ?? current.progress;
  const opacity = progress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, 0.8, 0],
  });
  return { cardStyle: { transform: [{ translateX }], opacity } };
};
export const slideFromBottom: StackCardStyleInterpolator = ({
  current,
  layouts: { screen },
}: Omit<TransitionParams, "next" | "inverted">) => {
  const translateY = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [screen.height, 0],
  });
  return { cardStyle: { transform: [{ translateY }] } };
};
export const fadeTransition: StackCardStyleInterpolator = ({
  current,
}: Pick<TransitionParams, "current">) => {
  const opacity = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  return { cardStyle: { opacity } };
};
export const scaleTransition: StackCardStyleInterpolator = ({
  current,
}: Pick<TransitionParams, "current">) => {
  const scale = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });
  const opacity = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  return { cardStyle: { transform: [{ scale }], opacity } };
};
export const sharedElementTransition: StackCardStyleInterpolator = ({
  current,
}: Pick<TransitionParams, "current">) => {
  return { cardStyle: { opacity: current.progress } };
};
export const transitionPresets = {
  slideFromRight: {
    gestureDirection: "horizontal",
    transitionSpec: {
      open: {
        animation: "timing",
        config: { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
      },
      close: {
        animation: "timing",
        config: { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
      },
    },
    cardStyleInterpolator: slideFromRight,
  },
  slideFromBottom: {
    gestureDirection: "vertical",
    transitionSpec: {
      open: {
        animation: "timing",
        config: { duration: 400, easing: Easing.out(Easing.cubic) },
      },
      close: {
        animation: "timing",
        config: { duration: 300, easing: Easing.in(Easing.cubic) },
      },
    },
    cardStyleInterpolator: slideFromBottom,
  },
  fade: {
    gestureDirection: "horizontal",
    transitionSpec: {
      open: {
        animation: "timing",
        config: { duration: 200, easing: Easing.linear },
      },
      close: {
        animation: "timing",
        config: { duration: 200, easing: Easing.linear },
      },
    },
    cardStyleInterpolator: fadeTransition,
  },
  scale: {
    gestureDirection: "horizontal",
    transitionSpec: {
      open: {
        animation: "spring",
        config: { stiffness: 1000, damping: 50, mass: 1 },
      },
      close: {
        animation: "timing",
        config: { duration: 200, easing: Easing.linear },
      },
    },
    cardStyleInterpolator: scaleTransition,
  },
};
