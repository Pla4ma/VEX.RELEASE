import React from 'react';
import { act, render } from '@testing-library/react-native';

import { triggerHaptic } from '../../../../utils/haptics';
import { SessionGradeCard } from '../SessionGradeCard';

jest.mock('../../../../utils/haptics', () => ({
  triggerHaptic: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../../../components/primitives', () => {
  const ReactActual = jest.requireActual('react') as typeof import('react');
  const ReactNative = jest.requireActual('react-native') as typeof import('react-native');

  return {
    Box: ({ children }: { children?: React.ReactNode }) =>
      ReactActual.createElement(ReactNative.View, null, children),
    Text: ({ children }: { children?: React.ReactNode }) =>
      ReactActual.createElement(ReactNative.Text, null, children),
  };
});

jest.mock('react-native-svg', () => {
  const ReactActual = jest.requireActual('react') as typeof import('react');
  const ReactNative = jest.requireActual('react-native') as typeof import('react-native');
  const SvgComponent = ({ children }: { children?: React.ReactNode }) =>
    ReactActual.createElement(ReactNative.View, null, children);

  return {
    __esModule: true,
    default: SvgComponent,
    Circle: SvgComponent,
    Defs: SvgComponent,
    LinearGradient: SvgComponent,
    Stop: SvgComponent,
  };
});

jest.mock('react-native-reanimated', () => {
  const View = 'Animated.View';
  const chainable = {
    damping: jest.fn(function chain(this: unknown) {
      return this;
    }),
    delay: jest.fn(function chain(this: unknown) {
      return this;
    }),
    duration: jest.fn(function chain(this: unknown) {
      return this;
    }),
    springify: jest.fn(function chain(this: unknown) {
      return this;
    }),
    stiffness: jest.fn(function chain(this: unknown) {
      return this;
    }),
  };

  return {
    __esModule: true,
    default: { View, createAnimatedComponent: jest.fn((component: unknown) => component) },
    Easing: { cubic: jest.fn(), out: jest.fn(() => jest.fn()) },
    FadeIn: chainable,
    FadeInDown: chainable,
    FadeInUp: chainable,
    useAnimatedProps: jest.fn((callback: () => unknown) => callback()),
    useSharedValue: jest.fn((initial: number) => ({ value: initial })),
    withSequence: jest.fn((...values: number[]) => values[values.length - 1]),
    withTiming: jest.fn((value: number) => value),
  };
});

describe('SessionGradeCard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('uses the shared haptic wrapper for grade reveal feedback', () => {
    render(
      <SessionGradeCard
        durationLabel="25:00 focused"
        gradeColor="white"
        gradeLabel="Clean focus"
        gradeLetter="A"
        purityColor="white"
        purityLabel="Strong"
        purityScore={92}
        width={360}
        xpEarned={120}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(triggerHaptic).toHaveBeenCalledWith('impactMedium');
  });
});
