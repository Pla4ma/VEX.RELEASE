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

<<<<<<< HEAD
import React, { useEffect, useCallback, useState } from 'react';
import { View, Dimensions } from 'react-native';
import { useReducedMotion } from '@/hooks';
import { ConfettiCelebrationProps, ParticleConfig } from './confetti/types';
import { CONFETTI_COLORS, PARTICLE_SHAPES, DEFAULT_PARTICLE_COUNT, DEFAULT_DURATION } from './confetti/constants';
import { Particle } from './confetti/Particle';
=======
import React, { useEffect, useCallback, useState } from "react";
import { View, Dimensions } from "react-native";
import { useReducedMotion } from "@/hooks";
import { ConfettiCelebrationProps, ParticleConfig } from "./confetti/types";
import { CONFETTI_COLORS, PARTICLE_SHAPES, DEFAULT_PARTICLE_COUNT, DEFAULT_DURATION } from "./confetti/constants";
import { Particle } from "./confetti/Particle";
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function ConfettiCelebration({
  active,
  particleCount = DEFAULT_PARTICLE_COUNT,
  duration = DEFAULT_DURATION,
  onComplete,
  colors = CONFETTI_COLORS,
  origin = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 },
}: ConfettiCelebrationProps) {
  const [particles, setParticles] = useState<ParticleConfig[]>([]);
  const isReducedMotion = useReducedMotion();

  const generateParticles = useCallback((): ParticleConfig[] => {
    const newParticles: ParticleConfig[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const velocity = 15 + Math.random() * 10;

      newParticles.push({
        id: Date.now() + i,
        x: origin.x,
        y: origin.y,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
        rotation: Math.random() * 360,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity - 10,
        shape: PARTICLE_SHAPES[Math.floor(Math.random() * PARTICLE_SHAPES.length)] ?? 'circle',
        delay: Math.random() * 0.5,
      });
    }

    return newParticles;
  }, [particleCount, origin, colors]);

  useEffect(() => {
    if (active && !isReducedMotion) {
      const newParticles = generateParticles();
      setParticles(newParticles);

      const timeout = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timeout);
    }
<<<<<<< HEAD
=======

    setParticles([]);
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452
    return undefined;
  }, [active, isReducedMotion, generateParticles, duration, onComplete]);

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
}
