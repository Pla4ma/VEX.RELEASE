import React from 'react';
import { View } from 'react-native';
import { GlassCard } from '../../../components/glass/GlassCard';
import { Text } from '../../../components/primitives/Text';

export function FocusScoreCard(): JSX.Element {
  return (
    <GlassCard padding={16} radius={22} style={{ flex: 1 }} variant="default">
      <Text style={{ color: '#0A1F1A', fontSize: 13, fontWeight: '800', letterSpacing: -0.2 }}>
        Focus Score
      </Text>
      <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <Text style={{ color: '#0A1F1A', fontSize: 24, fontWeight: '800', letterSpacing: -0.8 }}>82</Text>
        <Text style={{ color: '#0A9B8A', fontSize: 13, fontWeight: '800', marginBottom: 4 }}>+6</Text>
      </View>
      <Text style={{ color: '#0A9B8A', fontSize: 12, fontWeight: '800', marginTop: 3 }}>Stable</Text>
    </GlassCard>
  );
}

export function FocusMemoryCard(): JSX.Element {
  return (
    <GlassCard padding={16} radius={22} style={{ flex: 1 }} variant="default">
      <Text style={{ color: '#0A1F1A', fontSize: 13, fontWeight: '800', letterSpacing: -0.2 }}>
        Focus Memory
      </Text>
      <Text style={{ color: '#3D5A52', fontSize: 12, lineHeight: 17, marginTop: 8, fontWeight: '400' }}>
        VEX remembered your next move.
      </Text>
    </GlassCard>
  );
}
