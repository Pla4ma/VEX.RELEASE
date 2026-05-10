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

/**
 * Slide from right transition (iOS default)
 */
<<<<<<< HEAD
export const slideFromRight: StackCardStyleInterpolator = ({ current, next, inverted: _inverted, layouts: { screen } }: TransitionParams) => {
=======
export const slideFromRight: StackCardStyleInterpolator = ({ current, next, layouts: { screen } }: TransitionParams) => {
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
  const translateX = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [screen.width, 0],
  });

  const progress = next?.progress ?? current.progress;
  const opacity = progress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, 0.8, 0],
  });

  return {
    cardStyle: {
      transform: [{ translateX }],
      opacity,
    },
  };
};

/**
 * Slide from bottom transition (modal style)
 */
export const slideFromBottom: StackCardStyleInterpolator = ({ current, layouts: { screen } }: Omit<TransitionParams, 'next' | 'inverted'>) => {
  const translateY = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [screen.height, 0],
  });

  return {
    cardStyle: {
      transform: [{ translateY }],
    },
  };
};

/**
 * Fade transition
 */
export const fadeTransition: StackCardStyleInterpolator = ({ current }: Pick<TransitionParams, 'current'>) => {
  const opacity = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return {
    cardStyle: {
      opacity,
    },
  };
};

/**
 * Scale transition
 */
export const scaleTransition: StackCardStyleInterpolator = ({ current }: Pick<TransitionParams, 'current'>) => {
  const scale = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const opacity = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return {
    cardStyle: {
      transform: [{ scale }],
      opacity,
    },
  };
};

/**
 * Shared element transition placeholder
 */
export const sharedElementTransition: StackCardStyleInterpolator = ({ current }: Pick<TransitionParams, 'current'>) => {
  // This is a placeholder - actual implementation requires
  // react-navigation-shared-element library
  return {
    cardStyle: {
      opacity: current.progress,
    },
  };
};

/**
 * Transition presets
 */
export const transitionPresets = {
  slideFromRight: {
    gestureDirection: 'horizontal',
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration: 300,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: 300,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        },
      },
    },
    cardStyleInterpolator: slideFromRight,
  },

  slideFromBottom: {
    gestureDirection: 'vertical',
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: 300,
          easing: Easing.in(Easing.cubic),
        },
      },
    },
    cardStyleInterpolator: slideFromBottom,
  },

  fade: {
    gestureDirection: 'horizontal',
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration: 200,
          easing: Easing.linear,
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: 200,
          easing: Easing.linear,
        },
      },
    },
    cardStyleInterpolator: fadeTransition,
  },

  scale: {
    gestureDirection: 'horizontal',
    transitionSpec: {
      open: {
        animation: 'spring',
        config: {
          stiffness: 1000,
          damping: 50,
          mass: 1,
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: 200,
          easing: Easing.linear,
        },
      },
    },
    cardStyleInterpolator: scaleTransition,
  },
};
