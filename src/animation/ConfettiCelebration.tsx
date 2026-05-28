import React, { useCallback, useEffect } from "react";
import { View, Dimensions } from "react-native";
import { useReducedMotion } from "@/hooks";
import { useTheme } from "@/theme";
import { launchColors } from "@theme/tokens/launch-colors";
import { Particle, type ParticleConfig } from "./Particle";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ConfettiCelebrationProps {
  active: boolean;
  particleCount?: number;
  duration?: number;
  onComplete?: () => void;
  colors?: string[];
  origin?: { x: number; y: number };
}

const DEFAULT_COLORS = [
  launchColors.hex_4f46e5,
  launchColors.hex_10b981,
  launchColors.hex_f59e0b,
  launchColors.hex_ef4444,
  launchColors.hex_8b5cf6,
  launchColors.hex_ec4899,
  launchColors.hex_06b6d4,
  launchColors.hex_f97316,
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
      shape: ["circle", "square", "triangle"][
        Math.floor(Math.random() * 3)
      ] as ParticleConfig["shape"],
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
      style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
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
