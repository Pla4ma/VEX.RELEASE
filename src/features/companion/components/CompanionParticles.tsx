import React, { useMemo } from 'react';
import { View } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

interface CompanionParticlesProps {
  count: number;
  companionSize: number;
  theme: {
    particle: string;
  };
  particleContainerStyle: AnimatedStyle;
}

        
export const CompanionParticles: React.ComponentType<CompanionParticlesProps> = ({
  count,
  companionSize,
  theme,
  particleContainerStyle,
}) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2;
      const distance = companionSize * 0.6 + (index % 3) * 20;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const size = 4 + (index % 4) * 2;

      return {
        key: index,
        size,
        left: companionSize / 2 + x - size / 2,
        top: companionSize / 2 + y - size / 2,
        opacity: 0.6 + (index % 3) * 0.15,
      };
    });
  }, [count, companionSize]);

  return (
    <Animated.View
      style={[
        { position: 'absolute', width: '100%', height: '100%' },
        particleContainerStyle,
      ]}
    >
      {particles.map((p) => (
        <View
          key={p.key}
          style={{}}
        />
      ))}
    </Animated.View>
  );
};
