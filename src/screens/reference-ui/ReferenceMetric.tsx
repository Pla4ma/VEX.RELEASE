import React from 'react';
import { View } from 'react-native';
import { Text } from '../../components/primitives/Text';
import { ref, type } from './referenceTokens';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

interface ReferenceMetricProps {
  label: string;
  tone?: 'mint' | 'fire';
  value: string;
  progress?: number;
}

export function ReferenceMetric({
  label,
  tone = 'mint',
  value,
  progress = 0.64,
}: ReferenceMetricProps): React.ReactNode {
  const accent = tone === 'fire' ? vexLightGlass.semantic.fire : ref.mint;
  const track = tone === 'fire'
    ? vexLightGlass.background.atmosphericFire
    : vexLightGlass.background.mintTrack;
  const valueColor = tone === 'fire' ? vexLightGlass.semantic.fireDeep : ref.mintDark;

  return (
    <View style={{ gap: 5 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={type.body}>{label}</Text>
        <Text style={[type.body, { color: valueColor, fontWeight: '800' }]}>{value}</Text>
      </View>
      <View
        style={{
          backgroundColor: track,
          borderRadius: 99,
          height: 6,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            backgroundColor: accent,
            borderRadius: 99,
            height: 6,
            width: `${Math.max(4, Math.min(100, progress * 100))}%`,
          }}
        />
      </View>
    </View>
  );
}
