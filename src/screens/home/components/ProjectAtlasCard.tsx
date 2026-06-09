import React from 'react';
import { View } from 'react-native';
import { GlassCard } from '../../../components/glass/GlassCard';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';

export function ProjectAtlasCard(): JSX.Element {
  return (
    <GlassCard padding={16} radius={22} variant="default">
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
        <LiquidGlassSphere
          color="cyan"
          icon={<Icon color="#0E7490" name="book" size="sm" strokeWidth="thin" variant="outline" />}
          intensity={0.7}
          size={42}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#0A1F1A', fontSize: 15, fontWeight: '800', letterSpacing: -0.2 }}>
            Project Atlas
          </Text>
          <Text style={{ color: '#3D5A52', fontSize: 12, fontWeight: '400' }}>
            Continue where you left off.
          </Text>
        </View>
        <Icon color="#6B8F85" name="chevronRight" size="sm" strokeWidth="thin" variant="outline" />
      </View>
    </GlassCard>
  );
}
