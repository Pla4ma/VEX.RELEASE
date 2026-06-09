import React from 'react';
import { View } from 'react-native';
import { GlassCard } from '../../../components/glass/GlassCard';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { WaterBubble } from '../../../components/glass/WaterBubble';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';

export function AiCoachCard(): JSX.Element {
  return (
    <GlassCard padding={16} radius={22} variant="default">
      <View
        pointerEvents="none"
        style={{
          opacity: 0.85,
          position: 'absolute',
          right: 8,
          bottom: 8,
          zIndex: 0,
        }}
      >
        <WaterBubble size={20} opacity={0.65} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <LiquidGlassSphere
          color="pearl"
          icon={
            <Icon color="#0C765F" name="sparkles" size="sm" strokeWidth="thin" variant="outline" />
          }
          intensity={0.92}
          size={52}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: '#0A1F1A',
              fontSize: 15,
              fontWeight: '800',
              letterSpacing: -0.2,
            }}
          >
            AI Coach
          </Text>
          <Text
            style={{
              color: '#3D5A52',
              fontSize: 12,
              lineHeight: 17,
              fontWeight: '400',
            }}
          >
            One clean block, together. Ready?
          </Text>
        </View>
        <Icon color="#6B8F85" name="chevronRight" size="sm" strokeWidth="thin" variant="outline" />
      </View>
    </GlassCard>
  );
}
