import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
import { WaterBubble } from '../../../components/glass/WaterBubble';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface EvolutionTeaserProps {
  teaseCopy: string;
}

export function EvolutionTeaserCard({ teaseCopy }: EvolutionTeaserProps): React.ReactNode {
  return (
    <GlassCard padding={16} radius={22} variant="subtle">
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          right: 8,
          top: 8,
          zIndex: 0,
        }}
      >
        <FloatingDroplets count={3} opacity={0.65} size={24} />
      </View>
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          left: 6,
          bottom: 6,
          zIndex: 0,
        }}
      >
        <WaterBubble size={14} opacity={0.65} />
      </View>
      <Text
        style={{
          color: vexLightGlass.text.secondary,
          fontSize: 12,
          fontWeight: '800',
          letterSpacing: 1.4,
          textTransform: 'uppercase',
        }}
      >
        Next evolution
      </Text>
      <Text
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 14,
          fontWeight: '500',
          letterSpacing: -0.2,
          lineHeight: 20,
          marginTop: 4,
        }}
      >
        {teaseCopy}
      </Text>
    </GlassCard>
  );
}
