import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
import { WaterBubble } from '../../../components/glass/WaterBubble';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import type { HomeStakes } from '../../../features/home-spine/priority-schemas';

interface StakesCardProps {
  stakes: HomeStakes;
}

export function StakesCard({ stakes }: StakesCardProps): JSX.Element {
  return (
    <GlassCard
      variant="subtle"
      padding={12}
      radius={18}
      size="sm"
      style={{ marginBottom: 10, marginTop: 10 }}
    >
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
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          right: 32,
          bottom: 6,
          zIndex: 0,
        }}
      >
        <LiquidGlassSphere color="pearl" size={10} intensity={0.42} />
      </View>
      <Text
        style={{
          color: vexLightGlass.mint[700],
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1.2,
          marginBottom: 6,
          textTransform: 'uppercase',
        }}
      >
        What matters now
      </Text>
      <Text
        style={{
          color: vexLightGlass.text.primary,
          fontSize: 15,
          lineHeight: 21,
          fontWeight: '600',
        }}
      >
        {stakes.what}
      </Text>
      {stakes.atRisk ? (
        <Text
          style={{
            color: vexLightGlass.semantic.warning,
            fontSize: 12,
            marginTop: 6,
            fontWeight: '600',
          }}
        >
          At risk: {stakes.atRisk}
        </Text>
      ) : null}
    </GlassCard>
  );
}

export default StakesCard;
