import React, { useCallback, useEffect, useMemo } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useReducedMotion } from '@/hooks';
import { useTheme } from '@/theme';
import { lightColors } from '@/theme/tokens/colors';

import { Particle, type ParticleConfig } from './Particle';

interface ConfettiCelebrationProps {
  active: boolean;
  particleCount?: number;
  duration?: number;
  onComplete?: () => void;
  colors?: string[];
}

const DEFAULT_COLORS = [
  lightColors.semantic.primary,
  lightColors.accent.green,
  lightColors.semantic.warning,
  lightColors.semantic.danger,
  lightColors.accent.purple,
  lightColors.accent.pink,
  lightColors.accent.teal,
  lightColors.accent.orange,
];

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  active,
  particleCount = 50,
  onComplete,
  colors = DEFAULT_COLORS,
}) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const origin = useMemo(
    () => ({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 3 }),
    [SCREEN_HEIGHT, SCREEN_WIDTH],
  );
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
  const prevActiveRef = React.useRef(active);
  if (active !== prevActiveRef.current) {
    prevActiveRef.current = active;
    if (active && !isReducedMotion) {
      setParticles(generateParticles());
    } else if (!active) {
      setParticles([]);
    }
  }
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
