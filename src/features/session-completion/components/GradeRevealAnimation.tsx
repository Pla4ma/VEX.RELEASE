import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text } from '../../../components/primitives';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTheme } from '../../../theme';
import {
  BurstParticle,
  hexToRgba,
  PARTICLE_COUNT,
} from './grade-reveal-helpers';
import {
  useGradeRevealSequence,
  type GradeRevealAnimationProps,
} from './grade-reveal-logic';


export function GradeRevealAnimation({
  chainCount,
  creativeMoodLabel,
  gradeColor,
  gradeLetter,
  onComplete,
  sessionMode,
}: GradeRevealAnimationProps): JSX.Element {
  const { height } = useWindowDimensions();
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();

  const {
    overlayStyle,
    flashStyle,
    letterStyle,
    particleProgress,
    modeMessage,
  } = useGradeRevealSequence({
    chainCount,
    creativeMoodLabel,
    gradeColor,
    gradeLetter,
    height,
    isReducedMotion,
    onComplete,
    sessionMode,
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          alignItems: 'center',
          backgroundColor: '#000000',
          bottom: 0,
          justifyContent: 'center',
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
          zIndex: theme.zIndex.modal,
        },
        overlayStyle,
      ]}
    >
      <Animated.View
        style={[
          {
            backgroundColor: hexToRgba(gradeColor, 1),
            bottom: 0,
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          },
          flashStyle,
        ]}
      />
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {gradeLetter === 'S'
          ? Array.from({ length: PARTICLE_COUNT }).map((_, index) => (
              <BurstParticle
                key={`grade-reveal-particle-${index}`}
                color={index % 2 === 0 ? gradeColor : theme.colors.text.inverse}
                index={index}
                progress={particleProgress}
              />
            ))
          : null}
        <Animated.View style={letterStyle}>
          <Text
            color={gradeColor}
            style={{
              fontSize: 156,
              fontVariant: ['tabular-nums'],
              fontWeight: theme.fontWeights.heavy,
              lineHeight: 168,
              textAlign: 'center',
            }}
          >
            {gradeLetter}
          </Text>
          {modeMessage && (
            <Text
              color={theme.colors.text.inverse}
              style={{
                fontSize: 16,
                fontWeight: theme.fontWeights.medium,
                marginTop: theme.spacing[2],
                textAlign: 'center',
              }}
            >
              {modeMessage}
            </Text>
          )}
        </Animated.View>
      </View>
    </Animated.View>
  );
}

export default GradeRevealAnimation;
