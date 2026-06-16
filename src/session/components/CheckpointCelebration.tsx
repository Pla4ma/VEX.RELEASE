import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components/primitives/Text';
import type {
  Particle,
  CheckpointCelebrationProps,
} from './checkpoint-celebration-helpers';
import {
  generateParticles,
  detectCheckpoint,
} from './checkpoint-celebration-helpers';
import {
  overlayStyle,
  particleContainerStyle,
  particleStyle,
  cardStyle,
  emojiContainerStyle,
  emojiTextStyle,
  titleStyle,
  subtitleStyle,
  bonusBadgeStyle,
  bonusTextStyle,
  progressContainerStyle,
  progressBarStyle,
} from './CheckpointCelebration.styles';

export function CheckpointCelebration({
  progressPercent,
  elapsedMinutes,
  isVisible,
  onComplete,
}: CheckpointCelebrationProps): JSX.Element | null {
  const { theme } = useTheme();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    type: 'progress' | 'minute';
    value: number;
    title: string;
    subtitle: string;
    emoji: string;
  } | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [lastCheckpoint, setLastCheckpoint] = useState(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const emojiScale = useSharedValue(0);
  const particleY = useSharedValue(0);
  const [prevCheckpointKey, setPrevCheckpointKey] = useState(
    `${progressPercent}-${elapsedMinutes}-${lastCheckpoint}`,
  );
  const currentCheckpointKey = `${progressPercent}-${elapsedMinutes}-${lastCheckpoint}`;
  if (isVisible && currentCheckpointKey !== prevCheckpointKey) {
    setPrevCheckpointKey(currentCheckpointKey);
    const detected = detectCheckpoint(
      progressPercent,
      elapsedMinutes,
      lastCheckpoint,
    );
    if (detected) {
      setCelebrationData(detected);
      setShowCelebration(true);
      setLastCheckpoint(
        detected.type === 'progress' ? detected.value : detected.value + 100,
      );
      setParticles(generateParticles(20));
    }
  }
  useEffect(() => {
    if (showCelebration) {
      scale.value = 0;
      opacity.value = 0;
      emojiScale.value = 0;
      particleY.value = 0;
      scale.value = withSpring(1, { damping: 12, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 300 });
      emojiScale.value = withSequence(
        withTiming(1.5, { duration: 300, easing: Easing.out(Easing.back(2)) }),
        withSpring(1, { damping: 10 }),
      );
      particleY.value = withTiming(-300, { duration: 1500 });
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(setShowCelebration)(false);
          if (onComplete) {
            runOnJS(onComplete)();
          }
        });
      }, 2500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showCelebration, scale, opacity, emojiScale, particleY, onComplete]);
  const containerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  const emojiAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));
  if (!showCelebration || !celebrationData) {
    return null;
  }
  return (
    <Animated.View style={[overlayStyle, containerAnimStyle]}>
      {}
      <View style={particleContainerStyle}>
        {particles.map((particle) => (
          <Animated.View
            key={particle.id}
            style={[
              particleStyle,
              {
                backgroundColor: particle.color,
                width: particle.size,
                height: particle.size,
                transform: [
                  { translateX: particle.x },
                  { translateY: particle.y },
                ],
              },
              particleStyle,
            ]}
          />
        ))}
      </View>

      {}
      <Animated.View
        style={[
          cardStyle,
          { backgroundColor: theme.colors.background.elevated },
        ]}
      >
        {}
        <View style={emojiContainerStyle}>
          <Animated.View style={[emojiContainerStyle, emojiAnimStyle]}>
            <Text style={emojiTextStyle}>{celebrationData.emoji}</Text>
          </Animated.View>
        </View>

        {}
        <Text variant="h3" style={titleStyle}>
          {celebrationData.title}
        </Text>

        {}
        <Text variant="body" color="secondary" style={subtitleStyle}>
          {celebrationData.subtitle}
        </Text>

        {}
        {celebrationData.type === 'minute' && (
          <View style={bonusBadgeStyle}>
            <Text style={bonusTextStyle}>+50 XP Bonus!</Text>
          </View>
        )}

        {}
        {celebrationData.type === 'progress' && (
          <View style={progressContainerStyle}>
            <View
              style={[
                progressBarStyle,
                {
                  width: `${celebrationData.value}%`,
                  backgroundColor: theme.colors.primary[500],
                },
              ]}
            />
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

export default CheckpointCelebration;
