import React, { useCallback, useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { useReducedMotion } from '@/hooks';
import { useTheme } from '@/theme';

import { Particle, type ParticleConfig } from './Particle';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiCelebrationProps {
  active: boolean;
  particleCount?: number;
  duration?: number;
  onComplete?: () => void;
  colors?: string[];
  origin?: { x: number; y: number };
}

const DEFAULT_COLORS = [
  '#4f46e5',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
];

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  active,
  particleCount = 50,
  onComplete,
  colors = DEFAULT_COLORS,
  origin = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 3 },
}) => {
  const [particles, setParticles] = React.useState<ParticleConfig[]>([]);
  const { isReducedMotion } = useReducedMotion();
  useTheme();
  const generateParticles = useCallback((): ParticleConfig[] => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: origin.x,
      y: origin.y,
      color: colors[Math.floor(Math.random() * colors.length)]!,
      size: Math.random() * 12 + 8,
      rotation: Math.random() * 360,
      velocityX: (Math.random() - 0.5) * 800,
      velocityY: -Math.random() * 600 - 200,
      shape: ['circle', 'square', 'triangle'][
        Math.floor(Math.random() * 3)
      ] as ParticleConfig['shape'],
      delay: Math.random() * 200,
    }));
  }, [particleCount, colors, origin]);
  useEffect(() => {
    if (active && !isReducedMotion) {
      setParticles(generateParticles());
    } else if (!active) {
      setParticles([]);
    }
  }, [active, isReducedMotion, generateParticles]);
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
    <View
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      pointerEvents="none"
    >
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          config={particle}
          onComplete={handleParticleComplete}
        />
      ))}
    </View>
  );
};

export default ConfettiCelebration;
