import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface BossCardProps {
  rpgBossPlacement: string;
}

export function BossTeaserCard({ rpgBossPlacement }: BossCardProps): React.ReactNode {
  return (
    <GlassCard variant="subtle">
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
        <FloatingDroplets count={2} opacity={0.65} size={20} />
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
        <LiquidGlassSphere color="pearl" size={10} intensity={0.42} />
      </View>
      <Text
        style={{
          color: vexLightGlass.text.secondary,
          fontSize: 13,
          fontWeight: '600',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      >
        Challenge forming
      </Text>
      <Text
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 15,
          fontWeight: '500',
          letterSpacing: -0.2,
          lineHeight: 22,
          marginTop: 4,
        }}
      >
        {rpgBossPlacement}
      </Text>
    </GlassCard>
  );
}
