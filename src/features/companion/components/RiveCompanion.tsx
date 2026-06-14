import React, { Suspense, lazy } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { PngMascotRenderer } from '../../../screens/onboarding/components/ethereal/PngMascotRenderer';
import type { MascotMood } from '../../../screens/onboarding/components/ethereal/VexMascotGuide.tokens';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import type { CompanionState } from '../types';
const HAS_RIVE_MASCOT =
  Platform.OS !== 'web' &&
  Constants.appOwnership !== 'expo';

const LazyRiveMascotRenderer = lazy(async () => {
  const module = await import('../../../screens/onboarding/components/ethereal/RiveMascotRenderer');
  return { default: module.RiveMascotRenderer };
});

function moodToMascotMood(mood: CompanionState['currentMood']): MascotMood {
  const map: Record<CompanionState['currentMood'], MascotMood> = {
    SLEEPY: 'default',
    CONTENT: 'wave',
    FOCUSED: 'listening',
    DETERMINED: 'pointing',
    ECSTATIC: 'celebrate',
    STRUGGLING: 'thinking',
    DANGER: 'recovery',
  };
  return map[mood] ?? 'default';
}

interface RiveCompanionProps {
  companionState: CompanionState;
  size?: number;
  isSpeaking?: boolean;
  isThinking?: boolean;
  onReady?: () => void;
}

export function RiveCompanion({
  companionState,
  size = 120,
  isSpeaking = false,
  isThinking = false,
  onReady,
}: RiveCompanionProps): React.JSX.Element {
  const { isReducedMotion: reducedMotion } = useReducedMotion();
  const scale = useSharedValue(1);
  const glowPulse = useSharedValue(0);
  const floatY = useSharedValue(0);

  React.useEffect(() => {
    if (reducedMotion) {return;}
    floatY.value = withRepeat(
      withTiming(-6, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    glowPulse.value = withRepeat(
      withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [floatY, glowPulse, reducedMotion]);

  React.useEffect(() => {
    if (companionState.currentMood === 'ECSTATIC') {
      scale.value = withSequence(
        withSpring(1.15, { damping: 10 }),
        withSpring(1, { damping: 15 }),
      );
    } else if (companionState.currentMood === 'DANGER') {
      scale.value = withRepeat(
        withSequence(
          withSpring(0.96, { damping: 8 }),
          withSpring(1.04, { damping: 8 }),
        ),
        3,
      );
    }
  }, [companionState.currentMood, scale]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { scale: scale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.15, 0.35]),
    transform: [{ scale: interpolate(glowPulse.value, [0, 1], [1, 1.15]) }],
  }));

  const mood = moodToMascotMood(companionState.currentMood);
  const prefersPng = !HAS_RIVE_MASCOT;

  const mascotProps = {
    mood,
    size: { width: size, height: size },
    reducedMotion,
    isSpeaking,
    isThinking,
    onReady,
  };

  return (
    <Box alignItems="center" justifyContent="center">
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: (size * 1.4) / 2,
            backgroundColor: vexLightGlass.mint[300] + '40',
          },
          glowStyle,
        ]}
      />
      <Animated.View style={containerStyle}>
        {prefersPng ? (
          <PngMascotRenderer {...mascotProps} />
        ) : (
          <Suspense fallback={<PngMascotRenderer {...mascotProps} />}>
            <LazyRiveMascotRenderer {...mascotProps} />
          </Suspense>
        )}
      </Animated.View>
    </Box>
  );
}
