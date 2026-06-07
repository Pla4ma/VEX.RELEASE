import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

export function ProgressionStatCard({
  detail,
  label,
  tone,
  value,
}: {
  detail: string;
  label: string;
  tone: 'default' | 'success' | 'warning';
  value: string;
}): JSX.Element {
  const toneColor =
    tone === 'success'
      ? vexLightGlass.mint[700]
      : tone === 'warning'
        ? '#8A5A12'
        : vexLightGlass.text.primary;

  return (
    <GlassCard
      variant="subtle"
      padding={14}
      radius={20}
      size="sm"
      style={{ flexBasis: '47%', flexGrow: 1 }}
    >
      <View style={{ gap: 4 }}>
        <Text
          style={{
            color: vexLightGlass.text.tertiary,
            fontSize: 11,
            fontWeight: '600',
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            color: toneColor,
            fontSize: 20,
            fontWeight: '800',
            letterSpacing: -0.3,
          }}
        >
          {value}
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.secondary,
            fontSize: 11,
            fontWeight: '500',
          }}
        >
          {detail}
        </Text>
      </View>
    </GlassCard>
  );
}
