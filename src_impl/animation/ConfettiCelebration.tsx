/**
 * Confetti Celebration Component
 *
 * Premium reward animation with physics-based confetti particles.
 * Uses Reanimated 3 for smooth 60fps animations.
 *
 * Features:
 * - Physics-based particle movement
 * - Multiple colors and shapes
 * - Auto-cleanup after animation
 * - Reduced motion support
 */

import React, { useEffect, useCallback } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDecay, withDelay, runOnJS } from 'react-native-reanimated';
import { useReducedMotion } from '@/hooks';
import { useTheme } from '@/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// Types
// ============================================================================

interface ParticleConfig {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  shape: 'circle' | 'square' | 'triangle';
  delay: number;
}

interface ConfettiCelebrationProps {
  active: boolean;
  particleCount?: number;
  duration?: number;
  onComplete?: () => void;
  colors?: string[];
  origin?: { x: number; y: number };
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_COLORS = [
  '#4F46E5', // Primary
  '#10B981', // Success
  '#F59E0B', // Warning
  '#EF4444', // Error
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

const DRAG = 0.98;

// ============================================================================
// Particle Component
// ============================================================================

const Particle: React.FC<{
  config: ParticleConfig;
  onComplete: (id: number) => void;
}> = ({ config, onComplete }) => {
  const translateX = useSharedValue(config.x);
  const translateY = useSharedValue(config.y);
  const rotation = useSharedValue(config.rotation);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  useEffect(() => {
    // Initial burst
    scale.value = withDelay(config.delay, withSpring(1, { damping: 12, stiffness: 200 }));

    // Physics simulation
    translateX.value = withDecay({
      velocity: config.velocityX,
      deceleration: DRAG,
    });

    // Gravity simulation
    translateY.value = withDecay({
      velocity: config.velocityY,
      deceleration: DRAG,
    });

    // Rotation
    rotation.value = withDecay({
      velocity: Math.random() * 400 - 200,
      deceleration: 0.95,
    });

    // Fade out near end
    const timeout = setTimeout(() => {
      opacity.value = withSpring(0, { damping: 20 });
      setTimeout(() => {
        runOnJS(onComplete)(config.id);
      }, 500);
    }, 3000);

    return () => clearTimeout(timeout);
    // Shared values are stable references, not dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.delay, config.id, config.velocityX, config.velocityY, onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { rotate: `${rotation.value}deg` }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const renderShape = () => {
    const size = config.size;
    const color = config.color;

    switch (config.shape) {
      case 'circle':
        return (
          <View
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            }}
          />
        );
      case 'square':
        return (
          <View
            style={{
              width: size,
              height: size,
              backgroundColor: color,
            }}
          />
        );
      case 'triangle':
        return (
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: size / 2,
              borderRightWidth: size / 2,
              borderBottomWidth: size,
              borderBottomColor: color,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
            }}
          />
        );
    }
  };

  return <Animated.View style={[particleStyle, animatedStyle]}>{renderShape()}</Animated.View>;
};

// ============================================================================
// Main Component
// ============================================================================

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({ active, particleCount = 50, onComplete, colors = DEFAULT_COLORS, origin = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 3 } }) => {
  const [particles, setParticles] = React.useState<ParticleConfig[]>([]);
  const { isReducedMotion } = useReducedMotion();
  useTheme(); // Access theme for potential color overrides

  const generateParticles = useCallback((): ParticleConfig[] => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: origin.x,
      y: origin.y,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 12 + 8,
      rotation: Math.random() * 360,
      velocityX: (Math.random() - 0.5) * 800,
      velocityY: -Math.random() * 600 - 200,
      shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as ParticleConfig['shape'],
      delay: Math.random() * 200,
    }));
  }, [particleCount, colors, origin]);

  useEffect(() => {
    if (active && !isReducedMotion) {
      setParticles(generateParticles());
    } else if (!active) {
      setParticles([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, isReducedMotion]);

  const handleParticleComplete = useCallback(
    (id: number) => {
      setParticles((prev) => {
        const filtered = prev.filter((p) => p.id !== id);
        if (filtered.length === 0 && onComplete) {
          onComplete();
        }
        return filtered;
      });
    },
    [onComplete],
  );

  if (!active || isReducedMotion) {
    return null;
  }

  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} pointerEvents="none">
      {particles.map((particle) => (
        <Particle key={particle.id} config={particle} onComplete={handleParticleComplete} />
      ))}
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const particleStyle = { position: 'absolute' as const };

const shapeStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 3,
};

const triangleStyle = {
  width: 0,
  height: 0,
  backgroundColor: 'transparent' as const,
  borderStyle: 'solid' as const,
  borderLeftColor: 'transparent' as const,
  borderRightColor: 'transparent' as const,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
};

export default ConfettiCelebration;

export * from "./ConfettiCelebration.types";
export * from "./ConfettiCelebration.types";
