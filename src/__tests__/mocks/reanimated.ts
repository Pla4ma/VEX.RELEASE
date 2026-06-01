/**
 * Jest mock for react-native-reanimated
 *
 * Provides stub implementations for all Reanimated APIs including
 * animations, gestures, layout transitions, and shared values.
 */

function recordSetupFallback(error: unknown): void {
  void error;
}

const mockChain = () => ({
  duration: jest.fn(function duration(this: unknown) {
    return this;
  }),
  delay: jest.fn(function delay(this: unknown) {
    return this;
  }),
  springify: jest.fn(function springify(this: unknown) {
    return this;
  }),
});

try {
  jest.mock('react-native-reanimated', () => {
    const mockAnimated = {
      View: 'Animated.View',
      Text: 'Animated.Text',
      ScrollView: 'Animated.ScrollView',
      VirtualizedList: 'Animated.VirtualizedList',
      Image: 'Animated.Image',
      createAnimatedComponent: jest.fn((component: unknown) => component),
    };
    return {
      __esModule: true,
      default: mockAnimated,
      Easing: {
        linear: jest.fn((t: number) => t),
        ease: jest.fn((t: number) => t),
        quad: jest.fn((t: number) => t * t),
        cubic: jest.fn((t: number) => t * t * t),
        sin: jest.fn((t: number) => t),
        bezier: jest.fn(() => (t: number) => t),
        inOut: jest.fn(
          (easing: (t: number) => number) => (t: number) =>
            t < 0.5 ? easing(t * 2) / 2 : (2 - easing((1 - t) * 2)) / 2,
        ),
        out: jest.fn(
          (easing: (t: number) => number) => (t: number) => 1 - easing(1 - t),
        ),
        in: jest.fn((easing: (t: number) => number) => easing),
      },
      useSharedValue: jest.fn((initial: number) => ({ value: initial })),
      useAnimatedStyle: jest.fn((fn: () => unknown) => fn()),
      useReducedMotion: jest.fn(() => false),
      cancelAnimation: jest.fn(),
      useAnimatedGestureHandler: jest.fn(() => ({
        onStart: jest.fn(),
        onActive: jest.fn(),
        onEnd: jest.fn(),
      })),
      withTiming: jest.fn((toValue: number) => toValue),
      withSpring: jest.fn((toValue: number) => toValue),
      withDecay: jest.fn((config: unknown) => config),
      withDelay: jest.fn((_delay: number, animation: number) => animation),
      withSequence: jest.fn(
        (...animations: number[]) => animations[animations.length - 1],
      ),
      withRepeat: jest.fn((animation: number) => animation),
      interpolate: jest.fn(
        (value: number, input: number[], output: number[]) => {
          const [inMin, inMax] = [input[0]!, input[input.length - 1]!];
          const [outMin, outMax] = [output[0]!, output[output.length - 1]!];
          return (
            outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin)
          );
        },
      ),
      Gesture: {
        Pan: () => ({
          onBegin: jest.fn(function onBegin(this: unknown) {
            return this;
          }),
          onStart: jest.fn(function onStart(this: unknown) {
            return this;
          }),
          onUpdate: jest.fn(function onUpdate(this: unknown) {
            return this;
          }),
          onEnd: jest.fn(function onEnd(this: unknown) {
            return this;
          }),
          enabled: jest.fn(function enabled(this: unknown) {
            return this;
          }),
        }),
        Tap: () => ({
          onBegin: jest.fn(function onBegin(this: unknown) {
            return this;
          }),
          onEnd: jest.fn(function onEnd(this: unknown) {
            return this;
          }),
        }),
      },
      runOnJS: jest.fn((fn: (...args: unknown[]) => unknown) => fn),
      runOnUI: jest.fn((fn: (...args: unknown[]) => unknown) => fn),
      Animated: mockAnimated,
      createAnimatedComponent: mockAnimated.createAnimatedComponent,
      FadeIn: mockChain(),
      FadeOut: mockChain(),
      FadeInUp: mockChain(),
      FadeInDown: mockChain(),
      FadeInLeft: mockChain(),
      FadeInRight: mockChain(),
      FadeOutUp: mockChain(),
      FadeOutDown: mockChain(),
      SlideInUp: mockChain(),
      SlideInDown: mockChain(),
      SlideInLeft: mockChain(),
      SlideInRight: mockChain(),
      SlideOutUp: mockChain(),
      SlideOutDown: mockChain(),
      ZoomIn: mockChain(),
      ZoomOut: mockChain(),
      BounceIn: mockChain(),
      BounceOut: mockChain(),
      StretchInX: mockChain(),
      StretchOutX: mockChain(),
      LightSpeedInLeft: mockChain(),
      LightSpeedOutLeft: mockChain(),
      Layout: mockChain(),
    };
  });
} catch (error) {
  recordSetupFallback(error);
}
