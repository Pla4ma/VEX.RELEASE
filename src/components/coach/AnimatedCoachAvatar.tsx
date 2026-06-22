import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useTheme } from '../../theme/ThemeContext';
import {
  type AnimatedCoachAvatarProps,
  getMoodScale,
} from './coach-avatar-types';

export { type CoachMood, type AnimatedCoachAvatarProps } from './coach-avatar-types';

export function AnimatedCoachAvatar({
  size = 112,
  mood = 'calm',
  style,
}: AnimatedCoachAvatarProps): React.ReactNode {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const pulse = useSharedValue(0);
  const float = useSharedValue(0);
  const moodScale = getMoodScale(mood);

  useEffect(() => {
    if (isReducedMotion) {
      pulse.value = 0;
      float.value = 0;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800 }),
        withTiming(0, { duration: 1800 }),
      ),
      -1,
      false,
    );
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200 }),
        withTiming(0, { duration: 2200 }),
      ),
      -1,
      false,
    );
  }, [float, isReducedMotion, pulse]);

  const shellStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(float.value, [0, 1], [0, -6]) },
      { scale: interpolate(pulse.value, [0, 1], [1, moodScale]) },
    ],
  }), [moodScale]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.28, 0.58]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.92, 1.08]) }],
  }));

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          height: size,
          width: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            height: size,
            width: size,
            borderRadius: size / 2,
            backgroundColor: theme.colors.semantic.primarySoft,
          },
          haloStyle,
        ]}
      />
      <Animated.View style={shellStyle}>
        <Svg height={size} width={size} viewBox="0 0 120 120">
          <Defs>
            <LinearGradient id="coachCore" x1="18" y1="8" x2="104" y2="112">
              <Stop
                offset="0"
                stopColor={theme.colors.semantic.accent}
                stopOpacity="1"
              />
              <Stop
                offset="0.52"
                stopColor={theme.colors.semantic.primary}
                stopOpacity="1"
              />
              <Stop
                offset="1"
                stopColor={theme.colors.semantic.surfaceElevated}
                stopOpacity="1"
              />
            </LinearGradient>
            <LinearGradient id="coachSignal" x1="31" y1="30" x2="90" y2="88">
              <Stop
                offset="0"
                stopColor={theme.colors.semantic.textPrimary}
                stopOpacity="0.98"
              />
              <Stop
                offset="1"
                stopColor={theme.colors.semantic.textSecondary}
                stopOpacity="0.82"
              />
            </LinearGradient>
          </Defs>
          {/* Abstract focus core - outer ring */}
          <Path
            d="M60 10C36 10 19 29 19 55c0 32 19 52 41 52s41-20 41-52C101 29 84 10 60 10Z"
            fill="url(#coachCore)"
          />
          {/* Inner signal surface - no face, just a calm gradient panel */}
          <Path
            d="M34 53c0-15 11-26 26-26s26 11 26 26v15c0 13-11 24-26 24S34 81 34 68V53Z"
            fill={theme.colors.semantic.surfaceGlass}
            stroke={theme.colors.semantic.borderStrong}
            strokeWidth="2"
          />
          {/* Focus signal dot - center core */}
          <Circle cx="60" cy="60" r="5" fill="url(#coachSignal)" />
          {/* Mood arc - abstract expression instead of face */}
          <Path
            d={
              mood === 'celebrate'
                ? 'M48 73c7 7 17 7 24 0'
                : 'M50 73c6 4 14 4 20 0'
            }
            stroke={theme.colors.semantic.textPrimary}
            strokeLinecap="round"
            strokeWidth="4"
            opacity="0.35"
          />
          {/* Side signal nodes */}
          <Circle
            cx="22"
            cy="54"
            r="7"
            fill={theme.colors.semantic.accent}
            opacity="0.9"
          />
          <Circle
            cx="98"
            cy="54"
            r="7"
            fill={theme.colors.semantic.secondary}
            opacity="0.9"
          />
          {/* Top crown arc - abstract antenna */}
          <Path
            d="M37 28c10-10 34-11 47 1"
            stroke={theme.colors.semantic.textPrimary}
            strokeLinecap="round"
            strokeOpacity="0.55"
            strokeWidth="3"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

export { AnimatedCoachAvatar }