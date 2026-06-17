/**
 * Confetti Particle Component
 *
 * Individual particle component for confetti celebration.
 */

import React, { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDecay,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';

import { ParticleShape } from './ParticleShape';
import type { ParticleConfig } from './types';
import {
  particleStyle,
  shapeStyle,
  triangleStyle,
  FRICTION,
} from './constants';

interface ParticleProps {
  config: ParticleConfig;
  onComplete: (id: number) => void;
}

export function Particle({ config, onComplete }: ParticleProps) {
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const animatedX = useSharedValue(config.x);
  const animatedY = useSharedValue(config.y);
  const animatedRotation = useSharedValue(config.rotation);
  const animatedScale = useSharedValue(1);
  const animatedOpacity = useSharedValue(1);

  useEffect(() => {
    const handleComplete = () => {
      runOnJS(onComplete)(config.id);
    };

    // Apply physics-based animation
    animatedX.value = withDelay(
      config.delay * 1000,
      withDecay({
        velocity: config.velocityX,
        deceleration: FRICTION,
      }),
    );

    // Y animation with spring
    animatedY.value = withDelay(
      config.delay * 1000,
      withSpring(SCREEN_HEIGHT + 100, {
        velocity: config.velocityY,
        damping: 20,
        stiffness: 100,
        mass: 1,
        overshootClamping: true,
      }),
    );

    // Rotation animation
    animatedRotation.value = withDelay(
      config.delay * 1000,
      withSpring(config.rotation + 720, {
        damping: 10,
        stiffness: 100,
      }),
    );

    // Fade out animation
    animatedOpacity.value = withDelay(
      (config.delay + 2) * 1000,
      withSpring(0, {
        damping: 20,
        stiffness: 100,
      }),
    );

    // Scale animation
    animatedScale.value = withDelay(
      (config.delay + 2) * 1000,
      withSpring(0, {
        damping: 20,
        stiffness: 100,
      }),
    );

    // Auto-cleanup
    const timeout = setTimeout(handleComplete, (config.delay + 3) * 1000);
    return () => clearTimeout(timeout);
  }, [
    animatedOpacity,
    animatedRotation,
    animatedScale,
    animatedX,
    animatedY,
    config,
    onComplete,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: animatedX.value },
      { translateY: animatedY.value },
      { rotate: `${animatedRotation.value}deg` },
      { scale: animatedScale.value },
    ],
    opacity: animatedOpacity.value,
  }));

  return (
    <ParticleShape
      shape={config.shape}
      size={config.size}
      color={config.color}
      animatedStyle={animatedStyle}
      particleStyle={particleStyle}
      shapeStyle={shapeStyle}
      triangleStyle={triangleStyle}
    />
  );
}
